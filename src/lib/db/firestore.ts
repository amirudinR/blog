import "server-only";

import { unstable_cache } from "next/cache";
import { FieldValue, type DocumentData } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Locale } from "@/lib/i18n/config";
import { calcReadingTime } from "@/lib/utils/blog";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  readingTime: number;
  publishedAt: Date | null;
  categoryName: string | null;
};

export type ArticleData = PostCardData & {
  contentMarkdown: string;
  metaTitle: string | null;
  metaDescription: string | null;
  viewsCount: number;
  requestedLocale: Locale;
  availableLocale: Locale;
  tags: { slug: string; name: string }[];
};

export type PaginatedPosts = {
  posts: PostCardData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type CommentData = {
  id: number;
  authorName: string;
  content: string;
  createdAt: Date;
};

export type CategoryWithCount = {
  slug: string;
  name: string;
  postCount: number;
};

export type TagWithCount = {
  slug: string;
  name: string;
  postCount: number;
};

type TranslationContent = {
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

type PostRecord = {
  id: string;
  slug: string;
  status: "draft" | "published";
  coverImageUrl: string | null;
  categoryId: string | null;
  publishedAt: Date | null;
  readingTimeId: number | null;
  readingTimeEn: number | null;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  translations: Partial<Record<Locale, TranslationContent>>;
  tagIds: string[];
};

type TaxonomyNames = Record<string, { nameId: string; nameEn: string }>;

type CardRow = PostCardData & { _categoryId: string | null };

const POSTS = "posts";
const CATEGORIES = "categories";
const TAGS = "tags";
const COMMENTS = "comments";
const SUBSCRIBERS = "subscribers";

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function toRequiredDate(value: unknown): Date {
  return toDate(value) ?? new Date(0);
}

function normalizeTranslation(raw: unknown): TranslationContent {
  const data = (raw ?? {}) as DocumentData;
  return {
    title: (data.title as string | undefined) ?? "",
    excerpt: (data.excerpt as string | null | undefined) ?? null,
    contentMarkdown: (data.contentMarkdown as string | undefined) ?? "",
    metaTitle: (data.metaTitle as string | null | undefined) ?? null,
    metaDescription:
      (data.metaDescription as string | null | undefined) ?? null,
  };
}

function normalizePost(id: string, data: DocumentData): PostRecord {
  const translations = (data.translations ?? {}) as Record<string, unknown>;
  const tagIds = Array.isArray(data.tagIds)
    ? (data.tagIds as unknown[]).map((v) => String(v))
    : [];
  return {
    id,
    slug: (data.slug as string | undefined) ?? id,
    status: data.status === "published" ? "published" : "draft",
    coverImageUrl: (data.coverImageUrl as string | null | undefined) ?? null,
    categoryId: (data.categoryId as string | null | undefined) ?? null,
    publishedAt: toDate(data.publishedAt),
    readingTimeId: (data.readingTimeId as number | null | undefined) ?? null,
    readingTimeEn: (data.readingTimeEn as number | null | undefined) ?? null,
    viewsCount: (data.viewsCount as number | undefined) ?? 0,
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toDate(data.updatedAt) ?? toRequiredDate(data.createdAt),
    translations: {
      id: translations.id ? normalizeTranslation(translations.id) : undefined,
      en: translations.en ? normalizeTranslation(translations.en) : undefined,
    },
    tagIds,
  };
}

function postsCollection() {
  return getAdminDb().collection(POSTS);
}

async function fetchAllPosts(): Promise<PostRecord[]> {
  const snap = await postsCollection().get();
  return snap.docs.map((doc) => normalizePost(doc.id, doc.data()));
}

type BlogData = {
  posts: PostRecord[];
  categoryNames: TaxonomyNames;
  tagNames: TaxonomyNames;
};

async function fetchBlogData(): Promise<BlogData> {
  const [postsSnap, catSnap, tagSnap] = await Promise.all([
    postsCollection().where("status", "==", "published").get(),
    getAdminDb().collection(CATEGORIES).get(),
    getAdminDb().collection(TAGS).get(),
  ]);

  return {
    posts: postsSnap.docs.map((doc) => normalizePost(doc.id, doc.data())),
    categoryNames: Object.fromEntries(
      catSnap.docs.map((d) => [
        d.id,
        {
          nameId: (d.get("nameId") as string | undefined) ?? "",
          nameEn: (d.get("nameEn") as string | undefined) ?? "",
        },
      ])
    ),
    tagNames: Object.fromEntries(
      tagSnap.docs.map((d) => [
        d.id,
        {
          nameId: (d.get("nameId") as string | undefined) ?? "",
          nameEn: (d.get("nameEn") as string | undefined) ?? "",
        },
      ])
    ),
  };
}

export const getCachedBlogData = unstable_cache(
  fetchBlogData,
  ["blog-data-v1"],
  { revalidate: 60, tags: ["posts"] }
);

function publishTime(post: PostRecord): number {
  if (!post.publishedAt) return Number.NEGATIVE_INFINITY;
  if (post.publishedAt instanceof Date) return post.publishedAt.getTime();
  return new Date(post.publishedAt as string | number).getTime();
}

function sortPostsByPublishedDesc(posts: PostRecord[]): PostRecord[] {
  return [...posts].sort((a, b) => publishTime(b) - publishTime(a));
}

function localeName(
  names: TaxonomyNames,
  id: string,
  locale: Locale
): string | null {
  const entry = names[id];
  if (!entry) return null;
  const name = locale === "id" ? entry.nameId : entry.nameEn;
  return name.length > 0 ? name : null;
}

function toCardRows(
  posts: PostRecord[],
  locale: Locale,
  categoryNames: TaxonomyNames
): CardRow[] {
  return sortPostsByPublishedDesc(
    posts.filter(
      (post) => post.status === "published" && Boolean(post.translations[locale])
    )
  ).map((post) => {
    const translation = post.translations[locale]!;
    return {
      id: post.id,
      slug: post.slug,
      title: translation.title,
      excerpt: translation.excerpt,
      coverImageUrl: post.coverImageUrl,
      readingTime:
        (locale === "id"
          ? post.readingTimeId
          : post.readingTimeEn) ?? 1,
      publishedAt: post.publishedAt,
      categoryName: post.categoryId
        ? localeName(categoryNames, post.categoryId, locale)
        : null,
      _categoryId: post.categoryId,
    };
  });
}

function stripRows(rows: CardRow[]): PostCardData[] {
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    readingTime: row.readingTime,
    publishedAt: row.publishedAt,
    categoryName: row.categoryName,
  }));
}

