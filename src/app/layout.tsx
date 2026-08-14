import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getLanguage } from "@/lib/language";
import { getSession } from "@/lib/auth";
import { DesktopNav } from "@/components/shell/DesktopNav";
import { ChatWidgetLoader } from "@/components/shell/ChatWidgetLoader";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shana — Makeup portfolio & booking",
  description: "Pick a look, hold the date, pay the deposit.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, session] = await Promise.all([getLanguage(), getSession()]);

  return (
    <html
      lang={lang === "id" ? "id" : "en"}
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans overflow-x-hidden">
        {/* The desktop chrome is CSS-gated, so the phone app never inherits it. */}
        <div className="hidden lg:contents">
          <DesktopNav lang={lang} session={session} />
        </div>
        <main className="flex-1 flex flex-col">{children}</main>
        <div className="hidden lg:contents">
          <ChatWidgetLoader lang={lang} />
        </div>
      </body>
    </html>
  );
}
