import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { requireArtistPage } from "@/lib/require-artist";
import { prisma } from "@/lib/prisma";
import { asBookingStatus, statusLabel, statusTone } from "@/lib/booking-status";
import { whatsappLink, whatsappDisplay } from "@/lib/support";
import { EXTRAS, venueById, payMethodById } from "@/lib/static-data";
import { l, idr } from "@/lib/i18n";
import {
  acceptBookingAction,
  declineBookingAction,
  confirmPaymentAction,
  rejectPaymentAction,
} from "@/lib/actions/reservations";

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

  const status = asBookingStatus(booking.status);
  const extras = JSON.parse(booking.extras) as string[];
  const venue = venueById(booking.venue);
  const method = payMethodById(booking.method);
  const whenLine = `${booking.date.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ${booking.timeLabel}`;

  // The client's own number, not the studio's — this button is the artist
  // reaching out about this specific booking.
  const clientPhone = (booking.phone || booking.user.phone || "").replace(/\D/g, "");

  const reasonField = (placeholder: string) => (
    <input
      name="reason"
      maxLength={300}
      placeholder={placeholder}
      className="w-full box-border h-[46px] rounded-2xl border-[1.5px] border-line-2 bg-white px-3.5 text-sm text-ink outline-none focus:border-maroon"
    />
  );

  const body = (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-[18px] flex flex-col gap-2">
        <span className="flex items-center gap-2 justify-between">
          <span className="font-extrabold text-lg tracking-tight">{booking.name}</span>
          <span
            className={`flex-none text-[10.5px] font-bold px-2.5 py-1 rounded-full ${statusTone(status)}`}
          >
            {statusLabel(lang, status)}
          </span>
        </span>
        <span className="text-[12px] text-muted-3">
          {booking.code} · {l(lang, "requested", "diminta")}{" "}
          {booking.createdAt.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <div className="flex flex-col gap-1 mt-1.5 text-[13px] text-[#4a3b32]">
          <span>✉ {booking.email}</span>
          <span>☎ {booking.phone || l(lang, "no number given", "tidak ada nomor")}</span>
          <span>📍 {booking.city || "—"}</span>
        </div>
        {clientPhone && (
          <a
            href={whatsappLink(
              `Halo ${booking.name}, ini Shana soal pesanan ${booking.code}.`,
              clientPhone
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 h-11 rounded-2xl text-[13.5px] font-bold flex items-center justify-center text-ink glass-light"
          >
            {l(lang, "WhatsApp the client", "WhatsApp klien")} · {whatsappDisplay(clientPhone)}
          </a>
        )}
      </div>

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
          <div className="flex justify-between gap-3">
            <span className="text-muted">{l(lang, "When", "Kapan")}</span>
            <span className="font-semibold">{whenLine}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">{l(lang, "Where", "Lokasi")}</span>
            <span className="font-semibold">{l(lang, venue.name, venue.nameId)}</span>
          </div>
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
          <p className="mt-3.5 m-0 text-[13px] leading-relaxed text-[#4a3b32] bg-tint rounded-2xl px-3.5 py-3">
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
                {booking.paymentSentAt.toLocaleString(lang === "id" ? "id-ID" : "en-GB")}
              </span>
            )}
          </div>
          <a
            href={booking.paymentProof}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block h-[340px] mt-3 rounded-2xl overflow-hidden bg-[#f0e6d8]"
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
            <button
              type="submit"
              className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
            >
              {l(lang, "Accept and ask for the deposit", "Terima dan minta deposit")}
            </button>
          </form>
          <form action={declineBookingAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={booking.id} />
            {reasonField(l(lang, "Reason (shown to the client)", "Alasan (tampil ke klien)"))}
            <button
              type="submit"
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-[#b23a3a] glass-light border-[#b23a3a]/30"
            >
              {l(lang, "Decline this date", "Tolak tanggal ini")}
            </button>
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
            <button
              type="submit"
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-[#b23a3a] glass-light border-[#b23a3a]/30"
            >
              {l(lang, "Cancel this booking", "Batalkan pesanan ini")}
            </button>
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
            <button
              type="submit"
              className="w-full h-[52px] rounded-2xl text-white text-[15px] font-bold cursor-pointer glass-fill"
            >
              {l(lang, "Confirm payment and lock the date", "Konfirmasi bayaran dan kunci tanggal")}
            </button>
          </form>
          <form action={rejectPaymentAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={booking.id} />
            {reasonField(l(lang, "What was wrong with it?", "Apa yang kurang?"))}
            <button
              type="submit"
              className="w-full h-[50px] rounded-2xl text-[14.5px] font-bold cursor-pointer text-ink glass-light"
            >
              {l(lang, "Ask for another receipt", "Minta bukti lain")}
            </button>
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
            {booking.paidAt &&
              ` · ${booking.paidAt.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB")}`}
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
              ←
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
            ← {l(lang, "Back to reservations", "Kembali ke reservasi")}
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mt-4 mb-7">
            {l(lang, "Reservation", "Reservasi")}
          </h1>
          <div className="max-w-[620px] pb-24">{body}</div>
        </div>
      </DesktopOnly>
    </>
  );
}
