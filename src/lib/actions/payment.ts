"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPay } from "@/lib/booking-status";
import { payMethodById } from "@/lib/static-data";

export type PaymentResult = { ok: boolean; error?: string };

/** Records the client's deposit payment and hands it to the artist to check.
 *
 * The booking is re-read here rather than trusted from the form: ownership, the
 * status gate and the method are all decided server-side, so a hand-crafted
 * POST cannot mark someone else's booking as paid. */
export async function submitPaymentAction(formData: FormData): Promise<PaymentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to send your payment." };

  const id = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id)
    return { ok: false, error: "That booking could not be found." };

  if (!canPay(booking.status))
    return {
      ok: false,
      error:
        booking.status === "requested"
          ? "Shana has not confirmed this date yet."
          : "This booking is not waiting for a payment.",
    };

  const method = String(formData.get("method") ?? "");
  if (!payMethodById(method))
    return { ok: false, error: "Choose how you paid the deposit." };

  const proof = String(formData.get("proof") ?? "").trim();
  if (!proof.startsWith("https://"))
    return { ok: false, error: "Attach a photo of your payment receipt." };

  const reference = String(formData.get("reference") ?? "")
    .trim()
    .slice(0, 120);

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      method,
      paymentProof: proof,
      paymentReference: reference || null,
      paymentSentAt: new Date(),
      status: "payment_review",
      // Clear any note from a previous rejection so the client is not left
      // reading a complaint about a receipt they have already replaced.
      adminNote: null,
    },
  });

  revalidatePath(`/orders/${booking.id}`);
  revalidatePath("/orders");
  revalidatePath("/manage/bookings");
  return { ok: true };
}
