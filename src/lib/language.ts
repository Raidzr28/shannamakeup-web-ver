import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "./i18n";

export const LANG_COOKIE = "shana_lang";

export async function getLanguage(): Promise<Lang> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANG_COOKIE)?.value;
  if (value === "en" || value === "id" || value === "both") return value;
  return "both";
}
