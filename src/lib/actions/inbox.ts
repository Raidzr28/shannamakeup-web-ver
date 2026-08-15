"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ARTIST_AUTHOR } from "@/lib/chat";

/** Re-checked inside every action rather than trusted from the page that
 * rendered the button, matching the reservation and package actions. */
async function requireArtist() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manage/chats");
  if (user.role !== "ARTIST") redirect("/");
  return user;
}

function refresh(userId: string) {
  revalidatePath("/manage/chats");
  revalidatePath(`/manage/chats/${userId}`);
  revalidatePath("/chat");
}

/** The thread row may not exist yet: a client who has never messaged has no
 * inbox metadata until something sets a flag on it. */
async function setFlags(
  userId: string,
  flags: { pinned?: boolean; archived?: boolean }
) {
  await prisma.chatThread.upsert({
    where: { userId },
    create: { userId, ...flags },
    update: flags,
  });
  refresh(userId);
}

export async function togglePinAction(formData: FormData) {
  await requireArtist();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const current = await prisma.chatThread.findUnique({ where: { userId } });
  await setFlags(userId, { pinned: !current?.pinned });
}

export async function toggleArchiveAction(formData: FormData) {
  await requireArtist();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const current = await prisma.chatThread.findUnique({ where: { userId } });
  const archived = !current?.archived;
  // An archived thread should not also sit pinned at the top of the inbox.
  await setFlags(userId, { archived, ...(archived ? { pinned: false } : {}) });
}

/** Clears the conversation itself, not the client. Messages are keyed by user
 * rather than by thread, so the row and its metadata go together or the inbox
 * would keep showing an empty conversation. */
export async function deleteThreadAction(formData: FormData) {
  await requireArtist();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await prisma.message.deleteMany({ where: { userId } });
  await prisma.chatThread.deleteMany({ where: { userId } });

  refresh(userId);
  redirect("/manage/chats");
}

/** Shana answering a client by hand. This is also what stops the assistant
 * from auto-replying in this thread from here on. */
export async function replyToClientAction(formData: FormData) {
  await requireArtist();
  const userId = String(formData.get("userId") ?? "");
  const text = String(formData.get("text") ?? "").trim().slice(0, 2000);
  if (!userId || !text) return;

  const client = await prisma.user.findUnique({ where: { id: userId } });
  if (!client) return;

  await prisma.message.create({
    data: { userId, who: ARTIST_AUTHOR, text },
  });
  await prisma.chatThread.upsert({
    where: { userId },
    create: { userId, lastMessageAt: new Date() },
    update: { lastMessageAt: new Date() },
  });

  refresh(userId);
}
