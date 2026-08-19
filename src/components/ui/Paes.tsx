import type { SVGProps } from "react";

/** Paes ageng, drawn.
 *
 * The Javanese bridal forehead ornament: a row of pointed leaves set out along
 * the hairline to prescribed proportion, each one filled matte black and closed
 * with a gold prada edge. Centre outward the shapes are the penunggul (tallest,
 * on the axis), the pengapit, and the penitis, with a godheg hooking down at
 * each temple.
 *
 * This is the build's signature asset. It is the brand mark, the section
 * marker, the active-state indicator, and the ground of every empty image slot,
 * so it is authored once here and never approximated with a glyph or a border
 * radius elsewhere.
 *
 * Geometry note: `leaf()` builds an ogee — the sides bow outward from the apex,
 * then straighten as they land on the baseline. The ornament sits ON a line; it
 * never floats.
 */

/** One ogee leaf, symmetric about `cx`, apex at `top`, resting on `base`. */
function leaf(cx: number, top: number, base: number, w: number) {
  const h = base - top;
  const half = w / 2;
  return [
    `M${cx} ${top}`,
    `C${cx - w * 0.58} ${top + h * 0.42} ${cx - half} ${base - h * 0.18} ${cx - half} ${base}`,
    `L${cx + half} ${base}`,
    `C${cx + half} ${base - h * 0.18} ${cx + w * 0.58} ${top + h * 0.42} ${cx} ${top}`,
    "Z",
  ].join(" ");
}

/** The temple hook. Mirrored by `dir`. */
function godheg(x: number, base: number, dir: 1 | -1) {
  return [
    `M${x} ${base}`,
    `C${x - dir * 4} ${base - 26} ${x + dir * 10} ${base - 40} ${x + dir * 22} ${base - 44}`,
    `C${x + dir * 12} ${base - 34} ${x + dir * 6} ${base - 18} ${x + dir * 9} ${base}`,
    "Z",
  ].join(" ");
}

const BASE = 72;

const CROWN = [
  leaf(120, 4, BASE, 48),
  leaf(120 - 45, 22, BASE, 35),
  leaf(120 + 45, 22, BASE, 35),
  leaf(120 - 81, 37, BASE, 27),
  leaf(120 + 81, 37, BASE, 27),
];

/** The full ornament. `tone="ink"` is the drawn form: black shapes, prada edge.
 *  `tone="edge"` is the hairline-only rendition used where the ornament must
 *  read as structure rather than as an object. */
export function PaesCrown({
  tone = "ink",
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { tone?: "ink" | "edge" }) {
  const fill = tone === "ink" ? "var(--paes-ink)" : "none";
  return (
    <svg
      viewBox="0 0 240 80"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <g
        fill={fill}
        stroke="var(--paes-prada)"
        strokeWidth={1}
        strokeLinejoin="round"
      >
        {CROWN.map((d, i) => (
          <path key={i} d={d} />
        ))}
        <path d={godheg(14, BASE, 1)} />
        <path d={godheg(226, BASE, -1)} />
      </g>
      {/* The hairline the ornament is set out on. */}
      <path
        d={`M0 ${BASE + 0.5}H240`}
        stroke="var(--paes-prada)"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
    </svg>
  );
}

/** A single penunggul. The brand mark, and the active-state indicator. */
export function PaesMark({
  tone = "ink",
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { tone?: "ink" | "edge" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d={leaf(16, 3, 29, 22)}
        fill={tone === "ink" ? "var(--paes-ink)" : "none"}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The lattice the ornament is set out on, as a fillable pattern.
 *  Used behind empty media slots so a missing photograph reads as prepared
 *  ground rather than as a hole. */
export function PaesGround({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 240 240"
    >
      <defs>
        <pattern
          id="paes-lattice"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H40V40H0Z"
            fill="none"
            stroke="var(--paes-prada)"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
          <path
            d="M20 8 L32 20 L20 32 L8 20 Z"
            fill="none"
            stroke="var(--paes-prada)"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <rect width="240" height="240" fill="var(--paes-ground)" />
      <rect width="240" height="240" fill="url(#paes-lattice)" />
    </svg>
  );
}
