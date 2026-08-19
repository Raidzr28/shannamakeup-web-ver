import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { prisma } from "@/lib/prisma";
import { statusLabel, statusTone, isAwaitingArtist } from "@/lib/booking-status";
import {
  countdownLabel,
  dayKey,
  dayParts,
  isStale,
  waitingLabel,
} from "@/lib/booking-time";
import { l, idr } from "@/lib/i18n";

const FILTERS = [
  { id: "inbox", en: "Needs you", id_: "Perlu tindakan" },
  { id: "requested", en: "Requests", id_: "Permintaan" },
  { id: "payment_review", en: "Payments", id_: "Pembayaran" },
  { id: "confirmed", en: "Confirmed", id_: "Terkonfirmasi" },
  { id: "all", en: "All", id_: "Semua" },
] as const;

const SORTS = [
  { id: "waiting", en: "Longest waiting", id_: "Menunggu terlama" },
  { id: "newest", en: "Newest", id_: "Terbaru" },
  { id: "event", en: "Event date", id_: "Tanggal acara" },
] as const;

/** Queues you are meant to work through read oldest-first; archives read
 * newest-first. Either way an explicit `sort` in the URL wins. */
function defaultSortFor(filter: string) {
  return filter === "confirmed" || filter === "all" ? "newest" : "waiting";
}

