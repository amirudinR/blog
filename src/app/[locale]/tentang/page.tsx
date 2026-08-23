import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {dict.site.name}
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {dict.about.title}
      </h1>
      <span className="mt-5 mb-8 flex items-center gap-3" aria-hidden>
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="h-px w-16 bg-primary/40" />
      </span>
      <div className="max-w-[65ch] space-y-5 leading-relaxed text-muted-foreground">
        <p>{dict.about.intro1}</p>
        <p>{dict.about.intro2}</p>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button render={<Link href={`/${locale}/blog`} />}>
          {dict.about.cta}
        </Button>
        <Button
          variant="ghost"
          render={<a href="mailto:amirudinridwan99@gmail.com" />}
        >
          Kontak
        </Button>
      </div>
    </div>
  );
}
