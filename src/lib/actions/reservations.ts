"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Re-checked inside every action rather than trusted from the page that
 * rendered the button, so a stale artist tab cannot drive the queue after a
 * role change. Mirrors the guard the package actions already use. */
async function requireArtist() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manage/bookings");
  if (user.role !== "ARTIST") redirect("/");
  return user;
}

function refresh(id: string) {
  revalidatePath("/manage/bookings");
  revalidatePath(`/manage/bookings/${id}`);
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
}

/** Guarded on the current status as well as the id: `updateMany` with a status
 * in the where clause means two admin tabs cannot double-apply a transition,
 * and a stale button is a no-op instead of a rewind. */
async function transition(
  id: string,
  from: string[],
  data: Record<string, unknown>
) {
  await requireArtist();
  const { count } = await prisma.booking.updateMany({
    where: { id, status: { in: from } },
    data,
  });
  if (count) refresh(id);
  return count > 0;
}

export async function acceptBookingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await transition(id, ["requested"], {
    status: "accepted",
    acceptedAt: new Date(),
    adminNote: null,
  });
}

export async function declineBookingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  await transition(id, ["requested", "accepted", "payment_review"], {
    status: "declined",
    adminNote: reason || null,
  });
}

/** Marks the deposit as actually received. This is the transition that reveals
 * the studio's WhatsApp contact on the client's order page. */
export async function confirmPaymentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await transition(id, ["payment_review"], {
    status: "confirmed",
    paidAt: new Date(),
    adminNote: null,
  });
}

/** Sends a receipt back without losing the accepted slot, so the client can
 * upload a readable one instead of starting the booking again. */
export async function rejectPaymentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  await transition(id, ["payment_review"], {
    status: "accepted",
    paymentProof: null,
    paymentSentAt: null,
    adminNote:
      reason || "The receipt could not be read. Please upload a clearer photo.",
  });
}
