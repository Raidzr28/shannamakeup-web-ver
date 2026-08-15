import {
  SkeletonGroup,
  SkeletonRow,
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <SkeletonGroup className="px-5 pt-2 flex flex-col gap-4">
        <SkeletonHeading />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-28 rounded-full flex-none" />
          <SkeletonBlock className="h-9 w-24 rounded-full flex-none" />
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonRow round />
          <SkeletonRow round />
          <SkeletonRow round />
        </div>
      </SkeletonGroup>
    </div>
  );
}
