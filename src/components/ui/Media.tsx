import Image from "next/image";
import clsx from "clsx";
import { PaesCrown, PaesGround } from "./Paes";

export function Media({
  src,
  alt,
  shape = "rounded",
  placeholder,
  className,
  sizes,
}: {
  src?: string | null;
  alt: string;
  shape?: "rounded" | "circle" | "rect";
  placeholder?: string;
  className?: string;
  sizes?: string;
}) {
  const radius =
    shape === "circle" ? "rounded-full" : shape === "rect" ? "" : "rounded-2xl";

  // The wrapper is the positioned ancestor that `fill` measures against, so it
  // must keep `relative` and callers must give it a SIZE (h-full, h-[340px]),
  // never a position. Passing `absolute inset-0` here silently collapses it:
  // Tailwind emits `relative` after `absolute`, so `relative` wins, the wrapper
  // measures 0 tall, and the image never renders or even lazy-loads.
  if (src) {
    return (
      <div className={clsx("relative overflow-hidden", radius, className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative overflow-hidden flex items-center justify-center",
        radius,
        className
      )}
    >
      {/* No photograph yet. The slot renders as prepared ground — the lattice
          the ornament is set out on — rather than as a coloured hole, so an
          unfilled portfolio still reads as the world it belongs to. The
          ornament's scale is driven off the slot, so it works from a 34px
          avatar to a full-bleed hero. */}
      <PaesGround className="absolute inset-0 w-full h-full" />
      <PaesCrown
        tone="edge"
        className="absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 opacity-80"
      />
      {placeholder ? (
        <span className="relative text-[11px] font-medium tracking-[0.06em] uppercase text-melati-3 text-center px-2 line-clamp-2">
          {placeholder}
        </span>
      ) : null}
    </div>
  );
}
