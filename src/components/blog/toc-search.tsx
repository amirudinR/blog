"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import type { Locale } from "@/lib/i18n/config";
import { subgroupArticles, type TocSubgroup } from "@/lib/content/toc-subgroups";

type Chapter = {
  slug: string;
  number: number;
  title: string;
  readingTime: number;
  group: string;
};

type Article = {
  slug: string;
  title: string;
  readingTime: number;
  categoryName: string | null;
  publishedAt: string | null;
};

type TocSearchProps = {
  chapters: Chapter[];
  articles: Article[];
  locale: Locale;
  labels: {
    searchPlaceholder: string;
    prophets: string;
    articles: string;
    minutes: string;
    noResults: string;
  };
  groupLabels: Record<string, string>;
};

const GROUP_ORDER = ["quran", "islamic", "bridge", "other", "epilogue"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

function Leader() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden min-w-6 flex-1 -translate-y-1 border-b border-dotted border-border sm:block"
    />
  );
}

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "id" ? "id-ID" : "en-US",
      { day: "numeric", month: "short", year: "numeric" }
    );
  } catch {
    return "";
  }
}

export function TocSearch({
  chapters,
  articles,
  locale,
  labels: t,
  groupLabels,
}: TocSearchProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const q = search.toLowerCase().trim();

  const filteredChapters = useMemo(
    () =>
      q
        ? chapters.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              String(c.number).includes(q)
          )
        : chapters,
    [chapters, q]
  );

  const filteredArticles = useMemo(
    () =>
      q
        ? articles.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              (a.categoryName ?? "").toLowerCase().includes(q)
          )
        : articles,
    [articles, q]
  );

  const noResults = q && filteredChapters.length === 0 && filteredArticles.length === 0;

  const groupedArticles = useMemo(() => {
    const map = new Map<string, Article[]>();
    for (const a of filteredArticles) {
      const key = a.categoryName ?? t.articles;
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    return [...map.entries()].map(([categoryName, articles]) => ({
      categoryName,
      subgroups: subgroupArticles(articles, categoryName, locale),
    }));
  }, [filteredArticles, t.articles, locale]);

  return (
    <>
      {/* Search bar */}
      <div className="mb-10">
        <div className="relative mx-auto max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-border/70 bg-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {noResults && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t.noResults}
        </p>
      )}

      {/* Prophets section */}
      {filteredChapters.length > 0 && (
        <section id="kisah-nabi" className="scroll-mt-32">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
              I
            </span>
            <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              {t.prophets}
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
              {filteredChapters.length}
            </span>
          </div>

          <div className="space-y-8">
            {GROUP_ORDER.map((group, groupIndex) => {
              const items = filteredChapters.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    <span className="text-xs">{ROMAN[groupIndex]}.</span>
                    {groupLabels[group] ?? group}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
                      {items.length}
                    </span>
                  </h3>
                  <ol className="overflow-hidden rounded-xl border border-border/70 bg-card">
                    {items.map((chapter) => (
                      <li key={chapter.slug}>
                        <Link
                          href={`/${locale}/kisah-nabi/${chapter.slug}`}
                          className="group flex items-baseline gap-2.5 px-4 py-3 transition-colors hover:bg-accent/50"
                        >
                          <span
                            className="flex size-6 shrink-0 translate-y-0.5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                            aria-hidden
                          >
                            {chapter.number}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover:text-primary sm:text-[15px]">
                            {chapter.title}
                          </span>
                          <Leader />
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {chapter.readingTime} {t.minutes}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Articles section */}
      {filteredArticles.length > 0 && (
        <section id="artikel" className="scroll-mt-32">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
              II
            </span>
            <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              {t.articles}
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
              {filteredArticles.length}
            </span>
          </div>

          <div className="space-y-8">
            {groupedArticles.map(({ categoryName, subgroups }) => (
              <div key={categoryName}>
                <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {categoryName}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
                    {subgroups.reduce((sum, sg) => sum + sg.articles.length, 0)}
                  </span>
                </h3>
                <div className="space-y-6">
                  {subgroups.map((subgroup) => (
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
                              href={`/${locale}/blog/${post.slug}`}
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
                                {(post as Article).publishedAt
                                  ? formatDate((post as Article).publishedAt as string, locale)
                                  : ""}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
