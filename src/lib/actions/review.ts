"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitReviewAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orders/${bookingId}/review`)}&reason=${encodeURIComponent(
        "Reviews are verified against a completed booking."
      )}`
    );
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== user.id) redirect("/orders");

  const rating = Number(formData.get("rating") ?? 5);
  const traits = formData.getAll("traits").map(String);
  const note = String(formData.get("note") ?? "").trim();

  await prisma.review.upsert({
    where: { bookingId },
    update: { rating, traits: JSON.stringify(traits), note: note || null },
    create: {
      userId: user.id,
      bookingId,
      rating,
      traits: JSON.stringify(traits),
      note: note || null,
    },
  });

  redirect("/orders");
}
