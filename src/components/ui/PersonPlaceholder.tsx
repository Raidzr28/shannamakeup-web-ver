import clsx from "clsx";

/** Portrait stand-in for a signed-in viewer who has not uploaded an avatar yet.
 *
 * Deliberately not the generic `Media` fallback: that one prints a letter on a
 * flat gradient, which reads as "missing" rather than as a person. This draws a
 * bust in the house palette, so an empty avatar slot still looks composed.
 *
 * `slice` rather than `meet` so the bust fills any aspect the caller gives it
 * and crops at the shoulders, the way a real portrait in that slot would. */
export function PersonPlaceholder({
  className,
  label = "Your profile photo",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 110"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      className={clsx("block", className)}
    >
      <defs>
        <linearGradient id="pp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbf1e4" />
          <stop offset="100%" stopColor="#efd7ba" />
        </linearGradient>
        <linearGradient id="pp-hair" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7a1a22" />
          <stop offset="100%" stopColor="#430a0f" />
        </linearGradient>
        <linearGradient id="pp-skin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#dda88f" />
          <stop offset="100%" stopColor="#c9866f" />
        </linearGradient>
        <radialGradient id="pp-glow" cx="0.5" cy="0.18" r="0.75">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="96" height="110" fill="url(#pp-bg)" />
      <rect width="96" height="110" fill="url(#pp-glow)" />

      {/* Hair falls behind the face, so it is laid down first and the bust
          overlaps it. */}
      <path
        d="M48 18c19 0 30 13 30 33 0 14-4 24-6 33-2-11-4-21-4-31 0-18-8-26-20-26s-20 8-20 26c0 10-2 20-4 31-2-9-6-19-6-33 0-20 11-33 30-33z"
        fill="url(#pp-hair)"
      />

      {/* Shoulders, neck and head as one warm tone. */}
      <path d="M6 110c2-19 18-30 42-30s40 11 42 30z" fill="url(#pp-skin)" />
      <path d="M41 58h14v22a7 7 0 0 1-14 0z" fill="url(#pp-skin)" />
      <ellipse cx="48" cy="45" rx="16" ry="19" fill="url(#pp-skin)" />

      {/* A swept fringe reads as styled rather than bald at this size. */}
      <path
        d="M31 44c0-13 7-20 17-20s17 7 17 20c-4-9-10-13-17-13s-13 4-17 13z"
        fill="url(#pp-hair)"
      />

      {/* Small gold sparkle — the one nod to what the app is actually for. */}
      <path
        d="M74 28l1.6 4.4L80 34l-4.4 1.6L74 40l-1.6-4.4L68 34l4.4-1.6z"
        fill="#dd9d63"
        opacity="0.85"
      />
    </svg>
  );
}
