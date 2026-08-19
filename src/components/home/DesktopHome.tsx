import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { ChipLink } from "@/components/ui/Option";
import { PaesCrown } from "@/components/ui/Paes";
import { LookCard } from "./LookCard";
import type { Lang } from "@/lib/i18n";
import { l, p, idr } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";
import { CATEGORIES } from "@/lib/static-data";

/** Studio figures carried over from the previous build unchanged. These are
 *  claims about a real business, so they are preserved rather than restated or
 *  rounded — only their presentation changed. */
const STATS = [
  { k: { en: "Faces since 2015", id: "Wajah sejak 2015" }, v: "1.240" },
  { k: { en: "Bookings a day", id: "Pesanan per hari" }, v: "1" },
  { k: { en: "Cities travelled", id: "Kota disinggahi" }, v: "19" },
  { k: { en: "Repeat families", id: "Keluarga berulang" }, v: "38%" },
];

const FLOW = [
  {
    n: "01",
    name: { en: "Pick a look", id: "Pilih tampilan" },
    note: {
      en: "Every photograph in the portfolio is a bookable service with a fixed price.",
      id: "Setiap foto di portofolio adalah layanan dengan harga tetap.",
    },
  },
  {
    n: "02",
    name: { en: "Hold the date", id: "Kunci tanggal" },
    note: {
      en: "One booking a day. A 30% deposit takes the slot off the calendar.",
      id: "Satu pesanan per hari. Deposit 30% mengeluarkan slot dari kalender.",
    },
  },
  {
    n: "03",
    name: { en: "Trial and call sheet", id: "Trial dan call sheet" },
    note: {
      en: "Optional trial six weeks out; the call sheet arrives one week before.",
      id: "Trial opsional enam minggu sebelum; call sheet dikirim seminggu sebelumnya.",
    },
  },
  {
    n: "04",
    name: { en: "The day itself", id: "Hari acara" },
    note: {
      en: "Shana arrives 90 minutes before the call, balance settles after.",
      id: "Shana datang 90 menit sebelum jadwal, sisa dibayar setelahnya.",
    },
  },
];

