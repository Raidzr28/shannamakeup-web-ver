"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLook } from "@/lib/looks";
import { bookingTotal, depositFor, nextOrderCode } from "@/lib/booking-calc";

export async function createBookingAction(formData: FormData) {
  const lookId = String(formData.get("lookId") ?? "");
  const dateIso = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const venue = String(formData.get("venue") ?? "venue");
  const extras = formData.getAll("extras").map(String);
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const carry = new URLSearchParams({
    date: dateIso,
    time,
    venue,
    name,
    phone,
    email,
    city,
    notes,
  });
  for (const e of extras) carry.append("extras", e);

  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/book/${lookId}/pay?${carry.toString()}`)}&reason=${encodeURIComponent(
        "Dates and prices are open to everyone. Sign in to put your name on the booking."
      )}`
    );
  }

  const look = await getLook(lookId);
  if (!look) redirect("/");

  const total = bookingTotal(look, extras);
  const deposit = depositFor(total);

  let code = nextOrderCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.booking.findUnique({ where: { code } });
    if (!clash) break;
    code = nextOrderCode();
  }

  const booking = await prisma.booking.create({
    data: {
      code,
      userId: user.id,
      lookId: look.id,
      date: dateIso ? new Date(dateIso) : new Date(),
      timeLabel: time || "05:00",
      venue,
      extras: JSON.stringify(extras),
      totalIdr: total,
      depositIdr: deposit,
      // Both filled in later: the client picks a payment channel only after
      // Shana has accepted the date, so nothing is collected for a slot she
      // may not be free for.
      method: "",
      status: "requested",
      name: name || user.name,
      phone,
      email: email || user.email,
      city,
      notes: notes || null,
    },
  });

  redirect(`/orders/${booking.id}`);
}
