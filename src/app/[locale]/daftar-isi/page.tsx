import type { Metadata } from "next";
import { ArrowUp, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getProphetChapterList,
  type ProphetGroup,
} from "@/lib/content/prophets";
import { getAllPostsForToc } from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/utils/blog";

type TocPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: TocPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.toc.title,
    description: dict.toc.subtitle,
    alternates: {
      languages: {
        id: `/id/daftar-isi`,
        en: `/en/daftar-isi`,
      },
    },
  };
}

const GROUP_ORDER: ProphetGroup[] = [
  "quran",
  "islamic",
  "bridge",
  "other",
  "epilogue",
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

function Leader() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden min-w-6 flex-1 -translate-y-1 border-b border-dotted border-border sm:block"
    />
  );
}

export default async function TocPage({ params }: TocPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const chapters = getProphetChapterList();
  const articles = await getAllPostsForToc(locale);

  const groupLabels: Record<ProphetGroup, string> = {
    quran: dict.prophets.groupQuran,
    islamic: dict.prophets.groupIslamic,
    bridge: dict.prophets.groupBridge,
    other: dict.prophets.groupOther,
    epilogue: dict.prophets.groupEpilogue,
  };

  const totalProphetMinutes = chapters.reduce(
    (sum, c) => sum + c.readingTime,
    0
  );
  const totalArticleMinutes = articles.reduce(
    (sum, a) => sum + a.readingTime,
    0
  );
  const totalHours = Math.round(
    (totalProphetMinutes + totalArticleMinutes) / 60
  );

  const groupedArticles = new Map<string, typeof articles>();
  for (const article of articles) {
    const key = article.categoryName ?? dict.toc.uncategorized;
    const list = groupedArticles.get(key);
    if (list) {
      list.push(article);
    } else {
      groupedArticles.set(key, [article]);
    }
  }

  return (
    <div id="top" className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12 sm:px-6">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {dict.toc.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {dict.toc.subtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <BookOpen className="size-3.5" aria-hidden />
            {chapters.length} {dict.toc.chapters}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <FileText className="size-3.5" aria-hidden />
            {articles.length} {dict.toc.articles}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            ~{totalHours} {dict.toc.hours} · {dict.toc.totalReading}
          </span>
        </div>
      </header>

      <nav
        aria-label={dict.toc.title}
        className="sticky top-16 z-30 -mx-4 mb-10 border-y border-border/70 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <a
            href="#kisah-nabi"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.toc.navProphets}
            <span className="ml-1.5 text-xs text-muted-foreground/70">
              ({chapters.length})
            </span>
          </a>
          <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
          <a
            href="#artikel"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.toc.navArticles}
            <span className="ml-1.5 text-xs text-muted-foreground/70">
              ({articles.length})
            </span>
          </a>
        </div>
      </nav>

      <section id="kisah-nabi" className="scroll-mt-32">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
            I
          </span>
          <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            {dict.toc.sectionOne}
          </h2>
        </div>

        <div className="space-y-8">
          {GROUP_ORDER.map((group, groupIndex) => {
            const items = chapters.filter((c) => c.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  <span className="text-xs">{ROMAN[groupIndex]}.</span>
                  {groupLabels[group]}
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
                        <span className="min-w-0 truncate text-sm font-medium transition-colors group-hover:text-primary sm:text-[15px]">
                          {chapter.title}
                        </span>
                        <Leader />
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {chapter.readingTime} {dict.toc.minutes}
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

      <section id="artikel" className="mt-14 scroll-mt-32">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
            II
          </span>
          <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            {dict.toc.sectionTwo}
          </h2>
        </div>

        {articles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {dict.blog.empty}
          </p>
        ) : (
          <div className="space-y-8">
            {[...groupedArticles.entries()].map(([categoryName, posts]) => (
              <div key={categoryName}>
                <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {categoryName}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
                    {posts.length}
                  </span>
                </h3>
                <ol className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="group flex items-baseline gap-2.5 px-4 py-3 transition-colors hover:bg-accent/50"
                      >
                        <span className="min-w-0 truncate text-sm font-medium transition-colors group-hover:text-primary sm:text-[15px]">
                          {post.title}
                        </span>
                        <Leader />
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {post.publishedAt ? formatDate(post.publishedAt, locale) : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            <div className="text-center">
              <Link
                href={`/${locale}/blog`}
                className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {dict.toc.viewAll} →
              </Link>
            </div>
          </div>
        )}
      </section>

      <footer className="mt-16 border-t border-border/70 pt-6 text-center">
        <a
          href="#top"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowUp className="size-4" aria-hidden />
          {dict.toc.backToTop}
        </a>
      </footer>
    </div>
  );
}
