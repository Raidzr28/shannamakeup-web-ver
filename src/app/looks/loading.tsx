import {
  SkeletonGroup,
  SkeletonCard,
  SkeletonCircle,
  SkeletonHeading,
} from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <SkeletonGroup className="px-5 pt-2 flex flex-col gap-4" label="Loading looks">
        <SkeletonHeading />
        {/* Story rail */}
        <div className="flex gap-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCircle key={i} className="w-16 h-16 flex-none" />
          ))}
        </div>
        <SkeletonCard className="h-[76px]" />
        <SkeletonCard className="h-[320px]" />
        <SkeletonCard className="h-[320px]" />
      </SkeletonGroup>
    </div>
  );
}
