import type { Lang } from "./i18n";
import { l } from "./i18n";

/** The reservation lifecycle, in order.
 *
 * `confirmed` is the terminal happy state and is deliberately the same string
 * the app used before this flow existed, so bookings taken under the old
 * auto-confirm behaviour still read as finished rather than stuck.
 *
 * No server-only import here: the admin pages, the client order pages and the
 * booking wizard all render from this one source. */
export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "payment_review",
  "confirmed",
  "declined",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

/** Anything unrecognised is treated as a fresh request rather than crashing a
 * page — the status column is a plain string in the database. */
export function asBookingStatus(value: string): BookingStatus {
  return isBookingStatus(value) ? value : "requested";
}

export function statusLabel(lang: Lang, status: string) {
  switch (asBookingStatus(status)) {
    case "requested":
      return l(lang, "Awaiting Shana", "Menunggu Shana");
    case "accepted":
      return l(lang, "Deposit due", "Deposit belum dibayar");
    case "payment_review":
      return l(lang, "Checking payment", "Memeriksa pembayaran");
    case "confirmed":
      return l(lang, "Confirmed", "Terkonfirmasi");
    case "declined":
      return l(lang, "Declined", "Ditolak");
  }
}

/** Tailwind classes for the pill next to a booking. */
export function statusTone(status: string) {
  switch (asBookingStatus(status)) {
    case "confirmed":
      return "bg-maroon text-white";
    case "declined":
      return "bg-[#f3e0e0] text-[#b23a3a]";
    case "payment_review":
      return "bg-[#e8dcf0] text-[#6b4a8a]";
    case "accepted":
      return "bg-[#f7e6cf] text-[#8a6320]";
    default:
      return "bg-[#efe4d5] text-muted-2";
  }
}

/** The client can pay only after the artist has accepted the date, and only
 * once — a receipt already under review must not be replaced from the UI. */
export function canPay(status: string) {
  return asBookingStatus(status) === "accepted";
}

/** Support contact is revealed once money has actually changed hands. */
export function showsSupport(status: string) {
  return asBookingStatus(status) === "confirmed";
}

export function isAwaitingArtist(status: string) {
  const s = asBookingStatus(status);
  return s === "requested" || s === "payment_review";
}
