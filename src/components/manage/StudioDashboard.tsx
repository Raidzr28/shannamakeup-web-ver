import Link from "next/link";
import type { AdminStats } from "@/lib/admin-stats";
import { statusLabel, statusTone } from "@/lib/booking-status";
import { countdownLabel, dayParts, longDate, waitingLabel } from "@/lib/booking-time";
import type { Lang } from "@/lib/i18n";
import { l, idr } from "@/lib/i18n";

/** The shape both lists need — a structural subset of the Prisma row, so the
 * component does not depend on every column a booking happens to carry. */
type PendingBooking = {
  id: string;
  code: string;
  name: string;
  status: string;
  date: Date;
  timeLabel: string;
  createdAt: Date;
  depositIdr: number;
  look: { title: string; titleId: string };
};

/** Compact money for tiles: 8.500.000 reads as 8,5jt at this size. */
function shortIdr(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}m`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
  return String(value);
}

/** The artist's landing screen: what is waiting, what is next, and the way in
 * to everything she manages.
 *
 * A component rather than a page because it is rendered from the artist's
 * Home — she has no use for the client-facing sales page — while the data
 * fetching stays with the route. */
export function StudioDashboard({
  lang,
  stats,
  pending,
  next,
}: {
  lang: Lang;
  stats: AdminStats;
  pending: PendingBooking[];
  next: PendingBooking | null;
}) {
  const now = new Date();
  const needsAction = stats.requests + stats.paymentsToCheck;

  const tile = (
    label: string,
    value: string,
    note: string,
    accent = false
  ) => (
    <div
      className={`rounded-2xl p-3.5 flex flex-col gap-1 ${
        accent ? "glass-fill text-white" : "glass-card"
      }`}
    >
      <span
        className={`text-[10.5px] font-bold tracking-[0.05em] uppercase ${
          accent ? "opacity-75" : "text-muted-3"
        }`}
      >
        {label}
      </span>
      <span className="text-[22px] font-extrabold leading-none tracking-tight">
        {value}
      </span>
      <span className={`text-[11px] ${accent ? "opacity-80" : "text-muted-3"}`}>
        {note}
      </span>
    </div>
  );

  const action = (href: string, name: string, note: string, badge?: number) => (
    <Link
      key={href}
      href={href}
      className="glass-card p-3.5 flex items-center gap-3"
    >
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-[14px]">{name}</span>
        <span className="block text-[11.5px] text-muted-3 mt-0.5 leading-snug">
          {note}
        </span>
      </span>
      {!!badge && badge > 0 && (
        <span className="flex-none min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#b23a3a] text-white text-[11px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
      <span aria-hidden="true" className="flex-none text-maroon">
        →
      </span>
    </Link>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* The one line that says whether anything is on fire. */}
      {needsAction + stats.waitingChats > 0 ? (
        <div className="glass-card p-[18px] border-[1.5px] border-[#8a6320]/40 flex flex-col gap-2">
          <span className="text-xs font-bold tracking-[0.04em] uppercase text-[#8a6320]">
            {l(lang, "Waiting on you", "Menunggu kamu")}
          </span>
          <p className="m-0 text-[13.5px] leading-snug text-ink">
            {[
              stats.requests > 0 &&
                l(
                  lang,
                  `${stats.requests} booking ${stats.requests === 1 ? "request" : "requests"}`,
                  `${stats.requests} permintaan pesanan`
                ),
              stats.paymentsToCheck > 0 &&
                l(
                  lang,
                  `${stats.paymentsToCheck} deposit ${stats.paymentsToCheck === 1 ? "receipt" : "receipts"}`,
                  `${stats.paymentsToCheck} bukti deposit`
                ),
              stats.waitingChats > 0 &&
                l(
                  lang,
                  `${stats.waitingChats} ${stats.waitingChats === 1 ? "chat" : "chats"}`,
                  `${stats.waitingChats} chat`
                ),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ) : (
        <div className="glass-card p-[18px]">
          <p className="m-0 text-[13.5px] leading-snug text-muted">
            {l(
              lang,
              "Nothing is waiting on you. Every request has been answered.",
              "Tidak ada yang menunggu. Semua permintaan sudah dijawab."
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {tile(
          l(lang, "Needs you", "Perlu tindakan"),
          String(needsAction),
          l(lang, "requests and receipts", "permintaan dan bukti"),
          needsAction > 0
        )}
        {tile(
          l(lang, "Upcoming", "Akan datang"),
          String(stats.upcoming),
          l(lang, "confirmed, not yet done", "terkonfirmasi, belum jalan")
        )}
        {tile(
          l(lang, "Deposits held", "Deposit diterima"),
          shortIdr(stats.depositsHeld),
          l(lang, `of ${shortIdr(stats.confirmedValue)} booked`, `dari ${shortIdr(stats.confirmedValue)} dipesan`)
        )}
        {tile(
          l(lang, "Rating", "Penilaian"),
          stats.avgRating ? stats.avgRating.toFixed(1) : "—",
          stats.reviewCount
            ? l(
                lang,
                `${stats.reviewCount} ${stats.reviewCount === 1 ? "review" : "reviews"}`,
                `${stats.reviewCount} ulasan`
              )
            : l(lang, "no reviews yet", "belum ada ulasan")
        )}
      </div>

      {stats.doubleBookedDays > 0 && (
        <Link
          href="/manage/bookings?filter=all&sort=event"
          className="glass-card p-3.5 flex items-center gap-3 border-[1.5px] border-[#8a6320]/35"
        >
          <span className="flex-1 text-[13px] leading-snug text-[#8a6320] font-semibold">
            {l(
              lang,
              `${stats.doubleBookedDays} ${stats.doubleBookedDays === 1 ? "day has" : "days have"} more than one live booking.`,
              `${stats.doubleBookedDays} hari punya lebih dari satu pesanan aktif.`
            )}
          </span>
          <span aria-hidden="true" className="flex-none text-[#8a6320]">
            →
          </span>
        </Link>
      )}

      {next && (
        <Link href={`/manage/bookings/${next.id}`} className="glass-card p-[18px] flex gap-3.5 items-center">
          <span className="flex-none w-[52px] rounded-2xl bg-tint text-maroon flex flex-col items-center justify-center py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] opacity-70">
              {dayParts(lang, next.date).weekday}
            </span>
            <span className="text-[19px] font-extrabold leading-none mt-0.5">
              {dayParts(lang, next.date).day}
            </span>
            <span className="text-[10.5px] font-bold uppercase opacity-80">
              {dayParts(lang, next.date).month}
            </span>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[10.5px] font-bold tracking-[0.05em] uppercase text-muted-3">
              {l(lang, "Next job", "Pekerjaan berikutnya")}
            </span>
            <span className="block font-bold text-[15px] truncate mt-0.5">{next.name}</span>
            <span className="block text-[11.5px] text-muted-3 truncate mt-0.5">
              {l(lang, next.look.title, next.look.titleId)} · {next.timeLabel} ·{" "}
              {countdownLabel(lang, next.date, now)}
            </span>
          </span>
        </Link>
      )}

      {pending.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
              {l(lang, "Booking requests", "Permintaan pesanan")}
            </span>
            <Link href="/manage/bookings" className="text-[12px] font-bold text-maroon">
              {l(lang, "See all", "Lihat semua")}
            </Link>
          </div>
          {pending.map((b) => (
            <Link
              key={b.id}
              href={`/manage/bookings/${b.id}`}
              className="glass-card p-3.5 flex items-center gap-3"
            >
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-[14px] truncate">{b.name}</span>
                  <span
                    className={`flex-none text-[10px] font-bold px-2 py-0.5 rounded-full ${statusTone(b.status)}`}
                  >
                    {statusLabel(lang, b.status)}
                  </span>
                </span>
                <span className="block text-[11.5px] text-muted-3 mt-1 truncate">
                  {l(lang, b.look.title, b.look.titleId)} · {longDate(lang, b.date)}
                </span>
                <span className="block text-[10.5px] text-muted-3 mt-0.5">
                  {b.code} · {waitingLabel(lang, b.createdAt, now)} · {idr(b.depositIdr)}
                </span>
              </span>
              <span aria-hidden="true" className="flex-none text-maroon">
                →
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Manage", "Kelola")}
        </span>
        {action(
          "/manage/bookings",
          l(lang, "Reservations", "Reservasi"),
          l(lang, "Accept dates and check deposits", "Terima tanggal dan periksa deposit"),
          needsAction
        )}
        {action(
          "/manage/chats",
          l(lang, "Client chats", "Chat klien"),
          l(lang, "Answer clients yourself", "Jawab klien sendiri"),
          stats.waitingChats
        )}
        {action(
          "/manage/packages",
          l(lang, "Packages", "Paket"),
          l(lang, "Prices, photos and what is included", "Harga, foto dan yang termasuk")
        )}
        {action(
          "/manage/knowledge",
          l(lang, "Knowledge base", "Basis pengetahuan"),
          l(lang, "What the assistant may tell clients", "Yang boleh disampaikan asisten")
        )}
        {action(
          "/manage/new",
          l(lang, "New package", "Paket baru"),
          l(lang, "Add something clients can book", "Tambah yang bisa dipesan klien")
        )}
      </div>

      <div className="glass-card p-[18px] flex flex-col gap-2.5">
        <span className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "This month", "Bulan ini")}
        </span>
        <div className="flex justify-between text-[13.5px]">
          <span className="text-muted">{l(lang, "Confirmed jobs", "Pesanan terkonfirmasi")}</span>
          <span className="font-bold">{stats.monthBookings}</span>
        </div>
        <div className="flex justify-between text-[13.5px]">
          <span className="text-muted">{l(lang, "Booked value", "Nilai pesanan")}</span>
          <span className="font-bold text-maroon">{idr(stats.monthValue)}</span>
        </div>
        <div className="h-px bg-line" />
        <div className="flex justify-between text-[13.5px]">
          <span className="text-muted">{l(lang, "Clients", "Klien")}</span>
          <span className="font-bold">{stats.clients}</span>
        </div>
      </div>
    </div>
    );
}
