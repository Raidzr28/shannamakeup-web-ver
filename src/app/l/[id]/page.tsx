import Link from "next/link";
import { notFound } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getLook } from "@/lib/looks";
import { l, idr } from "@/lib/i18n";

export default async function LookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lang, look] = await Promise.all([getLanguage(), getLook(id)]);
  if (!look) notFound();

  const title = l(lang, look.title, look.titleId);
  const includes = lang === "id" ? look.includesId : look.includes;

  return (
    <>
      <MobileOnly>
      <div className="min-h-full bg-[#f4f5f3] flex flex-col">
        <div className="relative h-[344px]">
          <Media src={look.heroImage} alt={title} placeholder={title} shape="rect" className="h-full w-full" />
          <Link
            href="/"
            className="absolute top-16 left-5 w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
          >
            ←
          </Link>
        </div>

        <div className="flex-1 bg-[#f4f5f3] rounded-t-[26px] -mt-6.5 relative px-5 pt-5.5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h1 className="text-[25px] font-extrabold tracking-tight leading-tight">{title}</h1>
              <div className="text-[12.5px] text-muted-2 mt-1.5">
                {l(lang, look.category, look.categoryId)} · {look.durationLabel}
              </div>
            </div>
            <div className="font-extrabold text-xl text-green whitespace-nowrap">
              {idr(look.priceIdr)}
            </div>
          </div>
          <p className="mt-3.5 text-[13.5px] leading-relaxed text-muted">
            {l(lang, look.blurb, look.blurbId)}
          </p>

          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3 mt-5">
            {l(lang, "What’s included", "Yang termasuk")}
          </div>
          <div className="flex flex-col gap-2 mt-2.5">
            {includes.map((item) => (
              <div key={item} className="flex gap-2.5 items-center glass-card px-3.5 py-3 rounded-2xl">
                <span className="w-5 h-5 rounded-full bg-tint text-green text-[11px] flex items-center justify-center flex-none font-extrabold">
                  ✓
                </span>
                <span className="text-[13.5px]">{item}</span>
              </div>
            ))}
          </div>
          <div className="h-6" />
        </div>

        <div className="sticky bottom-0 px-5 pt-3.5 pb-5 bg-gradient-to-b from-white/72 to-white/90 backdrop-blur-2xl border-t border-white/80">
          <Link
            href={`/book/${look.id}`}
            className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
          >
            {l(lang, "Book this look", "Pesan tampilan ini")} · {idr(look.priceIdr)}
          </Link>
        </div>
        <MobileTabBar lang={lang} />
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <Link href="/" className="text-[13px] font-semibold text-muted">
        ← {l(lang, "Back to work", "Kembali ke karya")}
      </Link>
      <div className="grid grid-cols-[1.1fr_1fr] gap-10 mt-6 items-start">
        <Media
          src={look.heroImage}
          alt={title}
          placeholder={title}
          className="h-[540px] rounded-[28px] border border-white/70 shadow-[0_18px_44px_rgba(28,38,32,0.12)]"
          sizes="55vw"
        />
        <div className="glass-card p-8 sticky top-24">
          <h1 className="text-[40px] font-extrabold tracking-[-0.03em] leading-tight">{title}</h1>
          <div className="text-sm text-muted-2 mt-2">
            {l(lang, look.category, look.categoryId)} · {look.durationLabel}
          </div>
          <div className="font-extrabold text-[28px] text-green mt-4">{idr(look.priceIdr)}</div>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            {l(lang, look.blurb, look.blurbId)}
          </p>

          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3 mt-7">
            {l(lang, "What’s included", "Yang termasuk")}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {includes.map((item) => (
              <div key={item} className="flex gap-2.5 items-center">
                <span className="w-5 h-5 rounded-full bg-tint text-green text-[11px] flex items-center justify-center flex-none font-extrabold">
                  ✓
                </span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          <Link
            href={`/book/${look.id}`}
            className="mt-8 w-full h-[54px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
          >
            {l(lang, "Book this look", "Pesan tampilan ini")}
          </Link>
        </div>
      </div>
    </div>
      </DesktopOnly>
    </>
  );
}
