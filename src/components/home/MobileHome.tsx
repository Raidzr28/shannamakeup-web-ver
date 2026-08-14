import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { ChipLink } from "@/components/ui/Option";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
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
}: {
  lang: Lang;
  looks: LookDTO[];
  category: string;
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
        <Link
          href="/chat"
          className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px]"
        >
          ◔
        </Link>
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
            <Media src={null} alt="promo" placeholder="✨" />
          </span>
        </div>
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
      <MobileTabBar lang={lang} />
    </div>
  );
}
