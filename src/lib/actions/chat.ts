"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { botReply } from "@/lib/chat";
import type { Lang } from "@/lib/i18n";

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

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const lang = (String(formData.get("lang") ?? "both") as Lang) ?? "both";
  const lookTitle = String(formData.get("lookTitle") ?? "Akad Pagi");
  const lookPrice = Number(formData.get("lookPrice") ?? 8500000);
  const whenLine = String(formData.get("whenLine") ?? "22 Aug · 05:00");

  await prisma.message.create({ data: { userId: user.id, who: "You", text } });
  const reply = botReply(text, lang, lookTitle, lookPrice, whenLine);
  await prisma.message.create({ data: { userId: user.id, who: "bot", text: reply } });

  revalidatePath(next);
}
