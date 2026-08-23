import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsletterForm } from "@/components/blog/newsletter-form";
import { PostCard } from "@/components/blog/post-card";
import { getFeaturedPosts, getLatestPosts } from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const revalidate = 60;

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const [featured, latest] = await Promise.all([
    getFeaturedPosts(locale, 3),
    getLatestPosts(locale, 1, 6),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
      <section className="py-8 sm:py-14 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {dict.home.overline}
        </p>
        <h1 className="mt-4 max-w-2xl font-heading text-[1.75rem] font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {dict.site.tagline}
        </h1>
        <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
          {dict.site.description}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          <span className="h-px w-16 bg-primary/40" aria-hidden />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
          >
            {dict.home.heroCta}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href={`/${locale}/tentang`}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.nav.about}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="mb-8 flex items-center gap-5">
          <h2 className="shrink-0 font-heading text-xl font-bold tracking-tight sm:text-3xl">
            {dict.home.featured}
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{dict.blog.empty}</p>
        )}
      </section>

      <section className="py-10 sm:py-16">
        <div className="mb-8 flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-5">
            <h2 className="shrink-0 font-heading text-xl font-bold tracking-tight sm:text-3xl">
              {dict.home.latest}
            </h2>
            <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
          </div>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {dict.home.viewAll}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {latest.posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{dict.blog.empty}</p>
        )}
      </section>

      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center shadow-sm">
          <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight">
            {dict.home.newsletterTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {dict.home.newsletterDesc}
          </p>
          <div className="mt-6">
            <NewsletterForm t={dict.home} />
          </div>
        </div>
      </section>
    </div>
  );
}
