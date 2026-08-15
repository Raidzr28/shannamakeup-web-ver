import {
  SkeletonGroup,
  SkeletonCard,
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <SkeletonGroup
        className="px-5 pt-2 flex flex-col gap-4"
        label="Loading knowledge base"
      >
        <SkeletonHeading />
        <SkeletonCard className="h-[110px]" />
        <SkeletonCard className="h-[210px]" />
        <SkeletonBlock className="h-[150px] w-full" />
        <SkeletonBlock className="h-[150px] w-full" />
      </SkeletonGroup>
    </div>
  );
}
