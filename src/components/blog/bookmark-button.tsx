"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { isBookmarked, toggleBookmark } from "@/lib/reading";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  href: string;
  title: string;
  labels: { save: string; saved: string };
};

export function BookmarkButton({ href, title, labels }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaved(isBookmarked(href));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [href]);

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleBookmark({ href, title }))}
      aria-pressed={saved}
      title={saved ? labels.saved : labels.save}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
        saved
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-primary"
      )}
    >
      {saved ? (
        <BookmarkCheck className="size-4" aria-hidden />
      ) : (
        <Bookmark className="size-4" aria-hidden />
      )}
      {saved ? labels.saved : labels.save}
    </button>
  );
}
