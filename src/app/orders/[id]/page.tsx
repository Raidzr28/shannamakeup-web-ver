import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { TabBar } from "@/components/shell/TabBar";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { l, idr } from "@/lib/i18n";
import { EXTRAS, VENUES } from "@/lib/static-data";
import { asBookingStatus, canPay, showsSupport, statusLabel, statusTone } from "@/lib/booking-status";
import { SUPPORT_HOURS_EN, SUPPORT_HOURS_ID, whatsappDisplay, whatsappLink } from "@/lib/support";

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

  const status = asBookingStatus(booking.status);
  const declined = status === "declined";
  const reached = ["requested", "accepted", "payment_review", "confirmed"].indexOf(status);

  const statuses = [
    {
      name: l(lang, "Request sent", "Permintaan terkirim"),
      note: booking.createdAt.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
        day: "numeric",
        month: "short",
      }),
      done: true,
    },
    {
      name: l(lang, "Shana accepts the date", "Shana menerima tanggal"),
      note: declined
        ? (booking.adminNote ?? l(lang, "Declined", "Ditolak"))
        : reached >= 1
          ? l(lang, "Confirmed free", "Dipastikan kosong")
          : l(lang, "Usually within a day", "Biasanya dalam sehari"),
      done: reached >= 1,
    },
    {
      name: l(lang, "Deposit paid", "Deposit dibayar"),
      note:
        status === "payment_review"
          ? l(lang, "Receipt under review", "Bukti sedang diperiksa")
          : reached >= 3
            ? idr(booking.depositIdr)
            : l(lang, "Due once accepted", "Dibayar setelah diterima"),
      done: reached >= 3,
    },
    {
      name: l(lang, "Event day", "Hari acara"),
      note: whenLine,
      done: false,
      last: true,
    },
  ];

  const headline = declined
    ? {
        icon: "✕",
        title: l(lang, "This date did not work.", "Tanggal ini tidak bisa."),
        blurb:
          booking.adminNote ??
          l(
            lang,
            "Shana could not take this date. Pick another and she will take a look.",
            "Shana tidak bisa mengambil tanggal ini. Pilih tanggal lain dan dia akan cek."
          ),
      }
    : status === "confirmed"
      ? {
          icon: "✓",
          title: l(lang, "You’re in the book.", "Tanggalmu terkunci."),
          blurb: l(
            lang,
            "Deposit received. Shana will send the call sheet a week before the day.",
            "Deposit diterima. Shana mengirim call sheet seminggu sebelum acara."
          ),
        }
      : status === "payment_review"
        ? {
            icon: "⏳",
            title: l(lang, "Checking your receipt.", "Memeriksa buktimu."),
            blurb: l(
              lang,
              "Shana is matching your transfer against the studio account. This is usually quick.",
              "Shana sedang mencocokkan transfermu dengan rekening studio. Biasanya cepat."
            ),
          }
        : status === "accepted"
          ? {
              icon: "◷",
              title: l(lang, "The date is yours to lock.", "Tinggal kunci tanggalnya."),
              blurb: l(
                lang,
                "Shana is free that day. Pay the deposit to hold it.",
                "Shana kosong di hari itu. Bayar deposit untuk menguncinya."
              ),
            }
          : {
              icon: "◷",
              title: l(lang, "Request sent.", "Permintaan terkirim."),
              blurb: l(
                lang,
                "Shana is checking the date. Nothing is charged until she accepts.",
                "Shana sedang memeriksa tanggal. Belum ada tagihan sampai dia menerima."
              ),
            };

  const body = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center text-center pb-2">
        <span
          className={`w-[76px] h-[76px] rounded-[26px] flex items-center justify-center text-[32px] ${
            declined ? "bg-[#f3e0e0] text-[#b23a3a]" : "glass-fill text-white"
          }`}
        >
          {headline.icon}
        </span>
        <h1 className="mt-5 text-[26px] font-extrabold tracking-[-0.03em]">{headline.title}</h1>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-2 max-w-[32ch]">
          {headline.blurb}
        </p>
        <span className="mt-4 flex items-center gap-2">
          <span className="text-xs font-bold tracking-[0.06em] text-muted glass-card px-3.5 py-2 rounded-full">
            ORDER {booking.code}
          </span>
          <span
            className={`text-[10.5px] font-bold px-2.5 py-1.5 rounded-full ${statusTone(status)}`}
          >
            {statusLabel(lang, status)}
          </span>
        </span>
      </div>

      {canPay(status) && (
        <Link
          href={`/orders/${booking.id}/pay`}
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
        >
          {l(lang, "Pay the deposit", "Bayar deposit")} · {idr(booking.depositIdr)}
        </Link>
      )}

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
          <span>
            {status === "confirmed"
              ? l(lang, "Deposit paid", "Deposit dibayar")
              : l(lang, "Deposit due", "Deposit")}
          </span>
          <span className="font-semibold text-maroon">{idr(booking.depositIdr)}</span>
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
                    s.done ? "bg-maroon border-maroon" : "bg-[#e6d8c3] border-[#e3d5be]"
                  }`}
                >
                  {s.done ? "✓" : ""}
                </span>
                {!s.last && <span className="flex-1 w-0.5 bg-[#e6d8c3] my-0.5" />}
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

      {showsSupport(status) && (
        <div className="glass-card p-[18px] flex flex-col gap-3">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Studio call centre", "Pusat bantuan studio")}
          </div>
          <p className="m-0 text-[13px] leading-snug text-muted">
            {l(
              lang,
              "Your booking is confirmed, so you can reach the studio directly about timings, the call sheet or anything on the day.",
              "Pesananmu terkonfirmasi, jadi kamu bisa langsung menghubungi studio soal jadwal, call sheet atau apa pun di hari-H."
            )}
          </p>
          <a
            href={whatsappLink(
              l(
                lang,
                `Hi Shana, this is ${booking.name} about order ${booking.code}.`,
                `Halo Shana, ini ${booking.name} soal pesanan ${booking.code}.`
              )
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2 bg-[#1f8f4e]"
          >
            <span aria-hidden>✆</span>
            {l(lang, "Chat on WhatsApp", "Chat lewat WhatsApp")}
          </a>
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[13px] font-bold tracking-wide">{whatsappDisplay()}</span>
            <span className="text-[11.5px] text-muted-3">
              {l(lang, SUPPORT_HOURS_EN, SUPPORT_HOURS_ID)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <Link
          href="/chat"
          className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold flex items-center justify-center glass-fill"
        >
          {l(lang, "Message Shana", "Chat Shana")}
        </Link>
        {status === "confirmed" &&
          (booking.review ? (
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
          ))}
        <Link
          href="/orders"
          className="w-full h-11 flex items-center justify-center text-maroon text-[13.5px] font-bold"
        >
          {l(lang, "View all orders", "Lihat semua pesanan")}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <MobileOnly>
      <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
        <div className="px-5 pt-6 pb-10">{body}</div>
        <div className="flex-1 min-h-6" />
        <TabBar lang={lang} />
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
