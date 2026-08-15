import type { Lang } from "./i18n";
import { l } from "./i18n";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The date locale the whole reservation area formats against. `both` falls
 * back to en-GB, matching how the rest of the app treats it. */
export function locale(lang: Lang) {
  return lang === "id" ? "id-ID" : "en-GB";
}

/** Whole days between two instants, measured on calendar days rather than
 * elapsed milliseconds — an event 23 hours out is "tomorrow", not "in 0 days". */
export function dayDelta(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

/** Bookings are stored at midnight, but grouping on the raw column would split
 * two same-day rows if either ever carried a time. Keyed on the calendar day. */
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** How long a request has sat unanswered. Drives the queue's urgency accent. */
export function waitingLabel(lang: Lang, createdAt: Date, now: Date) {
  const d = dayDelta(createdAt, now);
  if (d <= 0) return l(lang, "arrived today", "masuk hari ini");
  if (d === 1) return l(lang, "waiting 1 day", "menunggu 1 hari");
  return l(lang, `waiting ${d} days`, `menunggu ${d} hari`);
}

/** A request that has waited this long is called out in the queue. */
export function isStale(createdAt: Date, now: Date) {
  return dayDelta(createdAt, now) >= 2;
}

/** How far off the event itself is. */
export function countdownLabel(lang: Lang, date: Date, now: Date) {
  const d = dayDelta(now, date);
  if (d === 0) return l(lang, "today", "hari ini");
  if (d === 1) return l(lang, "tomorrow", "besok");
  if (d === -1) return l(lang, "yesterday", "kemarin");
  if (d < 0) return l(lang, `${-d} days ago`, `${-d} hari lalu`);
  return l(lang, `in ${d} days`, `${d} hari lagi`);
}

/** Day / month / weekday for the date block on a queue row. */
export function dayParts(lang: Lang, date: Date) {
  const loc = locale(lang);
  return {
    day: date.toLocaleDateString(loc, { day: "2-digit" }),
    month: date.toLocaleDateString(loc, { month: "short" }),
    weekday: date.toLocaleDateString(loc, { weekday: "short" }),
  };
}

export function longDate(lang: Lang, date: Date) {
  return date.toLocaleDateString(locale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
