export type Lang = "en" | "id" | "both";

/** Pick the single-language string for `lang` (used for prose that reads awkwardly doubled up). */
export function l(lang: Lang, en: string, id: string) {
  return lang === "id" ? id : en;
}

/** Pick a short label; in "both" mode, concatenate EN · ID (used for compact UI chrome). */
export function p(lang: Lang, en: string, id: string) {
  if (lang === "id") return id;
  if (lang === "both") return `${en} · ${id}`;
  return en;
}

export function idr(n: number) {
  return "Rp " + Math.round(n).toLocaleString("de-DE");
}
