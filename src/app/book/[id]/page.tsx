import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Media } from "@/components/ui/Media";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { getLook } from "@/lib/looks";
import { l, idr } from "@/lib/i18n";
import { BackIcon } from "@/components/ui/Icons";

type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SP>;
}) {
  const [{ id }, sp, lang, user] = await Promise.all([
    params,
    searchParams,
    getLanguage(),
    getCurrentUser(),
  ]);

  const look = await getLook(id);
  if (!look) notFound();

  const rawExtras = sp.extras;
  const extras = Array.isArray(rawExtras)
    ? rawExtras
    : rawExtras
      ? [rawExtras]
      : undefined;

  const defaults = {
    name: one(sp.name) || user?.name || "",
    email: one(sp.email) || user?.email || "",
    date: one(sp.date),
    time: one(sp.time),
    venue: one(sp.venue),
    extras,
    // A carried-over query value wins, then whatever the profile has saved.
    phone: one(sp.phone) || user?.phone || "",
    city: one(sp.city) || user?.city || "",
    notes: one(sp.notes),
    step: one(sp.step),
  };

  const wizard = (
    <BookingWizard lang={lang} look={look} signedIn={!!user} defaults={defaults} />
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
        <div className="px-5 pt-2 pb-4 flex items-center gap-3">
          <Link
            href={`/l/${look.id}`}
            className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
          >
            <BackIcon className="w-[18px] h-[18px]" />
          </Link>
          <div className="flex-1 text-center font-bold text-[15.5px]">
            {l(lang, look.title, look.titleId)}
          </div>
          <span className="w-[38px]" />
        </div>
        {wizard}
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <Link href={`/l/${look.id}`} className="text-[13px] font-semibold text-muted">
        <BackIcon className="w-4 h-4" /> {l(lang, "Back to the look", "Kembali ke tampilan")}
      </Link>
      <div className="grid grid-cols-[1fr_400px] gap-9 mt-5 items-start pb-24">
        <div>
          <h1 className="text-4xl font-display mb-6">
            {l(lang, "Book", "Pesan")} {l(lang, look.title, look.titleId)}
          </h1>
          {wizard}
        </div>
        <div className="glass-card p-6 sticky top-24 flex flex-col gap-4">
          <Media
            src={look.heroImage}
            alt={l(lang, look.title, look.titleId)}
            placeholder={l(lang, look.title, look.titleId)}
            className="h-[200px]"
            sizes="400px"
          />
          <div>
            <div className="font-display text-xl">
              {l(lang, look.title, look.titleId)}
            </div>
            <div className="text-[12.5px] text-muted-2 mt-1">
              {l(lang, look.category, look.categoryId)} · {look.durationLabel}
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            {l(lang, look.blurb, look.blurbId)}
          </p>
          <div className="h-px bg-line" />
          <div className="flex justify-between text-[13.5px]">
            <span className="text-muted">{l(lang, "Package", "Paket")}</span>
            <span className="font-bold">{idr(look.priceIdr)}</span>
          </div>
        </div>
      </div>
    </div>
      </DesktopOnly>
    </>
  );
}
