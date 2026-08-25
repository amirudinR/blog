import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUp, Newspaper, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { EmptyState } from "@/components/blog/empty-state";
import {
  buildTopicGroups,
  GroupedArticleList,
} from "@/components/blog/grouped-article-list";
import {
  getAllPostsFiltered,
  getCategoriesWithCount,
  getTagsWithCount,
} from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const revalidate = 60;

type BlogListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategori?: string; tag?: string }>;
};

export default async function BlogListPage({
  params,
  searchParams,
}: BlogListPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const sp = await searchParams;
  const filters = { kategori: sp.kategori, tag: sp.tag };

  const [posts, categories, tags] = await Promise.all([
    getAllPostsFiltered(locale, filters),
    getCategoriesWithCount(locale),
    getTagsWithCount(locale),
  ]);

  const activeCategoryName = filters.kategori
    ? categories.find((c) => c.slug === filters.kategori)?.name
    : null;
  const activeTagName = filters.tag
    ? tags.find((t) => t.slug === filters.tag)?.name
    : null;

  const groups = buildTopicGroups(posts, dict.toc.uncategorized, locale);

  return (
    <div id="top" className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
          {dict.blog.title}
        </h1>
        <span className="mt-4 flex h-px w-16 bg-primary/40" aria-hidden />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          {/* Mobile filter pills */}
          <div className="lg:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Link
                href={`/${locale}/blog`}
                className={cn(
                  "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                  !sp.kategori && !sp.tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/70 text-muted-foreground hover:bg-accent"
                )}
              >
                {dict.blog.allCategories}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/kategori/${cat.slug}`}
                  className={cn(
                    "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    sp.kategori === cat.slug
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/70 text-muted-foreground hover:bg-accent"
                  )}
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs opacity-70">{cat.postCount}</span>
                </Link>
              ))}
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/${locale}/tag/${tag.slug}`}
                  className={cn(
                    "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    sp.tag === tag.slug
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/70 text-muted-foreground hover:bg-accent"
                  )}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Active filter label */}
          {(activeCategoryName || activeTagName) && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{dict.blog.filtering}:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 font-medium text-primary">
                {activeCategoryName ?? activeTagName}
                <Link
                  href={`/${locale}/blog`}
                  className="ml-0.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full p-1 transition-colors hover:bg-primary/20"
                  aria-label={dict.blog.clearFilter}
                >
                  <X className="size-3" />
                </Link>
              </span>
            </div>
          )}

          {posts.length > 0 ? (
            <>
              {groups.length > 1 && (
                <nav
                  aria-label={dict.blog.categories}
                  className="mb-8 flex flex-wrap gap-2"
                >
                  {groups.map((group) => (
                    <a
                      key={group.anchor}
                      href={`#${group.anchor}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      {group.name}
                      <span className="tabular-nums text-muted-foreground/70">
                        {group.articleCount}
                      </span>
                    </a>
                  ))}
                </nav>
              )}

              <GroupedArticleList
                groups={groups}
                locale={locale}
                minutesLabel={dict.toc.minutes}
              />

              <div className="mt-12 border-t border-border/70 pt-6 text-center">
                <a
                  href="#top"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowUp className="size-4" aria-hidden />
                  {dict.toc.backToTop}
                </a>
              </div>
            </>
          ) : (
            <EmptyState icon={Newspaper} message={dict.blog.empty} />
          )}
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
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                      sp.kategori === cat.slug
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    )}
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
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                      sp.tag === tag.slug
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/70 bg-muted text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    )}
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
