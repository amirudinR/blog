import { notFound } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { EmptyState } from "@/components/blog/empty-state";
import { PostCard } from "@/components/blog/post-card";
import { Newspaper } from "lucide-react";
import {
  getCategoriesWithCount,
  getLatestPosts,
  getTagsWithCount,
  listPostsByCategory,
  listPostsByTag,
} from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type BlogListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; kategori?: string; tag?: string }>;
};

function buildPageHref(
  filters: { kategori?: string; tag?: string },
  page: number
): string {
  const sp = new URLSearchParams();
  if (filters.kategori) sp.set("kategori", filters.kategori);
  if (filters.tag) sp.set("tag", filters.tag);
  sp.set("page", String(page));
  return `?${sp.toString()}`;
}

export default async function BlogListPage({
  params,
  searchParams,
}: BlogListPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const filters = { kategori: sp.kategori, tag: sp.tag };

  const [result, categories, tags] = await Promise.all([
    sp.kategori
      ? listPostsByCategory(sp.kategori, locale, page)
      : sp.tag
        ? listPostsByTag(sp.tag, locale, page)
        : getLatestPosts(locale, page),
    getCategoriesWithCount(locale),
    getTagsWithCount(locale),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {dict.blog.title}
        </h1>
        <span className="mt-4 flex h-px w-16 bg-primary/40" aria-hidden />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <div className="-mx-4 mb-6 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border border-border/70 bg-card px-3 py-1 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {dict.blog.allCategories}
            </Link>
            {categories.map((cat) => (
              <Link
                key={`cat-${cat.slug}`}
                href={`/${locale}/kategori/${cat.slug}`}
                className="inline-flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border border-border/70 bg-card px-3 py-1 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {cat.name}
                <span className="text-xs text-muted-foreground">
                  {cat.postCount}
                </span>
              </Link>
            ))}
            {tags.map((tag) => (
              <Link
                key={`tag-${tag.slug}`}
                href={`/${locale}/tag/${tag.slug}`}
                className="inline-flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border border-border/70 bg-muted px-3 py-1 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {tag.name}
                <span className="text-muted-foreground">{tag.postCount}</span>
              </Link>
            ))}
          </div>

          <div className="lg:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Link
                href={`/${locale}/blog`}
                className={cn(
                  "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                  !sp.kategori && !sp.tag
                    ? "bg-[var(--md-primary)] text-[var(--md-on-primary)] border-[var(--md-primary)]"
                    : "border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:bg-[color-mix(in_srgb,var(--md-on-surface)_8%,transparent)]"
                )}
              >
                Semua
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/kategori/${cat.slug}`}
                  className={cn(
                    "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    sp.kategori === cat.slug
                      ? "bg-[var(--md-primary)] text-[var(--md-on-primary)] border-[var(--md-primary)]"
                      : "border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:bg-[color-mix(in_srgb,var(--md-on-surface)_8%,transparent)]"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/${locale}/tag/${tag.slug}`}
                  className={cn(
                    "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    sp.tag === tag.slug
                      ? "bg-[var(--md-primary)] text-[var(--md-on-primary)] border-[var(--md-primary)]"
                      : "border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:bg-[color-mix(in_srgb,var(--md-on-surface)_8%,transparent)]"
                  )}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>

          {result.posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {result.posts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Newspaper} message={dict.blog.empty} />
          )}

          {result.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between">
              {result.page > 1 ? (
                <Link
                  href={buildPageHref(filters, result.page - 1)}
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
                  href={buildPageHref(filters, result.page + 1)}
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

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {dict.blog.categories}
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/${locale}/kategori/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {cat.name}
                    <span className="text-xs text-muted-foreground">
                      {cat.postCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {dict.blog.tags}
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/${locale}/tag/${tag.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {tag.name}
                    <span className="text-muted-foreground">{tag.postCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
