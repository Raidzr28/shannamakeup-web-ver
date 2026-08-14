import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { ChipLink } from "@/components/ui/Option";
import { LookCard } from "./LookCard";
import type { Lang } from "@/lib/i18n";
import { l, p, idr } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";
import { CATEGORIES } from "@/lib/static-data";

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
}: {
  lang: Lang;
  looks: LookDTO[];
  category: string;
  featured: LookDTO;
}) {
  return (
    <div className="ambient-glow flex-1">
      <div className="px-11 pt-11 grid grid-cols-[1.05fr_1fr] gap-9 items-center">
        <div>
          <span className="inline-block px-3.5 py-2 rounded-full bg-tint text-maroon text-[12.5px] font-bold">
            {p(lang, "Bridal · Editorial · Jakarta", "Pengantin · Editorial · Jakarta")}
          </span>
          <h1 className="mt-5 text-[58px] leading-[1.03] tracking-[-0.04em] font-extrabold max-w-[16ch]">
            {l(lang, "Makeup that holds all day.", "Rias yang tahan sepanjang hari.")}
          </h1>
          <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-muted">
            {l(
              lang,
              "Eleven years of akad mornings, receptions and campaign sets. One artist, one chair, a schedule you can read.",
              "Sebelas tahun pagi akad, resepsi dan set kampanye. Satu artist, satu kursi, jadwal yang bisa kamu baca."
            )}
          </p>
          <div className="flex gap-3 mt-7">
            <Link
              href="/book"
              className="h-[54px] px-6 rounded-2xl text-white text-[15px] font-bold flex items-center glass-fill"
            >
              {l(lang, "Check a date", "Cek tanggal")}
            </Link>
            <Link
              href="/chat"
              className="h-[54px] px-6 rounded-2xl text-ink text-[15px] font-bold flex items-center glass-light"
            >
              {l(lang, "Ask the assistant", "Tanya asisten")}
            </Link>
          </div>
          <div className="flex gap-7 mt-8">
            {STATS.map((s) => (
              <span key={s.k.en}>
                <span className="block font-extrabold text-2xl tracking-tight">{s.v}</span>
                <span className="block text-xs text-muted-2 mt-1">{l(lang, s.k.en, s.k.id)}</span>
              </span>
            ))}
          </div>
        </div>
        <Media
          src={null}
          alt="Hero portrait"
          placeholder={l(lang, "Hero portrait", "Foto utama")}
          className="h-[440px] rounded-[28px] border border-white/70 shadow-[0_18px_44px_rgba(28,38,32,0.12)]"
        />
      </div>

      <div className="px-11 pt-13 flex items-center justify-between gap-6">
        <h2 className="text-3xl font-extrabold tracking-tight">
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
      <div className="grid grid-cols-4 gap-4.5 px-11 pt-5.5">
        {looks.map((k) => (
          <LookCard key={k.id} look={k} lang={lang} size="lg" />
        ))}
      </div>

      <div className="px-11 pt-13 grid grid-cols-[1fr_400px] gap-8 items-start">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {l(lang, "How a booking runs", "Alur pemesanan")}
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-5.5">
            {FLOW.map((f) => (
              <div key={f.n} className="glass-card p-[18px]">
                <span className="w-[34px] h-[34px] rounded-xl bg-tint text-maroon flex items-center justify-center font-extrabold text-[13px]">
                  {f.n}
                </span>
                <div className="font-bold text-[17px] mt-3.5">{l(lang, f.name.en, f.name.id)}</div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {l(lang, f.note.en, f.note.id)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-3.5 sticky top-24">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Start here", "Mulai di sini")}
          </div>
          <div className="font-extrabold text-[22px] tracking-tight">
            {l(lang, featured.title, featured.titleId)}
          </div>
          <Media
            src={featured.heroImage}
            alt={l(lang, featured.title, featured.titleId)}
            placeholder={l(lang, featured.title, featured.titleId)}
            className="h-[180px]"
          />
          <p className="text-[13px] leading-relaxed text-muted">
            {l(lang, featured.blurb, featured.blurbId)}
          </p>
          <div className="h-px bg-line" />
          <div className="flex justify-between text-[13.5px]">
            <span className="text-muted">{l(lang, "From", "Mulai")}</span>
            <span className="font-bold">{idr(featured.priceIdr)}</span>
          </div>
          <Link
            href={`/book/${featured.id}`}
            className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
          >
            {l(lang, "Continue", "Lanjut")}
          </Link>
        </div>
      </div>

      <div className="px-11 pt-14 pb-16">
        <div className="flex gap-8 items-center text-white rounded-[28px] p-11 glass-fill">
          <div className="flex-1">
            <div className="text-xs font-semibold tracking-[0.08em] uppercase opacity-80">
              {p(lang, "Booking for 2026 is open", "Pemesanan 2026 dibuka")}
            </div>
            <div className="font-extrabold text-[38px] leading-tight tracking-tight max-w-[26ch] mt-4">
              {l(
                lang,
                "Thirty-one dates left this year. Bridal calls close six weeks out.",
                "Tersisa tiga puluh satu tanggal tahun ini. Pesanan pengantin ditutup enam minggu sebelumnya."
              )}
            </div>
            <div className="flex gap-3 mt-6.5">
              <Link
                href="/book"
                className="h-[50px] px-6 rounded-2xl text-maroon text-[14.5px] font-bold flex items-center glass-light"
              >
                {l(lang, "Check a date", "Cek tanggal")}
              </Link>
              <Link
                href="/chat"
                className="h-[50px] px-6 rounded-2xl text-white text-[14.5px] font-bold flex items-center bg-gradient-to-br from-white/26 to-white/10 backdrop-blur-md border border-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]"
              >
                {l(lang, "Ask the assistant", "Tanya asisten")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
