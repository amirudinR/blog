import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper, BookOpen, Clock, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/blog/empty-state";
import { Pagination } from "@/components/blog/pagination";
import { PostCard } from "@/components/blog/post-card";
import { CATEGORY_META } from "@/lib/category-meta";
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
  const isId = locale === "id";

  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [categories, result] = await Promise.all([
    getCategoriesWithCount(locale),
    listPostsByCategory(slug, locale, page),
  ]);

  const meta = CATEGORY_META[slug];
  const name =
    categories.find((c) => c.slug === slug)?.name ??
    meta?.[isId ? "taglineId" : "taglineEn"] ??
    slug;
  const postCount =
    categories.find((c) => c.slug === slug)?.postCount ?? result.total;
  const estMinutes = postCount * 8;

  const featured = page === 1 ? result.posts.slice(0, 2) : [];
  const rest = page === 1 ? result.posts.slice(2) : result.posts;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${
          meta?.gradient ?? "from-primary via-primary/80 to-muted"
        } p-8 text-white sm:p-12`}
      >
        <div
          aria-hidden
          className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-14 right-24 size-40 rounded-full bg-black/10 blur-xl"
        />
        <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <Sparkles className="size-3.5" />
              {dict.category.title}
            </p>
            <h1 className="mt-2 max-w-xl font-heading text-3xl font-bold capitalize leading-tight tracking-tight sm:text-4xl">
              {name}
            </h1>
            {meta && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                {isId ? meta.descId : meta.descEn}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <BookOpen className="size-3.5" />
                {postCount} {isId ? "artikel" : "articles"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <Clock className="size-3.5" />
                ±{Math.max(1, Math.round(estMinutes / 60))}{" "}
                {isId ? "jam baca" : "hours of reading"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                🎯 {isId ? "pemula → mahir" : "beginner → pro"}
              </span>
            </div>
          </div>
          {meta && (
            <Image
              src={meta.svg}
              alt=""
              width={280}
              height={175}
              className="hidden rounded-xl shadow-lg sm:block"
            />
          )}
        </div>
      </section>

      {/* Sub-category pills */}
      {meta && meta.subcategories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {meta.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/${locale}/tag/${sub.slug}`}
              className="inline-flex items-center rounded-full border border-border/70 bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {isId ? sub.labelId : sub.labelEn}
            </Link>
          ))}
        </div>
      )}

      {/* Featured */}
      {featured.length === 2 && (
        <>
          <h2 className="mb-4 mt-10 flex items-center gap-2 font-heading text-xl font-bold">
            <Sparkles className="size-5 text-primary" />
            {isId ? "Mulai dari sini" : "Start here"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div
          className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
            featured.length === 2 ? "mt-8" : "mt-10"
          }`}
        >
          {rest.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}

      {result.posts.length === 0 && (
        <EmptyState icon={Newspaper} message={dict.category.empty} />
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        baseHref={`/${locale}/kategori/${slug}`}
      />
    </div>
  );
}
