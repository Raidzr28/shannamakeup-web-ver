import Link from "next/link";
import { notFound } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { AdminChatPanel } from "@/components/chat/AdminChatPanel";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { prisma } from "@/lib/prisma";
import { artistHasReplied, ARTIST_AUTHOR, CLIENT_AUTHOR } from "@/lib/chat";
import { statusLabel, statusTone } from "@/lib/booking-status";
import { locale } from "@/lib/booking-time";
import { l } from "@/lib/i18n";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  togglePinAction,
  toggleArchiveAction,
  deleteThreadAction,
} from "@/lib/actions/inbox";

export default async function ManageChatThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  await requireArtistPage(`/manage/chats/${userId}`);
  const lang = await getLanguage();

  const client = await prisma.user.findUnique({ where: { id: userId } });
  if (!client) notFound();

  const [messages, thread, bookings] = await Promise.all([
    prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
    prisma.chatThread.findUnique({ where: { userId } }),
    prisma.booking.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: { look: true },
      take: 5,
    }),
  ]);

  // Opening the thread is what marks it read. Written only when something is
  // actually unread, so a revisit is not a pointless write, and after the
  // messages are already loaded so nothing above depends on it.
  const newestClientAt = [...messages]
    .reverse()
    .find((m) => m.who === CLIENT_AUTHOR)?.createdAt;
  const isUnread =
    newestClientAt && (!thread?.lastReadAt || newestClientAt > thread.lastReadAt);
  if (isUnread) {
    await prisma.chatThread.upsert({
      where: { userId },
      create: { userId, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });
  }

  const handedOver = artistHasReplied(messages);

  const panel = (
    <AdminChatPanel
      lang={lang}
      userId={userId}
      clientName={client.name}
      clientAuthor={CLIENT_AUTHOR}
      artistAuthor={ARTIST_AUTHOR}
      messages={messages.map((m) => ({
        id: m.id,
        who: m.who,
        text: m.text,
        at: m.createdAt.toLocaleString(locale(lang), {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))}
    />
  );

  const header = (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-white/90 to-white/66 backdrop-blur-2xl border-b border-white/80">
      <Link
        href="/manage/chats"
        className="w-[38px] h-[38px] flex-none rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
      >
        ←
      </Link>
      <span className="w-10 h-10 flex-none">
        <Media
          src={client.avatarUrl}
          alt={client.name}
          shape="circle"
          placeholder={client.name.slice(0, 1).toUpperCase()}
          className="w-10 h-10"
          sizes="40px"
        />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-[15px] truncate">{client.name}</span>
        <span className="block text-[11.5px] text-muted-3 truncate">
          {handedOver
            ? l(lang, "You are answering this thread", "Kamu yang menjawab thread ini")
            : l(lang, "Assistant is answering", "Asisten sedang menjawab")}
        </span>
      </span>
      <form action={togglePinAction} className="flex-none">
        <input type="hidden" name="userId" value={userId} />
        <SubmitButton
          aria-label={thread?.pinned ? l(lang, "Unpin", "Lepas semat") : l(lang, "Pin", "Sematkan")}
          className={`w-[38px] h-[38px] rounded-[13px] flex items-center justify-center text-[15px] cursor-pointer ${
            thread?.pinned ? "glass-fill text-white" : "glass-light text-ink"
          }`}
        >
          ★
        </SubmitButton>
      </form>
    </div>
  );

  /* Everything that is not the conversation lives behind one disclosure, so
     the thread reads as a chat rather than a stack of forms. `details` keeps
     it working without shipping any JavaScript for it. */
  const aside = (
    <details className="flex-none border-b border-line bg-white/60 max-h-[50vh] overflow-auto">
      <summary className="px-4 py-3 text-[12.5px] font-bold text-muted-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between">
        <span>
          {l(lang, "Client details and actions", "Detail klien dan tindakan")}
        </span>
        <span aria-hidden="true" className="text-muted-3">
          ⌄
        </span>
      </summary>

      <div className="px-4 pb-4 flex flex-col gap-3">
        <div className="text-[12.5px] text-muted-3 leading-relaxed">
          <div>@{client.username ?? client.name}</div>
          <div>{client.email}</div>
          {client.phone && <div>{client.phone}</div>}
        </div>

        {bookings.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10.5px] font-bold tracking-[0.05em] uppercase text-muted-3">
              {l(lang, "Their bookings", "Pesanan mereka")}
            </span>
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/manage/bookings/${b.id}`}
                className="flex items-center gap-2 justify-between rounded-2xl bg-tint px-3.5 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold truncate">
                    {l(lang, b.look.title, b.look.titleId)}
                  </span>
                  <span className="block text-[11.5px] text-muted-3 truncate">
                    {b.code} ·{" "}
                    {b.date.toLocaleDateString(locale(lang), {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
                <span
                  className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${statusTone(b.status)}`}
                >
                  {statusLabel(lang, b.status)}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <form action={toggleArchiveAction} className="flex-1">
            <input type="hidden" name="userId" value={userId} />
            <SubmitButton
              className="w-full h-[38px] rounded-xl text-[12.5px] font-bold cursor-pointer text-ink glass-light"
            >
              {thread?.archived
                ? l(lang, "Unarchive", "Keluarkan")
                : l(lang, "Archive", "Arsipkan")}
            </SubmitButton>
          </form>
          <form action={deleteThreadAction} className="flex-1">
            <input type="hidden" name="userId" value={userId} />
            <SubmitButton
              className="w-full h-[38px] rounded-xl text-[12.5px] font-bold cursor-pointer text-[#b23a3a] glass-light border-[#b23a3a]/30"
            >
              {l(lang, "Delete conversation", "Hapus percakapan")}
            </SubmitButton>
          </form>
        </div>
        <p className="m-0 text-[11px] leading-snug text-muted-3">
          {l(
            lang,
            "Deleting clears every message here. The client and their bookings are untouched.",
            "Menghapus membersihkan semua pesan di sini. Klien dan pesanannya tidak terpengaruh."
          )}
        </p>
      </div>
    </details>
  );

  return (
    <>
      {/* Phone: the conversation owns the screen, like the client's own chat. */}
      {/* Phone: exactly viewport-tall, so no 58px top band — it would come
          straight out of the transcript. The disclosure sits under the header
          rather than after the panel: the composer has to be the bottom-most
          thing on screen for this to read as a chat. */}
      <div className="lg:hidden ambient-glow h-dvh overflow-hidden flex flex-col pt-[env(safe-area-inset-top)] w-full max-w-[560px] mx-auto">
        {header}
        {aside}
        {panel}
      </div>

      <div className="hidden lg:flex ambient-glow flex-1 justify-center px-11 py-11">
        <div className="w-full max-w-[720px] flex flex-col">
          <Link
            href="/manage/chats"
            className="text-[13px] font-semibold text-muted mb-4"
          >
            ← {l(lang, "Back to client chats", "Kembali ke chat klien")}
          </Link>
          <div className="glass-card overflow-hidden p-0 flex flex-col h-[680px]">
            {header}
            {aside}
            {panel}
          </div>
        </div>
      </div>
    </>
  );
}
