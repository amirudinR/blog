import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyAttribution } from "@/components/blog/copy-attribution";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/toc";
import { TextToSpeech } from "@/components/blog/text-to-speech";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  getAllProphetSlugs,
  getProphetChapter,
  getProphetNeighbors,
} from "@/lib/content/prophets";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { markdownToSpeechText } from "@/lib/utils/blog";

type ChapterPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const LOCALES: Locale[] = ["id", "en"];

export function generateStaticParams() {
  const slugs = getAllProphetSlugs();
  return LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const chapter = getProphetChapter(slug);
  if (!chapter) return {};

  return {
    title: chapter.title,
    description: chapter.excerpt,
    openGraph: {
      title: chapter.title,
      description: chapter.excerpt,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(chapter.title)}&locale=${locale}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      languages: {
        id: `/id/kisah-nabi/${slug}`,
        en: `/en/kisah-nabi/${slug}`,
      },
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const chapter = getProphetChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getProphetNeighbors(slug);
  const shareUrl = `${SITE_URL}/${locale}/kisah-nabi/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: chapter.title,
    description: chapter.excerpt,
    author: { "@type": "Person", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": shareUrl },
    inLanguage: locale === "id" ? "id-ID" : "en-US",
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <Link
        href={`/${locale}/kisah-nabi`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {dict.prophets.backToProphets}
      </Link>

      <article>
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {dict.prophets.chapter} {chapter.number}
          </p>
          <h1 className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2.75rem]">
            {chapter.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {chapter.readingTime} {dict.prophets.minRead}
            </span>
          </div>
          <div className="mt-5">
            <TextToSpeech
              text={markdownToSpeechText(chapter.content)}
              locale={locale}
              labels={{
                listen: dict.blog.ttsListen,
                pause: dict.blog.ttsPause,
                resume: dict.blog.ttsResume,
                stop: dict.blog.ttsStop,
                speed: dict.blog.ttsSpeed,
                partOf: dict.blog.ttsPartOf,
              }}
            />
          </div>
        </header>

        <div className="mb-6 sm:mb-8 xl:hidden">
          {chapter.headings.length > 0 ? (
            <TableOfContents
              items={chapter.headings}
              locale={locale}
              className="rounded-xl"
              defaultOpen={false}
            />
          ) : null}
        </div>

        <div className="grid gap-6 sm:gap-10 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0 max-w-[68ch]">
            <CopyAttribution url={shareUrl} siteName={SITE_NAME}>
              <MarkdownContent markdown={chapter.content} />
            </CopyAttribution>

            <div className="mt-10 border-t border-border/70 pt-6">
              <ShareButtons title={chapter.title} url={shareUrl} t={dict.blog} />
            </div>

            <nav
              aria-label={dict.prophets.chapter}
              className="mt-10 grid gap-3 sm:grid-cols-2"
            >
              {prev ? (
                <Link
                  href={`/${locale}/kisah-nabi/${prev.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 transition-all duration-300 hover:border-border hover:shadow-md"
                >
                  <ArrowLeft
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {dict.prophets.prev}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                      {prev.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span aria-hidden className="hidden sm:block" />
              )}
              {next ? (
                <Link
                  href={`/${locale}/kisah-nabi/${next.slug}`}
                  className="group flex items-start justify-end gap-3 rounded-xl border border-border/70 bg-card p-4 text-right transition-all duration-300 hover:border-border hover:shadow-md"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {dict.prophets.next}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                      {next.title}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ) : null}
            </nav>
          </div>

          {chapter.headings.length > 0 ? (
            <aside className="hidden xl:block">
              <TableOfContents
                items={chapter.headings}
                locale={locale}
                className="sticky top-24"
              />
            </aside>
          ) : null}
        </div>
      </article>
    </div>
  );
}
