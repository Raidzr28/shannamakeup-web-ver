import Link from "next/link";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { prisma } from "@/lib/prisma";
import { statusLabel, statusTone, isAwaitingArtist } from "@/lib/booking-status";
import { l, idr } from "@/lib/i18n";

const FILTERS = [
  { id: "inbox", en: "Needs you", id_: "Perlu tindakan" },
  { id: "requested", en: "Requests", id_: "Permintaan" },
  { id: "payment_review", en: "Payments", id_: "Pembayaran" },
  { id: "confirmed", en: "Confirmed", id_: "Terkonfirmasi" },
  { id: "all", en: "All", id_: "Semua" },
] as const;

export default async function ManageBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireArtistPage("/manage/bookings");
  const [lang, sp] = await Promise.all([getLanguage(), searchParams]);

  const filter = FILTERS.some((f) => f.id === sp.filter) ? sp.filter! : "inbox";
  const where =
    filter === "inbox"
      ? { status: { in: ["requested", "payment_review"] } }
      : filter === "all"
        ? {}
        : { status: filter };

  const [bookings, counts] = await Promise.all([
    prisma.booking.findMany({
      where,
      // Oldest first inside the queue: the person who has waited longest for an
      // answer is the one to answer next.
      orderBy: filter === "inbox" ? { createdAt: "asc" } : { createdAt: "desc" },
      include: { look: true, user: true },
    }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (id: string) => {
    if (id === "all") return counts.reduce((n, c) => n + c._count._all, 0);
    if (id === "inbox")
      return counts
        .filter((c) => isAwaitingArtist(c.status))
        .reduce((n, c) => n + c._count._all, 0);
    return counts.find((c) => c.status === id)?._count._all ?? 0;
  };

  const body = (
    <div className="flex flex-col gap-3">
      <div className="no-scrollbar flex gap-2 overflow-auto pb-1">
        {FILTERS.map((f) => {
          const on = f.id === filter;
          const n = countFor(f.id);
          return (
            <Link
              key={f.id}
              href={`/manage/bookings?filter=${f.id}`}
              className={`flex-none px-3.5 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap border ${
                on
                  ? "glass-fill text-white border-transparent"
                  : "glass-light text-[#5c4a3f] border-white/80"
              }`}
            >
              {l(lang, f.en, f.id_)}
              {n > 0 && <span className={on ? "opacity-80" : "text-muted-3"}> · {n}</span>}
            </Link>
          );
        })}
      </div>

      {bookings.length === 0 && (
        <div className="glass-card p-6 text-center">
          <p className="m-0 text-[13.5px] text-muted leading-relaxed">
            {filter === "inbox"
              ? l(lang, "Nothing waiting on you.", "Tidak ada yang menunggu.")
              : l(lang, "Nothing here yet.", "Belum ada di sini.")}
          </p>
        </div>
      )}

      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/manage/bookings/${b.id}`}
          className="glass-card p-[18px] flex flex-col gap-2"
        >
          <span className="flex items-center gap-2 justify-between">
            <span className="font-bold text-[15px]">{b.name}</span>
            <span
              className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${statusTone(b.status)}`}
            >
              {statusLabel(lang, b.status)}
            </span>
          </span>
          <span className="block text-[12px] text-muted-2">
            {l(lang, b.look.title, b.look.titleId)} ·{" "}
            {b.date.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · {b.timeLabel}
          </span>
          <span className="flex items-center gap-2 justify-between">
            <span className="text-[11.5px] text-muted-3">
              {b.code} · {b.city || "—"}
            </span>
            <span className="font-extrabold text-[13.5px] text-maroon">
              {idr(b.depositIdr)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );

  const heading = l(lang, "Reservations", "Reservasi");
  const sub = l(
    lang,
    "Every request lands here. Accept the date, then check the deposit receipt before the booking is locked.",
    "Semua permintaan masuk ke sini. Terima tanggalnya, lalu periksa bukti deposit sebelum pesanan dikunci."
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
