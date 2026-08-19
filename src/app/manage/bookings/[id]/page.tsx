import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { prisma } from "@/lib/prisma";
import { asBookingStatus, statusLabel, statusTone } from "@/lib/booking-status";
import { countdownLabel, locale, longDate, waitingLabel } from "@/lib/booking-time";
import { whatsappLink, whatsappDisplay } from "@/lib/support";
import { EXTRAS, venueById, payMethodById } from "@/lib/static-data";
import { l, idr } from "@/lib/i18n";
import {
  acceptBookingAction,
  declineBookingAction,
  confirmPaymentAction,
  rejectPaymentAction,
} from "@/lib/actions/reservations";
import { BackIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/ui/Icons";

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }] = await Promise.all([params]);
  await requireArtistPage(`/manage/bookings/${id}`);
  const lang = await getLanguage();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { look: true, user: true },
  });
  if (!booking) notFound();

  // Day bounds rather than an equality match: the column is a timestamp, and a
  // clash is about the calendar day, not the stored instant.
  const dayStart = new Date(booking.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [sameDay, clientHistory] = await Promise.all([
    // Shana takes one booking a day, so anything else live on this date is the
    // single most important thing to see before accepting.
    prisma.booking.findMany({
      where: {
        id: { not: booking.id },
        status: { not: "declined" },
        date: { gte: dayStart, lt: dayEnd },
      },
      include: { look: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.booking.findMany({
      where: { userId: booking.userId },
      select: { status: true },
    }),
  ]);

  const now = new Date();
  const status = asBookingStatus(booking.status);
  const extras = JSON.parse(booking.extras) as string[];
  const venue = venueById(booking.venue);
  const method = payMethodById(booking.method);
  const confirmedBefore = clientHistory.filter((b) => b.status === "confirmed").length;
  const isFirstBooking = clientHistory.length <= 1;

  // The client's own number, not the studio's — this button is the artist
  // reaching out about this specific booking.
  const clientPhone = (booking.phone || booking.user.phone || "").replace(/\D/g, "");

  const reasonField = (placeholder: string) => (
    <input
      name="reason"
      maxLength={300}
      placeholder={placeholder}
      className="w-full box-border h-[46px] rounded-2xl border-[1.5px] border-line-2 bg-card px-3.5 text-sm text-ink outline-none focus:border-maroon"
    />
  );

  const fact = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] font-bold tracking-[0.05em] uppercase text-muted-3">
        {label}
      </span>
      <span className="text-[13.5px] font-semibold text-ink leading-snug">{value}</span>
    </div>
  );

  const body = (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-[18px] flex flex-col gap-3">
        <div className="flex gap-3.5 items-start">
          <span className="flex-none w-12 h-12">
            <Media
              src={booking.user.avatarUrl}
              alt={booking.name}
              shape="circle"
              placeholder={booking.name.slice(0, 1).toUpperCase()}
              className="w-12 h-12"
              sizes="48px"
            />
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 justify-between">
              <span className="font-extrabold text-lg tracking-tight truncate">
                {booking.name}
              </span>
              <span
                className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${statusTone(status)}`}
              >
                {statusLabel(lang, status)}
              </span>
            </span>
            <span className="block text-[12px] text-muted-3 mt-1">
              {booking.code} · {waitingLabel(lang, booking.createdAt, now)}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {isFirstBooking ? (
            <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-sirih/15 text-[var(--paes-sirih)]">
              {l(lang, "First booking", "Pesanan pertama")}
            </span>
          ) : (
            <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-[var(--paes-ground-2)] text-[var(--paes-sirih)]">
              {l(
                lang,
                `${clientHistory.length} bookings · ${confirmedBefore} confirmed`,
                `${clientHistory.length} pesanan · ${confirmedBefore} terkonfirmasi`
              )}
            </span>
          )}
          <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-ground-3 text-muted-2">
            {l(lang, "Client since", "Klien sejak")}{" "}
            {booking.user.createdAt.toLocaleDateString(locale(lang), {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-[13px] text-[var(--paes-melati-2)]">
          <span className="flex items-center gap-1.5"><MailIcon className="w-4 h-4 flex-none text-melati-3" />{booking.email}</span>
          <span className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4 flex-none text-melati-3" />{booking.phone || l(lang, "no number given", "tidak ada nomor")}</span>
          <span className="flex items-center gap-1.5"><PinIcon className="w-4 h-4 flex-none text-melati-3" />{booking.city || "—"}</span>
        </div>
        {clientPhone && (
          <a
            href={whatsappLink(
              `Halo ${booking.name}, ini Shana soal pesanan ${booking.code}.`,
              clientPhone
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 rounded-2xl text-[13.5px] font-bold flex items-center justify-center text-ink glass-light"
          >
            {l(lang, "WhatsApp the client", "WhatsApp klien")} · {whatsappDisplay(clientPhone)}
          </a>
        )}
      </div>

      {/* The four things that decide whether the date can be taken, before any
          of the money detail. */}
      <div className="glass-card p-[18px]">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "At a glance", "Ringkasan")}
          </div>
          <span className="text-[11.5px] font-bold text-maroon">
            {countdownLabel(lang, booking.date, now)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 mt-3">
          {fact(l(lang, "Date", "Tanggal"), longDate(lang, booking.date))}
          {fact(l(lang, "Time", "Waktu"), booking.timeLabel)}
          {fact(l(lang, "Venue", "Lokasi"), l(lang, venue.name, venue.nameId))}
          {fact(
            l(lang, "Package", "Paket"),
            l(lang, booking.look.title, booking.look.titleId)
          )}
        </div>
      </div>

      {sameDay.length > 0 && (
        <div className="glass-card p-[18px] border-[1.5px] border-[var(--paes-prada-deep)]/35">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-[var(--paes-prada-deep)]">
            {l(lang, "Also on this day", "Juga di hari ini")}
          </div>
          <p className="m-0 mt-2 text-[12.5px] leading-snug text-muted">
            {l(
              lang,
              "You normally take one booking a day. Check these before accepting.",
              "Biasanya kamu ambil satu pesanan per hari. Periksa ini sebelum menerima."
            )}
          </p>
          <div className="flex flex-col gap-2 mt-3">
            {sameDay.map((other) => (
              <Link
                key={other.id}
                href={`/manage/bookings/${other.id}`}
                className="flex items-center gap-2 justify-between rounded-2xl bg-tint px-3.5 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold truncate">{other.name}</span>
                  <span className="block text-[11.5px] text-muted-3 truncate">
                    {l(lang, other.look.title, other.look.titleId)} · {other.timeLabel}
                  </span>
                </span>
                <span
                  className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${statusTone(other.status)}`}
                >
                  {statusLabel(lang, other.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-[18px]">
        <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
          {l(lang, "The booking", "Pesanan")}
        </div>
        <div className="flex flex-col gap-2.5 mt-3 text-[13.5px]">
          <div className="flex justify-between gap-3">
            <span className="text-muted">{l(lang, booking.look.title, booking.look.titleId)}</span>
            <span className="font-semibold">{idr(booking.look.priceIdr)}</span>
          </div>
          {EXTRAS.filter((e) => extras.includes(e.id)).map((e) => (
            <div key={e.id} className="flex justify-between gap-3">
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
          <span>{l(lang, "Deposit", "Deposit")}</span>
          <span className="font-semibold text-maroon">{idr(booking.depositIdr)}</span>
        </div>
        {booking.notes && (
          <p className="mt-3.5 m-0 text-[13px] leading-relaxed text-[var(--paes-melati-2)] bg-tint rounded-2xl px-3.5 py-3">
            {booking.notes}
          </p>
        )}
      </div>

      {booking.paymentProof && (
        <div className="glass-card p-[18px]">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Payment receipt", "Bukti pembayaran")}
          </div>
          <div className="flex flex-col gap-1 mt-3 text-[12.5px] text-muted-2">
            <span>
              {l(lang, "Method", "Metode")}:{" "}
              <span className="font-bold text-ink">
                {method ? l(lang, method.name, method.nameId) : booking.method}
              </span>
            </span>
            {booking.paymentReference && (
              <span>
                {l(lang, "Reference", "Referensi")}:{" "}
                <span className="font-bold text-ink">{booking.paymentReference}</span>
              </span>
            )}
            {booking.paymentSentAt && (
              <span>
                {l(lang, "Sent", "Dikirim")}:{" "}
                {booking.paymentSentAt.toLocaleString(locale(lang))}
              </span>
            )}
          </div>
          <a
            href={booking.paymentProof}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block h-[340px] mt-3 rounded-2xl overflow-hidden bg-ground-3"
          >
            {/* unoptimized: the receipt URL is a mutable database column, and a
                host next/image does not recognise throws rather than degrading
                — which would take the whole reservation page down with it. */}
            <Image
              src={booking.paymentProof}
              alt="receipt"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 620px"
              unoptimized
            />
          </a>
          <p className="m-0 mt-2 text-[11.5px] text-faint">
            {l(lang, "Tap the image to open it full size.", "Ketuk gambar untuk membukanya penuh.")}
          </p>
        </div>
      )}

      {booking.adminNote && (
        <p className="m-0 text-[13px] leading-snug text-muted bg-tint border border-maroon/15 rounded-2xl px-3.5 py-3">
          {l(lang, "Your note", "Catatanmu")}: {booking.adminNote}
        </p>
      )}

      {status === "requested" && (
        <div className="glass-card p-[18px] flex flex-col gap-3">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Is the date free?", "Tanggalnya kosong?")}
          </div>
          <form action={acceptBookingAction}>
            <input type="hidden" name="id" value={booking.id} />
            <SubmitButton
              pendingLabel={l(lang, "Accepting…", "Menerima…")}
              className="w-full h-[52px] rounded-2xl text-[15px] font-bold cursor-pointer prada-leaf"
            >
              {l(lang, "Accept and ask for the deposit", "Terima dan minta deposit")}
            </SubmitButton>
          </form>
          <form action={declineBookingAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={booking.id} />
            {reasonField(l(lang, "Reason (shown to the client)", "Alasan (tampil ke klien)"))}
            <SubmitButton
              pendingLabel={l(lang, "Declining…", "Menolak…")}
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-[var(--paes-alarm)] glass-light border-[var(--paes-alarm)]/30"
            >
              {l(lang, "Decline this date", "Tolak tanggal ini")}
            </SubmitButton>
          </form>
        </div>
      )}

      {status === "accepted" && (
        <div className="glass-card p-[18px] flex flex-col gap-3">
          <p className="m-0 text-[13px] leading-snug text-muted">
            {l(
              lang,
              "Accepted. Waiting for the client to send the deposit receipt.",
              "Diterima. Menunggu klien mengirim bukti deposit."
            )}
          </p>
          <form action={declineBookingAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={booking.id} />
            {reasonField(l(lang, "Reason (shown to the client)", "Alasan (tampil ke klien)"))}
            <SubmitButton
              pendingLabel={l(lang, "Cancelling…", "Membatalkan…")}
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-[var(--paes-alarm)] glass-light border-[var(--paes-alarm)]/30"
            >
              {l(lang, "Cancel this booking", "Batalkan pesanan ini")}
            </SubmitButton>
          </form>
        </div>
      )}

      {status === "payment_review" && (
        <div className="glass-card p-[18px] flex flex-col gap-3">
          <div className="text-xs font-bold tracking-[0.04em] uppercase text-muted-3">
            {l(lang, "Did the deposit arrive?", "Deposit sudah masuk?")}
          </div>
          <form action={confirmPaymentAction}>
            <input type="hidden" name="id" value={booking.id} />
            <SubmitButton
              pendingLabel={l(lang, "Confirming…", "Mengonfirmasi…")}
              className="w-full h-[52px] rounded-2xl text-[15px] font-bold cursor-pointer prada-leaf"
            >
              {l(lang, "Confirm payment and lock the date", "Konfirmasi bayaran dan kunci tanggal")}
            </SubmitButton>
          </form>
          <form action={rejectPaymentAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={booking.id} />
            {reasonField(l(lang, "What was wrong with it?", "Apa yang kurang?"))}
            <SubmitButton
              pendingLabel={l(lang, "Sending back…", "Mengirim balik…")}
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-ink glass-light"
            >
              {l(lang, "Ask for another receipt", "Minta bukti lain")}
            </SubmitButton>
          </form>
        </div>
      )}

      {status === "confirmed" && (
        <div className="glass-card p-[18px]">
          <p className="m-0 text-[13px] leading-snug text-muted">
            {l(
              lang,
              "Confirmed and paid. The client can now see the studio's WhatsApp contact.",
              "Terkonfirmasi dan dibayar. Klien sekarang bisa melihat kontak WhatsApp studio."
            )}
            {booking.paidAt && ` · ${booking.paidAt.toLocaleDateString(locale(lang))}`}
          </p>
        </div>
      )}

      {status === "declined" && (
        <div className="glass-card p-[18px]">
          <p className="m-0 text-[13px] leading-snug text-muted">
            {l(lang, "This booking was declined.", "Pesanan ini ditolak.")}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href="/manage/bookings"
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              <BackIcon className="w-[18px] h-[18px]" />
            </Link>
            <div className="flex-1 text-center font-bold text-[15.5px]">
              {l(lang, "Reservation", "Reservasi")}
            </div>
            <span className="w-[38px]" />
          </div>
          <div className="px-5 py-4 pb-10">{body}</div>
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href="/manage/bookings" className="text-[13px] font-semibold text-muted">
            <BackIcon className="w-4 h-4" /> {l(lang, "Back to reservations", "Kembali ke reservasi")}
          </Link>
          <h1 className="text-4xl font-display mt-4 mb-7">
            {l(lang, "Reservation", "Reservasi")}
          </h1>
          <div className="max-w-[620px] pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
