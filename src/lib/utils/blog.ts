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

export type SpeechChunk = { text: string; arabic: boolean };

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

function segmentScripts(text: string): SpeechChunk[] {
  const segments: SpeechChunk[] = [];
  let current = "";
  let currentArabic = false;
  for (const char of text) {
    if (/\s/.test(char)) {
      if (current) current += char;
      continue;
    }
    const arabic = ARABIC_CHAR.test(char);
    if (current && arabic !== currentArabic) {
      segments.push({ text: current.trim(), arabic: currentArabic });
      current = "";
    }
    currentArabic = arabic;
    current += char;
  }
  if (current.trim()) segments.push({ text: current.trim(), arabic: currentArabic });
  return segments.filter((segment) => segment.text.length > 0);
}

export function buildSpeechChunks(text: string, chunkSize = 240): SpeechChunk[] {
  const sentences = text.match(/[^.!?؟]+[.!?؟]*\s*/g) ?? [text];
  const chunks: SpeechChunk[] = [];
  for (const sentence of sentences) {
    for (const segment of segmentScripts(sentence)) {
      let buffer = "";
      for (const word of segment.text.split(/\s+/)) {
        if (buffer && buffer.length + word.length + 1 > chunkSize) {
          chunks.push({ text: buffer.trim(), arabic: segment.arabic });
          buffer = "";
        }
        buffer += (buffer ? " " : "") + word;
      }
      if (buffer.trim()) chunks.push({ text: buffer.trim(), arabic: segment.arabic });
    }
  }
  return chunks.filter((chunk) => chunk.text.length > 0);
}

export function markdownToSpeechText(markdown: string): string {
  return stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\|/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(". ")
    .replace(/\.{2,}/g, ".")
    .trim();
}

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
