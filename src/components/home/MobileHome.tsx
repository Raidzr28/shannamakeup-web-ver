import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { PersonPlaceholder } from "@/components/ui/PersonPlaceholder";
import { PaesCrown } from "@/components/ui/Paes";
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
  // The first look in the current filter leads the surface. Null-safe: an empty
  // category still renders, the slot falling back to prepared ground.
  const hero = looks[0];

  return (
    <div className="ink-field min-h-dvh flex flex-col">
      {/* The work leads. A portrait runs full-bleed off the top edge and
          resolves down into the ink ground, with the ornament set across the
          line where it resolves — the ground of the page and the ground of the
          ornament are the same surface. The wordmark then sits INTO that fade
          rather than after it, so the first viewport is one object. */}
      <header className="relative">
        <div className="relative h-[392px] w-full overflow-hidden">
          <Media
            src={hero?.heroImage ?? null}
            alt={hero ? l(lang, hero.title, hero.titleId) : "Shana"}
            shape="rect"
            className="absolute inset-0 h-full w-full"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/5 to-bg"
          />
          <PaesCrown
            tone="edge"
            className="absolute left-1/2 bottom-6 w-[66%] -translate-x-1/2"
          />
        </div>
        <h1 className="relative -mt-8 text-center font-display text-[clamp(3.5rem,19vw,5.5rem)] leading-[0.84]">
          Shana
        </h1>
        <p className="mx-auto mt-5 max-w-[34ch] px-5 text-center text-[12.5px] leading-[1.65] text-melati-2">
          {l(
            lang,
            "Skin first, structure second, colour last. Bridal work built to survive tears, prayer and photographers.",
            "Kulit dulu, struktur kedua, warna terakhir. Rias pengantin yang tahan tangis, doa dan kamera."
          )}
        </p>
      </header>

      {/* The commercial facts, on a band closed by a prada hairline, with the
          one leaf-filled action of the surface at its right. A date and a price
          are figures: tabular, and never wrapped. */}
      <section className="px-5 pt-8">
        {/* Below 360px the date and the action cannot share a row: the button
            will not shrink, so the date lost its time to an ellipsis on an
            iPhone SE ("Tue 25 Aug ·…"). The one fact this band exists to state
            is never abbreviated — under 360 the action drops to its own
            full-width row instead, which is a better tap target anyway. */}
        <div className="prada-edge leaf-catch flex flex-col items-stretch gap-3 px-4 py-3.5 min-[360px]:flex-row min-[360px]:items-center">
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-melati-3">
              {l(lang, "Next opening", "Slot terdekat")}
            </div>
            <div className="font-display tabular-nums text-[20px] leading-tight mt-1">
              {formatOpeningLine(opening, lang)}
            </div>
            <div className="text-[11px] text-melati-3 mt-1.5 leading-snug">
              {l(
                lang,
                "One booking a day, travel included",
                "Satu pesanan per hari, termasuk perjalanan"
              )}
            </div>
          </div>
          <Link
            href="/book"
            className="prada-leaf inline-flex h-[42px] w-full items-center justify-center px-4 text-[12.5px] min-[360px]:w-auto min-[360px]:flex-none"
          >
            {l(lang, "Take this slot", "Ambil slot ini")}
          </Link>
        </div>
      </section>

      <div className="px-5 pt-3">
        <Link
          href="/looks"
          className="plate-quiet flex h-[44px] items-center px-4 text-[12.5px] text-melati-3"
        >
          {l(lang, "Search looks, dates, add-ons", "Cari tampilan, tanggal, tambahan")}
        </Link>
      </div>

      {/* Directly under the slot band: someone who has just read a date and a
          price is exactly the person with a question about it. */}
      <div className="px-5 pt-3">
        <Link
          href={chatHref}
          className="plate-quiet flex items-center gap-3.5 px-4 py-3.5"
        >
          <span className="relative h-11 w-11 flex-none overflow-hidden rounded-full border border-prada/40">
            {viewer?.avatarUrl ? (
              <Media
                src={viewer.avatarUrl}
                alt={viewer.name}
                shape="rect"
                className="h-full w-full"
                sizes="44px"
              />
            ) : (
              <PersonPlaceholder
                className="h-full w-full"
                label={l(lang, "Your profile photo", "Foto profilmu")}
              />
            )}
            {waitingChats > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-bg bg-alarm px-1 text-[10px] font-semibold tabular-nums text-melati">
                {waitingChats}
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-bg bg-sirih"
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] text-melati">
              {isArtist
                ? l(lang, "Client chats", "Chat klien")
                : l(lang, "Ask the assistant", "Tanya asisten")}
            </span>
            <span className="mt-1 block text-[11.5px] leading-snug text-melati-3">
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
        </Link>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-auto px-5 pt-7 pb-0.5">
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

      <h2 className="px-5 pt-6 font-display text-[26px] leading-none">
        {l(lang, "Most booked", "Paling banyak dipesan")}
      </h2>
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {looks.map((k) => (
          <LookCard key={k.id} look={k} lang={lang} size="sm" />
        ))}
      </div>

      <div className="min-h-8 flex-1" />
      <TabBar lang={lang} />
    </div>
  );
}