function paginate(
  rows: CardRow[],
  page: number,
  perPage: number
): PaginatedPosts {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    posts: stripRows(rows.slice(start, start + perPage)),
    total,
    page: safePage,
    perPage,
    totalPages,
  };
}

export async function getLatestPosts(
  locale: Locale,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const { posts, categoryNames } = await getCachedBlogData();
  return paginate(toCardRows(posts, locale, categoryNames), page, perPage);
}

export async function getFeaturedPosts(
  locale: Locale,
  limit = 3
): Promise<PostCardData[]> {
  const { posts, categoryNames } = await getCachedBlogData();
  return stripRows(toCardRows(posts, locale, categoryNames).slice(0, limit));
}

export async function listPostsByCategory(
  categorySlug: string,
  locale: Locale,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const { posts, categoryNames } = await getCachedBlogData();
  const catSnap = await getAdminDb()
    .collection(CATEGORIES)
    .doc(categorySlug)
    .get();
  if (!catSnap.exists) {
    return { posts: [], total: 0, page: 1, perPage, totalPages: 1 };
  }
  const filtered = posts.filter((post) => post.categoryId === categorySlug);
  return paginate(toCardRows(filtered, locale, categoryNames), page, perPage);
}

export async function listPostsByTag(
  tagSlug: string,
  locale: Locale,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const { posts, categoryNames } = await getCachedBlogData();
  const tagSnap = await getAdminDb().collection(TAGS).doc(tagSlug).get();
  if (!tagSnap.exists) {
    return { posts: [], total: 0, page: 1, perPage, totalPages: 1 };
  }
  const filtered = posts.filter((post) => post.tagIds.includes(tagSlug));
  return paginate(toCardRows(filtered, locale, categoryNames), page, perPage);
}

