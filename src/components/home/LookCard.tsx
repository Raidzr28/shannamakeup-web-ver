import Link from "next/link";
import clsx from "clsx";
import { Media } from "@/components/ui/Media";
import { idr } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { l } from "@/lib/i18n";
import type { LookDTO } from "@/lib/looks";

/** The repeated atom of the portfolio.
 *
 * The portrait owns the card and runs edge to edge; the commercial facts sit
 * below it on a band closed by a prada hairline. Scale carries the hierarchy on
 * its own — the title is display-scale, everything else is small and exact, and
 * nothing sits in between. The price is a figure, not a decoration, so it is set
 * in the display face with tabular numerals and never wraps. */
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
  const title = l(lang, look.title, look.titleId);

  return (
    <Link
      href={href ?? `/l/${look.id}`}
      className="plate group block overflow-hidden"
    >
      <Media
        src={look.heroImage}
        alt={title}
        shape="rect"
        className={clsx("w-full", size === "sm" ? "h-[152px]" : "h-[248px]")}
        sizes={size === "sm" ? "(max-width: 1024px) 50vw, 25vw" : "50vw"}
      />
      <div className="border-t border-prada/30 px-3 pt-2.5 pb-3">
        <div
          className={clsx(
            "font-display leading-[1.05] text-melati",
            size === "sm" ? "text-[17px]" : "text-[22px]"
          )}
        >
          {title}
        </div>
        {/* Category, duration and price each get their own line. Sharing one
            row truncated the category to "TRADIT…" at grid width and dropped
            the duration entirely — and `both` mode, which is the default,
            doubles the length of every one of these labels. */}
        <div className="mt-1.5 text-[10px] uppercase leading-[1.5] tracking-[0.08em] text-melati-3">
          {l(lang, look.category, look.categoryId)} · {look.durationLabel}
        </div>
        <div
          className={clsx(
            "mt-2 font-display tabular-nums text-prada",
            size === "sm" ? "text-[15px]" : "text-[18px]"
          )}
        >
          {idr(look.priceIdr)}
        </div>
      </div>
    </Link>
  );
}
