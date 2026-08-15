"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  botReply,
  artistHasReplied,
  BOT_AUTHOR,
  CLIENT_AUTHOR,
} from "@/lib/chat";
import { assistantSystemPrompt } from "@/lib/knowledge";
import { geminiReply, type ChatTurn } from "@/lib/gemini";
import type { Lang } from "@/lib/i18n";

/** Enough context for the assistant to follow a conversation without sending
 * the entire history on every turn. */
const HISTORY_LIMIT = 20;

/** Keeps the artist's inbox ordering fresh. A message from the client also
 * pulls the thread back out of the archive — that is the point of archiving,
 * not deleting. Shana's own replies leave the archive flag alone. */
async function touchThread(userId: string, fromClient: boolean) {
  const now = new Date();
  await prisma.chatThread.upsert({
    where: { userId },
    create: { userId, lastMessageAt: now },
    update: fromClient
      ? { lastMessageAt: now, archived: false }
      : { lastMessageAt: now },
  });
}

export async function sendMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  const next = String(formData.get("next") ?? "/chat");
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(next)}&reason=${encodeURIComponent(
        "Chat is between Shana and her clients. Sign in to open the thread."
      )}`
    );
  }

  const text = String(formData.get("text") ?? "").trim().slice(0, 2000);
  if (!text) return;

  const lang = (String(formData.get("lang") ?? "both") as Lang) ?? "both";
  const lookTitle = String(formData.get("lookTitle") ?? "Akad Pagi");
  const lookPrice = Number(formData.get("lookPrice") ?? 8500000);
  const whenLine = String(formData.get("whenLine") ?? "22 Aug · 05:00");

  await prisma.message.create({
    data: { userId: user.id, who: CLIENT_AUTHOR, text },
  });

  const history = await prisma.message.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  history.reverse();

  // Once Shana is in the conversation it is hers. The client still sends
  // messages; nothing answers automatically until she does.
  if (!artistHasReplied(history)) {
    const turns: ChatTurn[] = history.map((m) => ({
      role: m.who === CLIENT_AUTHOR ? ("user" as const) : ("model" as const),
      text: m.text,
    }));

    // Null covers every failure: no key yet, bad key, timeout, quota, safety
    // block. The scripted reply keeps the thread useful in all of them.
    const generated = await geminiReply(await assistantSystemPrompt(), turns);
    const reply = generated ?? botReply(text, lang, lookTitle, lookPrice, whenLine);

    await prisma.message.create({
      data: { userId: user.id, who: BOT_AUTHOR, text: reply },
    });
  }

  await touchThread(user.id, true);

  revalidatePath(next);
  revalidatePath("/manage/chats");
  revalidatePath(`/manage/chats/${user.id}`);
}
