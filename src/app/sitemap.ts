import type { MetadataRoute } from "next";

import { getAllPublishedSlugs } from "@/lib/db/queries";
import { SITE_URL } from "@/lib/constants";
import { i18n } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of i18n.locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      changeFrequency: "weekly",
      priority: 1,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/tentang`,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  try {
    const slugs = await getAllPublishedSlugs();
    for (const locale of i18n.locales) {
      for (const { slug, updatedAt } of slugs) {
        entries.push({
          url: `${SITE_URL}/${locale}/blog/${slug}`,
          lastModified: updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    return entries;
  }

  return entries;
}
