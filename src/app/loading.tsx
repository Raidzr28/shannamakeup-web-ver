import {
  SkeletonGroup,
  SkeletonCard,
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/ui/Skeleton";

/** Fallback for the home route and any nested route without its own
 * loading file, so no navigation lands on a blank screen. */
export default function Loading() {
  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <SkeletonGroup className="px-5 pt-2 flex flex-col gap-4">
        <SkeletonHeading />
        <SkeletonBlock className="h-[46px] w-full" />
        <SkeletonBlock className="h-[150px] w-full rounded-[22px]" />
        <SkeletonBlock className="h-[76px] w-full" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard className="h-[190px]" />
          <SkeletonCard className="h-[190px]" />
          <SkeletonCard className="h-[190px]" />
          <SkeletonCard className="h-[190px]" />
        </div>
      </SkeletonGroup>
    </div>
  );
}
