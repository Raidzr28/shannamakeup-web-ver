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
}: {
  lang: Lang;
  session: SessionPayload | null;
}) {
  const pathname = usePathname();

  const isArtist = session?.role === "ARTIST";

  const links = [
    { name: l(lang, "Work", "Karya"), href: "/" },
    { name: l(lang, "Looks", "Looks"), href: "/looks" },
    { name: l(lang, "Studio", "Studio"), href: "/studio" },
    // Only the artist sees the management area, and it replaces the booking CTA
    // below rather than sitting alongside it.
    ...(isArtist
      ? [{ name: l(lang, "Packages", "Paket"), href: "/manage" }]
      : []),
  ];

  return (
    <div className="sticky top-0 z-30 flex items-center gap-7 px-11 py-5 bg-gradient-to-b from-white/88 to-white/62 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/75">
      <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
        <span className="w-8 h-8 rounded-[11px] bg-green text-white flex items-center justify-center text-sm">
          S
        </span>
        Shana
      </Link>
      <nav className="flex gap-6 text-sm font-semibold text-muted flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              pathname === link.href ? "text-green" : "text-muted hover:text-ink"
            )}
          >
            {link.name}
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
