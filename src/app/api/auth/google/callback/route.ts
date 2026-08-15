import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createSessionCookie, safeNext } from "@/lib/auth";
import {
  GOOGLE_OAUTH_COOKIE,
  exchangeGoogleCode,
  googleCallbackUrl,
  googleConfig,
} from "@/lib/google-oauth";
import { findOrCreateGoogleUser } from "@/lib/user-identity";

/** What `/api/auth/google` stashed before sending the browser to Google. */
type Pending = { state: string; verifier: string; next: string };

/** The cookie is plain JSON rather than a signed token on purpose.
 *
 * Its only security job is to hold a value that must equal the `state` Google
 * echoes back, and signing would not add to that: anyone able to write this
 * cookie could just as well run a real sign-in and plant a matching pair.
 * `next` is re-checked with `safeNext` here anyway, so a tampered cookie
 * cannot steer the final redirect off-site. */
function readPending(raw: string | undefined): Pending | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Pending>;
    if (typeof parsed.state !== "string" || typeof parsed.verifier !== "string") {
      return null;
    }
    return {
      state: parsed.state,
      verifier: parsed.verifier,
      next: safeNext(parsed.next),
    };
  } catch {
    return null;
  }
}

/** Where Google sends the browser back with an authorization code.
 *
 * Signs the session in on success and returns null; on any failure returns the
 * message to show on /login. Written this way so `redirect()` is only ever
 * called from `GET` below — it works by throwing, and a `catch` around it here
 * would swallow the redirect and answer with a blank 200 instead. */
async function completeSignIn(
  request: NextRequest,
  params: URLSearchParams,
  pending: Pending | null
): Promise<string | null> {
  const config = googleConfig();
  if (!config) return "Google sign-in is not available right now.";

  const denied = params.get("error");
  if (denied) {
    // The ordinary case is the user pressing Cancel on the consent screen,
    // which does not deserve an alarming message.
    if (denied === "access_denied") return "Google sign-in was cancelled.";
    console.error("google returned an error", denied);
    return "Google could not complete that sign-in.";
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!pending || !code || !state) {
    // No cookie means the flow was never started here, or it sat longer than
    // the cookie's ten minutes.
    return "That sign-in took too long. Please try again.";
  }
  if (state !== pending.state) {
    console.error("google callback state did not match");
    return "That sign-in could not be verified. Please try again.";
  }

  const identity = await exchangeGoogleCode({
    config,
    code,
    verifier: pending.verifier,
    redirectUri: googleCallbackUrl(request),
  });
  if (!identity) return "Google could not confirm that account. Please try again.";

  try {
    const user = await findOrCreateGoogleUser(identity);
    await createSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("google sign-in could not resolve an account", error);
    return "Could not finish signing you in. Please try again.";
  }

  return null;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const pending = readPending(cookieStore.get(GOOGLE_OAUTH_COOKIE)?.value);
  // Cleared before the code is spent, so one authorization code gets exactly
  // one attempt whatever happens next.
  cookieStore.delete(GOOGLE_OAUTH_COOKIE);

  const next = pending?.next ?? "/";
  const failure = await completeSignIn(request, request.nextUrl.searchParams, pending);

  if (failure) {
    redirect(
      `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(failure)}`
    );
  }
  redirect(next);
}