export function DesktopHome({
  lang,
  looks,
  category,
  featured,
  chatHref,
}: {
  lang: Lang;
  looks: LookDTO[];
  category: string;
  featured: LookDTO;
  /** Points the artist at her client inbox rather than a thread with herself. */
  chatHref: string;
}) {
  return (
    <div className="ink-field flex-1">
      <div className="grid grid-cols-[1.05fr_1fr] items-center gap-12 px-11 pt-12">
        <div>
          {/* The ornament opens the surface. It replaces the category pill that
              used to sit here: a label above a heading is a caption apologising
              for the heading, and this heading does not need one. */}
          <PaesCrown className="h-auto w-[212px]" />
          <h1 className="mt-7 max-w-[15ch] font-display text-[68px] leading-[0.94]">
            {l(lang, "Makeup that holds all day.", "Rias yang tahan sepanjang hari.")}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.7] text-melati-2">
            {l(
              lang,
              "Eleven years of akad mornings, receptions and campaign sets. One artist, one chair, a schedule you can read.",
              "Sebelas tahun pagi akad, resepsi dan set kampanye. Satu artist, satu kursi, jadwal yang bisa kamu baca."
            )}
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/book"
              className="prada-leaf flex h-[52px] items-center px-7 text-[15px]"
            >
              {l(lang, "Check a date", "Cek tanggal")}
            </Link>
            <Link
              href={chatHref}
              className="flex h-[52px] items-center rounded-xl border border-prada/35 px-7 text-[15px] text-melati-2 transition-colors hover:border-prada/70 hover:text-melati"
            >
              {l(lang, "Ask the assistant", "Tanya asisten")}
            </Link>
          </div>
          {/* Figures on a ruled band, set in the display face with tabular
              numerals so the column edges line up. */}
          <dl className="mt-10 grid grid-cols-4 gap-6 border-t border-prada/25 pt-5">
            {STATS.map((s) => (
              <div key={s.k.en}>
                <dt className="text-[10px] uppercase tracking-[0.1em] text-melati-3">
                  {l(lang, s.k.en, s.k.id)}
                </dt>
                <dd className="mt-2 font-display text-[27px] leading-none tabular-nums">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {/* The featured look's own photograph. This slot was hardcoded to null,
            so the largest frame on the page rendered as empty ground while real
            portraits sat in the grid directly below it. */}
        <Media
          src={featured.heroImage}
          alt={l(lang, featured.title, featured.titleId)}
          shape="rect"
          className="h-[492px] rounded-[26px_26px_8px_8px] border border-prada/40"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </div>

      <div className="flex items-end justify-between gap-6 px-11 pt-20">
        <h2 className="font-display text-[38px] leading-none">
          {l(lang, "Selected work", "Karya terpilih")}
        </h2>
        <div className="flex gap-2">
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
      </div>
      <div className="grid grid-cols-4 gap-4 px-11 pt-7">
        {looks.map((k) => (
          <LookCard key={k.id} look={k} lang={lang} size="lg" />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_400px] items-start gap-10 px-11 pt-20">
        <div>
          <h2 className="font-display text-[38px] leading-none">
            {l(lang, "How a booking runs", "Alur pemesanan")}
          </h2>
          {/* A ruled sequence rather than four identical cards. The numbers stay
              because the order is the information — step three cannot happen
              before step two. */}
          <ol className="mt-7 border-t border-prada/25">
            {FLOW.map((f) => (
              <li
                key={f.n}
                className="grid grid-cols-[auto_1fr] gap-6 border-b border-prada/25 py-5"
              >
                <span className="pt-1 font-display text-[15px] tabular-nums text-prada">
                  {f.n}
                </span>
                <div>
                  <h3 className="font-display text-[21px] leading-none">
                    {l(lang, f.name.en, f.name.id)}
                  </h3>
                  <p className="mt-2.5 max-w-[56ch] text-[13.5px] leading-[1.7] text-melati-2">
                    {l(lang, f.note.en, f.note.id)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="plate sticky top-24 flex flex-col gap-4 p-6">
          {/* No "Start here" label above this name. A caption over a heading is
              the heading apologising for itself. */}
          <div className="font-display text-[24px] leading-none">
            {l(lang, featured.title, featured.titleId)}
          </div>
          <Media
            src={featured.heroImage}
            alt={l(lang, featured.title, featured.titleId)}
            shape="rect"
            className="h-[184px] rounded-[18px_18px_6px_6px]"
          />
          <p className="text-[13px] leading-[1.7] text-melati-2">
            {l(lang, featured.blurb, featured.blurbId)}
          </p>
          <div className="h-px bg-prada/25" />
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] text-melati-3">
              {l(lang, "From", "Mulai")}
            </span>
            <span className="font-display text-[22px] tabular-nums text-prada">
              {idr(featured.priceIdr)}
            </span>
          </div>
          <Link
            href={`/book/${featured.id}`}
            className="prada-leaf flex h-[50px] w-full items-center justify-center text-[15px]"
          >
            {l(lang, "Continue", "Lanjut")}
          </Link>
        </div>
      </div>

      <div className="px-11 pt-20 pb-20">
        <div className="prada-edge leaf-catch flex items-center gap-10 rounded-[26px_26px_8px_8px] p-11">
          <div className="flex-1">
            {/* The 2026 line carries real information, so it stays — but below
                the heading as a statement, not above it as a caption. */}
            <p className="max-w-[24ch] font-display text-[42px] leading-[1.05]">
              {l(
                lang,
                "Thirty-one dates left this year. Bridal calls close six weeks out.",
                "Tersisa tiga puluh satu tanggal tahun ini. Pesanan pengantin ditutup enam minggu sebelumnya."
              )}
            </p>
            <div className="mt-4 text-[12.5px] text-melati-3">
              {p(lang, "Booking for 2026 is open", "Pemesanan 2026 dibuka")}
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                href="/book"
                className="prada-leaf flex h-[50px] items-center px-7 text-[14.5px]"
              >
                {l(lang, "Check a date", "Cek tanggal")}
              </Link>
              <Link
                href={chatHref}
                className="flex h-[50px] items-center rounded-xl border border-prada/35 px-7 text-[14.5px] text-melati-2 transition-colors hover:border-prada/70 hover:text-melati"
              >
                {l(lang, "Ask the assistant", "Tanya asisten")}
              </Link>
            </div>
          </div>
          <PaesCrown className="hidden h-auto w-[240px] flex-none opacity-70 xl:block" />
        </div>
      </div>
    </div>
  );
}
