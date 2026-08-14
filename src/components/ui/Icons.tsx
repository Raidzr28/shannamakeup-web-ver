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
