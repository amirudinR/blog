import { PageTitleBarSkeleton, PostGridSkeleton, SidebarChipsSkeleton } from "@/components/blog/skeletons";

export default function BlogLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <PageTitleBarSkeleton />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <PostGridSkeleton count={4} columns="sm2" />

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <SidebarChipsSkeleton />
          </div>
        </aside>
      </div>
    </div>
  );
}
