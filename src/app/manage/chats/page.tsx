import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { getInboxThreads } from "@/lib/inbox";
import { geminiConfigured } from "@/lib/gemini";
import { waitingLabel } from "@/lib/booking-time";
import { l } from "@/lib/i18n";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { togglePinAction, toggleArchiveAction } from "@/lib/actions/inbox";
import { ReplyIcon, StarIcon } from "@/components/ui/Icons";

export default async function ManageChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireArtistPage("/manage/chats");
  const [lang, sp, threads, assistantLive] = await Promise.all([
    getLanguage(),
    searchParams,
    getInboxThreads(),
    geminiConfigured(),
  ]);

  const showArchived = sp.view === "archived";
  const visible = threads.filter((t) => t.archived === showArchived);
  const archivedCount = threads.filter((t) => t.archived).length;
  const waitingCount = threads.filter((t) => t.waiting && !t.archived).length;
  const now = new Date();

  const tab = (on: boolean) =>
    `flex-none px-3.5 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap border ${
      on
        ? "glass-fill text-white border-transparent"
        : "glass-light text-[var(--paes-melati-2)] border-prada/80"
    }`;

  const body = (
    <div className="flex flex-col gap-3">
      {waitingCount > 0 && !showArchived && (
        <p className="m-0 text-[13px] font-semibold leading-snug text-[var(--paes-prada-deep)] bg-[var(--paes-ground-3)] border border-[var(--paes-prada-deep)]/25 rounded-2xl px-3.5 py-3">
          {waitingCount === 1
            ? l(
                lang,
                "1 client is waiting on your reply.",
                "1 klien menunggu balasanmu."
              )
            : l(
                lang,
                `${waitingCount} clients are waiting on your reply.`,
                `${waitingCount} klien menunggu balasanmu.`
              )}
        </p>
      )}

      {!assistantLive && (
        <p className="m-0 text-[12.5px] leading-snug text-muted bg-tint border border-maroon/15 rounded-2xl px-3.5 py-3">
          {l(
            lang,
            "The AI assistant is not connected yet — clients still get the scripted replies. Add an API key in the knowledge base to switch it on.",
            "Asisten AI belum terhubung — klien masih menerima balasan naskah. Tambahkan kunci API di basis pengetahuan untuk mengaktifkannya."
          )}
        </p>
      )}

      <div className="no-scrollbar flex gap-2 overflow-auto pb-1">
        <Link href="/manage/chats" className={tab(!showArchived)}>
          {l(lang, "Inbox", "Kotak masuk")}
          {threads.length - archivedCount > 0 && (
            <span className={!showArchived ? "opacity-80" : "text-muted-3"}>
              {" "}
              · {threads.length - archivedCount}
            </span>
          )}
        </Link>
        <Link href="/manage/chats?view=archived" className={tab(showArchived)}>
          {l(lang, "Archived", "Arsip")}
          {archivedCount > 0 && (
            <span className={showArchived ? "opacity-80" : "text-muted-3"}>
              {" "}
              · {archivedCount}
            </span>
          )}
        </Link>
      </div>

      {visible.length === 0 && (
        <div className="glass-card p-6 text-center">
          <p className="m-0 text-[13.5px] text-muted leading-relaxed">
            {showArchived
              ? l(lang, "Nothing archived.", "Tidak ada arsip.")
              : l(lang, "No client has written yet.", "Belum ada klien yang menulis.")}
          </p>
        </div>
      )}

      {visible.map((t) => (
        <div
          key={t.userId}
          className={`glass-card p-[18px] flex flex-col gap-3 ${
            t.waiting
              ? "border-[1.5px] border-[var(--paes-prada-deep)]/45"
              : t.pinned
                ? "border-[1.5px] border-gold/60"
                : ""
          }`}
        >
          <Link href={`/manage/chats/${t.userId}`} className="flex gap-3.5 items-start">
            <span className="flex-none w-11 h-11">
              <Media
                src={t.avatarUrl}
                alt={t.name}
                shape="circle"
                placeholder={t.name.slice(0, 1).toUpperCase()}
                className="w-11 h-11"
                sizes="44px"
              />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 justify-between">
                <span className="flex items-center gap-1.5 min-w-0">
                  {t.waiting && (
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 flex-none rounded-full bg-[var(--paes-alarm)]"
                    />
                  )}
                  <span className="font-bold text-[15px] truncate">{t.name}</span>
                </span>
                <span
                  className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                    t.active ? "bg-maroon text-white" : "bg-ground-3 text-muted-2"
                  }`}
                >
                  {t.active
                    ? l(lang, "In progress", "Berjalan")
                    : l(lang, "Done", "Selesai")}
                </span>
              </span>
              <span
                className={`block text-[12.5px] mt-1 truncate ${
                  t.waiting ? "text-ink font-semibold" : "text-muted-2"
                }`}
              >
                {t.lastFromClient ? null : <ReplyIcon className="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" />}
                {t.lastText || l(lang, "No messages yet.", "Belum ada pesan.")}
              </span>
              {t.waiting && (
                <span className="inline-block text-[10.5px] font-bold px-2 py-1 rounded-full bg-[var(--paes-ground-2)] text-[var(--paes-alarm)] mt-1.5">
                  {l(lang, "Waiting for you", "Menunggu kamu")}
                </span>
              )}
              <span className="block text-[11px] text-muted-3 mt-1">
                @{t.handle} · {t.messageCount}{" "}
                {l(lang, "messages", "pesan")}
                {t.lastAt && ` · ${waitingLabel(lang, t.lastAt, now)}`}
                {t.openBookings > 0 &&
                  ` · ${t.openBookings} ${l(lang, "open booking", "pesanan aktif")}`}
              </span>
            </span>
            {t.pinned && <StarIcon className="h-4 w-4 flex-none text-prada" />}
          </Link>

          <div className="flex gap-2 border-t border-line pt-2.5">
            <form action={togglePinAction} className="flex-1">
              <input type="hidden" name="userId" value={t.userId} />
              <SubmitButton
                className="w-full h-[38px] rounded-xl text-[12.5px] font-bold cursor-pointer text-ink glass-light"
              >
                {t.pinned ? l(lang, "Unpin", "Lepas semat") : l(lang, "Pin", "Sematkan")}
              </SubmitButton>
            </form>
            <form action={toggleArchiveAction} className="flex-1">
              <input type="hidden" name="userId" value={t.userId} />
              <SubmitButton
                className="w-full h-[38px] rounded-xl text-[12.5px] font-bold cursor-pointer text-ink glass-light"
              >
                {t.archived
                  ? l(lang, "Unarchive", "Keluarkan")
                  : l(lang, "Archive", "Arsipkan")}
              </SubmitButton>
            </form>
            <Link
              href={`/manage/chats/${t.userId}`}
              className="flex-1 h-[38px] rounded-xl text-[12.5px] font-bold flex items-center justify-center text-white glass-fill"
            >
              {l(lang, "Open", "Buka")}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  const heading = l(lang, "Client chats", "Chat klien");
  const sub = l(
    lang,
    "Conversations with clients. Anything still in progress sits at the top; pinned threads stay above everything.",
    "Percakapan dengan klien. Yang masih berjalan ada di atas; yang disematkan tetap paling atas."
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2">
            <h1 className="font-display text-[22px]">{heading}</h1>
            <p className="text-xs text-muted-3 mt-1.5 leading-snug">{sub}</p>
          </div>
          <div className="px-5 pt-4.5">{body}</div>
          <div className="flex-1 min-h-6" />
          <TabBar lang={lang} />
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <h1 className="text-4xl font-display">{heading}</h1>
          <p className="text-sm text-muted mt-3 max-w-[60ch]">{sub}</p>
          <div className="max-w-[760px] mt-8 pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