export async function searchPosts(
  locale: Locale,
  q: string,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const term = q.trim().toLowerCase();
  const { posts, categoryNames } = await getCachedBlogData();
  const filtered = term
    ? posts.filter((post) => {
        const translation = post.translations[locale];
        if (!translation) return false;
        return (
          translation.title.toLowerCase().includes(term) ||
          (translation.excerpt?.toLowerCase().includes(term) ?? false) ||
          translation.contentMarkdown.toLowerCase().includes(term)
        );
      })
    : posts;
  return paginate(toCardRows(filtered, locale, categoryNames), page, perPage);
}

export async function getPostBySlug(
  slug: string,
  locale: Locale
): Promise<ArticleData | null> {
  const snap = await postsCollection()
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  const doc = snap.docs[0];
  if (!doc) return null;

  const post = normalizePost(doc.id, doc.data());

  let availableLocale: Locale = locale;
  let translation = post.translations[locale];
  if (!translation) {
    availableLocale = "id";
    translation = post.translations.id;
  }
  if (!translation) return null;

  let categoryName: string | null = null;
  if (post.categoryId) {
    const { categoryNames } = await getCachedBlogData();
    categoryName = localeName(categoryNames, post.categoryId, availableLocale);
  }

  const { tagNames } = await getCachedBlogData();
  const tags = post.tagIds.flatMap((tagSlug) => {
    const entry = tagNames[tagSlug];
    if (!entry) return [];
    return [
      {
        slug: tagSlug,
        name:
          (availableLocale === "id" ? entry.nameId : entry.nameEn) || tagSlug,
      },
    ];
  });

  return {
    id: post.id,
    slug: post.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    coverImageUrl: post.coverImageUrl,
    readingTime:
      (availableLocale === "id"
        ? post.readingTimeId
        : post.readingTimeEn) ?? 1,
    publishedAt: post.publishedAt,
    categoryName,
    contentMarkdown: translation.contentMarkdown,
    metaTitle: translation.metaTitle,
    metaDescription: translation.metaDescription,
    viewsCount: post.viewsCount,
    requestedLocale: locale,
    availableLocale,
    tags,
  };
}

export async function getRelatedPosts(
  postId: string,
  locale: Locale,
  limit = 3
): Promise<PostCardData[]> {
  const { posts, categoryNames } = await getCachedBlogData();
  const current = posts.find((post) => post.id === postId);
  const pool = toCardRows(posts, locale, categoryNames);

  if (current?.categoryId) {
    const sameCategory = pool
      .filter((row) => row._categoryId === current.categoryId)
      .slice(0, limit);
    if (sameCategory.length > 0) return stripRows(sameCategory);
  }

  const others = pool.filter((row) => row.id !== postId).slice(0, limit);
  return stripRows(others);
}

