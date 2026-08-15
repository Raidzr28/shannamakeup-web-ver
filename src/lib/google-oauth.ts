import "server-only";
import { createHash, randomBytes } from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

/** Google sign-in, written straight against the OAuth 2.0 endpoints.
 *
 * Deliberately not NextAuth/Auth.js: this app already owns its session format
 * — a jose-signed JWT in `shana_session`, see ./auth.ts — and adopting a
 * framework would mean either running two session systems side by side or
 * rewriting every `getSession()` caller. What is actually needed is a redirect
 * out, a code exchange back and a verified id_token, which is all of the code
 * below. `jose` is already here for the session cookie and is what checks
 * Google's signature too, so this adds no dependency.
 *
 * The flow is Authorization Code + PKCE. PKCE is not strictly required for a
 * confidential client that keeps a secret, but it costs one hash and it is
 * what stops an authorization code intercepted in transit from being
 * redeemable by anyone but the browser that started the flow. */

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const TIMEOUT_MS = 10_000;

/** Where Google sends the browser back. Must match a redirect URI registered
 * on the OAuth client in Google Cloud Console, character for character. */
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

/** Short-lived, httpOnly, and gone the moment the callback has read it. */
export const GOOGLE_OAUTH_COOKIE = "shana_google_oauth";
export const GOOGLE_OAUTH_MAX_AGE = 10 * 60;

/** Google's signing keys. Held at module scope so `jose` caches them across
 * sign-ins rather than fetching the key set on every callback. */
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

/** Google still issues both spellings of the issuer claim. */
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export type GoogleConfig = { clientId: string; clientSecret: string };

/** The credentials, or null when the deploy has not been given them.
 *
 * Read per call rather than captured at import so the sign-in button and the
 * route handlers always agree with the current environment, and so a missing
 * variable degrades to "Google sign-in is not offered" instead of crashing
 * every page that imports this module. */
export function googleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** The absolute callback URL for this request.
 *
 * Derived from the request rather than hardcoded so preview deployments and
 * localhost work without their own build, but `GOOGLE_REDIRECT_URI` wins when
 * set — behind a proxy that rewrites the host, the derived value can differ
 * from the one registered with Google, and Google rejects any mismatch. */
export function googleCallbackUrl(request: Request) {
  const override = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (override) return override;

  const url = new URL(request.url);
  // Both headers arrive as a comma-separated chain when several proxies are in
  // front; the first entry is the one the browser actually asked for.
  const first = (value: string | null) => value?.split(",")[0]?.trim();
  const host = first(request.headers.get("x-forwarded-host")) || url.host;
  const proto =
    first(request.headers.get("x-forwarded-proto")) || url.protocol.replace(":", "");

  return `${proto}://${host}${GOOGLE_CALLBACK_PATH}`;
}

/** A PKCE verifier and its S256 challenge. The verifier stays in the httpOnly
 * cookie; only the challenge ever reaches Google. */
export function pkcePair() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function randomState() {
  return randomBytes(16).toString("base64url");
}

export function googleAuthorizeUrl({
  clientId,
  redirectUri,
  state,
  challenge,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
}) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    // openid gets the id_token; email and profile fill in the name and photo
    // so a new account is not left blank. No offline access is requested —
    // nothing here acts on the user's Google account after sign-in, so a
    // refresh token would be a credential stored for no reason.
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    // Without this, anyone already signed into Google is silently signed in as
    // that account, which is wrong on a shared phone.
    prompt: "select_account",
  });

  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export type GoogleIdentity = {
  /** Google's stable subject id, stored as `User.googleId`. */
  sub: string;
  email: string;
  name: string;
  picture: string | null;
};

/** Trades the authorization code for an id_token and verifies it.
 *
 * Returns null on every failure — a bad code, a rejected client secret, an
 * unverified address — because the caller's answer is the same in all of them:
 * send the browser back to /login with a message. The specifics go to the
 * server log instead of the query string, where they would tell a prober which
 * step they got to. */
export async function exchangeGoogleCode({
  config,
  code,
  verifier,
  redirectUri,
}: {
  config: GoogleConfig;
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<GoogleIdentity | null> {
  let idToken: string;

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error("google token exchange failed", response.status);
      return null;
    }

    const payload = (await response.json()) as { id_token?: string };
    if (!payload.id_token) {
      console.error("google token exchange returned no id_token");
      return null;
    }
    idToken = payload.id_token;
  } catch (error) {
    console.error("google token exchange errored", error);
    return null;
  }

  return verifyGoogleIdToken(idToken, config.clientId);
}

/** Checks the id_token's signature, issuer, audience and expiry against
 * Google's published keys.
 *
 * The token arrives over a TLS connection to Google, so this is belt and
 * braces — but it is cheap, and it is what makes the `aud` check possible:
 * without it a token minted for some *other* Google OAuth client would be
 * accepted here, which is the classic way this integration is broken. */
async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<GoogleIdentity | null> {
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ISSUERS,
      audience: clientId,
    });

    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    // Google will hand out a token for an address the user has not proven they
    // own. Honouring it would let anyone claim an existing account here just by
    // typing its address into a Google profile, since `email` is what accounts
    // are matched and merged on below.
    const verified = payload.email_verified === true;

    if (!sub || !email || !verified) {
      console.error("google id_token missing sub, email, or verification");
      return null;
    }

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const picture = typeof payload.picture === "string" ? payload.picture : null;

    return {
      sub,
      email,
      // Google omits `name` on accounts with no profile name set, and the
      // column is non-null, so fall back to the local part of the address.
      name: name || email.split("@")[0],
      picture,
    };
  } catch (error) {
    console.error("google id_token verification failed", error);
    return null;
  }
}
