import "server-only";

import fs from "node:fs";
import path from "node:path";

import { calcReadingTime, excerptFrom, extractHeadings, type TocItem } from "@/lib/utils/blog";

const PROPHETS_DIR = path.join(process.cwd(), "src", "content", "prophets");

export type ProphetGroup =
  | "quran"
  | "islamic"
  | "bridge"
  | "other"
  | "epilogue";

export type ProphetChapterMeta = {
  number: number;
  slug: string;
  title: string;
  excerpt: string;
  readingTime: number;
  group: ProphetGroup;
};

export type ProphetChapter = ProphetChapterMeta & {
  content: string;
  headings: TocItem[];
};

const ISLAMIC_SLUGS = new Set(["khidr", "luqman", "dhul-qarnayn"]);
const OTHER_SLUGS = new Set(["nabi-yahudi", "nabi-katolik"]);

function groupForSlug(slug: string): ProphetGroup {
  if (slug === "epilog") return "epilogue";
  if (slug.startsWith("penghubung")) return "bridge";
  if (ISLAMIC_SLUGS.has(slug)) return "islamic";
  if (OTHER_SLUGS.has(slug)) return "other";
  return "quran";
}

function parseFileName(fileName: string): { number: number; slug: string } | null {
  const match = fileName.match(/^chapter-(\d+)-(.+)\.md$/);
  if (!match) return null;
  return { number: Number(match[1]), slug: match[2] };
}

function readChapterFile(
  fileName: string,
  parsed: { number: number; slug: string }
): ProphetChapter {
  const raw = fs.readFileSync(path.join(PROPHETS_DIR, fileName), "utf8");
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = (titleMatch?.[1] ?? parsed.slug).trim();
  const content = raw.replace(/^#\s+.+\n/, "").trim();
  return {
    number: parsed.number,
    slug: parsed.slug,
    title,
    excerpt: excerptFrom(content, 180),
    readingTime: calcReadingTime(content),
    group: groupForSlug(parsed.slug),
    content,
    headings: extractHeadings(content),
  };
}

let cache: ProphetChapter[] | null = null;

export function getAllProphetChapters(): ProphetChapter[] {
  if (cache) return cache;
  const files = fs
    .readdirSync(PROPHETS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ fileName: f, parsed: parseFileName(f) }))
    .filter((e): e is { fileName: string; parsed: { number: number; slug: string } } => e.parsed !== null)
    .map((e) => readChapterFile(e.fileName, e.parsed))
    .sort((a, b) => a.number - b.number);
  cache = files;
  return cache;
}

export function getProphetChapterList(): ProphetChapterMeta[] {
  return getAllProphetChapters().map((c) => ({
    number: c.number,
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    readingTime: c.readingTime,
    group: c.group,
  }));
}

export function getProphetChapter(slug: string): ProphetChapter | null {
  const chapters = getAllProphetChapters();
  const index = chapters.findIndex((c) => c.slug === slug);
  if (index === -1) return null;
  return chapters[index];
}

export function getProphetNeighbors(slug: string): {
  prev: ProphetChapterMeta | null;
  next: ProphetChapterMeta | null;
} {
  const chapters = getAllProphetChapters();
  const index = chapters.findIndex((c) => c.slug === slug);
  if (index === -1) return { prev: null, next: null };
  const prev = index > 0 ? chapters[index - 1] : null;
  const next = index < chapters.length - 1 ? chapters[index + 1] : null;
  return { prev, next };
}

export function getAllProphetSlugs(): string[] {
  return getAllProphetChapters().map((c) => c.slug);
}