export async function getCategoriesWithCount(
  locale: Locale
): Promise<CategoryWithCount[]> {
  const { posts, categoryNames } = await getCachedBlogData();
  const rows: CategoryWithCount[] = [];
  for (const [slug, names] of Object.entries(categoryNames)) {
    const postCount = posts.filter(
      (post) =>
        post.status === "published" &&
        Boolean(post.translations[locale]) &&
        post.categoryId === slug
    ).length;
    rows.push({
      slug,
      name: (locale === "id" ? names.nameId : names.nameEn) || slug,
      postCount,
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export async function getTagsWithCount(locale: Locale): Promise<TagWithCount[]> {
  const { posts, tagNames } = await getCachedBlogData();
  const rows: TagWithCount[] = [];
  for (const [slug, names] of Object.entries(tagNames)) {
    const postCount = posts.filter(
      (post) =>
        post.status === "published" &&
        Boolean(post.translations[locale]) &&
        post.tagIds.includes(slug)
    ).length;
    rows.push({
      slug,
      name: (locale === "id" ? names.nameId : names.nameEn) || slug,
      postCount,
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export async function getApprovedComments(
  postId: string
): Promise<CommentData[]> {
  const snap = await getAdminDb()
    .collection(COMMENTS)
    .where("postId", "==", postId)
    .where("status", "==", "approved")
    .get();
  const rows = snap.docs.map((doc) => ({
    id: doc.id,
    authorName: (doc.get("authorName") as string | undefined) ?? "",
    content: (doc.get("content") as string | undefined) ?? "",
    createdAt: toRequiredDate(doc.get("createdAt")),
  }));
  rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return rows.map((row) => ({
    ...row,
    id: row.id as unknown as number,
  }));
}

export async function incrementViews(postId: string): Promise<void> {
  const ref = postsCollection().doc(postId);
  const snap = await ref.get();
  if (!snap.exists) return;
  await ref.update({ viewsCount: FieldValue.increment(1) });
}

export async function getAllPublishedSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const snap = await postsCollection().where("status", "==", "published").get();
  return snap.docs.map((doc) => {
    const post = normalizePost(doc.id, doc.data());
    return { slug: post.slug, updatedAt: post.updatedAt };
  });
}

export async function isPublishedPost(postId: string): Promise<boolean> {
  const snap = await postsCollection().doc(postId).get();
  return snap.exists && snap.data()?.status === "published";
}

export type AdminStats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  pendingComments: number;
  subscribers: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const db = getAdminDb();
  const [postsSnap, commentsSnap, subscribersSnap] = await Promise.all([
    db.collection(POSTS).get(),
    db.collection(COMMENTS).get(),
    db.collection(SUBSCRIBERS).get(),
  ]);

  let published = 0;
  let totalViews = 0;
  for (const doc of postsSnap.docs) {
    const status = doc.get("status");
    if (status === "published") published += 1;
    totalViews += (doc.get("viewsCount") as number | undefined) ?? 0;
  }
  let pendingComments = 0;
  for (const doc of commentsSnap.docs) {
    if (doc.get("status") === "pending") pendingComments += 1;
  }

  return {
    totalPosts: postsSnap.size,
    publishedPosts: published,
    draftPosts: postsSnap.size - published,
    totalViews,
    pendingComments,
    subscribers: subscribersSnap.size,
  };
}

export type AdminPostRow = {
  id: string;
  slug: string;
  status: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  viewsCount: number;
  titleId: string | null;
  titleEn: string | null;
};

export async function adminListPosts(q?: string): Promise<AdminPostRow[]> {
  const records = await fetchAllPosts();
  records.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const term = q ? q.trim().toLowerCase() : null;
  return records
    .filter((post) => {
      if (!term) return true;
      const titleId = post.translations.id?.title.toLowerCase() ?? "";
      const titleEn = post.translations.en?.title.toLowerCase() ?? "";
      return (
        titleId.includes(term) ||
        titleEn.includes(term) ||
        post.slug.toLowerCase().includes(term)
      );
    })
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      status: post.status,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt,
      viewsCount: post.viewsCount,
      titleId: post.translations.id?.title ?? null,
      titleEn: post.translations.en?.title ?? null,
    }));
}

export type PostTranslationInput = {
  locale: Locale;
  title: string;
  excerpt?: string | null;
  contentMarkdown: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type PostInput = {
  slug: string;
  status: "draft" | "published";
  coverImageUrl?: string | null;
  categoryId?: string | null;
  publishedAt?: Date | null;
  translations: PostTranslationInput[];
  tagIds: string[];
};

function derivedReadingTimes(translations: PostTranslationInput[]) {
  const rtId = translations.find((t) => t.locale === "id");
  const rtEn = translations.find((t) => t.locale === "en");
  return {
    readingTimeId: rtId ? calcReadingTime(rtId.contentMarkdown) : null,
    readingTimeEn: rtEn ? calcReadingTime(rtEn.contentMarkdown) : null,
  };
}

function translationsToMap(
  translations: PostTranslationInput[]
): Partial<Record<Locale, TranslationContent>> {
  const map: Partial<Record<Locale, TranslationContent>> = {};
  for (const tr of translations) {
    map[tr.locale] = {
      title: tr.title,
      excerpt: tr.excerpt ?? null,
      contentMarkdown: tr.contentMarkdown,
      metaTitle: tr.metaTitle ?? null,
      metaDescription: tr.metaDescription ?? null,
    };
  }
  return map;
}

function dedupeTagIds(tagIds: string[]): string[] {
  return [...new Set(tagIds)];
}

export async function createPost(input: PostInput): Promise<string> {
  const dup = await postsCollection()
    .where("slug", "==", input.slug)
    .limit(1)
    .get();
  if (!dup.empty) throw new Error("Slug sudah dipakai");

  const now = new Date();
  const ref = postsCollection().doc();
  await ref.set({
    slug: input.slug,
    status: input.status,
    coverImageUrl: input.coverImageUrl ?? null,
    categoryId: input.categoryId ?? null,
    publishedAt: input.publishedAt ?? null,
    ...derivedReadingTimes(input.translations),
    viewsCount: 0,
    createdAt: now,
    updatedAt: now,
    translations: translationsToMap(input.translations),
    tagIds: dedupeTagIds(input.tagIds),
  });
  return ref.id;
}

export async function updatePost(
  id: string,
  input: PostInput
): Promise<void> {
  const ref = postsCollection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Post tidak ditemukan");

  const dup = await postsCollection()
    .where("slug", "==", input.slug)
    .limit(1)
    .get();
  if (!dup.empty && dup.docs[0].id !== id) {
    throw new Error("Slug sudah dipakai");
  }

  const prev = normalizePost(snap.id, snap.data()!);
  await ref.set({
    slug: input.slug,
    status: input.status,
    coverImageUrl: input.coverImageUrl ?? null,
    categoryId: input.categoryId ?? null,
    publishedAt: input.publishedAt ?? null,
    ...derivedReadingTimes(input.translations),
    viewsCount: prev.viewsCount,
    createdAt: prev.createdAt,
    updatedAt: new Date(),
    translations: {
      ...prev.translations,
      ...translationsToMap(input.translations),
    },
    tagIds: dedupeTagIds(input.tagIds),
  });
}

export async function deletePostById(id: string): Promise<void> {
  const db = getAdminDb();
  const batch = db.batch();
  batch.delete(db.collection(POSTS).doc(id));
  const commentsSnap = await db
    .collection(COMMENTS)
    .where("postId", "==", id)
    .get();
  for (const doc of commentsSnap.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
}

export type AdminFullPost = {
  id: string;
  slug: string;
  status: "draft" | "published";
  coverImageUrl: string | null;
  categoryId: string | null;
  publishedAt: Date | null;
  translations: PostTranslationInput[];
  tagIds: string[];
};

export async function adminGetPost(id: string): Promise<AdminFullPost | null> {
  const snap = await postsCollection().doc(id).get();
  if (!snap.exists) return null;
  const post = normalizePost(snap.id, snap.data()!);

  const translations: PostTranslationInput[] = [];
  if (post.translations.id) {
    translations.push({ locale: "id", ...post.translations.id });
  }
  if (post.translations.en) {
    translations.push({ locale: "en", ...post.translations.en });
  }

  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    coverImageUrl: post.coverImageUrl,
    categoryId: post.categoryId,
    publishedAt: post.publishedAt,
    translations,
    tagIds: post.tagIds,
  };
}

export type AdminTaxonomyRow = {
  id: string;
  slug: string;
  nameId: string | null;
  nameEn: string | null;
};

function taxonomyCollection(kind: "category" | "tag") {
  return getAdminDb().collection(kind === "category" ? CATEGORIES : TAGS);
}

async function listTaxonomyAdmin(
  kind: "category" | "tag"
): Promise<AdminTaxonomyRow[]> {
  const snap = await taxonomyCollection(kind).get();
  return snap.docs
    .map((doc) => ({
      id: doc.id,
      slug: (doc.get("slug") as string | undefined) ?? doc.id,
      nameId: (doc.get("nameId") as string | undefined) ?? null,
      nameEn: (doc.get("nameEn") as string | undefined) ?? null,
    }))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

export async function listCategoriesAdmin(): Promise<AdminTaxonomyRow[]> {
  return listTaxonomyAdmin("category");
}

export async function listTagsAdmin(): Promise<AdminTaxonomyRow[]> {
  return listTaxonomyAdmin("tag");
}

export async function upsertTaxonomy(
  kind: "category" | "tag",
  data: { id?: string; slug: string; nameId: string; nameEn: string }
): Promise<void> {
  const db = getAdminDb();
  const coll = taxonomyCollection(kind);
  const targetRef = coll.doc(data.slug);
  const targetSnap = await targetRef.get();
  const createdAt = toDate(targetSnap.get("createdAt")) ?? new Date();

  await targetRef.set({
    slug: data.slug,
    nameId: data.nameId,
    nameEn: data.nameEn,
    createdAt,
  });

  const oldId = data.id;
  if (oldId && oldId !== data.slug) {
    const batch = db.batch();
    if (kind === "category") {
      const referencing = await db
        .collection(POSTS)
        .where("categoryId", "==", oldId)
        .get();
      for (const doc of referencing.docs) {
        batch.update(doc.ref, { categoryId: data.slug });
      }
    } else {
      const referencing = await db
        .collection(POSTS)
        .where("tagIds", "array-contains", oldId)
        .get();
      for (const doc of referencing.docs) {
        const current = Array.isArray(doc.get("tagIds"))
          ? (doc.get("tagIds") as unknown[]).map((v) => String(v))
          : [];
        batch.update(doc.ref, {
          tagIds: current.map((v) => (v === oldId ? data.slug : v)),
        });
      }
    }
    batch.delete(coll.doc(oldId));
    await batch.commit();
  }
}

export async function deleteTaxonomy(
  kind: "category" | "tag",
  id: string
): Promise<void> {
  const db = getAdminDb();
  await taxonomyCollection(kind).doc(id).delete();

  const batch = db.batch();
  if (kind === "category") {
    const referencing = await db
      .collection(POSTS)
      .where("categoryId", "==", id)
      .get();
    for (const doc of referencing.docs) {
      batch.update(doc.ref, { categoryId: null });
    }
  } else {
    const referencing = await db
      .collection(POSTS)
      .where("tagIds", "array-contains", id)
      .get();
    for (const doc of referencing.docs) {
      batch.update(doc.ref, { tagIds: FieldValue.arrayRemove(id) });
    }
  }
  await batch.commit();
}

export type AdminCommentRow = {
  id: number;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: Date;
  postSlug: string | null;
  postTitle: string | null;
};

export async function listComments(
  status?: string
): Promise<AdminCommentRow[]> {
  const db = getAdminDb();
  const commentsSnap =
    status && status !== "all"
      ? await db.collection(COMMENTS).where("status", "==", status).get()
      : await db.collection(COMMENTS).get();

  const postsSnap = await db.collection(POSTS).get();
  const postsById = new Map(
    postsSnap.docs.map((doc) => [doc.id, normalizePost(doc.id, doc.data())])
  );

  const rows = commentsSnap.docs.map((doc) => {
    const post = postsById.get(doc.get("postId") as string);
    return {
      id: doc.id,
      authorName: (doc.get("authorName") as string | undefined) ?? "",
      authorEmail: (doc.get("authorEmail") as string | undefined) ?? "",
      content: (doc.get("content") as string | undefined) ?? "",
      status: (doc.get("status") as string | undefined) ?? "pending",
      createdAt: toRequiredDate(doc.get("createdAt")),
      postSlug: post?.slug ?? null,
      postTitle: post?.translations.id?.title ?? post?.translations.en?.title ?? null,
    };
  });
  rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return rows.map((row) => ({ ...row, id: row.id as unknown as number }));
}

export async function setCommentStatus(
  id: number,
  status: "approved" | "rejected" | "pending"
): Promise<void> {
  await getAdminDb()
    .collection(COMMENTS)
    .doc(String(id))
    .update({ status });
}

export async function deleteCommentById(id: number): Promise<void> {
  await getAdminDb().collection(COMMENTS).doc(String(id)).delete();
}

export async function listSubscribers() {
  const snap = await getAdminDb().collection(SUBSCRIBERS).get();
  const rows = snap.docs.map((doc) => ({
    id: doc.id,
    email: (doc.get("email") as string | undefined) ?? doc.id,
    status: (doc.get("status") as string | undefined) ?? "active",
    subscribedAt: toRequiredDate(doc.get("subscribedAt")),
  }));
  rows.sort((a, b) => b.subscribedAt.getTime() - a.subscribedAt.getTime());
  return rows;
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const normalized = email.toLowerCase();
  const ref = getAdminDb().collection(SUBSCRIBERS).doc(normalized);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.set({ email: normalized, status: "active" }, { merge: true });
    return;
  }
  await ref.set({
    email: normalized,
    status: "active",
    subscribedAt: new Date(),
  });
}

export async function createComment(input: {
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
}): Promise<void> {
  await getAdminDb()
    .collection(COMMENTS)
    .add({ ...input, status: "pending", createdAt: new Date() });
}
