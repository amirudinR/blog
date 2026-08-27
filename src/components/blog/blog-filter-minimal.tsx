"use client";

import { useState } from "react";

type Post = {
  slug: string;
  title: string;
  categoryName: string | null;
  tags: string[];
  readingTime: number;
  publishedAt: string | null;
};

type Props = {
  posts: Post[];
};

export function BlogFilterMinimal({ posts }: Props) {
  const [search, setSearch] = useState("");
  const filtered = posts.filter(
    (p) =>
      !search.trim() || p.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari artikel..."
        className="w-full rounded-xl border border-border/70 bg-card px-3 py-2 text-sm"
      />
      <p className="mt-2 text-sm text-muted-foreground">
        {filtered.length} artikel
      </p>
    </div>
  );
}
