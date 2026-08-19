import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/components/booking/ReviewForm";
import { MobileOnly, DesktopOnly } from "@/components/shell/Viewports";
import { getLanguage } from "@/lib/language";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { l } from "@/lib/i18n";
import { BackIcon } from "@/components/ui/Icons";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, lang, user] = await Promise.all([
    params,
    getLanguage(),
    getCurrentUser(),
  ]);

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orders/${id}/review`)}&reason=${encodeURIComponent(
        "Reviews are verified against a completed booking."
      )}`
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { look: true },
  });
  if (!booking || booking.userId !== user.id) notFound();

  const form = <ReviewForm lang={lang} bookingId={booking.id} />;

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
            {l(lang, "Review", "Ulasan")}
          </div>
          <span className="w-[38px]" />
        </div>
        <div className="px-5 py-4.5 pb-10">{form}</div>
      </div>
      </MobileOnly>

      <DesktopOnly>
    <div className="ambient-glow flex-1 px-11 py-11">
      <Link href={`/orders/${booking.id}`} className="text-[13px] font-semibold text-muted">
        <BackIcon className="w-4 h-4" /> {l(lang, "Back to the order", "Kembali ke pesanan")}
      </Link>
      <h1 className="text-4xl font-display mt-4 mb-7">
        {l(lang, "Review", "Ulasan")} · {l(lang, booking.look.title, booking.look.titleId)}
      </h1>
      <div className="max-w-[560px] pb-24">{form}</div>
    </div>
      </DesktopOnly>
    </>
  );
}
