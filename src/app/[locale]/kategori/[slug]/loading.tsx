import { PageTitleBarSkeleton, PostGridSkeleton } from "@/components/blog/skeletons";

export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <PageTitleBarSkeleton withOverline />
      <PostGridSkeleton count={6} columns="sm2lg3" />
    </div>
  );
}
