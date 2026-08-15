import { SkeletonGroup, SkeletonRow, SkeletonLine } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="ambient-glow min-h-dvh flex flex-col pt-[58px]">
      <SkeletonGroup className="px-5 pt-2 flex flex-col gap-4" label="Loading orders">
        <SkeletonLine className="h-3.5 w-32 mx-auto" />
        <div className="flex flex-col gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </SkeletonGroup>
    </div>
  );
}
