import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/config";
import type { PostCardData } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils/blog";
import { ProtectedCover } from "@/components/blog/protected-cover";

type PostCardProps = {
  post: PostCardData;
  locale: Locale;
};

export function PostCard({ post, locale }: PostCardProps) {
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden">
        {post.coverImageUrl ? (
          <ProtectedCover
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <img
            src={`/api/og?title=${encodeURIComponent(post.title)}&locale=${locale}`}
            alt={post.title}
            draggable={false}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="space-y-2.5 p-5">
        <p className="text-sm text-muted-foreground">
          {post.publishedAt ? formatDate(post.publishedAt, locale) : ""}
          {" · "}
          {post.readingTime} min
        </p>
        <h3 className="line-clamp-2 text-[15px] sm:text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        {post.categoryName && (
          <Badge
            variant="secondary"
            className="rounded-full bg-primary/10 text-primary hover:bg-primary/10"
          >
            {post.categoryName}
          </Badge>
        )}
      </div>
    </Link>
  );
}
