import clsx from "clsx";

/** Placeholder shapes shown while a route's data is still on the way.
 *
 * The pulse lives on the wrapper rather than on each bar, so a card's parts
 * breathe together instead of shimmering out of step with each other.
 *
 * Everything here is decorative: `aria-hidden` on the wrapper keeps the whole
 * arrangement out of the accessibility tree, and the live region announces the
 * one thing that actually matters — that something is loading. */
export function SkeletonGroup({
  children,
  className,
  label = "Loading",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <>
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>
      <div aria-hidden="true" className={clsx("animate-pulse", className)}>
        {children}
      </div>
    </>
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <span className={clsx("block rounded-full bg-line/70", className ?? "h-3 w-full")} />
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <span className={clsx("block rounded-2xl bg-line/60", className)} />;
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <span className={clsx("block rounded-full bg-line/70", className)} />;
}

/** A card-shaped placeholder matching the app's `glass-card` rows. */
export function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={clsx("glass-card p-[18px] flex flex-col gap-3", className)}>
      {children ?? (
        <>
          <SkeletonLine className="h-3.5 w-1/2" />
          <SkeletonLine className="h-3 w-3/4" />
          <SkeletonLine className="h-3 w-1/3" />
        </>
      )}
    </div>
  );
}

/** A row with a leading avatar or thumbnail — the inbox and queue shape. */
export function SkeletonRow({ round = false }: { round?: boolean }) {
  return (
    <div className="glass-card p-[18px] flex gap-3.5 items-start">
      {round ? (
        <SkeletonCircle className="w-11 h-11 flex-none" />
      ) : (
        <SkeletonBlock className="w-[52px] h-[58px] flex-none" />
      )}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <SkeletonLine className="h-3.5 w-2/5" />
        <SkeletonLine className="h-3 w-4/5" />
        <SkeletonLine className="h-2.5 w-1/2" />
      </div>
      <SkeletonBlock className="w-16 h-5 flex-none rounded-full" />
    </div>
  );
}

/** Page heading placeholder, shared by every list route. */
export function SkeletonHeading() {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonLine className="h-5 w-40" />
      <SkeletonLine className="h-3 w-64 max-w-full" />
    </div>
  );
}
