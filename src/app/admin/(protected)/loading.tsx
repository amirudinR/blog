import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-[28px] border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] p-5"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)]">
        <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)] px-6 py-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-3 w-48 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-48 rounded-full" />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
