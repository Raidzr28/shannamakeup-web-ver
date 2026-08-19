import clsx from "clsx";

/** Portrait stand-in for a signed-in viewer who has not uploaded an avatar yet.
 *
 * Deliberately not the generic `Media` fallback: that one renders prepared
 * ground, which reads as "no photograph". This draws a person, so an empty
 * avatar slot still looks composed.
 *
 * She wears the paes. The ornament this whole interface is built from is drawn
 * on the brow of the one figure the app draws, which is where it belongs in
 * life — the placeholder is the world stating itself rather than apologising
 * for a missing upload.
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
        <linearGradient id="pp-skin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#d8a274" />
          <stop offset="100%" stopColor="#b57a4f" />
        </linearGradient>
      </defs>

      {/* Ink ground, so the figure is the only lit thing in the frame. */}
      <rect width="96" height="110" fill="var(--paes-ground)" />

      {/* Hair falls behind the face, so it is laid down first. */}
      <path
        d="M48 18c19 0 30 13 30 33 0 14-4 24-6 33-2-11-4-21-4-31 0-18-8-26-20-26s-20 8-20 26c0 10-2 20-4 31-2-9-6-19-6-33 0-20 11-33 30-33z"
        fill="var(--paes-ink)"
      />

      {/* Shoulders, neck and head. */}
      <path d="M6 110c2-19 18-30 42-30s40 11 42 30z" fill="url(#pp-skin)" />
      <path d="M41 58h14v22a7 7 0 0 1-14 0z" fill="url(#pp-skin)" />
      <ellipse cx="48" cy="45" rx="16" ry="19" fill="url(#pp-skin)" />

      {/* The paes, set out along the hairline: penunggul on the axis, a
          pengapit and a penitis falling away on each side, godheg at the
          temples. Same ogee construction as the drawn ornament, fitted to the
          curve of this brow. */}
      <g fill="var(--paes-ink)" stroke="var(--paes-prada)" strokeWidth={0.6}>
        <path d="M48 27c-1.6 3.4-4.6 6-4.6 9.2 0 2.6 2.1 4.4 4.6 4.4s4.6-1.8 4.6-4.4c0-3.2-3-5.8-4.6-9.2z" />
        <path d="M39.4 29.4c-1.3 2.7-3.7 4.8-3.7 7.3 0 2.1 1.7 3.5 3.7 3.5s3.7-1.4 3.7-3.5c0-2.5-2.4-4.6-3.7-7.3z" />
        <path d="M56.6 29.4c-1.3 2.7-3.7 4.8-3.7 7.3 0 2.1 1.7 3.5 3.7 3.5s3.7-1.4 3.7-3.5c0-2.5-2.4-4.6-3.7-7.3z" />
        <path d="M32.6 33c-1 2.1-2.9 3.7-2.9 5.6 0 1.6 1.3 2.7 2.9 2.7s2.9-1.1 2.9-2.7c0-1.9-1.9-3.5-2.9-5.6z" />
        <path d="M63.4 33c-1 2.1-2.9 3.7-2.9 5.6 0 1.6 1.3 2.7 2.9 2.7s2.9-1.1 2.9-2.7c0-1.9-1.9-3.5-2.9-5.6z" />
      </g>
      {/* Godheg: the temple hooks. */}
      <path
        d="M31 43c-1.5 4-1 8 .5 11.5-2.5-2.5-4-6.5-3.5-11.5z"
        fill="var(--paes-ink)"
      />
      <path
        d="M65 43c1.5 4 1 8-.5 11.5 2.5-2.5 4-6.5 3.5-11.5z"
        fill="var(--paes-ink)"
      />

      {/* Prada along the hairline the ornament is set out on. */}
      <path
        d="M31 42.5c5.5-3.4 11.4-5 17-5s11.5 1.6 17 5"
        fill="none"
        stroke="var(--paes-prada)"
        strokeOpacity="0.55"
        strokeWidth="0.7"
      />
    </svg>
  );
}
