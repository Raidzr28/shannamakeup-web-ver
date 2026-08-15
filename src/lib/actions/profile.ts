"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, createSessionCookie, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUsername, validateUsername } from "@/lib/username";

/** These forms stay on the page and report inline rather than redirecting, so
 * the actions hand back a result instead of throwing a redirect. */
export type ProfileResult = { ok: boolean; error?: string };

const MAX_BIO = 200;
const MAX_ADDRESS = 200;

function trimmed(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);
}

export async function updateProfileAction(formData: FormData): Promise<ProfileResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to edit your profile." };

  const name = trimmed(formData, "name", 60);
  if (!name) return { ok: false, error: "Your display name cannot be empty." };

  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const invalid = validateUsername(username);
  if (invalid) return { ok: false, error: invalid };

  if (username !== user.username) {
    const taken = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (taken) return { ok: false, error: "That username is already taken." };
  }

  const submitted = String(formData.get("avatarUrl") ?? "").trim();
  // "" means the field was left alone, "remove" means the photo was cleared.
  const avatarUrl =
    submitted === "remove"
      ? null
      : submitted.startsWith("https://")
        ? submitted
        : user.avatarUrl;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        username,
        avatarUrl,
        bio: trimmed(formData, "bio", MAX_BIO) || null,
        phone: trimmed(formData, "phone", 30) || null,
        address: trimmed(formData, "address", MAX_ADDRESS) || null,
        city: trimmed(formData, "city", 60) || null,
      },
    });
  } catch {
    // Two people can claim the same free handle between the check above and
    // this write; the unique index is what actually decides it.
    return { ok: false, error: "That username is already taken." };
  }

  // The nav greets you from the session cookie, not the database, so a renamed
  // user would keep seeing the old name until their next sign-in without this.
  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name,
    role: user.role,
  });

  revalidatePath("/account");
  revalidatePath("/looks");
  return { ok: true };
}

export async function changePasswordAction(formData: FormData): Promise<ProfileResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to change your password." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  // Checked even though the session already proves who they are: it is what
  // stops a walked-away-from browser being turned into a permanent takeover.
  //
  // An account that has only ever signed in with Google has no hash to check
  // against, so there is nothing to ask for — that is the "add a password"
  // case, and the form drops the field to match. The takeover guard really is
  // weaker in that one case; the only thing that could replace it is a fresh
  // round trip through Google, which is more machinery than this earns.
  if (user.passwordHash && !(await verifyPassword(current, user.passwordHash)))
    return { ok: false, error: "Your current password is not right." };
  if (next.length < 6)
    return { ok: false, error: "The new password needs at least 6 characters." };
  if (next !== confirm) return { ok: false, error: "The two new passwords do not match." };
  if (next === current)
    return { ok: false, error: "The new password matches the old one." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return { ok: true };
}
