import type { SVGProps } from "react";

/** Stroke icons drawn to match the app's soft consumer language: 24px grid,
 * 1.75 weight, round caps. They inherit `currentColor`, so the tab bar controls
 * their colour through the link's text class. */
function Icon({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9.6Z" />
      <path d="M9.5 21v-6h5v6" />
    </Icon>
  );
}

/** A photo frame — the Looks tab is a feed of portfolio images. */
export function LooksIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="3.5" width="18" height="17" rx="3.5" />
      <circle cx="8.75" cy="9.25" r="1.6" />
      <path d="M3.6 16.6l4.3-4a2 2 0 0 1 2.7 0l5 4.6" />
      <path d="M14.8 13.4l1.6-1.5a2 2 0 0 1 2.7 0l1.3 1.2" />
    </Icon>
  );
}

/** A calendar — booking is choosing a date. */
export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v3.5M16 3v3.5M3 10h18" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** A receipt — orders and their deposit status. */
export function OrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5.5 3.5h13a1 1 0 0 1 1 1V21l-2.6-1.7L14.3 21l-2.3-1.7L9.7 21l-2.6-1.7L4.5 21V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 8.5h7M8.5 12.5h4.5" />
    </Icon>
  );
}

/** Sliders — the artist's package management tab. */
export function ManageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h8M16 17h4" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="14" cy="17" r="2" />
    </Icon>
  );
}

export function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.9" />
      <path d="M4.6 20.5a7.6 7.6 0 0 1 14.8 0" />
    </Icon>
  );
}

/* ---- Retiring the glyphs -------------------------------------------------
 * The app reached for ←, ✓, →, ★, ✕ and friends where an icon belonged. A
 * text glyph takes its shape from whatever font happens to resolve, so it
 * cannot hold a stroke weight, and it drifts between platforms. These are the
 * replacements, drawn on the same 24px grid at the same 1.75 weight as the
 * tab icons above, so one stroke runs through every atom in the system. */

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M15 5.5 8.5 12l6.5 6.5" />
    </Icon>
  );
}

export function ForwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </Icon>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 12.5 10 17.5 19 7" />
    </Icon>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </Icon>
  );
}

/** Filled by default: a rating star is a value, not an outline. */
export function StarIcon({
  filled = true,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <Icon fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 3.6l2.6 5.5 6 .85-4.35 4.2 1.05 5.95L12 17.3l-5.3 2.8 1.05-5.95L3.4 9.95l6-.85z" />
    </Icon>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </Icon>
  );
}

export function HeartIcon({
  filled = false,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <Icon fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 20s-7.2-4.35-7.2-9.15A4.15 4.15 0 0 1 12 8.4a4.15 4.15 0 0 1 7.2 2.45C19.2 15.65 12 20 12 20Z" />
    </Icon>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 21s6.2-6.05 6.2-10.2a6.2 6.2 0 1 0-12.4 0C5.8 14.95 12 21 12 21Z" />
      <circle cx="12" cy="10.6" r="2.4" />
    </Icon>
  );
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6.2 3.8h3.1l1.5 3.9-2 1.4a11.4 11.4 0 0 0 5.1 5.1l1.4-2 3.9 1.5v3.1a1.6 1.6 0 0 1-1.75 1.6C10.3 17.9 6.1 13.7 4.6 5.55A1.6 1.6 0 0 1 6.2 3.8Z" />
    </Icon>
  );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.4" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </Icon>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2.4" />
      <path d="M8.4 10.2V7.8a3.6 3.6 0 0 1 7.2 0v2.4" />
    </Icon>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4.8 6.9h14.4M9.6 6.6V4.9h4.8v1.7" />
      <path d="M6.6 6.9 7.5 19a1.4 1.4 0 0 0 1.4 1.3h6.2a1.4 1.4 0 0 0 1.4-1.3l.9-12.1" />
      <path d="M10.4 10.4v6M13.6 10.4v6" />
    </Icon>
  );
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4.6 19.4h3.2L18.5 8.7a2.05 2.05 0 0 0-2.9-2.9L4.9 16.5v2.9Z" />
      <path d="m14.8 6.9 2.9 2.9" />
    </Icon>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Icon>
  );
}

export function ReplyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9 6.5 3.8 11.4 9 16.3" />
      <path d="M4.4 11.4h8.9a6.3 6.3 0 0 1 6.3 6.3v0" />
    </Icon>
  );
}
