import type { Locale } from "@/lib/i18n/config";

const LOCALE_MAP: Record<Locale, string> = { id: "id-ID", en: "en-US" };

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

const FRONTMATTER_KEY =
  /^\s*(title|excerpt|meta_title|metaTitle|meta_description|metaDescription|category|tags|reading_time|readingTime|slug|cover|cover_image|coverImage|cover_image_url|coverImageUrl|published_at|publishedAt|status)\s*[:=]/i;

export function stripFrontmatter(markdown: string): string {
  let text = markdown;
  if (text.trimStart().startsWith("---")) {
    const start = text.indexOf("---");
    const end = text.indexOf("\n---", start + 3);
    if (end !== -1) {
      const nextLine = text.indexOf("\n", end + 1);
      text = nextLine === -1 ? "" : text.slice(nextLine + 1);
    }
  }
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length && (lines[i].trim() === "" || FRONTMATTER_KEY.test(lines[i]))) {
    i++;
  }
  return lines.slice(i).join("\n").replace(/^\s+/, "");
}

export function calcReadingTime(markdown: string): number {
  const words = stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`~\-\[\]()!]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE_MAP[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function excerptFrom(markdown: string, max = 160): string {
  const plain = stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*_>`~\[\]()>!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

export type TocItem = { id: string; text: string; level: number };

function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): TocItem[] {
  const withoutCode = stripFrontmatter(markdown).replace(/```[\s\S]*?```/g, "");
  const items: TocItem[] = [];
  for (const match of withoutCode.matchAll(/^(#{2,4})\s+(.+)$/gm)) {
    const level = match[1].length;
    const text = match[2].replace(/[#*_`]/g, "").trim();
    items.push({ id: headingId(text), text, level });
  }
  return items;
}

export { headingId };

export function getCoverSrc(
  coverUrl: string | null,
  title: string,
  locale: Locale
): string {
  return (
    coverUrl ??
    `/api/og?title=${encodeURIComponent(title)}&locale=${locale}`
  );
}
