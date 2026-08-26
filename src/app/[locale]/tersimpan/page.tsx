import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SavedList } from "@/components/blog/saved-list";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type SavedPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: SavedPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.saved.title,
    description: dict.saved.subtitle,
    robots: { index: false },
  };
}

export default async function SavedPage({ params }: SavedPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <SavedList
      locale={locale}
      labels={{
        title: dict.saved.title,
        subtitle: dict.saved.subtitle,
        empty: dict.saved.empty,
        browse: dict.saved.browse,
        remove: dict.saved.remove,
      }}
    />
  );
}
