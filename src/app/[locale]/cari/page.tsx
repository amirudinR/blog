import { Search, SearchX } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/blog/empty-state";
import { PostCard } from "@/components/blog/post-card";
import { searchPosts } from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Number(sp.page) || 1;
  const result = q ? await searchPosts(locale, q, page) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
        {dict.search.title}
      </h1>
      <span className="mt-4 mb-8 flex h-px w-16 bg-primary/40" aria-hidden />

      <form
        method="GET"
        action={`/${locale}/cari`}
        className="mb-10 flex flex-col sm:flex-row max-w-xl gap-2"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder={dict.search.placeholder}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          aria-label={dict.nav.search}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto w-full"
        >
          <Search className="size-4" aria-hidden />
          {dict.nav.search}
        </button>
      </form>

      {result ? (
        <>
          <div className="mb-6">
            <p className="text-lg font-medium">
              {dict.search.resultsFor}: &ldquo;{q}&rdquo;
            </p>
            <p className="text-sm text-muted-foreground">
              {dict.search.resultsCount.replace(
                "{count}",
                String(result.total)
              )}
            </p>
          </div>

          {result.posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.posts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <EmptyState icon={SearchX} message={dict.blog.noResults} />
          )}

          {result.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between">
              {result.page > 1 ? (
                <Link
                  href={`/${locale}/cari?q=${encodeURIComponent(q)}&page=${result.page - 1}`}
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
                  href={`/${locale}/cari?q=${encodeURIComponent(q)}&page=${result.page + 1}`}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {dict.blog.next}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
