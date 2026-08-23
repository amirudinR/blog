import { Skeleton } from "@/components/ui/skeleton";
import { ProseSkeleton } from "@/components/blog/skeletons";

export default function ArticleLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Skeleton className="mb-6 h-4 w-28" />

      <article>
        <header className="mb-8">
          <Skeleton className="h-3 w-24" />
          <div className="mt-3 max-w-3xl space-y-3">
            <Skeleton className="h-8 w-full sm:h-10" />
            <Skeleton className="h-8 w-2/3 sm:h-10" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </header>

        <Skeleton className="mb-10 aspect-video w-full rounded-xl" />

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0 max-w-[68ch] space-y-8">
            <ProseSkeleton />
            <ProseSkeleton />
          </div>
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-3 rounded-xl border border-border/70 bg-card p-5">
              <Skeleton className="h-4 w-24" />
              {["85%", "70%", "90%", "60%", "75%"].map((w, i) => (
                <Skeleton key={i} className="h-3.5" style={{ width: w }} />
              ))}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
