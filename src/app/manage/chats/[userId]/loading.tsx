import {
  SkeletonGroup,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonLine,
} from "@/components/ui/Skeleton";

/** Mirrors the thread's real shape — fixed header, transcript, pinned
 * composer — so the layout does not jump when the messages arrive. */
export default function Loading() {
  const bubbles = [
    { mine: false, w: "w-3/5" },
    { mine: true, w: "w-2/5" },
    { mine: false, w: "w-4/5" },
    { mine: true, w: "w-1/2" },
    { mine: false, w: "w-3/4" },
  ];

  return (
    <div className="lg:hidden ambient-glow h-dvh overflow-hidden flex flex-col pt-[env(safe-area-inset-top)] w-full max-w-[560px] mx-auto">
      <SkeletonGroup className="flex flex-col h-full" label="Loading conversation">
        <div className="flex items-center gap-3 px-4 py-3 bg-ground-2 border-b border-prada/80">
          <SkeletonBlock className="w-[38px] h-[38px] flex-none rounded-[13px]" />
          <SkeletonCircle className="w-10 h-10 flex-none" />
          <div className="flex-1 flex flex-col gap-1.5">
            <SkeletonLine className="h-3.5 w-32" />
            <SkeletonLine className="h-2.5 w-24" />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-4">
          {bubbles.map((b, i) => (
            <SkeletonBlock
              key={i}
              className={`h-12 ${b.w} ${b.mine ? "self-end" : "self-start"}`}
            />
          ))}
        </div>

        <div className="flex gap-2.5 items-center bg-card border-t border-line flex-none px-4 py-3.5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <SkeletonBlock className="flex-1 h-11" />
          <SkeletonBlock className="w-[46px] h-[46px] flex-none" />
        </div>
      </SkeletonGroup>
    </div>
  );
}
