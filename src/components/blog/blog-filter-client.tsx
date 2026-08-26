"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";

const BlogFilter = dynamic(
  () =>
    import("@/components/blog/blog-filter").then((mod) => ({
      default: mod.BlogFilter,
    })),
  { ssr: false }
);

type Post = {
  slug: string;
  title: string;
  categoryName: string | null;
  tags: string[];
  readingTime: number;
  publishedAt: string | null;
};

type Category = { slug: string; name: string; postCount: number };
type Tag = { slug: string; name: string; postCount: number };

type Props = {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  locale: Locale;
  dictionary: {
    allCategories: string;
    categories: string;
    tags: string;
    filtering: string;
    clearFilter: string;
    minutes: string;
    searchPlaceholder: string;
  };
  initialKategori?: string;
  initialTag?: string;
};

export function BlogFilterClient(props: Props) {
  return <BlogFilter {...props} />;
}
