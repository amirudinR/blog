import type { Metadata } from "next";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TocSearch } from "@/components/blog/toc-search";
import {
  getProphetChapterList,
  type ProphetGroup,
} from "@/lib/content/prophets";
import { getAllPostsForToc } from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

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
            {chapters.length} {dict.toc.chapters}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {articles.length} {dict.toc.articles}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            ~{totalHours} {dict.toc.hours} · {dict.toc.totalReading}
          </span>
        </div>
      </header>

      <TocSearch
        chapters={chapters.map((c) => ({
          slug: c.slug,
          number: c.number,
          title: c.title,
          readingTime: c.readingTime,
          group: c.group,
        }))}
        articles={articles.map((a) => ({
          slug: a.slug,
          title: a.title,
          readingTime: a.readingTime,
          categoryName: a.categoryName,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        }))}
        locale={locale}
        labels={{
          searchPlaceholder: dict.toc.searchPlaceholder,
          prophets: dict.toc.sectionOne,
          articles: dict.toc.sectionTwo,
          minutes: dict.toc.minutes,
          noResults: dict.toc.noResults,
        }}
        groupLabels={groupLabels}
      />

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
