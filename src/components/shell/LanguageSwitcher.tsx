"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { setLanguageAction } from "@/lib/actions/language";
import type { Lang } from "@/lib/i18n";

const OPTIONS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "id", label: "ID" },
  { id: "both", label: "EN·ID" },
];

export function LanguageSwitcher({
  lang,
  className,
}: {
  lang: Lang;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={clsx("flex gap-1 rounded-full glass-light p-1", className)}>
      {OPTIONS.map((opt) => (
        <form key={opt.id} action={setLanguageAction}>
          <input type="hidden" name="lang" value={opt.id} />
          <input type="hidden" name="next" value={pathname} />
          <button
            type="submit"
            className={clsx(
              "px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer",
              lang === opt.id ? "bg-green text-white" : "text-muted"
            )}
          >
            {opt.label}
          </button>
        </form>
      ))}
    </div>
  );
}
