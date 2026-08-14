import Link from "next/link";
import clsx from "clsx";
import { Media } from "@/components/ui/Media";
import { idr } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";

export function LookCard({
  look,
  lang,
  size = "sm",
  href,
}: {
  look: LookDTO;
  lang: Lang;
  size?: "sm" | "lg";
  /** Defaults to the look's detail page; the booking chooser points straight at the wizard. */
  href?: string;
}) {
  return (
    <Link
      href={href ?? `/l/${look.id}`}
      className={clsx("glass-card block", size === "sm" ? "p-2.5 pb-3.5" : "p-3")}
    >
      <Media
        src={look.heroImage}
        alt={l(lang, look.title, look.titleId)}
        placeholder={l(lang, look.title, look.titleId)}
        className={size === "sm" ? "h-[132px]" : "h-[214px]"}
      />
      <div
        className={clsx(
          "font-bold leading-tight",
          size === "sm" ? "text-sm mt-2.5" : "text-base mt-3"
        )}
      >
        {l(lang, look.title, look.titleId)}
      </div>
      <div className="text-[11.5px] text-muted-2 mt-1">
        {l(lang, look.category, look.categoryId)} · {look.durationLabel}
      </div>
      <div className={clsx("font-extrabold text-green mt-1.5", size === "sm" ? "text-sm" : "text-[15px]")}>
        {idr(look.priceIdr)}
      </div>
    </Link>
  );
}
