import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaymentForm } from "@/components/booking/PaymentForm";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPay } from "@/lib/booking-status";
import { BANK_TRANSFER, QRIS_IMAGE_URL, QRIS_MERCHANT } from "@/lib/support";
import { l } from "@/lib/i18n";
import { BackIcon } from "@/components/ui/Icons";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, lang, user] = await Promise.all([
    params,
    getLanguage(),
    getCurrentUser(),
  ]);

  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}/pay`)}`);

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id) notFound();

  // Sending someone to the receipt form for a booking that is not waiting on a
  // payment would only produce an error on submit, so bounce them early.
  if (!canPay(booking.status)) redirect(`/orders/${booking.id}`);

  const form = (
    <PaymentForm
      lang={lang}
      bookingId={booking.id}
      code={booking.code}
      depositIdr={booking.depositIdr}
      channels={{
        bank: BANK_TRANSFER.bank,
        accountNumber: BANK_TRANSFER.accountNumber,
        accountName: BANK_TRANSFER.accountName,
        qrisImageUrl: QRIS_IMAGE_URL,
        qrisMerchant: QRIS_MERCHANT,
      }}
    />
  );

  const retry = booking.adminNote ? (
    <p
      role="alert"
      className="m-0 text-[13px] leading-snug text-[var(--paes-alarm)] bg-[var(--paes-ground-2)] border border-[var(--paes-alarm)]/25 rounded-2xl px-3.5 py-3 mb-4"
    >
      {booking.adminNote}
    </p>
  ) : null;

  return (
    <>
      <MobileOnly>
        <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
          <div className="px-5 pt-2 flex items-center gap-3">
            <Link
              href={`/orders/${booking.id}`}
              className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
            >
              <BackIcon className="w-[18px] h-[18px]" />
            </Link>
            <div className="flex-1 text-center font-bold text-[15.5px]">
              {l(lang, "Pay the deposit", "Bayar deposit")}
            </div>
            <span className="w-[38px]" />
          </div>
          <div className="px-5 py-4 pb-10">
            {retry}
            {form}
          </div>
        </div>
      </MobileOnly>

      <DesktopOnly>
        <div className="ambient-glow flex-1 px-11 py-11">
          <Link href={`/orders/${booking.id}`} className="text-[13px] font-semibold text-muted">
            <BackIcon className="w-4 h-4" /> {l(lang, "Back to the order", "Kembali ke pesanan")}
          </Link>
          <h1 className="text-4xl font-display mt-4 mb-7">
            {l(lang, "Pay the deposit", "Bayar deposit")}
          </h1>
          <div className="max-w-[620px] pb-24">
            {retry}
            {form}
          </div>
        </div>
      </DesktopOnly>
    </>
  );
}
