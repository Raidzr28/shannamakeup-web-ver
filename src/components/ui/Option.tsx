import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        "w-5 h-5 rounded-full flex-none box-border border-2",
        active ? "border-green bg-green shadow-[inset_0_0_0_3px_#fff]" : "border-line-2 bg-white"
      )}
    />
  );
}

export function Check({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        "w-[22px] h-[22px] rounded-lg flex-none box-border border-[1.5px] flex items-center justify-center text-xs font-extrabold text-white",
        active ? "border-green bg-green" : "border-line-2 bg-white"
      )}
    >
      {active ? "✓" : ""}
    </span>
  );
}

export function ChipLink({
  active,
  href,
  className,
  children,
}: {
  active?: boolean;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "px-[15px] py-2.5 rounded-full text-[12.5px] font-semibold cursor-pointer whitespace-nowrap border",
        active
          ? "glass-fill text-white border-transparent"
          : "glass-light text-[#4e5d54] border-white/80",
        className
      )}
    >
      {children}
    </Link>
  );
}
