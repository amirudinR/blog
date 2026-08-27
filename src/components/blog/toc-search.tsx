"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, X, ChevronsUpDown, ChevronRight } from "lucide-react";

import type { Locale } from "@/lib/i18n/config";
import { subgroupArticles } from "@/lib/content/toc-subgroups";

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
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const CATEGORY_MERGES: Record<string, string> = {
  "pengembangan diri": "motivasi",
  "self improvement": "motivation",
};

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

function anchorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
  const containerRef = useRef<HTMLDivElement>(null);
  const q = search.toLowerCase().trim();

  // ── Prophet groups (Level 1) ──
  const prophetGroups = useMemo(() => {
    return GROUP_ORDER.map((group, groupIndex) => {
      const items = chapters.filter((c) => c.group === group);
      const totalMinutes = items.reduce((sum, c) => sum + c.readingTime, 0);
      return { group, groupIndex, items, totalMinutes, label: groupLabels[group] ?? group };
    }).filter((g) => g.items.length > 0);
  }, [chapters, groupLabels]);

  // ── Article categories (Level 1) ──
  const articleCategories = useMemo(() => {
    const grouped = new Map<string, Article[]>();
    for (const a of articles) {
      const rawKey = a.categoryName ?? t.articles;
      const key = CATEGORY_MERGES[rawKey.toLowerCase()] ?? rawKey;
      const list = grouped.get(key);
      if (list) list.push(a);
      else grouped.set(key, [a]);
    }

    const usedAnchors = new Map<string, number>();
    return [...grouped.entries()].map(([name, items]) => {
      const base = anchorSlug(name) || "topik";
      const seen = usedAnchors.get(base) ?? 0;
      usedAnchors.set(base, seen + 1);
      const anchor = seen === 0 ? base : `${base}-${seen + 1}`;
      const subgroups = subgroupArticles(items, name, locale);
      const totalMinutes = items.reduce((sum, a) => sum + a.readingTime, 0);
      return { name, anchor, items, subgroups, totalMinutes };
    });
  }, [articles, t.articles, locale]);

  // ── Filtered data for search ──
  const filteredProphetGroups = useMemo(() => {
    if (!q) return prophetGroups;
    return prophetGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            String(c.number).includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [prophetGroups, q]);

  const filteredArticleCategories = useMemo(() => {
    if (!q) return articleCategories;
    return articleCategories
      .map((cat) => {
        const filteredItems = cat.items.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.categoryName?.toLowerCase().includes(q) ||
            a.slug.toLowerCase().includes(q)
        );
        const subgroups = subgroupArticles(filteredItems, cat.name, locale);
        return { ...cat, items: filteredItems, subgroups };
      })
      .filter((cat) => cat.items.length > 0);
  }, [articleCategories, q, locale]);

  const noResults = q && filteredProphetGroups.length === 0 && filteredArticleCategories.length === 0;

  // ── Auto-expand all details when searching ──
  useEffect(() => {
    if (!containerRef.current) return;
    const details = containerRef.current.querySelectorAll("details");
    details.forEach((d) => {
      d.open = !!q;
    });
  }, [q]);

  // ── Toggle all ──
  const toggleAll = useCallback(() => {
    if (!containerRef.current) return;
    const details = containerRef.current.querySelectorAll("details");
    const anyOpen = [...details].some((d) => d.open);
    details.forEach((d) => {
      d.open = !anyOpen;
    });
  }, []);

  // ── Total minutes for stats ──
  const prophetMinutes = chapters.reduce((sum, c) => sum + c.readingTime, 0);
  const articleMinutes = articles.reduce((sum, a) => sum + a.readingTime, 0);

  return (
    <>
      {/* Sticky mini-nav */}
      <nav
        aria-label="Navigasi cepat"
        className="sticky top-14 z-30 -mx-4 mb-8 overflow-x-auto border-b border-border/70 bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6"
      >
        <div className="flex gap-1.5 whitespace-nowrap">
          {prophetGroups.map((g) => (
            <a
              key={g.group}
              href={`#prophet-${g.group}`}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span className="hidden sm:inline">{g.label}</span>
              <span className="sm:hidden">Nabi {ROMAN[g.groupIndex]}</span>
              <span className="tabular-nums text-muted-foreground/70">{g.items.length}</span>
            </a>
          ))}
          <span className="mx-1 my-1 w-px shrink-0 bg-border/70" aria-hidden />
          {articleCategories.map((cat) => (
            <a
              key={cat.anchor}
              href={`#artikel-${cat.anchor}`}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {cat.name}
              <span className="tabular-nums text-muted-foreground/70">{cat.items.length}</span>
            </a>
          ))}
        </div>
      </nav>

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

      <div ref={containerRef}>
        {/* ═══════════════════════════════════════════════════════════
            SECTION I — KISAH PARA NABI
        ═══════════════════════════════════════════════════════════ */}
        {filteredProphetGroups.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
                I
              </span>
              <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {t.prophets}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
                {filteredProphetGroups.reduce((s, g) => s + g.items.length, 0)} {t.minutes.replace(" mnt", "")}
              </span>
              <span className="text-xs text-muted-foreground">
                ~{Math.round(prophetMinutes / 60)} jam
              </span>
            </div>

            <div className="space-y-3">
              {filteredProphetGroups.map((g) => (
                <details
                  key={g.group}
                  id={`prophet-${g.group}`}
                  className="group rounded-xl border border-border/70 bg-card open:shadow-sm scroll-mt-32"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                    <span className="text-xs font-bold tracking-wider text-primary/80">
                      {ROMAN[g.groupIndex]}.
                    </span>
                    <span className="flex-1 font-heading text-sm font-semibold tracking-tight sm:text-base">
                      {g.label}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums normal-case tracking-normal">
                      {g.items.length} {t.minutes.replace(" mnt", "")}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      ~{Math.round(g.totalMinutes / 60)}j
                    </span>
                  </summary>
                  <ol className="border-t border-border/70">
                    {g.items.map((chapter) => (
                      <li key={chapter.slug}>
                        <Link
                          href={`/${locale}/kisah-nabi/${chapter.slug}`}
                          className="group/link flex items-baseline gap-2.5 px-4 py-3 pl-10 transition-colors hover:bg-accent/50"
                        >
                          <span
                            className="flex size-6 shrink-0 translate-y-0.5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary transition-colors group-hover/link:bg-primary group-hover/link:text-primary-foreground"
                            aria-hidden
                          >
                            {chapter.number}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover/link:text-primary sm:text-[15px]">
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
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION II — ARTIKEL BLOG
        ═══════════════════════════════════════════════════════════ */}
        {filteredArticleCategories.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
                II
              </span>
              <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {t.articles}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
                {filteredArticleCategories.reduce((s, c) => s + c.items.length, 0)} {t.minutes.replace(" mnt", "")}
              </span>
              <span className="text-xs text-muted-foreground">
                ~{Math.round(articleMinutes / 60)} jam
              </span>
              <button
                type="button"
                onClick={toggleAll}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <ChevronsUpDown className="size-3.5" aria-hidden />
                Buka / Tutup semua
              </button>
            </div>

            <div className="space-y-3">
              {filteredArticleCategories.map((cat, catIndex) => {
                const subgroups = cat.subgroups;
                return (
                  <details
                    key={cat.anchor}
                    id={`artikel-${cat.anchor}`}
                    className="group rounded-xl border border-border/70 bg-card open:shadow-sm scroll-mt-32"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                      <span className="text-xs font-bold tracking-wider text-primary/80">
                        {ROMAN[catIndex]}.
                      </span>
                      <span className="flex-1 font-heading text-sm font-semibold tracking-tight sm:text-base">
                        {cat.name}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums normal-case tracking-normal">
                        {cat.items.length} artikel
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        ~{Math.round(cat.totalMinutes / 60)}j
                      </span>
                    </summary>

                    <div className="border-t border-border/70 px-4 pt-3 pb-2">
                      {/* Subgroup mini-nav pills inside category */}
                      {subgroups.length > 1 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {subgroups.map((sg) => (
                            <a
                              key={sg.label ?? "_all"}
                              href={`#sg-${anchorSlug(sg.label ?? cat.anchor)}`}
                              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              {sg.label ?? t.articles}
                              <span className="tabular-nums opacity-60">{sg.articles.length}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Subgroups as nested collapsibles */}
                      <div className="space-y-2">
                        {subgroups.map((subgroup) => (
                          <details
                            key={subgroup.label ?? "_all"}
                            id={`sg-${anchorSlug(subgroup.label ?? cat.anchor)}`}
                            className="rounded-lg border border-border/50 bg-muted/20 open:bg-card open:shadow-sm scroll-mt-36"
                          >
                            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-colors hover:bg-accent/40 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                              <span className="inline-block size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                              {subgroup.label ?? t.articles}
                              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal tabular-nums">
                                {subgroup.articles.length}
                              </span>
                              <svg
                                className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </summary>
                            <ol className="border-t border-border/50">
                              {subgroup.articles.map((post, index) => (
                                <li key={post.slug}>
                                  <Link
                                    href={`/${locale}/blog/${post.slug}`}
                                    className="group/link flex items-baseline gap-2.5 px-3 py-2.5 transition-colors hover:bg-accent/50"
                                  >
                                    <span
                                      className="flex size-5 shrink-0 translate-y-0.5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold tabular-nums text-primary transition-colors group-hover/link:bg-primary group-hover/link:text-primary-foreground"
                                      aria-hidden
                                    >
                                      {index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover/link:text-primary">
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
                          </details>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
