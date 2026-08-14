import "server-only";

/** Studio contact and payment destinations.
 *
 * Server-only on purpose: these read plain (non-NEXT_PUBLIC) env vars, which
 * Next replaces with `undefined` inside a client bundle. Importing this from a
 * client component would silently fall back to the demo values in production,
 * so pages read it on the server and pass the result down as props. */

/** Digits only, with country code and no +, which is what wa.me expects. */
export const SUPPORT_WHATSAPP = (
  process.env.SUPPORT_WHATSAPP ?? "6281200000000"
).replace(/\D/g, "");

export const SUPPORT_HOURS_EN = "Every day, 08:00–20:00 WIB";
export const SUPPORT_HOURS_ID = "Setiap hari, 08.00–20.00 WIB";

/** Pretty form for display: 6281200000000 -> +62 812 0000 000 */
export function whatsappDisplay(number = SUPPORT_WHATSAPP) {
  const groups = number.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, "$1 $2 $3 $4");
  return `+${groups}`;
}

export function whatsappLink(message: string, number = SUPPORT_WHATSAPP) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const BANK_TRANSFER = {
  bank: process.env.PAYMENT_BANK_NAME ?? "BCA",
  accountNumber: process.env.PAYMENT_BANK_ACCOUNT ?? "123 456 7890",
  accountName: process.env.PAYMENT_BANK_HOLDER ?? "Shana Prameswari",
};

/** A hosted QRIS image. Left unset in the demo, in which case the payment page
 * shows an explanatory placeholder rather than a broken image. */
export const QRIS_IMAGE_URL = process.env.PAYMENT_QRIS_URL ?? null;
export const QRIS_MERCHANT = process.env.PAYMENT_QRIS_MERCHANT ?? "Shana Makeup";
