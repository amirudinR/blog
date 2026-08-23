"use client";

import { ChevronDown, List } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import type { TocItem } from "@/lib/utils/blog";

type TableOfContentsProps = {
  items: TocItem[];
  locale: Locale;
  className?: string;
  defaultOpen?: boolean;
};

const TITLES: Record<Locale, string> = {
  id: "Daftar Isi",
  en: "On this page",
};

function flattenVisible(items: TocItem[]): TocItem[] {
  return items.filter((item) => item.level <= 3);
}

function getIndentClass(level: number): string {
  switch (level) {
    case 2:
      return "pl-0";
    case 3:
      return "pl-4";
    case 4:
      return "pl-8";
    default:
      return "pl-0";
  }
}

export function TableOfContents({
  items,
  locale,
  className,
  defaultOpen,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(defaultOpen ?? true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const visibleItems = flattenVisible(items);
  let number = 0;

  useEffect(() => {
    const headings = visibleItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [visibleItems]);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [visibleItems, open]);

  if (visibleItems.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label={TITLES[locale]}
      className={className}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <span className="flex items-center gap-2">
          <List className="size-4 text-primary" />
          <span className="font-heading text-sm font-bold tracking-tight">
            {TITLES[locale]}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {visibleItems.length}
          </span>
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: open ? contentHeight + 16 : 0,
        }}
      >
        <div ref={contentRef} className="pt-2">
          <ul className="space-y-0.5 rounded-xl border border-border/70 bg-card p-3">
            {visibleItems.map((item) => {
              number++;
              const isActive = activeId === item.id;
              return (
                <li key={`${item.level}-${item.id}`}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={`group flex items-baseline gap-2 rounded-lg py-1.5 pr-2 text-sm leading-snug transition-colors ${getIndentClass(item.level)} ${
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      }`}
                    >
                      {number}
                    </span>
                    <span className="min-w-0 truncate">{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
