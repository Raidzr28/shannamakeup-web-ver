import Image from "next/image";
import clsx from "clsx";

const PALETTES = [
  "from-[#dfeee7] to-[#c9e3d6]",
  "from-[#f0e6d8] to-[#e3d0b2]",
  "from-[#e6e0ef] to-[#d3c4e8]",
  "from-[#f0dbdb] to-[#e5bcbc]",
];

function paletteFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

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
        "relative overflow-hidden bg-gradient-to-br flex items-center justify-center",
        paletteFor(alt || placeholder || "shana"),
        radius,
        className
      )}
    >
      <span className="text-[11px] font-bold text-[#3d4a43]/70 text-center px-2 line-clamp-2">
        {placeholder ?? "+"}
      </span>
    </div>
  );
}
