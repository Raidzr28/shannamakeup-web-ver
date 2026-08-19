"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import { PaesMark } from "@/components/ui/Paes";
import { BookIcon, HomeIcon, LooksIcon, ManageIcon, OrdersIcon, ProfileIcon } from "@/components/ui/Icons";

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
      className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-prada/35 bg-bg px-1.5 pt-2.5 pb-7"
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex flex-col items-center gap-1 py-1 text-[10.5px] transition-colors",
              active ? "text-prada" : "text-melati-3"
            )}
          >
            <tab.Icon className="w-[21px] h-[21px]" />
            <span className="leading-none">{tab.name}</span>
            {/* The position marker is the ornament's own centre shape. The row
                always reserves its height, so switching tabs moves the leaf
                rather than shifting the bar. Colour is not carrying this on its
                own — the marked tab has a mark. */}
            <PaesMark
              tone="edge"
              className={clsx(
                "h-[7px] w-[7px] transition-opacity",
                active ? "opacity-100" : "opacity-0"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
