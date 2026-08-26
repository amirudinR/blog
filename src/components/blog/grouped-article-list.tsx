import Link from "next/link";

import {
  subgroupArticles,
  type TocSubgroup,
} from "@/lib/content/toc-subgroups";
import type { Locale } from "@/lib/i18n/config";
import type { TocArticle } from "@/lib/db/queries";

export type TopicGroup = {
  name: string;
  anchor: string;
  articleCount: number;
  subgroups: TocSubgroup[];
};

function anchorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_MERGES: Record<string, string> = {
  "pengembangan diri": "motivasi",
  "self improvement": "motivation",
};

export function buildTopicGroups(
  articles: TocArticle[],
  uncategorizedLabel: string,
  locale: Locale
): TopicGroup[] {
  const grouped = new Map<string, TocArticle[]>();
  for (const article of articles) {
    const rawKey = article.categoryName ?? uncategorizedLabel;
    const key = CATEGORY_MERGES[rawKey.toLowerCase()] ?? rawKey;
    const list = grouped.get(key);
    if (list) {
      list.push(article);
    } else {
      grouped.set(key, [article]);
    }
  }

  const usedAnchors = new Map<string, number>();
  return [...grouped.entries()].map(([name, items]) => {
    const base = anchorSlug(name) || "topik";
    const seen = usedAnchors.get(base) ?? 0;
    usedAnchors.set(base, seen + 1);
    const anchor = seen === 0 ? base : `${base}-${seen + 1}`;
    const subgroups = subgroupArticles(items, name, locale);
    const articleCount = subgroups.reduce(
      (sum, sg) => sum + sg.articles.length,
      0
    );
    return { name, anchor, articleCount, subgroups };
  });
}

function Leader() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden min-w-6 flex-1 -translate-y-1 border-b border-dotted border-border sm:block"
    />
  );
}

type GroupedArticleListProps = {
  groups: TopicGroup[];
  locale: Locale;
  minutesLabel: string;
};

export function GroupedArticleList({
  groups,
  locale,
  minutesLabel,
}: GroupedArticleListProps) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.anchor} id={group.anchor} className="scroll-mt-28">
          <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {group.name}
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal">
              {group.articleCount}
            </span>
          </h3>
          <div className="space-y-4">
            {group.subgroups.map((subgroup) => (
              <div key={subgroup.label ?? "_all"}>
                {subgroup.label ? (
                  <h4 className="mb-2 flex items-center gap-2 pl-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    <span
                      className="inline-block size-1.5 rounded-full bg-primary/60"
                      aria-hidden
                    />
                    {subgroup.label}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                      {subgroup.articles.length}
                    </span>
                  </h4>
                ) : null}
                <ol className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  {subgroup.articles.map((post, index) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="group flex items-baseline gap-2.5 px-4 py-3 transition-colors hover:bg-accent/50"
                      >
                        <span
                          className="flex size-6 shrink-0 translate-y-0.5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                          aria-hidden
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 truncate text-sm font-medium transition-colors group-hover:text-primary sm:text-[15px]">
                          {post.title}
                        </span>
                        <Leader />
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {post.readingTime} {minutesLabel}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
