import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatPanel } from "@/components/chat/ChatPanel";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export async function ChatWidgetLoader({ lang }: { lang: Lang }) {
  const user = await getCurrentUser();
  const rows = user
    ? await prisma.message.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        take: 40,
      })
    : [];

  return (
    <div className="fixed bottom-0 right-0 z-40 flex justify-end w-full px-9 pb-7 pointer-events-none">
      <div className="w-[352px] overflow-hidden pointer-events-auto rounded-[22px] bg-gradient-to-br from-white/90 to-white/68 backdrop-blur-2xl backdrop-saturate-150 border border-white/75 shadow-[0_18px_44px_rgba(28,38,32,0.16)]">
        <div className="flex items-center gap-2.5 px-4 py-3.5 text-white glass-fill">
          <span className="w-8 h-8 rounded-[11px] bg-white/20 flex items-center justify-center font-extrabold text-[13px]">
            S
          </span>
          <span className="flex-1 font-bold text-[14.5px]">Shana Studio</span>
          <span className="text-[11px] opacity-85">
            {l(lang, "answers day and night", "menjawab siang malam")}
          </span>
        </div>
        <ChatPanel lang={lang} messages={rows} signedIn={!!user} variant="floating" />
      </div>
    </div>
  );
}
