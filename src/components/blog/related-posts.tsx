import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/blog/empty-state";
import { PostCard } from "@/components/blog/post-card";
import type { Locale } from "@/lib/i18n/config";
import type { PostCardData } from "@/lib/db/queries";

type RelatedPostsProps = {
  posts: PostCardData[];
  locale: Locale;
  title: string;
  emptyMessage?: string;
};

export function RelatedPosts({
  posts,
  locale,
  title,
  emptyMessage,
}: RelatedPostsProps) {
  if (posts.length === 0) {
    return (
      <section className="mt-14">
        <h2 className="mb-6 font-heading text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <EmptyState icon={Newspaper} message={emptyMessage ?? title} />
      </section>
    );
  }

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center gap-5">
        <h2 className="shrink-0 font-heading text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
