"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import type { TocItem } from "@/lib/utils/blog";

type TableOfContentsProps = {
  items: TocItem[];
  locale: Locale;
};

const TITLES: Record<Locale, string> = {
  id: "Daftar Isi",
  en: "On this page",
};

export function TableOfContents({ items, locale }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = items
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
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label={TITLES[locale]}
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border/70 bg-card p-5"
    >
      <p className="mb-3 font-heading text-sm font-bold tracking-tight">
        {TITLES[locale]}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={`${item.level}-${item.id}`}
            style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`block border-l-2 py-1 pl-3 text-sm leading-snug transition-colors ${
                activeId === item.id
                  ? "border-primary font-medium text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
