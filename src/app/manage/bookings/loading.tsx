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
        <div className="flex gap-2 overflow-hidden">
          {["w-24", "w-20", "w-24", "w-28", "w-14"].map((w, i) => (
            <SkeletonBlock key={i} className={`h-9 rounded-full flex-none ${w}`} />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </SkeletonGroup>
    </div>
  );
}
