import type { Metadata } from "next";
import { CalendarDays, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/blog/comment-section";
import { CopyAttribution } from "@/components/blog/copy-attribution";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { ProtectedCover } from "@/components/blog/protected-cover";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { RelatedPosts } from "@/components/blog/related-posts";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/toc";
import { ViewCounter } from "@/components/blog/view-counter";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  getApprovedComments,
  getCategoriesWithCount,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { extractHeadings, formatDate, getCoverSrc } from "@/lib/utils/blog";

type ArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const article = await getPostBySlug(slug, locale);
  if (!article) return {};

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? "",
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt ?? "",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(article.title)}&locale=${locale}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      languages: {
        id: `/id/blog/${slug}`,
        en: `/en/blog/${slug}`,
      },
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const article = await getPostBySlug(slug, locale);
  if (!article) notFound();

  const [comments, relatedPosts, categories] = await Promise.all([
    getApprovedComments(article.id),
    getRelatedPosts(article.id, locale),
    getCategoriesWithCount(locale),
  ]);

  const categorySlug = categories.find(
    (c) => c.name === article.categoryName
  )?.slug;

  const tocItems = extractHeadings(article.contentMarkdown);
  const shareUrl = `${SITE_URL}/${locale}/blog/${article.slug}`;
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&locale=${locale}`;
  const publishedAt = article.publishedAt
    ? new Date(article.publishedAt).toISOString()
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription ?? article.excerpt ?? "",
    image: [ogImage],
    datePublished: publishedAt,
    dateModified: publishedAt,
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
        href={`/${locale}/blog`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {dict.blog.backToBlog}
      </Link>

      {article.requestedLocale !== article.availableLocale ? (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {dict.blog.translationNotice}
        </div>
      ) : null}

      <article>
        <header className="mb-8">
          {article.categoryName ? (
            <Link
              href={`/${locale}/kategori/${categorySlug ?? encodeURIComponent(article.categoryName.toLowerCase())}`}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
            >
              {article.categoryName}
            </Link>
          ) : null}
          <h1 className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2.75rem]">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {article.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                <time dateTime={new Date(article.publishedAt).toISOString()}>
                  {formatDate(article.publishedAt, locale)}
                </time>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {article.readingTime} {dict.blog.minRead}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" aria-hidden />
              {article.viewsCount} {dict.blog.views}
            </span>
            {article.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/${locale}/tag/${tag.slug}`}
                className="rounded-full bg-muted px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
          <ViewCounter postId={article.id} />
        </header>

        <div className="relative mb-6 sm:mb-10 aspect-video w-full overflow-hidden rounded-xl">
          {article.coverImageUrl ? (
            <ProtectedCover
              src={getCoverSrc(article.coverImageUrl, article.title, locale)}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="select-none object-cover"
            />
          ) : (
            <div className="h-64 w-full rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-muted sm:h-80 lg:h-96" />
          )}
        </div>

        <div className="xl:hidden mb-8">
          {tocItems.length > 0 ? (
            <TableOfContents
              items={tocItems}
              locale={locale}
              className="rounded-xl"
              defaultOpen={false}
            />
          ) : null}
        </div>

        <div className="grid gap-6 sm:gap-10 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0 max-w-[68ch]">
            <CopyAttribution url={shareUrl} siteName={SITE_NAME}>
              <MarkdownContent markdown={article.contentMarkdown} />
            </CopyAttribution>

            <div className="mt-10 border-t border-border/70 pt-6">
              <ShareButtons title={article.title} url={shareUrl} t={dict.blog} />
            </div>
          </div>

          {tocItems.length > 0 ? (
            <aside className="hidden xl:block">
              <TableOfContents items={tocItems} locale={locale} className="sticky top-24" />
            </aside>
          ) : null}
        </div>
      </article>

      <CommentSection postId={article.id} comments={comments} locale={locale} />

      <RelatedPosts
        posts={relatedPosts}
        locale={locale}
        title={dict.blog.related}
        emptyMessage={dict.blog.empty}
      />
    </div>
  );
}
