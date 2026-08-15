"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import type { SessionPayload } from "@/lib/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function DesktopNav({
  lang,
  session,
  waitingChats = 0,
}: {
  lang: Lang;
  session: SessionPayload | null;
  /** Client conversations waiting on a reply. Zero for everyone but the artist. */
  waitingChats?: number;
}) {
  const pathname = usePathname();

  const isArtist = session?.role === "ARTIST";

  const links: {
    name: string;
    href: string;
    match?: (p: string) => boolean;
    badge?: number;
  }[] = [
    // For the artist, "/" is her dashboard rather than the portfolio front page.
    {
      name: isArtist ? l(lang, "Dashboard", "Dasbor") : l(lang, "Work", "Karya"),
      href: "/",
    },
    { name: l(lang, "Looks", "Looks"), href: "/looks" },
    { name: l(lang, "Studio", "Studio"), href: "/studio" },
    // Only the artist sees the management area, and it replaces the booking CTA
    // below rather than sitting alongside it. Reservations come first: incoming
    // requests are the thing that actually needs answering.
    ...(isArtist
      ? [
          {
            name: l(lang, "Reservations", "Reservasi"),
            href: "/manage/bookings",
            match: (p: string) => p.startsWith("/manage/bookings"),
          },
          {
            name: l(lang, "Chats", "Chat"),
            href: "/manage/chats",
            match: (p: string) => p.startsWith("/manage/chats"),
            badge: waitingChats,
          },
          {
            name: l(lang, "Packages", "Paket"),
            href: "/manage/packages",
            // Covers the package editors that hang off /manage; the other
            // areas have their own links above.
            match: (p: string) =>
              p.startsWith("/manage") &&
              !p.startsWith("/manage/bookings") &&
              !p.startsWith("/manage/chats") &&
              !p.startsWith("/manage/knowledge"),
          },
        ]
      : []),
  ];

  return (
    <div className="sticky top-0 z-30 flex items-center gap-7 px-11 py-5 bg-gradient-to-b from-white/88 to-white/62 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/75">
      <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
        <span className="w-8 h-8 rounded-[11px] bg-gold text-ink flex items-center justify-center text-sm">
          S
        </span>
        <span className="text-gold">Shana</span>
      </Link>
      <nav className="flex gap-6 text-sm font-semibold text-muted flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center gap-1.5",
              (link.match ? link.match(pathname) : pathname === link.href)
                ? "text-maroon"
                : "text-muted hover:text-ink"
            )}
          >
            {link.name}
            {!!link.badge && link.badge > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#b23a3a] text-white text-[10.5px] font-bold flex items-center justify-center">
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <LanguageSwitcher lang={lang} />
      <Link
        href={session ? "/account" : "/login"}
        className="h-[42px] px-[18px] rounded-2xl text-sm font-bold cursor-pointer text-ink glass-light flex items-center"
      >
        {session ? session.name.split(" ")[0] : l(lang, "Sign in", "Masuk")}
      </Link>
      <Link
        href={isArtist ? "/manage/new" : "/book"}
        className="h-[42px] px-5 rounded-2xl text-sm font-bold cursor-pointer text-white glass-fill flex items-center"
      >
        {isArtist
          ? l(lang, "New package", "Paket baru")
          : l(lang, "Book a date", "Pesan tanggal")}
      </Link>
    </div>
  );
}
