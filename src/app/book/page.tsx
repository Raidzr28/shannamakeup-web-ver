import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { LookCard } from "@/components/home/LookCard";
import { getLanguage } from "@/lib/language";
import { getLooks } from "@/lib/looks";
import { l, idr } from "@/lib/i18n";

export default async function BookIndexPage() {
  const [lang, looks] = await Promise.all([getLanguage(), getLooks()]);

  const heading = l(lang, "Which look are we booking?", "Tampilan mana yang dipesan?");
  const sub = l(
    lang,
    "Pick a package to start. You can still change the date, add-ons and venue on the next steps.",
    "Pilih paket untuk mulai. Tanggal, tambahan dan lokasi masih bisa diubah di langkah berikutnya."
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2">
            <h1 className="font-extrabold text-[22px] tracking-tight">{heading}</h1>
            <p className="text-xs text-muted-3 mt-1.5 leading-snug">{sub}</p>
          </div>

          <div className="flex flex-col gap-3 px-5 pt-4.5">
            {looks.map((k) => (
              <Link
                key={k.id}
                href={`/book/${k.id}`}
                className="glass-card p-3 flex gap-3.5 items-center"
              >
                <Media
                  src={k.heroImage}
                  alt={l(lang, k.title, k.titleId)}
                  placeholder={l(lang, k.title, k.titleId)}
                  className="w-[68px] h-[68px] flex-none"
                  sizes="68px"
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[15px] truncate">
                    {l(lang, k.title, k.titleId)}
                  </span>
                  <span className="block text-[11.5px] text-muted-3 mt-1">
                    {l(lang, k.category, k.categoryId)} · {k.durationLabel}
                  </span>
                  <span className="block font-extrabold text-[13.5px] text-green mt-1.5">
                    {idr(k.priceIdr)}
                  </span>
                </span>
                <span className="text-muted-2 text-lg flex-none" aria-hidden="true">
                  ›
                </span>
              </Link>
            ))}
          </div>

          <div className="flex-1 min-h-6" />
          <MobileTabBar lang={lang} />
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <h1 className="text-4xl font-extrabold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted mt-3 max-w-[60ch]">{sub}</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4.5 mt-8 pb-24">
            {looks.map((k) => (
              <LookCard key={k.id} look={k} lang={lang} size="lg" href={`/book/${k.id}`} />
            ))}
          </div>
        </div>
      </DesktopOnly>
    </>
  );
}
