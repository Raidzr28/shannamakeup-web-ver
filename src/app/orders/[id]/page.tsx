import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { l, idr } from "@/lib/i18n";
import { EXTRAS, VENUES } from "@/lib/static-data";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, lang, user] = await Promise.all([
    params,
    getLanguage(),
    getCurrentUser(),
  ]);

  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { look: true, review: true },
  });
  if (!booking || booking.userId !== user.id) notFound();

  const extras = JSON.parse(booking.extras) as string[];
  const venue = VENUES.find((v) => v.id === booking.venue) ?? VENUES[0];
  const whenLine = `${booking.date.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ${booking.timeLabel}`;

  const statuses = [
    {
      name: l(lang, "Deposit received", "Deposit diterima"),
      note: idr(booking.depositIdr),
      done: true,
    },
    {
      name: l(lang, "Trial scheduled", "Trial dijadwalkan"),
      note: l(lang, "Awaiting your pick of dates", "Menunggu pilihan tanggal"),
      done: true,
    },
    {
      name: l(lang, "Call sheet sent", "Call sheet dikirim"),
      note: l(lang, "One week before the event", "Seminggu sebelum acara"),
      done: false,
    },
    {
      name: l(lang, "Event day", "Hari acara"),
      note: whenLine,
      done: false,
      last: true,
    },
  ];

  const body = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center text-center pb-2">
        <span className="w-[76px] h-[76px] rounded-[26px] glass-fill text-white flex items-center justify-center text-[32px]">
          ✓
        </span>
        <h1 className="mt-5 text-[26px] font-extrabold tracking-[-0.03em]">
          {l(lang, "You’re in the book.", "Tanggalmu terkunci.")}
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-2 max-w-[30ch]">
          {l(
            lang,
            "Deposit received. Shana will send the call sheet a week before the day.",
            "Deposit diterima. Shana mengirim call sheet seminggu sebelum acara."
          )}
        </p>
        <span className="mt-4 text-xs font-bold tracking-[0.06em] text-muted glass-card px-3.5 py-2 rounded-full">
          ORDER {booking.code}
        </span>
      </div>

      <div className="glass-card p-[18px] flex gap-3.5 items-center">
        <span className="w-16 h-16 flex-none">
          <Media
            src={booking.look.heroImage}
            alt={booking.look.title}
            placeholder={l(lang, booking.look.title, booking.look.titleId).slice(0, 1)}
            className="w-16 h-16"
          />
        </span>
        <span className="flex-1">
          <span className="block font-bold text-[15px]">
            {l(lang, booking.look.title, booking.look.titleId)}
          </span>
          <span className="block text-xs text-muted-2 mt-1.5">{whenLine}</span>
          <span className="block text-xs text-muted-2 mt-0.5">
            {l(lang, venue.name, venue.nameId)}
          </span>
        </span>
      </div>

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Your order", "Pesananmu")}
        </div>
        <div className="flex flex-col gap-2.5 mt-3">
          <div className="flex justify-between gap-3 text-[13.5px]">
            <span className="text-muted">{l(lang, booking.look.title, booking.look.titleId)}</span>
            <span className="font-semibold">{idr(booking.look.priceIdr)}</span>
          </div>
          {EXTRAS.filter((e) => extras.includes(e.id)).map((e) => (
            <div key={e.id} className="flex justify-between gap-3 text-[13.5px]">
              <span className="text-muted">{l(lang, e.name, e.nameId)}</span>
              <span className="font-semibold">{idr(e.price)}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-line my-3.5" />
        <div className="flex justify-between font-extrabold text-[15.5px]">
          <span>{l(lang, "Total", "Total")}</span>
          <span>{idr(booking.totalIdr)}</span>
        </div>
        <div className="flex justify-between text-[13.5px] mt-2 text-muted">
          <span>{l(lang, "Deposit paid", "Deposit dibayar")}</span>
          <span className="font-semibold text-green">{idr(booking.depositIdr)}</span>
        </div>
        <div className="flex justify-between text-[13.5px] mt-1 text-muted">
          <span>{l(lang, "Balance on the day", "Sisa di hari-H")}</span>
          <span className="font-semibold">{idr(booking.totalIdr - booking.depositIdr)}</span>
        </div>
      </div>

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "Status", "Status")}
        </div>
        <div className="mt-3.5 flex flex-col">
          {statuses.map((s) => (
            <div key={s.name} className="flex gap-3.5 items-start">
              <span className="flex flex-col items-center self-stretch">
                <span
                  className={`w-[22px] h-[22px] rounded-full flex-none flex items-center justify-center text-[11px] font-extrabold text-white border-[1.5px] ${
                    s.done ? "bg-green border-green" : "bg-[#e6ebe7] border-[#dfe5e0]"
                  }`}
                >
                  {s.done ? "✓" : ""}
                </span>
                {!s.last && <span className="flex-1 w-0.5 bg-[#e6ebe7] my-0.5" />}
              </span>
              <span className="flex-1 pb-4">
                <span
                  className={`block font-bold text-[14.5px] ${s.done ? "text-ink" : "text-faint"}`}
                >
                  {s.name}
                </span>
                <span className="block text-[11.5px] text-muted-2 mt-0.5">{s.note}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/chat"
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
        >
          {l(lang, "Message Shana", "Chat Shana")}
        </Link>
        {booking.review ? (
          <div className="glass-card p-4 text-center text-[13px] text-muted">
            {l(lang, "Review sent — thank you.", "Ulasan terkirim — terima kasih.")}
          </div>
        ) : (
          <Link
            href={`/orders/${booking.id}/review`}
            className="w-full h-[50px] rounded-2xl text-ink text-[14.5px] font-bold flex items-center justify-center glass-light"
          >
            {l(lang, "Leave a review", "Tulis ulasan")}
          </Link>
        )}
        <Link
          href="/orders"
          className="w-full h-11 flex items-center justify-center text-green text-[13.5px] font-bold"
        >
          {l(lang, "View all orders", "Lihat semua pesanan")}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-full flex flex-col pt-[58px]">
        <div className="px-5 pt-6 pb-10">{body}</div>
        <MobileTabBar lang={lang} />
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <div className="max-w-[620px] mx-auto pb-24">{body}</div>
    </div>
      </DesktopOnly>
    </>
  );
}
