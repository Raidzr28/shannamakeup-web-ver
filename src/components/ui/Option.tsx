import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { CheckIcon } from "@/components/ui/Icons";

export function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        "w-5 h-5 rounded-full flex-none box-border border",
        active
          ? "border-prada bg-prada shadow-[inset_0_0_0_3px_var(--paes-ink)]"
          : "border-line-2 bg-ground"
      )}
    />
  );
}

export function Check({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        "w-[22px] h-[22px] rounded-md flex-none box-border border flex items-center justify-center",
        active ? "border-prada bg-prada text-onprada" : "border-line-2 bg-ground"
      )}
    >
      {active ? <CheckIcon className="w-3.5 h-3.5" /> : null}
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
        "px-[15px] py-2.5 rounded-full text-[12px] cursor-pointer whitespace-nowrap border transition-colors",
        active
          ? "bg-prada text-onprada border-prada-lit"
          : "bg-ground text-melati-2 border-prada/30 hover:border-prada/60",
        className
      )}
    >
      {children}
    </Link>
  );
}
