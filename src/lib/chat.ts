import { idr } from "./i18n";
import type { Lang } from "./i18n";
import { DEPOSIT_RATE } from "./static-data";

export function botReply(
  query: string,
  lang: Lang,
  lookTitle: string,
  lookPrice: number,
  whenLine: string
) {
  const key = /price|harga|cost|biaya/i.test(query)
    ? "price"
    : /travel|jauh|luar|transport/i.test(query)
      ? "travel"
      : /trial/i.test(query)
        ? "trial"
        : "hold";

  const en: Record<string, string> = {
    price: `${lookTitle} is ${idr(lookPrice)} before add-ons. The ${DEPOSIT_RATE}% deposit reserves the date; the balance settles on the day.`,
    travel:
      "Travel inside Jakarta is included. Beyond it, we add transport at cost and Shana arrives the night before.",
    trial:
      "Trials run in the Kemang studio, two hours, six weeks out. Rp 1.500.000, credited against the balance.",
    hold: `Held. I have blocked ${whenLine} for 24 hours — the deposit confirms it.`,
  };
  const id: Record<string, string> = {
    price: `${lookTitle} ${idr(lookPrice)} sebelum tambahan. Deposit ${DEPOSIT_RATE}% mengunci tanggal; sisanya dibayar hari-H.`,
    travel:
      "Perjalanan dalam Jakarta termasuk. Di luar itu, transport sesuai biaya dan Shana datang sehari sebelumnya.",
    trial:
      "Trial di studio Kemang, dua jam, enam minggu sebelum. Rp 1.500.000, dipotong dari sisa pembayaran.",
    hold: `Ditahan. ${whenLine} saya blok 24 jam — deposit yang mengonfirmasi.`,
  };

  return lang === "id" ? id[key] : en[key];
}

export const QUICK_REPLIES = [
  { en: "Is 22 Aug free?", id: "Apakah 22 Agt kosong?" },
  { en: "Price for akad?", id: "Harga akad?" },
  { en: "Do you travel?", id: "Bisa ke luar kota?" },
  { en: "Trial?", id: "Trial?" },
];

export function seedGreeting(lang: Lang): { who: "bot"; text: string } {
  const en =
    "Good evening. I keep Shana’s calendar — tell me your date and city and I’ll tell you what is still open.";
  const id =
    "Selamat malam. Saya memegang jadwal Shana — sebutkan tanggal dan kota, saya beri tahu yang masih terbuka.";
  return { who: "bot", text: lang === "id" ? id : en };
}
