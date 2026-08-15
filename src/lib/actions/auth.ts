"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reserveUsername } from "@/lib/user-identity";
import {
  clearSessionCookie,
  createSessionCookie,
  hashPassword,
  safeNext,
  verifyPassword,
} from "@/lib/auth";

/** Back to the sign-in form with a message.
 *
 * A hoisted declaration with an explicit `: never` rather than a closure over
 * `next`, because that combination is what TypeScript needs to treat a call as
 * ending control flow — and the checks in `loginAction` rely on exactly that
 * to narrow the user and their hash on the lines after. */
function failLogin(next: string, message: string): never {
  redirect(
    `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`
  );
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) failLogin(next, "Email or password did not match.");

  // An account created through Google has no password until it sets one, so
  // there is nothing here to compare against — and `verifyPassword` would
  // throw on a null hash rather than just returning false.
  //
  // Said plainly rather than folded into "did not match": otherwise someone
  // who signed up with the Google button and later types their address into
  // this form hits a dead end with no way to learn why. It does confirm to a
  // prober that the address is registered, but the register form already
  // answers that with "an account with that email already exists", so this
  // reveals nothing that was not already reachable.
  if (!user.passwordHash) {
    failLogin(next, "That account signs in with Google. Use the Google button below.");
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    failLogin(next, "Email or password did not match.");
  }

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  redirect(next);
}

/** Whether the passwordless artist shortcut may run at all.
 *
 * It hands out a full ARTIST session with no credential, so it is off unless
 * explicitly switched on, and can never be switched on in production — a
 * Server Action is a public endpoint, so hiding the button alone would still
 * leave anyone able to POST to it and become the admin. */
export async function demoLoginEnabled() {
  return demoLoginAllowed();
}

function demoLoginAllowed() {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) return false;
  return process.env.ALLOW_DEMO_ARTIST_LOGIN === "1";
}

export async function demoArtistLoginAction(formData: FormData) {
  const next = safeNext(formData.get("next"));
  if (!demoLoginAllowed()) redirect(`/login?next=${encodeURIComponent(next)}`);

  const user = await prisma.user.findUnique({
    where: { email: "shana@shanamakeup.id" },
  });
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  redirect(next);
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!name || !email || password.length < 6) {
    redirect(
      `/register?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "Fill in every field — password needs at least 6 characters."
      )}`
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(
      `/register?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "An account with that email already exists."
      )}`
    );
  }

  const passwordHash = await hashPassword(password);
  // Assigned rather than asked for: the register form stays two fields, and the
  // handle is editable straight away under /account/edit.
  const username = await reserveUsername(name || email.split("@")[0]);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CLIENT", username },
  });

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  redirect(next);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
