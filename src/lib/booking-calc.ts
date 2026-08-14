import { EXTRAS, DEPOSIT_RATE } from "./static-data";
import type { LookDTO } from "./looks";

export function extrasTotal(extraIds: string[]) {
  return EXTRAS.filter((e) => extraIds.includes(e.id)).reduce(
    (sum, e) => sum + e.price,
    0
  );
}

export function bookingTotal(look: LookDTO, extraIds: string[]) {
  return look.priceIdr + extrasTotal(extraIds);
}

export function depositFor(total: number, rate: number = DEPOSIT_RATE) {
  return Math.round((total * rate) / 100 / 50000) * 50000;
}

export function nextOrderCode() {
  return "SHN-" + Math.floor(1000 + Math.random() * 9000);
}

/** The next bookable slot, shown as the home-page promo — a handful of days out, always 05:00. */
export function nextOpening() {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  return d;
}

export function formatOpeningLine(date: Date, lang: "en" | "id" | "both") {
  const day = date.getDate();
  const monthsEn = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthsId = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const dowEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowId = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dow = lang === "id" ? dowId[date.getDay()] : dowEn[date.getDay()];
  const month = lang === "id" ? monthsId[date.getMonth()] : monthsEn[date.getMonth()];
  return `${dow} ${day} ${month} · 05:00`;
}
