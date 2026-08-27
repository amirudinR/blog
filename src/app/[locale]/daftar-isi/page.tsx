import type { Metadata } from "next";
import { ArrowUp } from "lucide-react";
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
    <div id="top" className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14 sm:px-6">
      <header className="mb-10 text-center sm:mb-14">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {locale === "id" ? "Indeks Lengkap" : "Complete Index"}
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-tight">
          {dict.toc.title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {dict.toc.subtitle}
        </p>

        <div className="mt-6 inline-flex items-center divide-x divide-border/60 rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-xs">
          <span className="pr-3 tabular-nums">
            <span className="font-semibold text-foreground">{chapters.length}</span>{" "}
            {dict.toc.chapters}
          </span>
          <span className="px-3 tabular-nums">
            <span className="font-semibold text-foreground">{articles.length}</span>{" "}
            {dict.toc.articles}
          </span>
          <span className="pl-3 tabular-nums">
            ~{totalHours} {dict.toc.hours}
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

      <footer className="mt-16 border-t border-border/60 pt-6 text-center">
        <a
          href="#top"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowUp className="size-3.5" aria-hidden />
          {dict.toc.backToTop}
        </a>
      </footer>
    </div>
  );
}
