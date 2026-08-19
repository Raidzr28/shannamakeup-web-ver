import type { Metadata } from "next";
import { Bodoni_Moda, Archivo } from "next/font/google";
import "./globals.css";
import { getLanguage } from "@/lib/language";
import { getSession } from "@/lib/auth";
import { DesktopNav } from "@/components/shell/DesktopNav";
import { ChatWidgetLoader } from "@/components/shell/ChatWidgetLoader";
import { getWaitingChatCount } from "@/lib/inbox";

/** Display voice. Bodoni's thick-to-hairline contrast makes the same move the
 *  ornament does: a solid black shape closed by a gold hairline. */
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

/** Working face. Carries the dense EN · ID labels, where `both` mode makes
 *  every short label roughly double width, and owns the tabular figures. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shana — Makeup portfolio & booking",
  description: "Pick a look, hold the date, pay the deposit.",
};

/** The direction contract.
 *
 * React strips JSX comments, so this is emitted through innerHTML to put a real
 * HTML comment in the built markup where it can be grepped for the seed key.
 * The hidden div is the wrapper React requires; the comment is the payload. */
const DIRECTION_CONTRACT = `<!--
THESIS: Bridal makeup sold in the grammar of bridal makeup. Paes ageng's
prescribed geometry becomes the interface. Refuses the cream portfolio grid
with a serif display and a Book Now button.
OWN-WORLD: Warm ink ground. Prada gold only ever a hairline edge, never glow,
never gradient, laid solid on the one primary action per surface. Melati type.
Bodoni Moda at architectural scale against small Archivo, nothing between. One
stroke weight across every atom. The penunggul arc is the radius language.
STORY: She is on her phone at night, months before her akad, judging whether
this work holds on skin. The portrait proves it; the gold edge says where to act.
FIRST VIEWPORT: Full-bleed portrait on ink, cropped to brow and forehead. Paes
arcs carry the nav. Price and duration as exact tabular figures on a
prada-edged band, the leaf-filled action at its right.
FORM: Paes Ageng, candidate 1 of 7, seed f9f47396.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance
-->`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, session] = await Promise.all([getLanguage(), getSession()]);

  // Only the artist has an inbox, so only she pays for this query.
  const waitingChats =
    session?.role === "ARTIST" ? await getWaitingChatCount() : 0;

  return (
    <html
      lang={lang === "id" ? "id" : "en"}
      className={`${archivo.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans overflow-x-hidden">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {/* The desktop chrome is CSS-gated, so the phone app never inherits it. */}
        <div className="hidden lg:contents">
          <DesktopNav lang={lang} session={session} waitingChats={waitingChats} />
        </div>
        <main className="flex-1 flex flex-col">{children}</main>
        <div className="hidden lg:contents">
          <ChatWidgetLoader lang={lang} />
        </div>
      </body>
    </html>
  );
}
