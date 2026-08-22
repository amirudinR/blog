import { notFound } from "next/navigation";
import Link from "next/link";
import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/blog/empty-state";
import { PostCard } from "@/components/blog/post-card";
import {
  getCategoriesWithCount,
  listPostsByCategory,
} from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [categories, result] = await Promise.all([
    getCategoriesWithCount(locale),
    listPostsByCategory(slug, locale, page),
  ]);

  const name = categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {dict.category.title}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold capitalize tracking-tight sm:text-4xl">
        {name}
      </h1>
      <span className="mt-4 mb-10 flex h-px w-16 bg-primary/40" aria-hidden />

      {result.posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Newspaper} message={dict.category.empty} />
      )}

      {result.totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-between">
          {result.page > 1 ? (
            <Link
              href={`/${locale}/kategori/${slug}?page=${result.page - 1}`}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              {dict.blog.prev}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            {dict.blog.page} {result.page} / {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Link
              href={`/${locale}/kategori/${slug}?page=${result.page + 1}`}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              {dict.blog.next}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
