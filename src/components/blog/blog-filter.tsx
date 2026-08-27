"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import {
  subgroupArticles,
  type TocArticleLike,
  type TocSubgroup,
} from "@/lib/content/toc-subgroups";

type Post = {
  slug: string;
  title: string;
  categoryName: string | null;
  tags: string[];
  readingTime: number;
  publishedAt: string | null;
  type?: "prophet" | "blog";
};

function postHref(locale: Locale, post: TocArticleLike): string {
  if (post.type === "prophet") return `/${locale}/kisah-nabi/${post.slug}`;
  return `/${locale}/blog/${post.slug}`;
}

type Category = { slug: string; name: string; postCount: number };
type Tag = { slug: string; name: string; postCount: number };

type BlogFilterProps = {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  locale: Locale;
  dictionary: {
    allCategories: string;
    categories: string;
    tags: string;
    filtering: string;
    clearFilter: string;
    minutes: string;
    searchPlaceholder: string;
  };
  initialKategori?: string;
  initialTag?: string;
};

function anchorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_MERGES: Record<string, string> = {
  "pengembangan diri": "motivasi",
  "self improvement": "motivation",
};

function buildGroups(
  filtered: Post[],
  uncategorizedLabel: string,
  locale: Locale
) {
  const grouped = new Map<string, Post[]>();
  for (const p of filtered) {
    const rawKey = p.categoryName ?? uncategorizedLabel;
    const key = CATEGORY_MERGES[rawKey.toLowerCase()] ?? rawKey;
    const list = grouped.get(key);
    if (list) list.push(p);
    else grouped.set(key, [p]);
  }

  const usedAnchors = new Map<string, number>();
  return [...grouped.entries()].map(([name, items]) => {
    const base = anchorSlug(name) || "topik";
    const seen = usedAnchors.get(base) ?? 0;
    usedAnchors.set(base, seen + 1);
    const anchor = seen === 0 ? base : `${base}-${seen + 1}`;
    const subgroups = subgroupArticles(items, name, locale);
    const articleCount = subgroups.reduce(
      (sum, sg) => sum + sg.articles.length,
      0
    );
    return { name, anchor, articleCount, subgroups };
  });
}

function Leader() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden min-w-6 flex-1 -translate-y-1 border-b border-dotted border-border sm:block"
    />
  );
}

export function BlogFilter({
  posts,
  categories,
  tags,
  locale,
  dictionary: dict,
  initialKategori,
  initialTag,
}: BlogFilterProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matchesSearch = useCallback(
    (title: string, slug: string) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        title.toLowerCase().includes(q) || slug.toLowerCase().includes(q)
      );
    },
    [search]
  );

  const filtered = posts.filter((p) => {
    if (!matchesSearch(p.title, p.slug)) return false;
    if (initialKategori && p.categoryName?.toLowerCase() !== initialKategori)
      return false;
    if (initialTag && !p.tags.includes(initialTag)) return false;
    return true;
  });

  const groups = buildGroups(filtered, dict.allCategories, locale);

  return (
    <>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className="w-full rounded-xl border border-border/70 bg-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={dict.clearFilter}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter pills */}
      <div className="lg:hidden mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href={`/${locale}/blog`}
            className={cn(
              "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
              !initialKategori && !initialTag
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/70 text-muted-foreground hover:bg-accent"
            )}
          >
            {dict.allCategories}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${locale}/kategori/${cat.slug}`}
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                initialKategori === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/70 text-muted-foreground hover:bg-accent"
              )}
            >
              {cat.name}
              <span className="ml-1.5 text-xs opacity-70">
                {cat.postCount}
              </span>
            </Link>
          ))}
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/${locale}/tag/${tag.slug}`}
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                initialTag === tag.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/70 text-muted-foreground hover:bg-accent"
              )}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      {groups.length > 1 && (
        <nav
          aria-label={dict.categories}
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

      <div className="space-y-10">
        {groups.map((group) => (
          <section
            key={group.anchor}
            id={group.anchor}
            className="scroll-mt-28"
          >
            <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {group.name}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
                {group.articleCount}
              </span>
            </h3>
            <div className="space-y-4">
              {group.subgroups.map((subgroup: TocSubgroup) => (
                <div key={subgroup.label ?? "_all"}>
                  {subgroup.label ? (
                    <h4 className="mb-2 flex items-center gap-2 pl-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      <span
                        className="inline-block size-1.5 rounded-full bg-primary/60"
                        aria-hidden
                      />
                      {subgroup.label}
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                        {subgroup.articles.length}
                      </span>
                    </h4>
                  ) : null}
                  <ol className="overflow-hidden rounded-xl border border-border/70 bg-card">
                    {subgroup.articles.map((post, index) => (
                      <li key={post.slug}>
                        <Link
                          href={postHref(locale, post)}
                          className="group flex items-baseline gap-2.5 px-4 py-3 transition-colors hover:bg-accent/50"
                        >
                          <span
                            className="flex size-6 shrink-0 translate-y-0.5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                            aria-hidden
                          >
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover:text-primary sm:text-[15px]">
                            {post.title}
                          </span>
                          <Leader />
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {post.readingTime} {dict.minutes}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {search
              ? `Tidak ada artikel yang cocok dengan "${search}"`
              : "Belum ada artikel."}
          </p>
        )}
      </div>
    </>
  );
}
