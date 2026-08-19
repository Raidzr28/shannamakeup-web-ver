"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import type { SessionPayload } from "@/lib/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PaesMark } from "@/components/ui/Paes";

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
    <div className="sticky top-0 z-30 flex items-center gap-7 border-b border-prada/30 bg-bg px-11 py-4">
      {/* The mark is the penunggul — the ornament's centre shape — not a letter
          in a rounded square. */}
      <Link href="/" className="flex items-center gap-2.5">
        <PaesMark tone="edge" className="h-7 w-7 text-prada" />
        <span className="font-display text-[22px] leading-none text-melati">
          Shana
        </span>
      </Link>
      <nav className="flex flex-1 gap-6 text-[13.5px]">
        {links.map((link) => {
          const active = link.match
            ? link.match(pathname)
            : pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-1.5 border-b py-1 transition-colors",
                active
                  ? "border-prada text-prada"
                  : "border-transparent text-melati-2 hover:text-melati"
              )}
            >
              {link.name}
              {!!link.badge && link.badge > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-alarm px-1 text-[10.5px] font-semibold tabular-nums text-melati">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <LanguageSwitcher lang={lang} />
      <Link
        href={session ? "/account" : "/login"}
        className="flex h-[40px] cursor-pointer items-center rounded-xl border border-prada/35 px-[18px] text-[13.5px] text-melati-2 transition-colors hover:border-prada/70 hover:text-melati"
      >
        {session ? session.name.split(" ")[0] : l(lang, "Sign in", "Masuk")}
      </Link>
      <Link
        href={isArtist ? "/manage/new" : "/book"}
        className="prada-leaf flex h-[40px] cursor-pointer items-center px-5 text-[13.5px]"
      >
        {isArtist
          ? l(lang, "New package", "Paket baru")
          : l(lang, "Book a date", "Pesan tanggal")}
      </Link>
    </div>
  );
}
