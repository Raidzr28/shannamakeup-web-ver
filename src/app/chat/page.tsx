import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { l } from "@/lib/i18n";

export default async function ChatPage() {
  const [lang, user] = await Promise.all([getLanguage(), getCurrentUser()]);

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/chat")}&reason=${encodeURIComponent(
        "Chat is between Shana and her clients. Sign in to open the thread."
      )}`
    );
  }

  const messages = await prisma.message.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 60,
  });

  const header = (
    <div className="px-5 pt-2 pb-3.5 flex items-center gap-3 bg-gradient-to-b from-white/90 to-white/66 backdrop-blur-2xl border-b border-white/80">
      <Link
        href="/"
        className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
      >
        ←
      </Link>
      <span className="w-10 h-10 rounded-2xl bg-green text-white flex items-center justify-center font-extrabold">
        S
      </span>
      <span className="flex-1">
        <span className="block font-bold text-[15px]">Shana Studio</span>
        <span className="block text-[11.5px] text-green mt-0.5">
          {l(lang, "answers day and night", "menjawab siang malam")}
        </span>
      </span>
    </div>
  );

  return (
    <>
      {/* Phone: the thread owns the whole screen. */}
      <div className="lg:hidden ambient-glow h-dvh flex flex-col pt-[58px] w-full max-w-[560px] mx-auto">
        {header}
        <ChatPanel lang={lang} messages={messages} signedIn variant="full" />
      </div>

      {/* Desktop: a centred panel — the floating widget stays available too. */}
      <div className="hidden lg:flex ambient-glow flex-1 justify-center px-11 py-11">
        <div className="w-full max-w-[640px] glass-card overflow-hidden p-0 flex flex-col h-[640px]">
          {header}
          <ChatPanel lang={lang} messages={messages} signedIn variant="full" />
        </div>
      </div>
    </>
  );
}
