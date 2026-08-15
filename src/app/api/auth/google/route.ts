import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import {
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_OAUTH_MAX_AGE,
  googleAuthorizeUrl,
  googleCallbackUrl,
  googleConfig,
  pkcePair,
  randomState,
} from "@/lib/google-oauth";

/** Starts the Google sign-in flow: `/api/auth/google?next=/orders`.
 *
 * A Route Handler rather than a Server Action because the browser has to leave
 * for accounts.google.com. An action replies to a POST the React runtime made
 * in the background, which cannot navigate the window to a third-party consent
 * screen; a plain GET link can. */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const config = googleConfig();

  if (!config) {
    // Reachable by typing the URL even when the button is hidden, so it
    // answers rather than throwing a 500 at an unconfigured deploy.
    redirect(
      `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "Google sign-in is not available right now."
      )}`
    );
  }

  const state = randomState();
  const { verifier, challenge } = pkcePair();

  const cookieStore = await cookies();
  // Everything the callback needs to trust what comes back, kept server-side
  // for the length of one sign-in. `state` is compared against the copy Google
  // echoes in the URL — that comparison is what makes a callback forged by
  // another site useless. `sameSite: "lax"` is required, not incidental: the
  // callback arrives as a top-level navigation from Google, and a "strict"
  // cookie would not be sent with it, breaking every sign-in.
  cookieStore.set(GOOGLE_OAUTH_COOKIE, JSON.stringify({ state, verifier, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GOOGLE_OAUTH_MAX_AGE,
  });

  redirect(
    googleAuthorizeUrl({
      clientId: config.clientId,
      redirectUri: googleCallbackUrl(request),
      state,
      challenge,
    })
  );
}
