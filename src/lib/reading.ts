export type RecentItem = {
  href: string;
  title: string;
  ts: number;
};

export type BookmarkItem = {
  href: string;
  title: string;
  ts: number;
};

const RECENTS_KEY = "blogkutts.recent";
const BOOKMARKS_KEY = "blogkutts.bookmarks";
const RECENTS_LIMIT = 8;

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = JSON.parse(raw ?? "[]") as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    return;
  }
}

export function getRecents(): RecentItem[] {
  return readList<RecentItem>(RECENTS_KEY);
}

export function pushRecent(item: Omit<RecentItem, "ts">): void {
  if (typeof window === "undefined") return;
  const list = getRecents().filter((entry) => entry.href !== item.href);
  list.unshift({ ...item, ts: Date.now() });
  writeList(RECENTS_KEY, list.slice(0, RECENTS_LIMIT));
}

export function getBookmarks(): BookmarkItem[] {
  return readList<BookmarkItem>(BOOKMARKS_KEY);
}

export function isBookmarked(href: string): boolean {
  return getBookmarks().some((entry) => entry.href === href);
}

export function toggleBookmark(item: Omit<BookmarkItem, "ts">): boolean {
  if (typeof window === "undefined") return false;
  const list = getBookmarks();
  const exists = list.some((entry) => entry.href === item.href);
  const next = exists
    ? list.filter((entry) => entry.href !== item.href)
    : [{ ...item, ts: Date.now() }, ...list];
  writeList(BOOKMARKS_KEY, next);
  return !exists;
}

export function removeBookmark(href: string): void {
  if (typeof window === "undefined") return;
  writeList(
    BOOKMARKS_KEY,
    getBookmarks().filter((entry) => entry.href !== href)
  );
}

export function ttsProgressKeyFromHref(href: string): string | null {
  const match = href.match(/^\/(?:id|en)\/blog\/(.+)$|^\/(?:id|en)\/kisah-nabi\/(.+)$/);
  if (!match) return null;
  const slug = match[1] ?? match[2];
  return href.includes("/kisah-nabi/") ? `kisah-nabi-${slug}` : `blog-${slug}`;
}
