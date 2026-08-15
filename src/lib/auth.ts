import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_COOKIE = "shana_session";

/** Signing key for session cookies.
 *
 * Fails closed in production instead of falling back to a constant. The old
 * default was a literal in this file, so anyone who could read the source
 * could forge a session — including one with role ARTIST — whenever
 * AUTH_SECRET happened to be unset.
 *
 * Resolved per call rather than once at import, so a misconfigured deploy
 * breaks sign-in loudly rather than at module load of every page that happens
 * to read the session. */
function sessionSecret() {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is not set — refusing to sign sessions with a known default."
    );
  }
  return new TextEncoder().encode("dev-only-insecure-secret");
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "CLIENT" | "ARTIST";
};

/** Constrains a post-sign-in destination to a path inside this app.
 *
 * Shared by the sign-in actions and the Google callback, because all of them
 * take the target from somewhere a stranger can set — a hidden form field, a
 * query string, a cookie that round-trips through Google. Anything absolute is
 * dropped, or a link to `/login?next=https://…` would make the sign-in page an
 * open redirect that lands freshly-authenticated people on someone else's
 * site. `//host` is rejected for the same reason despite starting with a
 * slash: browsers read it as protocol-relative, so it is another origin. */
export function safeNext(next: FormDataEntryValue | null | undefined) {
  const value = typeof next === "string" ? next : "";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(sessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  return user;
}
