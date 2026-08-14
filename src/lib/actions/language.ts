"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LANG_COOKIE } from "@/lib/language";

export async function setLanguageAction(formData: FormData) {
  const lang = String(formData.get("lang") ?? "both");
  const next = String(formData.get("next") ?? "/");
  const cookieStore = await cookies();
  cookieStore.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  redirect(next.startsWith("/") ? next : "/");
}
