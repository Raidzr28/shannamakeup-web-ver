import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getLooks } from "@/lib/looks";
import { requireArtistPage } from "@/lib/require-artist";
import { prisma } from "@/lib/prisma";
import { l, idr } from "@/lib/i18n";
import { deletePackageAction } from "@/lib/actions/packages";

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireArtistPage("/manage");
  const [lang, looks, params] = await Promise.all([
    getLanguage(),
    getLooks(),
    searchParams,
  ]);

  // Shown per row so the artist knows what a delete would orphan.
  const counts = await prisma.booking.groupBy({
    by: ["lookId"],
    _count: { _all: true },
  });
  const bookingsFor = new Map(counts.map((c) => [c.lookId, c._count._all]));

  const body = (
    <div className="flex flex-col gap-3">
      {params.error && (
        <p
          role="alert"
          className="text-[13px] leading-snug text-[#b23a3a] bg-[#f7eeee] border border-[#b23a3a]/25 rounded-2xl px-3.5 py-3"
        >
          {params.error}
        </p>
      )}

      <Link
        href="/manage/new"
        className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
      >
        {l(lang, "+ New package", "+ Paket baru")}
      </Link>

      {looks.map((k) => {
        const used = bookingsFor.get(k.id) ?? 0;
        return (
          <div key={k.id} className="glass-card p-3 flex gap-3.5 items-center">
            <Media
              src={k.heroImage}
              alt={l(lang, k.title, k.titleId)}
              placeholder={l(lang, k.title, k.titleId)}
              className="w-[62px] h-[62px] flex-none"
              sizes="62px"
            />
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-[15px] truncate">
                {l(lang, k.title, k.titleId)}
              </span>
              <span className="block text-[11.5px] text-muted-3 mt-0.5">
                {l(lang, k.category, k.categoryId)} · {k.durationLabel}
              </span>
              <span className="block font-extrabold text-[13px] text-green mt-1">
                {idr(k.priceIdr)}
              </span>
              {used > 0 && (
                <span className="block text-[10.5px] text-muted-2 mt-1">
                  {used} {l(lang, used === 1 ? "booking" : "bookings", "pesanan")}
                </span>
              )}
            </span>
            <span className="flex flex-col gap-1.5 flex-none">
              <Link
                href={`/manage/${k.id}`}
                className="px-3.5 py-2 rounded-xl text-[12.5px] font-bold text-ink glass-light text-center"
              >
                {l(lang, "Edit", "Ubah")}
              </Link>
              <form action={deletePackageAction}>
                <input type="hidden" name="id" value={k.id} />
                <button
                  type="submit"
                  className="w-full px-3.5 py-2 rounded-xl text-[12.5px] font-bold text-[#b23a3a] glass-light border-[#b23a3a]/25 cursor-pointer"
                >
                  {l(lang, "Delete", "Hapus")}
                </button>
              </form>
            </span>
          </div>
        );
      })}

      {looks.length === 0 && (
        <p className="text-[13.5px] text-muted text-center py-8">
          {l(lang, "No packages yet.", "Belum ada paket.")}
        </p>
      )}
    </div>
  );

  const heading = l(lang, "Manage packages", "Kelola paket");
  const sub = l(
    lang,
    "These are the packages clients can book. Changes show up on the site immediately.",
    "Ini paket yang bisa dipesan klien. Perubahan langsung tampil di situs."
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2">
            <h1 className="font-extrabold text-[22px] tracking-tight">{heading}</h1>
            <p className="text-xs text-muted-3 mt-1.5 leading-snug">{sub}</p>
          </div>
          <div className="px-5 pt-4.5">{body}</div>
          <div className="flex-1 min-h-6" />
          <TabBar lang={lang} />
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <h1 className="text-4xl font-extrabold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted mt-3 max-w-[60ch]">{sub}</p>
          <div className="max-w-[760px] mt-8 pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
