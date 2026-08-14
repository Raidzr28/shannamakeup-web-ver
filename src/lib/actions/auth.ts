"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  createSessionCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === "string" ? next : "";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(
      `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "Email or password did not match."
      )}`
    );
  }

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  redirect(next);
}

export async function demoArtistLoginAction(formData: FormData) {
  const next = safeNext(formData.get("next"));
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
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CLIENT" },
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
