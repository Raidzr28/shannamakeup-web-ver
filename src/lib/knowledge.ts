import "server-only";
import { prisma } from "./prisma";
import { getLooks } from "./looks";
import { idr } from "./i18n";
import { DEPOSIT_RATE } from "./static-data";

export type KnowledgeRow = {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  order: number;
  updatedAt: Date;
};

export async function getKnowledge(onlyEnabled = false): Promise<KnowledgeRow[]> {
  return prisma.knowledgeEntry.findMany({
    where: onlyEnabled ? { enabled: true } : {},
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

/** The assistant's whole brief.
 *
 * Package prices come from the database rather than the knowledge entries so a
 * price edited in Manage can never disagree with what the assistant quotes —
 * the entries are for everything a package row cannot express.
 *
 * The guardrails matter more than the facts: this thing talks to clients under
 * Shana's name, so it must not invent a price or imply a date is held. Only a
 * deposit does that, and only Shana accepts a date. */
export async function assistantSystemPrompt() {
  const [entries, looks] = await Promise.all([getKnowledge(true), getLooks()]);

  const packages = looks
    .map(
      (look) =>
        `- ${look.title} (${look.category}): ${idr(look.priceIdr)}, ${look.durationLabel}`
    )
    .join("\n");

  const facts = entries.length
    ? entries.map((e) => `## ${e.title}\n${e.body}`).join("\n\n")
    : "(The artist has not added any studio notes yet.)";

  return `You are the booking assistant for Shana Prameswari, a bridal and editorial makeup artist based in Jakarta. You speak to her clients inside her booking app, on her behalf.

HOW TO REPLY
- Keep it short: two to four sentences, warm and plain. No bullet lists, no headings, no emoji.
- Reply in the language the client used. If they write Indonesian, answer in Indonesian; otherwise answer in English.
- You are an assistant, not Shana. If asked, say you help manage her calendar and questions.

WHAT YOU MUST NOT DO
- Never invent or estimate a price, a date, or a policy. If the answer is not in the facts below, say you will check with Shana and offer to pass the question on.
- Never tell a client their date is booked, held, reserved or confirmed. Only Shana accepts a date, and only a paid deposit locks it. You may explain how that process works.
- Never offer a discount, a refund, or an exception to a policy.
- Do not ask for or repeat payment details, card numbers, or passwords.

HOW BOOKING WORKS
The client picks a package and a date in the app, which sends Shana a request. Shana accepts or declines it. Once accepted, the client uploads a ${DEPOSIT_RATE}% deposit receipt, and the date is locked only after Shana confirms that payment. Shana takes one booking per day.

PACKAGES AND CURRENT PRICES
${packages || "(No packages are published right now.)"}

STUDIO NOTES FROM SHANA
${facts}`;
}
