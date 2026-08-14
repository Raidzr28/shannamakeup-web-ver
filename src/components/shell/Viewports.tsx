import type { ReactNode } from "react";

/** The phone app. Shown below the `lg` breakpoint, and capped so it stays
 * phone-shaped rather than stretching across a half-wide window. */
export function MobileOnly({ children }: { children: ReactNode }) {
  return (
    <div className="lg:hidden w-full max-w-[560px] mx-auto flex-1 flex flex-col">
      {children}
    </div>
  );
}

/** The desktop site. Shown from `lg` up. */
export function DesktopOnly({ children }: { children: ReactNode }) {
  return <div className="hidden lg:flex flex-1 flex-col">{children}</div>;
}
