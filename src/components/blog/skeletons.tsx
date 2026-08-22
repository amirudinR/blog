import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2.5 p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="size-6 rounded-full" />
      </div>
    </div>
  );
}

type PostGridSkeletonProps = {
  count?: number;
  columns?: "sm2lg3" | "sm2md3" | "sm2";
  className?: string;
};

const columnClass = {
  sm2lg3: "sm:grid-cols-2 lg:grid-cols-3",
  sm2md3: "sm:grid-cols-2 md:grid-cols-3",
  sm2: "sm:grid-cols-2",
} as const;

export function PostGridSkeleton({
  count = 6,
  columns = "sm2lg3",
  className,
}: PostGridSkeletonProps) {
  return (
    <div className={cn("grid gap-6", columnClass[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarChipsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          {[16, 20, 14, 18, 12].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-4 w-12" />
        <div className="flex flex-wrap gap-2">
          {[12, 16, 10, 20, 14, 16].map((w, i) => (
            <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageTitleBarSkeleton({ withOverline }: { withOverline?: boolean }) {
  return (
    <div className="mb-10">
      {withOverline ? <Skeleton className="h-3 w-28" /> : null}
      <Skeleton className={cn("h-9 w-64 max-w-full", withOverline && "mt-2")} />
      <Skeleton className="mt-4 mb-8 h-px w-16" />
    </div>
  );
}

export function ProseSkeleton() {
  const widths = ["100%", "92%", "97%", "85%", "100%", "78%", "95%", "88%"];
  return (
    <div className="space-y-4">
      {widths.map((w, i) => (
        <Skeleton key={i} className="h-4" style={{ width: w }} />
      ))}
    </div>
  );
}
