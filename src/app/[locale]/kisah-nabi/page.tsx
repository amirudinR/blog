import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProphetChapterList, type ProphetGroup } from "@/lib/content/prophets";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProphetsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ProphetsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.prophets.title,
    description: dict.prophets.subtitle,
    alternates: {
      languages: {
        id: `/id/kisah-nabi`,
        en: `/en/kisah-nabi`,
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

export default async function ProphetsPage({ params }: ProphetsPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const chapters = getProphetChapterList();

  const groupLabels: Record<ProphetGroup, string> = {
    quran: dict.prophets.groupQuran,
    islamic: dict.prophets.groupIslamic,
    bridge: dict.prophets.groupBridge,
    other: dict.prophets.groupOther,
    epilogue: dict.prophets.groupEpilogue,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12 sm:px-6">
      <header className="mb-10 sm:mb-14">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <BookOpen className="size-3.5" aria-hidden />
          {dict.prophets.chapter} 1–35
        </p>
        <h1 className="mt-4 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {dict.prophets.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {dict.prophets.subtitle}
        </p>
      </header>

      <div className="space-y-10 sm:space-y-12">
        {GROUP_ORDER.map((group) => {
          const items = chapters.filter((c) => c.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="mb-4 flex items-center gap-3 font-heading text-lg font-bold tracking-tight sm:text-xl">
                <span className="h-px w-6 bg-primary/60" aria-hidden />
                {groupLabels[group]}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((chapter) => (
                  <Link
                    key={chapter.slug}
                    href={`/${locale}/kisah-nabi/${chapter.slug}`}
                    className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-md sm:p-5"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                      aria-hidden
                    >
                      {chapter.number}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-base">
                        {chapter.title}
                      </span>
                      {chapter.excerpt ? (
                        <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                          {chapter.excerpt}
                        </span>
                      ) : null}
                      <span className="mt-2 block text-xs text-muted-foreground">
                        {chapter.readingTime} {dict.prophets.minRead}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
