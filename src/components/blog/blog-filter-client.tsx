"use client";

import { BlogFilter } from "@/components/blog/blog-filter";

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
  locale: "id" | "en";
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
