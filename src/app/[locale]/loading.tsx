import { Skeleton } from "@/components/ui/skeleton";
import { PostGridSkeleton } from "@/components/blog/skeletons";

export default function HomeLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <section className="py-10 sm:py-14 lg:py-20">
        <Skeleton className="h-3 w-32" />
        <div className="mt-4 max-w-2xl space-y-3">
          <Skeleton className="h-12 w-full sm:h-14" />
          <Skeleton className="h-12 w-3/4 sm:h-14" />
        </div>
        <div className="mt-5 max-w-xl space-y-2.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Skeleton className="mt-8 h-px w-16" />
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mb-8 flex items-center gap-5">
          <Skeleton className="h-8 w-48 shrink-0" />
          <Skeleton className="h-px flex-1" />
        </div>
        <PostGridSkeleton count={3} columns="sm2md3" />
      </section>

      <section className="py-14 sm:py-16">
        <div className="mb-8 flex items-center justify-between gap-5">
          <Skeleton className="h-8 w-44 shrink-0" />
          <Skeleton className="h-5 w-20 shrink-0" />
        </div>
        <PostGridSkeleton count={6} columns="sm2lg3" />
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center shadow-sm">
          <Skeleton className="mx-auto h-6 w-52" />
          <Skeleton className="mx-auto mt-3 h-4 w-full max-w-xs" />
          <div className="mt-6 flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
      </section>
    </div>
  );
}
