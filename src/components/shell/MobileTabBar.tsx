"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";

export function MobileTabBar({ lang }: { lang: Lang }) {
  const pathname = usePathname();

  const tabs = [
    { name: l(lang, "Home", "Beranda"), href: "/", match: (p: string) => p === "/" },
    { name: l(lang, "Looks", "Looks"), href: "/looks", match: (p: string) => p.startsWith("/looks") },
    { name: l(lang, "Book", "Pesan"), href: "/book/akad", match: (p: string) => p.startsWith("/book") },
    { name: l(lang, "Orders", "Pesanan"), href: "/orders", match: (p: string) => p.startsWith("/orders") },
    { name: l(lang, "Profile", "Profil"), href: "/account", match: (p: string) => p.startsWith("/account") },
  ];

  return (
    <div className="sticky bottom-0 grid grid-cols-5 px-1.5 pt-2.5 pb-7 bg-gradient-to-b from-white/70 to-white/95 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/80 shadow-[0_-8px_24px_rgba(28,38,32,0.07)] z-20">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-col items-center gap-1.5 py-1.5 text-[11px] font-semibold",
              active ? "text-green" : "text-faint"
            )}
          >
            <span
              className={clsx(
                "w-[22px] h-[22px] rounded-lg",
                active ? "bg-green" : "bg-[#e6ebe7]"
              )}
            />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
