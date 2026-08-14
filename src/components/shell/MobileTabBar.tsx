"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import {
  HomeIcon,
  LooksIcon,
  BookIcon,
  OrdersIcon,
  ProfileIcon,
} from "@/components/ui/Icons";

export function MobileTabBar({ lang }: { lang: Lang }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: l(lang, "Home", "Beranda"),
      href: "/",
      Icon: HomeIcon,
      match: (p: string) => p === "/",
    },
    {
      name: l(lang, "Looks", "Looks"),
      href: "/looks",
      Icon: LooksIcon,
      match: (p: string) => p.startsWith("/looks"),
    },
    {
      name: l(lang, "Book", "Pesan"),
      href: "/book",
      Icon: BookIcon,
      match: (p: string) => p.startsWith("/book"),
    },
    {
      name: l(lang, "Orders", "Pesanan"),
      href: "/orders",
      Icon: OrdersIcon,
      match: (p: string) => p.startsWith("/orders"),
    },
    {
      name: l(lang, "Profile", "Profil"),
      href: "/account",
      Icon: ProfileIcon,
      match: (p: string) => p.startsWith("/account"),
    },
  ];

  return (
    <nav
      aria-label={l(lang, "Main", "Utama")}
      className="sticky bottom-0 grid grid-cols-5 px-1.5 pt-2 pb-7 bg-gradient-to-b from-white/70 to-white/95 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/80 shadow-[0_-8px_24px_rgba(28,38,32,0.07)] z-20"
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors",
              active ? "text-green" : "text-faint"
            )}
          >
            {/* The tinted pill echoes the accent chips used elsewhere, so the
                active tab reads at a glance without relying on colour alone. */}
            <span
              className={clsx(
                "flex items-center justify-center w-11 h-7 rounded-full transition-colors",
                active ? "bg-tint" : "bg-transparent"
              )}
            >
              <tab.Icon className="w-[21px] h-[21px]" />
            </span>
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
