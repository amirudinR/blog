"use client";

import { ArrowRight, BookmarkX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getBookmarks, removeBookmark, type BookmarkItem } from "@/lib/reading";
import type { Locale } from "@/lib/i18n/config";

type SavedListLabels = {
  title: string;
  subtitle: string;
  empty: string;
  browse: string;
  remove: string;
};

export function SavedList({
  labels,
  locale,
}: {
  labels: SavedListLabels;
  locale: Locale;
}) {
  const [items, setItems] = useState<BookmarkItem[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setItems(getBookmarks()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (items === null) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
        {labels.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{labels.subtitle}</p>
      <span className="mt-4 flex h-px w-16 bg-primary/40" aria-hidden />

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BookmarkX className="size-5" aria-hidden />
          </span>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {labels.empty}
          </p>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            {labels.browse}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <ol className="mt-8 overflow-hidden rounded-xl border border-border/70 bg-card">
          {items.map((item) => (
            <li key={item.href} className="border-b border-border/50 last:border-b-0">
              <div className="flex items-center gap-3 px-4 py-3">
                <Link
                  href={item.href}
                  className="group flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <span className="min-w-0 truncate text-sm font-medium transition-colors group-hover:text-primary sm:text-[15px]">
                    {item.title}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    removeBookmark(item.href);
                    setItems(getBookmarks());
                  }}
                  aria-label={labels.remove}
                  title={labels.remove}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <BookmarkX className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
