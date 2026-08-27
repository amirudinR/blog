import { notFound } from "next/navigation";
import { ArrowUp, Newspaper } from "lucide-react";

import { EmptyState } from "@/components/blog/empty-state";
import { BlogFilter } from "@/components/blog/blog-filter";
import { getProphetChapterList } from "@/lib/content/prophets";
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

  const [posts, categories, tags, prophetChapters] = await Promise.all([
    getAllPostsFiltered(locale, filters),
    getCategoriesWithCount(locale),
    getTagsWithCount(locale),
    getProphetChapterList(),
  ]);

  const activeCategoryName = filters.kategori
    ? categories.find((c) => c.slug === filters.kategori)?.name
    : null;
  const activeTagName = filters.tag
    ? tags.find((t) => t.slug === filters.tag)?.name
    : null;

  const prophetLabel = dict.toc.navProphets;

  const prophetPosts = prophetChapters.map((c) => ({
    slug: c.slug,
    title: c.title,
    categoryName: prophetLabel,
    tags: [] as string[],
    readingTime: c.readingTime,
    publishedAt: null,
    type: "prophet" as const,
  }));

  const serializedPosts = [
    ...prophetPosts,
    ...posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      categoryName: p.categoryName,
      tags: p.tags ?? [],
      readingTime: p.readingTime,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    })),
  ];

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
          {/* Active filter label */}
          {(activeCategoryName || activeTagName) && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{dict.blog.filtering}:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 font-medium text-primary">
                {activeCategoryName ?? activeTagName}
              </span>
            </div>
          )}

          {serializedPosts.length > 0 ? (
            <>
              <BlogFilter
                posts={serializedPosts}
                categories={categories}
                tags={tags}
                locale={locale}
                dictionary={{
                  allCategories: dict.blog.allCategories,
                  categories: dict.blog.categories,
                  tags: dict.blog.tags,
                  filtering: dict.blog.filtering,
                  clearFilter: dict.blog.clearFilter,
                  minutes: dict.toc.minutes,
                  searchPlaceholder: dict.blog.searchPlaceholder,
                }}
                initialKategori={sp.kategori}
                initialTag={sp.tag}
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
                  <a
                    key={cat.slug}
                    href={`#artikel`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {cat.name}
                    <span className="text-xs text-muted-foreground">
                      {cat.postCount}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {dict.blog.tags}
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag.name}
                    <span className="text-muted-foreground">{tag.postCount}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
