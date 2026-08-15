import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { PersonPlaceholder } from "@/components/ui/PersonPlaceholder";
import { ChipLink } from "@/components/ui/Option";
import { TabBar } from "@/components/shell/TabBar";
import { LookCard } from "./LookCard";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";
import { CATEGORIES } from "@/lib/static-data";
import { formatOpeningLine, nextOpening } from "@/lib/booking-calc";

export function MobileHome({
  lang,
  looks,
  category,
  viewer,
  chatHref,
  isArtist,
  waitingChats,
}: {
  lang: Lang;
  looks: LookDTO[];
  category: string;
  /** Null when signed out, which falls back to the drawn portrait. */
  viewer: { name: string; avatarUrl: string | null } | null;
  /** The artist's thread with herself is empty by definition, so hers points
   * at the client inbox instead. */
  chatHref: string;
  isArtist: boolean;
  /** Client conversations waiting on the artist. Zero for clients. */
  waitingChats: number;
}) {
  const opening = nextOpening();

  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <div className="px-5 pt-2 pb-1 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[12.5px] text-muted-2">
            {l(lang, "Good evening", "Selamat malam")}
          </div>
          <div className="font-extrabold text-[19px] tracking-tight mt-0.5">
            {l(lang, "Find your look", "Temukan tampilanmu")}
          </div>
        </div>
      </div>

      <div className="px-5 pt-3">
        <Link
          href="/looks"
          className="h-[46px] flex items-center text-[13.5px] text-muted glass-card px-4"
        >
          {l(lang, "Search looks, dates, add-ons", "Cari tampilan, tanggal, tambahan")}
        </Link>
      </div>

      <div className="px-5 pt-3.5">
        <div className="flex gap-3.5 items-center text-white rounded-[22px] p-4.5 glass-fill">
          <div className="flex-1">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase opacity-75">
              {l(lang, "Next opening", "Slot terdekat")}
            </div>
            <div className="font-extrabold text-xl mt-2 tracking-tight">
              {formatOpeningLine(opening, lang)}
            </div>
            <div className="text-xs opacity-80 mt-1">
              {l(
                lang,
                "One booking a day, travel included",
                "Satu pesanan per hari, termasuk perjalanan"
              )}
            </div>
            <Link
              href="/book"
              className="mt-3.5 inline-flex h-[38px] px-4 rounded-xl text-white text-[13px] font-bold items-center bg-gradient-to-br from-white/34 to-white/16 backdrop-blur-md border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
            >
              {l(lang, "Take this slot", "Ambil slot ini")}
            </Link>
          </div>
          <span className="w-24 h-[110px] rounded-[20px] overflow-hidden flex-none bg-white/18">
            {viewer?.avatarUrl ? (
              // `shape="rect"` because the wrapper already rounds and clips, and
              // `Media` needs an explicit size or its `fill` image collapses.
              <Media
                src={viewer.avatarUrl}
                alt={viewer.name}
                shape="rect"
                className="w-full h-full"
                sizes="96px"
              />
            ) : (
              <PersonPlaceholder
                className="w-full h-full"
                label={l(lang, "Your profile photo", "Foto profilmu")}
              />
            )}
          </span>
        </div>
      </div>

      {/* Directly under the slot card: someone who has just read a date and a
          price is exactly the person with a question about it. The old entry
          point was a "◔" glyph in the header, which said nothing. */}
      <div className="px-5 pt-3">
        <Link href={chatHref} className="glass-card p-4 flex gap-3.5 items-center">
          <span className="relative w-12 h-12 flex-none rounded-2xl flex items-center justify-center glass-fill text-white text-lg">
            ✦
            {waitingChats > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#b23a3a] text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#fffcf7]">
                {waitingChats}
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4e9a5f] border-2 border-[#fffcf7]"
              />
            )}
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2">
              <span className="font-bold text-[15px]">
                {isArtist
                  ? l(lang, "Client chats", "Chat klien")
                  : l(lang, "Ask the assistant", "Tanya asisten")}
              </span>
              <span className="flex-none text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-tint text-maroon uppercase tracking-[0.04em]">
                {isArtist
                  ? waitingChats > 0
                    ? l(lang, "Waiting", "Menunggu")
                    : l(lang, "Inbox", "Masuk")
                  : l(lang, "Live", "Aktif")}
              </span>
            </span>
            <span className="block text-[12px] text-muted-3 mt-1 leading-snug">
              {isArtist
                ? waitingChats > 0
                  ? l(
                      lang,
                      `${waitingChats} ${waitingChats === 1 ? "client is" : "clients are"} waiting on your reply.`,
                      `${waitingChats} klien menunggu balasanmu.`
                    )
                  : l(
                      lang,
                      "Conversations with your clients. Nobody is waiting on you.",
                      "Percakapan dengan klienmu. Tidak ada yang menunggu."
                    )
                : l(
                    lang,
                    "Prices, free dates, travel — answered in seconds. Shana takes over when it matters.",
                    "Harga, tanggal kosong, perjalanan — dijawab dalam hitungan detik. Shana turun tangan bila perlu."
                  )}
            </span>
          </span>
          <span aria-hidden="true" className="flex-none text-maroon text-lg">
            →
          </span>
        </Link>
      </div>

      <div className="no-scrollbar flex gap-2 px-5 pt-4.5 pb-0.5 overflow-auto">
        {CATEGORIES.map((c) => (
          <ChipLink
            key={c.id}
            href={c.id === "All" ? "/" : `/?cat=${c.id}`}
            active={category === c.id}
          >
            {l(lang, c.name, c.nameId)}
          </ChipLink>
        ))}
      </div>

      <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3 px-5 pt-4">
        {l(lang, "Most booked", "Paling banyak dipesan")}
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pt-3">
        {looks.map((k) => (
          <LookCard key={k.id} look={k} lang={lang} size="sm" />
        ))}
      </div>

      <div className="flex-1 min-h-6" />
      <TabBar lang={lang} />
    </div>
  );
}
