"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getRecents,
  ttsProgressKeyFromHref,
  type RecentItem,
} from "@/lib/reading";
import { cn } from "@/lib/utils";

type ContinueReadingProps = {
  currentHref?: string;
  labels: {
    title: string;
    resume: string;
    partOf: string;
    emptyHint: string;
  };
};

type RecentWithProgress = RecentItem & {
  current: number | null;
  total: number | null;
};

export function ContinueReading({ currentHref, labels }: ContinueReadingProps) {
  const [items, setItems] = useState<RecentWithProgress[] | null>(null);

  useEffect(() => {
    const load = () => {
      const recents = getRecents()
        .filter((entry) => entry.href !== currentHref)
        .slice(0, 3);
      const withProgress = recents.map((entry) => {
        const key = ttsProgressKeyFromHref(entry.href);
        if (!key) return { ...entry, current: null, total: null };
        try {
          const saved = JSON.parse(
            window.localStorage.getItem(`blogkutts.progress.${key}`) ?? "null"
          ) as { i?: number; total?: number } | null;
          if (
            saved &&
            typeof saved.i === "number" &&
            typeof saved.total === "number" &&
            saved.i > 0 &&
            saved.i < saved.total
          ) {
            return { ...entry, current: saved.i + 1, total: saved.total };
          }
        } catch {
          return { ...entry, current: null, total: null };
        }
        return { ...entry, current: null, total: null };
      });
      setItems(withProgress);
    };
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [currentHref]);

  if (items === null || items.length === 0) return null;

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-5">
        <h2 className="shrink-0 font-heading text-xl font-bold tracking-tight">
          {labels.title}
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card p-4",
              "transition-all duration-300 hover:border-primary/40 hover:shadow-md"
            )}
          >
            <p className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
              {item.title}
            </p>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              {item.current !== null && item.total !== null ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium tabular-nums text-primary">
                  {labels.partOf
                    .replace("{current}", String(item.current))
                    .replace("{total}", String(item.total))}
                </span>
              ) : (
                <span>{labels.resume}</span>
              )}
              <ArrowRight
                className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
