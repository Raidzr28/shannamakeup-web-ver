"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, verifyPassword } from "@/lib/auth";
import { GEMINI_SECRET, clearSecret, setSecret } from "@/lib/secret-store";

async function requireArtist() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manage/knowledge");
  if (user.role !== "ARTIST") redirect("/");
  return user;
}

/** `: never` so the compiler knows a call ends the action, which is what lets
 * the password checks below narrow `passwordHash` to a string. */
function back(message: string, ok: boolean): never {
  const key = ok ? "saved" : "error";
  redirect(`/manage/knowledge?${key}=${encodeURIComponent(message)}`);
}

/** Shown when the signed-in artist has no password to re-authenticate with,
 * which only happens on an account that has only ever used the Google button.
 * The actions fail closed rather than skipping the check: an unguarded key
 * swap is the exact thing that check exists to stop, and adding a password
 * takes one visit to /account/edit. */
const NO_PASSWORD = "Set a password under Edit profile before changing this key.";

/** Re-authentication before a sensitive change.
 *
 * A live session is not enough here: an unattended logged-in tab would
 * otherwise be all anyone needed to swap the studio's API key for one they
 * control, and bill Shana for it. The password is checked against the
 * current user's own hash and never stored. */
export async function setGeminiKeyAction(formData: FormData) {
  const user = await requireArtist();
  const password = String(formData.get("password") ?? "");
  const apiKey = String(formData.get("apiKey") ?? "").trim();

  if (!apiKey) back("Paste the API key first.", false);
  if (!password) back("Enter your password to confirm.", false);
  if (!user.passwordHash) back(NO_PASSWORD, false);

  if (!(await verifyPassword(password, user.passwordHash))) {
    back("That password is not right.", false);
  }

  // Cheap sanity check. Google's keys are long and have no spaces; catching a
  // pasted-wrong value here beats a silent fallback to scripted replies.
  if (apiKey.length < 20 || /\s/.test(apiKey)) {
    back("That does not look like an API key.", false);
  }

  await setSecret(GEMINI_SECRET, apiKey, user.id);

  revalidatePath("/manage/knowledge");
  revalidatePath("/manage/chats");
  back("API key saved. The assistant is live.", true);
}

export async function clearGeminiKeyAction(formData: FormData) {
  const user = await requireArtist();
  const password = String(formData.get("password") ?? "");

  if (!password) back("Enter your password to confirm.", false);
  if (!user.passwordHash) back(NO_PASSWORD, false);
  if (!(await verifyPassword(password, user.passwordHash))) {
    back("That password is not right.", false);
  }

  await clearSecret(GEMINI_SECRET);

  revalidatePath("/manage/knowledge");
  revalidatePath("/manage/chats");
  back("API key removed. Clients get the scripted replies again.", true);
}
