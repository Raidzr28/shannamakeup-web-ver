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
  ManageIcon,
  OrdersIcon,
  ProfileIcon,
} from "@/components/ui/Icons";

export function MobileTabBar({
  lang,
  isArtist = false,
}: {
  lang: Lang;
  isArtist?: boolean;
}) {
  const pathname = usePathname();

  // Shana books nobody but herself, so the artist gets package management in
  // the slot a client uses to book.
  const middleTab = isArtist
    ? {
        // Home is the studio dashboard for the artist, so this slot is the
        // price list rather than a second way into the same screen.
        name: l(lang, "Packages", "Paket"),
        href: "/manage/packages",
        Icon: ManageIcon,
        // Excludes the queues that have their own tabs, so only one lights up.
        match: (p: string) =>
          p.startsWith("/manage") &&
          !p.startsWith("/manage/bookings") &&
          !p.startsWith("/manage/chats"),
      }
    : {
        name: l(lang, "Book", "Pesan"),
        href: "/book",
        Icon: BookIcon,
        match: (p: string) => p.startsWith("/book"),
      };

  // /orders lists the bookings you placed yourself, which for the artist is
  // always empty — she takes bookings, she does not make them. Hers points at
  // the queue of client requests instead, which is what "Orders" means to her.
  const ordersTab = isArtist
    ? {
        name: l(lang, "Orders", "Pesanan"),
        href: "/manage/bookings",
        Icon: OrdersIcon,
        match: (p: string) => p.startsWith("/manage/bookings"),
      }
    : {
        name: l(lang, "Orders", "Pesanan"),
        href: "/orders",
        Icon: OrdersIcon,
        match: (p: string) => p.startsWith("/orders"),
      };

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
    middleTab,
    ordersTab,
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
              active ? "text-maroon" : "text-faint"
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
