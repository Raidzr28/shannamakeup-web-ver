import {
  SkeletonGroup,
  SkeletonCard,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonLine,
} from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <SkeletonGroup className="px-5 pt-2 flex flex-col gap-4" label="Loading reservation">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-[38px] h-[38px] flex-none rounded-[13px]" />
          <SkeletonLine className="h-3.5 w-32 mx-auto" />
        </div>

        <div className="glass-card p-[18px] flex gap-3.5 items-start">
          <SkeletonCircle className="w-12 h-12 flex-none" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonLine className="h-4 w-2/5" />
            <SkeletonLine className="h-2.5 w-3/5" />
            <SkeletonLine className="h-2.5 w-1/2" />
          </div>
        </div>

        {/* At-a-glance grid */}
        <div className="glass-card p-[18px] grid grid-cols-2 gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <SkeletonLine className="h-2.5 w-14" />
              <SkeletonLine className="h-3.5 w-24" />
            </div>
          ))}
        </div>

        <SkeletonCard className="h-[180px]" />
        <SkeletonBlock className="h-[52px] w-full" />
      </SkeletonGroup>
    </div>
  );
}