/** One malformed row must not take the whole queue down. */
function extrasCount(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default async function ManageBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string; q?: string }>;
}) {
  await requireArtistPage("/manage/bookings");
  const [lang, sp] = await Promise.all([getLanguage(), searchParams]);

  const filter = FILTERS.some((f) => f.id === sp.filter) ? sp.filter! : "inbox";
  const sortExplicit = SORTS.some((s) => s.id === sp.sort);
  const sort = sortExplicit ? sp.sort! : defaultSortFor(filter);
  const q = (sp.q ?? "").trim().slice(0, 80);

  const statusWhere =
    filter === "inbox"
      ? { status: { in: ["requested", "payment_review"] } }
      : filter === "all"
        ? {}
        : { status: filter };

  // Code and city are how Shana actually refers to a booking out loud, so both
  // are searchable alongside the name and the email.
  const searchWhere = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { code: { contains: q, mode: "insensitive" as const } },
          { city: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const orderBy =
    sort === "event"
      ? ({ date: "asc" } as const)
      : sort === "newest"
        ? ({ createdAt: "desc" } as const)
        : ({ createdAt: "asc" } as const);

  const [bookings, counts, perClient, activeDates] = await Promise.all([
    prisma.booking.findMany({
      where: { ...statusWhere, ...searchWhere },
      orderBy,
      include: { look: true, user: true },
    }),
    // Chip counts follow the search so the numbers match what a search shows.
    prisma.booking.groupBy({
      by: ["status"],
      where: searchWhere,
      _count: { _all: true },
    }),
    // Lifetime totals per client, so a returning bride is visible in the queue.
    prisma.booking.groupBy({ by: ["userId"], _count: { _all: true } }),
    // Only the dates, so flagging a double-booked day stays a cheap projection.
    prisma.booking.findMany({
      where: { status: { not: "declined" } },
      select: { date: true },
    }),
  ]);

  const now = new Date();
  const bookingsBy = new Map(perClient.map((c) => [c.userId, c._count._all]));

  const perDay = new Map<string, number>();
  for (const row of activeDates) {
    const key = dayKey(row.date);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  const countFor = (id: string) => {
    if (id === "all") return counts.reduce((n, c) => n + c._count._all, 0);
    if (id === "inbox")
      return counts
        .filter((c) => isAwaitingArtist(c.status))
        .reduce((n, c) => n + c._count._all, 0);
    return counts.find((c) => c.status === id)?._count._all ?? 0;
  };

  /** Links carry the rest of the query so a search survives a filter change. */
  const hrefWith = (patch: { filter?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const f = patch.filter ?? filter;
    const s = patch.sort ?? (sortExplicit ? sort : undefined);
    if (f !== "inbox") params.set("filter", f);
    if (s && s !== defaultSortFor(f)) params.set("sort", s);
    if (q) params.set("q", q);
    const query = params.toString();
    return query ? `/manage/bookings?${query}` : "/manage/bookings";
  };

  const chip = (on: boolean) =>
    `flex-none px-3.5 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap border ${
      on
        ? "glass-fill text-white border-transparent"
        : "glass-light text-[var(--paes-melati-2)] border-prada/80"
    }`;

  const controls = (
    <div className="flex flex-col gap-3">
      {/* A plain GET form: the queue stays a server component and a search is
          a shareable URL rather than client state. */}
      <form method="get" action="/manage/bookings" className="flex gap-2">
        {filter !== "inbox" && <input type="hidden" name="filter" value={filter} />}
        {sortExplicit && <input type="hidden" name="sort" value={sort} />}
        <input
          name="q"
          defaultValue={q}
          maxLength={80}
          placeholder={l(
            lang,
            "Search name, code, city or email",
            "Cari nama, kode, kota atau email"
          )}
          className="flex-1 min-w-0 box-border h-[46px] rounded-2xl border-[1.5px] border-line-2 bg-card px-3.5 text-sm text-ink outline-none focus:border-maroon"
        />
        <button
          type="submit"
          className="flex-none h-[46px] px-4 rounded-2xl text-[13.5px] font-bold cursor-pointer prada-leaf"
        >
          {l(lang, "Search", "Cari")}
        </button>
      </form>

      {q && (
        <div className="flex items-center gap-2 text-[12.5px] text-muted-2">
          <span>
            {l(lang, "Matches for", "Hasil untuk")} <span className="font-bold text-ink">{q}</span>
          </span>
          <Link
            href={
              filter === "inbox" && !sortExplicit
                ? "/manage/bookings"
                : `/manage/bookings?${new URLSearchParams({
                    ...(filter !== "inbox" ? { filter } : {}),
                    ...(sortExplicit ? { sort } : {}),
                  }).toString()}`
            }
            className="font-semibold text-maroon"
          >
            {l(lang, "Clear", "Hapus")}
          </Link>
        </div>
      )}

      <div className="no-scrollbar flex gap-2 overflow-auto pb-1">
        {FILTERS.map((f) => {
          const on = f.id === filter;
          const n = countFor(f.id);
          return (
            <Link key={f.id} href={hrefWith({ filter: f.id })} className={chip(on)}>
              {l(lang, f.en, f.id_)}
              {n > 0 && <span className={on ? "opacity-80" : "text-muted-3"}> · {n}</span>}
            </Link>
          );
        })}
      </div>

      <div className="no-scrollbar flex gap-2 items-center overflow-auto pb-1">
        <span className="flex-none text-[11px] font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Sort", "Urutkan")}
        </span>
        {SORTS.map((s) => (
          <Link
            key={s.id}
            href={hrefWith({ sort: s.id })}
            className={`flex-none px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border ${
              s.id === sort
                ? "bg-tint text-maroon border-maroon/25"
                : "bg-ground-2 text-muted-2 border-line"
            }`}
          >
            {l(lang, s.en, s.id_)}
          </Link>
        ))}
      </div>
    </div>
  );

  const body = (
    <div className="flex flex-col gap-3">
      {controls}

      {bookings.length === 0 && (
        <div className="glass-card p-6 text-center">
          <p className="m-0 text-[13.5px] text-muted leading-relaxed">
            {q
              ? l(lang, "No booking matches that search.", "Tidak ada pesanan yang cocok.")
              : filter === "inbox"
                ? l(lang, "Nothing waiting on you.", "Tidak ada yang menunggu.")
                : l(lang, "Nothing here yet.", "Belum ada di sini.")}
          </p>
        </div>
      )}

      {bookings.map((b) => {
        const when = dayParts(lang, b.date);
        const extras = extrasCount(b.extras);
        const history = bookingsBy.get(b.userId) ?? 1;
        const clash = (perDay.get(dayKey(b.date)) ?? 0) > 1 && b.status !== "declined";
        const urgent = b.status === "requested" && isStale(b.createdAt, now);

        return (
          <Link
            key={b.id}
            href={`/manage/bookings/${b.id}`}
            className={`glass-card p-[18px] flex flex-col gap-3 ${
              urgent ? "border-[1.5px] border-[var(--paes-alarm)]/35" : ""
            }`}
          >
            <span className="flex gap-3.5 items-start">
              {/* The event date is the thing Shana schedules around, so it gets
                  the strongest position rather than sitting inside a text line. */}
              <span className="flex-none w-[52px] rounded-2xl bg-tint text-maroon flex flex-col items-center justify-center py-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] opacity-70">
                  {when.weekday}
                </span>
                <span className="text-[19px] font-extrabold leading-none mt-0.5">{when.day}</span>
                <span className="text-[10.5px] font-bold uppercase opacity-80">{when.month}</span>
              </span>

              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 justify-between">
                  <span className="font-bold text-[15px] truncate">{b.name}</span>
                  <span
                    className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${statusTone(b.status)}`}
                  >
                    {statusLabel(lang, b.status)}
                  </span>
                </span>
                <span className="block text-[12px] text-muted-2 mt-1 truncate">
                  {l(lang, b.look.title, b.look.titleId)} · {b.timeLabel}
                </span>
                <span className="block text-[11.5px] text-muted-3 mt-0.5 truncate">
                  {b.city || "—"}
                  {extras > 0 &&
                    ` · ${extras} ${l(lang, extras === 1 ? "add-on" : "add-ons", "tambahan")}`}
                  {` · ${countdownLabel(lang, b.date, now)}`}
                </span>
              </span>

              <span className="flex-none w-9 h-9">
                <Media
                  src={b.user.avatarUrl}
                  alt={b.name}
                  shape="circle"
                  placeholder={b.name.slice(0, 1).toUpperCase()}
                  className="w-9 h-9"
                  sizes="36px"
                />
              </span>
            </span>

            {(clash || history > 1 || b.paymentProof || urgent) && (
              <span className="flex flex-wrap gap-1.5">
                {urgent && (
                  <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-[var(--paes-ground-2)] text-[var(--paes-alarm)]">
                    {waitingLabel(lang, b.createdAt, now)}
                  </span>
                )}
                {clash && (
                  <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-[var(--paes-ground-3)] text-[var(--paes-prada-deep)]">
                    {l(lang, "Two on this day", "Dua di hari ini")}
                  </span>
                )}
                {history > 1 && (
                  <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-[var(--paes-ground-2)] text-[#6b4a8a]">
                    {l(lang, `Repeat · ${history}`, `Berulang · ${history}`)}
                  </span>
                )}
                {b.paymentProof && (
                  <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-[#e3ece2] text-[var(--paes-sirih)]">
                    {l(lang, "Receipt attached", "Ada bukti bayar")}
                  </span>
                )}
              </span>
            )}

            <span className="flex items-center gap-2 justify-between border-t border-line pt-2.5">
              <span className="text-[11.5px] text-muted-3 truncate">
                {b.code} · {waitingLabel(lang, b.createdAt, now)}
              </span>
              <span className="flex-none text-right">
                <span className="block font-extrabold text-[13.5px] text-maroon">
                  {idr(b.depositIdr)}
                </span>
                <span className="block text-[10.5px] text-muted-3">
                  {l(lang, "of", "dari")} {idr(b.totalIdr)}
                </span>
              </span>
            </span>
          </Link>
        );
      })}
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
            <h1 className="font-display text-[22px]">{heading}</h1>
            <p className="text-xs text-muted-3 mt-1.5 leading-snug">{sub}</p>
          </div>
          <div className="px-5 pt-4.5">{body}</div>
          <div className="flex-1 min-h-6" />
          <TabBar lang={lang} />
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <h1 className="text-4xl font-display">{heading}</h1>
          <p className="text-sm text-muted mt-3 max-w-[60ch]">{sub}</p>
          <div className="max-w-[760px] mt-8 pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
