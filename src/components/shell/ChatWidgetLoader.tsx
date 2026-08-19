import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ChatWidgetShell } from "./ChatWidgetShell";
import type { Lang } from "@/lib/i18n";

export async function ChatWidgetLoader({ lang }: { lang: Lang }) {
  const user = await getCurrentUser();

  // This widget is a client talking to the studio. The artist is the studio —
  // hers is the client inbox at /manage/chats, not a thread with herself.
  if (user?.role === "ARTIST") return null;

  const rows = user
    ? await prisma.message.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        take: 40,
      })
    : [];

  return (
    <ChatWidgetShell lang={lang}>
      <ChatPanel lang={lang} messages={rows} signedIn={!!user} variant="floating" />
    </ChatWidgetShell>
  );
}
