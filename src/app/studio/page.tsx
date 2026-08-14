import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { l } from "@/lib/i18n";

const FACTS = [
  {
    k: { en: "Where", id: "Di mana" },
    v: { en: "Jl. Bangka Raya, Kemang, Jakarta Selatan", id: "Jl. Bangka Raya, Kemang, Jakarta Selatan" },
  },
  {
    k: { en: "Hours", id: "Jam" },
    v: { en: "By appointment — one booking a day", id: "Dengan janji — satu pesanan per hari" },
  },
  {
    k: { en: "Travel", id: "Perjalanan" },
    v: { en: "Jakarta included, elsewhere at cost", id: "Jakarta termasuk, di luar sesuai biaya" },
  },
  {
    k: { en: "Trials", id: "Trial" },
    v: { en: "Two hours, six weeks before the day", id: "Dua jam, enam minggu sebelum hari-H" },
  },
];

export default async function StudioPage() {
  const lang = await getLanguage();

  const body = (
    <>
      <p className="text-[14.5px] leading-relaxed text-muted max-w-[52ch]">
        {l(
          lang,
          "Shana has worked one chair at a time since 2015 — akad mornings that start at 03:00, receptions lit for stage, campaign sets where the brief matters more than the trend. The studio in Kemang is where trials run and kits are packed the night before.",
          "Shana bekerja satu kursi sekaligus sejak 2015 — pagi akad yang mulai jam 03:00, resepsi dengan lampu panggung, set kampanye di mana brief lebih penting dari tren. Studio di Kemang adalah tempat trial berjalan dan kit dikemas malam sebelumnya."
        )}
      </p>

      <div className="flex flex-col gap-2.5 mt-6">
        {FACTS.map((f) => (
          <div key={f.k.en} className="glass-card p-4 flex gap-3 justify-between items-start">
            <span className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3 flex-none w-24">
              {l(lang, f.k.en, f.k.id)}
            </span>
            <span className="text-[13.5px] text-ink text-right flex-1">
              {l(lang, f.v.en, f.v.id)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-7">
        <Link
          href="/book"
          className="h-[52px] px-6 rounded-2xl text-white text-[15px] font-bold flex items-center glass-fill"
        >
          {l(lang, "Check a date", "Cek tanggal")}
        </Link>
        <Link
          href="/looks"
          className="h-[52px] px-6 rounded-2xl text-ink text-[15px] font-bold flex items-center glass-light"
        >
          {l(lang, "See the feed", "Lihat feed")}
        </Link>
      </div>
    </>
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
        <div className="px-5 pt-2">
          <h1 className="text-[28px] font-extrabold tracking-tight">
            {l(lang, "The studio", "Studio")}
          </h1>
        </div>
        <div className="px-5 pt-4">
          <Media
            src={null}
            alt="Kemang studio"
            placeholder={l(lang, "Kemang studio", "Studio Kemang")}
            className="h-[220px]"
            sizes="100vw"
          />
        </div>
        <div className="px-5 pt-5 pb-8">{body}</div>
        <div className="flex-1 min-h-6" />
        <TabBar lang={lang} />
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <div className="grid grid-cols-[1fr_1.1fr] gap-10 items-start pb-24">
        <div>
          <h1 className="text-5xl font-extrabold tracking-[-0.03em]">
            {l(lang, "The studio", "Studio")}
          </h1>
          <div className="mt-6">{body}</div>
        </div>
        <Media
          src={null}
          alt="Kemang studio"
          placeholder={l(lang, "Kemang studio", "Studio Kemang")}
          className="h-[520px] rounded-[28px] border border-white/70 shadow-[0_18px_44px_rgba(28,38,32,0.12)]"
          sizes="55vw"
        />
      </div>
    </div>
      </DesktopOnly>
    </>
  );
}
