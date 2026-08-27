"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, X, ChevronsUpDown, ChevronDown } from "lucide-react";

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

function DotLeader() {
  return (
    <span
      aria-hidden
      className="mx-2 hidden min-w-4 flex-1 border-b border-dotted border-border sm:block"
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

  const prophetGroups = useMemo(() => {
    return GROUP_ORDER.map((group, groupIndex) => {
      const items = chapters.filter((c) => c.group === group);
      const totalMinutes = items.reduce((sum, c) => sum + c.readingTime, 0);
      return { group, groupIndex, items, totalMinutes, label: groupLabels[group] ?? group };
    }).filter((g) => g.items.length > 0);
  }, [chapters, groupLabels]);

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

  useEffect(() => {
    if (!containerRef.current) return;
    const details = containerRef.current.querySelectorAll("details");
    details.forEach((d) => {
      d.open = !!q;
    });
  }, [q]);

  const toggleAll = useCallback(() => {
    if (!containerRef.current) return;
    const details = containerRef.current.querySelectorAll("details");
    const anyOpen = [...details].some((d) => d.open);
    details.forEach((d) => {
      d.open = !anyOpen;
    });
  }, []);

  const prophetMinutes = chapters.reduce((sum, c) => sum + c.readingTime, 0);
  const articleMinutes = articles.reduce((sum, a) => sum + a.readingTime, 0);

  return (
    <>
      {/* ── Sticky mini-nav ── */}
      <nav
        aria-label="Navigasi cepat"
        className="sticky top-14 z-30 -mx-4 mb-8 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6"
      >
        <div className="flex gap-1 overflow-x-auto py-2.5 scrollbar-none">
          {prophetGroups.map((g) => (
            <a
              key={g.group}
              href={`#prophet-${g.group}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <span className="font-semibold tabular-nums text-foreground/60">{ROMAN[g.groupIndex]}.</span>
              <span className="hidden sm:inline">{g.label}</span>
              <span className="sm:hidden">Nabi {ROMAN[g.groupIndex]}</span>
              <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium tabular-nums">
                {g.items.length}
              </span>
            </a>
          ))}
          <span className="mx-1 my-2 w-px shrink-0 bg-border/60" aria-hidden />
          {articleCategories.map((cat) => (
            <a
              key={cat.anchor}
              href={`#artikel-${cat.anchor}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {cat.name}
              <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium tabular-nums">
                {cat.items.length}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* ── Search bar ── */}
      <div className="mb-10">
        <div className="relative mx-auto max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg border border-border/60 bg-card py-2.5 pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {noResults && (
        <p className="rounded-lg border border-dashed border-border/60 bg-muted/30 py-10 text-center text-sm text-muted-foreground">
          {t.noResults}
        </p>
      )}

      <div ref={containerRef}>
        {/* ═══════════════════════════════════════════════════════════
            SECTION I — KISAH PARA NABI
        ═══════════════════════════════════════════════════════════ */}
        {filteredProphetGroups.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70">
                {t.prophets}
              </h2>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {filteredProphetGroups.reduce((s, g) => s + g.items.length, 0)} bab
                <span className="mx-1.5 text-border">·</span>
                ~{Math.round(prophetMinutes / 60)} jam
              </span>
            </div>

            <div className="space-y-2">
              {filteredProphetGroups.map((g) => (
                <details
                  key={g.group}
                  id={`prophet-${g.group}`}
                  className="group rounded-lg border border-border/60 scroll-mt-32"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 transition-colors hover:bg-accent/40 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-open:rotate-180" />
                    <span className="text-xs font-bold tabular-nums text-muted-foreground/50">
                      {ROMAN[g.groupIndex]}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-foreground sm:text-[15px]">
                      {g.label}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {g.items.length} bab
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground/60">
                      ~{Math.round(g.totalMinutes / 60)}j
                    </span>
                  </summary>
                  <ul className="border-t border-border/40">
                    {g.items.map((chapter) => (
                      <li key={chapter.slug}>
                        <Link
                          href={`/${locale}/kisah-nabi/${chapter.slug}`}
                          className="group/link flex items-baseline gap-3 px-4 py-2.5 pl-10 transition-colors hover:bg-accent/40"
                        >
                          <span className="text-[11px] font-medium tabular-nums text-muted-foreground/40">
                            {chapter.number}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground transition-colors group-hover/link:text-primary sm:text-sm">
                            {chapter.title}
                          </span>
                          <DotLeader />
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/50">
                            {chapter.readingTime} {t.minutes}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
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
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70">
                {t.articles}
              </h2>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {filteredArticleCategories.reduce((s, c) => s + c.items.length, 0)} artikel
                <span className="mx-1.5 text-border">·</span>
                ~{Math.round(articleMinutes / 60)} jam
              </span>
              <button
                type="button"
                onClick={toggleAll}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronsUpDown className="size-3.5" aria-hidden />
                Buka / Tutup semua
              </button>
            </div>

            <div className="space-y-2">
              {filteredArticleCategories.map((cat, catIndex) => {
                const subgroups = cat.subgroups;
                return (
                  <details
                    key={cat.anchor}
                    id={`artikel-${cat.anchor}`}
                    className="group rounded-lg border border-border/60 scroll-mt-32"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 transition-colors hover:bg-accent/40 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-open:rotate-180" />
                      <span className="text-xs font-bold tabular-nums text-muted-foreground/50">
                        {ROMAN[catIndex]}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-foreground sm:text-[15px]">
                        {cat.name}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {cat.items.length} artikel
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground/60">
                        ~{Math.round(cat.totalMinutes / 60)}j
                      </span>
                    </summary>

                    <div className="border-t border-border/40 px-4 pt-3 pb-2">
                      {subgroups.length > 1 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {subgroups.map((sg) => (
                            <a
                              key={sg.label ?? "_all"}
                              href={`#sg-${anchorSlug(sg.label ?? cat.anchor)}`}
                              className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              {sg.label ?? t.articles}
                              <span className="tabular-nums opacity-50">{sg.articles.length}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1">
                        {subgroups.map((subgroup) => (
                          <details
                            key={subgroup.label ?? "_all"}
                            id={`sg-${anchorSlug(subgroup.label ?? cat.anchor)}`}
                            className="rounded-md border border-border/40 scroll-mt-36"
                          >
                            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 transition-colors hover:bg-accent/30 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                              <span className="inline-block size-1 shrink-0 rounded-full bg-foreground/20" aria-hidden />
                              {subgroup.label ?? t.articles}
                              <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium normal-case tabular-nums tracking-normal">
                                {subgroup.articles.length}
                              </span>
                              <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-open:rotate-180" />
                            </summary>
                            <ul className="border-t border-border/30">
                              {subgroup.articles.map((post, index) => (
                                <li key={post.slug}>
                                  <Link
                                    href={`/${locale}/blog/${post.slug}`}
                                    className="group/link flex items-baseline gap-2.5 px-3 py-2 pl-7 transition-colors hover:bg-accent/30"
                                  >
                                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground/30">
                                      {index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground transition-colors group-hover/link:text-primary">
                                      {post.title}
                                    </span>
                                    <DotLeader />
                                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/40">
                                      {(post as Article).publishedAt
                                        ? formatDate((post as Article).publishedAt as string, locale)
                                        : ""}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
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
