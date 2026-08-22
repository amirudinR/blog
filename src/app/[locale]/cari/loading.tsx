import { Skeleton } from "@/components/ui/skeleton";
import { PostGridSkeleton } from "@/components/blog/skeletons";

export default function SearchLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Skeleton className="h-9 w-48 max-w-full" />
      <Skeleton className="mt-4 mb-8 h-px w-16" />

      <div className="mb-10 flex max-w-xl gap-2">
        <Skeleton className="h-11 flex-1 rounded-md" />
        <Skeleton className="h-11 w-28 rounded-md" />
      </div>

      <PostGridSkeleton count={6} columns="sm2lg3" />
    </div>
  );
}
