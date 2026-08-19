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

/** Tailwind classes for the pill next to a booking.
 *
 * The tones track the lifecycle rather than decorating it: a request is
 * neutral, gold warms as the date firms up, sirih means settled, alarm means
 * it did not happen. Each is a tinted ground behind its own text colour with a
 * hairline — no pale fills, which is what these were before and what made
 * "Awaiting Shana" read as light-on-light against the ink ground. */
export function statusTone(status: string) {
  switch (asBookingStatus(status)) {
    case "confirmed":
      return "bg-sirih/15 text-sirih border border-sirih/40";
    case "declined":
      return "bg-alarm/15 text-alarm border border-alarm/40";
    case "payment_review":
      return "bg-prada/20 text-prada-lit border border-prada/50";
    case "accepted":
      return "bg-prada/12 text-prada border border-prada/40";
    default:
      return "bg-ground-3 text-melati-2 border border-prada/25";
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
