import { notFound } from "next/navigation";

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

  const [posts, categories, tags] = await Promise.all([
    getAllPostsFiltered(locale, {}),
    getCategoriesWithCount(locale),
    getTagsWithCount(locale),
  ]);

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
          <p className="text-muted-foreground">BlogFilterClient removed for testing — {posts.length} posts loaded</p>
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
                    href={`#${cat.slug}`}
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
