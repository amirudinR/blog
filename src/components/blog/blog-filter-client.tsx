"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

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
  const [BlogFilter, setBlogFilter] = useState<
    React.ComponentType<Props> | null
  >(null);

  useEffect(() => {
    import("@/components/blog/blog-filter").then((mod) =>
      setBlogFilter(() => mod.BlogFilter)
    );
  }, []);

  if (!BlogFilter) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return <BlogFilter {...props} />;
}
