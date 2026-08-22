import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { Locale } from "@/lib/i18n/config";
import { calcReadingTime } from "@/lib/utils/blog";

import { db } from "./client";
import {
  categories,
  categoryTranslations,
  comments,
  newsletterSubscribers,
  postTags,
  postTranslations,
  posts,
  tagTranslations,
  tags,
  users,
} from "./schema";

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

const ptId = alias(postTranslations, "pt_requested");
const ctLocale = alias(categoryTranslations, "ct_locale");

async function queryPostCards(
  locale: Locale,
  where: ReturnType<typeof and> | undefined,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const baseWhere = and(
    eq(posts.status, "published"),
    eq(ptId.locale, locale),
    where
  );

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(posts)
    .innerJoin(ptId, eq(ptId.postId, posts.id))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(ctLocale, eq(ctLocale.categoryId, categories.id))
    .where(baseWhere);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: ptId.title,
      excerpt: ptId.excerpt,
      coverImageUrl: posts.coverImageUrl,
      readingTime:
        locale === "id" ? posts.readingTimeId : posts.readingTimeEn,
      publishedAt: posts.publishedAt,
      categoryName: ctLocale.name,
    })
    .from(posts)
    .innerJoin(ptId, eq(ptId.postId, posts.id))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(ctLocale, eq(ctLocale.categoryId, categories.id))
    .where(baseWhere)
    .orderBy(desc(posts.publishedAt))
    .limit(perPage)
    .offset((safePage - 1) * perPage);

  return {
    posts: rows.map((r) => ({
      ...r,
      readingTime: r.readingTime ?? 1,
    })),
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
  return queryPostCards(locale, undefined, page, perPage);
}

export async function getFeaturedPosts(
  locale: Locale,
  limit = 3
): Promise<PostCardData[]> {
  const result = await queryPostCards(locale, undefined, 1, limit);
  return result.posts;
}

export async function listPostsByCategory(
  categorySlug: string,
  locale: Locale,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const cat = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  if (!cat[0]) return { posts: [], total: 0, page: 1, perPage, totalPages: 1 };
  return queryPostCards(
    locale,
    eq(posts.categoryId, cat[0].id),
    page,
    perPage
  );
}

export async function listPostsByTag(
  tagSlug: string,
  locale: Locale,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const tag = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, tagSlug))
    .limit(1);
  if (!tag[0]) return { posts: [], total: 0, page: 1, perPage, totalPages: 1 };

  const taggedIds = db
    .select({ postId: postTags.postId })
    .from(postTags)
    .where(eq(postTags.tagId, tag[0].id));

  return queryPostCards(
    locale,
    inArray(posts.id, taggedIds),
    page,
    perPage
  );
}

export async function searchPosts(
  locale: Locale,
  q: string,
  page = 1,
  perPage = 9
): Promise<PaginatedPosts> {
  const term = `%${q.trim()}%`;
  const condition = or(
    ilike(ptId.title, term),
    ilike(ptId.excerpt, term),
    ilike(ptId.contentMarkdown, term)
  );
  return queryPostCards(locale, condition, page, perPage);
}

export async function getPostBySlug(
  slug: string,
  locale: Locale
): Promise<ArticleData | null> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      status: posts.status,
      viewsCount: posts.viewsCount,
      publishedAt: posts.publishedAt,
      readingTimeId: posts.readingTimeId,
      readingTimeEn: posts.readingTimeEn,
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  const post = rows[0];
  if (!post) return null;

  let tr = await db
    .select()
    .from(postTranslations)
    .where(
      and(eq(postTranslations.postId, post.id), eq(postTranslations.locale, locale))
    )
    .limit(1);

  let availableLocale: Locale = locale;
  if (!tr[0]) {
    tr = await db
      .select()
      .from(postTranslations)
      .where(
        and(
          eq(postTranslations.postId, post.id),
          eq(postTranslations.locale, "id")
        )
      )
      .limit(1);
    availableLocale = "id";
  }
  const t = tr[0];
  if (!t) return null;

  const catName = await db
    .select({ name: categoryTranslations.name })
    .from(categories)
    .innerJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.locale, availableLocale)
      )
    )
    .where(eq(categories.id, posts.categoryId))
    .limit(1);

  const postTagRows = await db
    .select({ slug: tags.slug, name: tagTranslations.name })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .innerJoin(
      tagTranslations,
      and(eq(tagTranslations.tagId, tags.id), eq(tagTranslations.locale, availableLocale))
    )
    .where(eq(postTags.postId, post.id));

  return {
    id: post.id,
    slug: post.slug,
    title: t.title,
    excerpt: t.excerpt,
    coverImageUrl: post.coverImageUrl,
    readingTime:
      (availableLocale === "id"
        ? post.readingTimeId
        : post.readingTimeEn) ?? 1,
    publishedAt: post.publishedAt,
    categoryName: catName[0]?.name ?? null,
    contentMarkdown: t.contentMarkdown,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    viewsCount: post.viewsCount,
    requestedLocale: locale,
    availableLocale,
    tags: postTagRows,
  };
}

export async function getRelatedPosts(
  postId: string,
  locale: Locale,
  limit = 3
): Promise<PostCardData[]> {
  const current = await db
    .select({ categoryId: posts.categoryId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  const categoryId = current[0]?.categoryId;

  if (categoryId) {
    const res = await queryPostCards(
      locale,
      and(ne(posts.id, postId), eq(posts.categoryId, categoryId)),
      1,
      limit
    );
    if (res.posts.length > 0) return res.posts;
  }
  const res2 = await queryPostCards(locale, ne(posts.id, postId), 1, limit);
  return res2.posts;
}

export async function getCategoriesWithCount(
  locale: Locale
): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      slug: categories.slug,
      name: categoryTranslations.name,
      postCount: sql<number>`(
        select count(*)::int from ${posts}
        inner join ${postTranslations}
          on ${postTranslations.postId} = ${posts.id}
        where ${posts.categoryId} = ${categories.id}
          and ${posts.status} = 'published'
          and ${postTranslations.locale} = ${locale}
      )`,
    })
    .from(categories)
    .innerJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.locale, locale)
      )
    )
    .orderBy(asc(categoryTranslations.name));
  return rows;
}

export async function getTagsWithCount(
  locale: Locale
): Promise<TagWithCount[]> {
  const rows = await db
    .select({
      slug: tags.slug,
      name: tagTranslations.name,
      postCount: sql<number>`(
        select count(*)::int from ${postTags}
        inner join ${posts} on ${posts.id} = ${postTags.postId}
        inner join ${postTranslations}
          on ${postTranslations.postId} = ${posts.id}
        where ${postTags.tagId} = ${tags.id}
          and ${posts.status} = 'published'
          and ${postTranslations.locale} = ${locale}
      )`,
    })
    .from(tags)
    .innerJoin(
      tagTranslations,
      and(eq(tagTranslations.tagId, tags.id), eq(tagTranslations.locale, locale))
    )
    .orderBy(asc(tagTranslations.name));
  return rows;
}

export async function getApprovedComments(
  postId: string
): Promise<CommentData[]> {
  return db
    .select({
      id: comments.id,
      authorName: comments.authorName,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.status, "approved")))
    .orderBy(desc(comments.createdAt));
}

export async function incrementViews(postId: string): Promise<void> {
  await db
    .update(posts)
    .set({ viewsCount: sql`${posts.viewsCount} + 1` })
    .where(eq(posts.id, postId));
}

export async function getAllPublishedSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.status, "published"));
}

export async function getUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
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
  const [p] = await db
    .select({
      total: count(),
      published: sql<number>`sum(case when ${posts.status} = 'published' then 1 else 0 end)::int`,
      views: sql<number>`coalesce(sum(${posts.viewsCount}), 0)::int`,
    })
    .from(posts);
  const [c] = await db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, "pending"));
  const [s] = await db.select({ value: count() }).from(newsletterSubscribers);

  return {
    totalPosts: p.total,
    publishedPosts: p.published,
    draftPosts: p.total - p.published,
    totalViews: p.views,
    pendingComments: c.value,
    subscribers: s.value,
  };
}

const ptAdminId = alias(postTranslations, "pt_admin_id");
const ptAdminEn = alias(postTranslations, "pt_admin_en");

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
  const term = q ? `%${q.trim()}%` : null;
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      status: posts.status,
      coverImageUrl: posts.coverImageUrl,
      publishedAt: posts.publishedAt,
      viewsCount: posts.viewsCount,
      titleId: ptAdminId.title,
      titleEn: ptAdminEn.title,
    })
    .from(posts)
    .leftJoin(ptAdminId, eq(ptAdminId.postId, posts.id))
    .leftJoin(ptAdminEn, eq(ptAdminEn.postId, posts.id))
    .where(
      term
        ? or(ilike(ptAdminId.title, term), ilike(ptAdminEn.title, term), ilike(posts.slug, term))
        : undefined
    )
    .orderBy(desc(posts.updatedAt));
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
  categoryId?: number | null;
  publishedAt?: Date | null;
  translations: PostTranslationInput[];
  tagIds: number[];
};

function derivedReadingTimes(translations: PostTranslationInput[]) {
  const rtId = translations.find((t) => t.locale === "id");
  const rtEn = translations.find((t) => t.locale === "en");
  return {
    readingTimeId: rtId ? calcReadingTime(rtId.contentMarkdown) : null,
    readingTimeEn: rtEn ? calcReadingTime(rtEn.contentMarkdown) : null,
  };
}

export async function createPost(input: PostInput): Promise<string> {
  return db.transaction(async (tx) => {
    const [post] = await tx
      .insert(posts)
      .values({
        slug: input.slug,
        status: input.status,
        coverImageUrl: input.coverImageUrl ?? null,
        categoryId: input.categoryId ?? null,
        publishedAt: input.publishedAt ?? null,
        ...derivedReadingTimes(input.translations),
      })
      .returning({ id: posts.id });

    for (const tr of input.translations) {
      await tx.insert(postTranslations).values({
        postId: post.id,
        locale: tr.locale,
        title: tr.title,
        excerpt: tr.excerpt ?? null,
        contentMarkdown: tr.contentMarkdown,
        metaTitle: tr.metaTitle ?? null,
        metaDescription: tr.metaDescription ?? null,
      });
    }
    if (input.tagIds.length > 0) {
      await tx
        .insert(postTags)
        .values(input.tagIds.map((tagId) => ({ postId: post.id, tagId })));
    }
    return post.id;
  });
}

export async function updatePost(
  id: string,
  input: PostInput
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(posts)
      .set({
        slug: input.slug,
        status: input.status,
        coverImageUrl: input.coverImageUrl ?? null,
        categoryId: input.categoryId ?? null,
        publishedAt: input.publishedAt ?? null,
        updatedAt: new Date(),
        ...derivedReadingTimes(input.translations),
      })
      .where(eq(posts.id, id));

    for (const tr of input.translations) {
      await tx
        .insert(postTranslations)
        .values({
          postId: id,
          locale: tr.locale,
          title: tr.title,
          excerpt: tr.excerpt ?? null,
          contentMarkdown: tr.contentMarkdown,
          metaTitle: tr.metaTitle ?? null,
          metaDescription: tr.metaDescription ?? null,
        })
        .onConflictDoUpdate({
          target: [postTranslations.postId, postTranslations.locale],
          set: {
            title: tr.title,
            excerpt: tr.excerpt ?? null,
            contentMarkdown: tr.contentMarkdown,
            metaTitle: tr.metaTitle ?? null,
            metaDescription: tr.metaDescription ?? null,
          },
        });
    }
    await tx.delete(postTags).where(eq(postTags.postId, id));
    if (input.tagIds.length > 0) {
      await tx
        .insert(postTags)
        .values(input.tagIds.map((tagId) => ({ postId: id, tagId })));
    }
  });
}

export async function deletePostById(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}

export type AdminFullPost = {
  id: string;
  slug: string;
  status: "draft" | "published";
  coverImageUrl: string | null;
  categoryId: number | null;
  publishedAt: Date | null;
  translations: PostTranslationInput[];
  tagIds: number[];
};

export async function adminGetPost(id: string): Promise<AdminFullPost | null> {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  const post = rows[0];
  if (!post) return null;

  const trs = await db
    .select()
    .from(postTranslations)
    .where(eq(postTranslations.postId, id));

  const tg = await db
    .select({ tagId: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.postId, id));

  return {
    id: post.id,
    slug: post.slug,
    status: post.status as "draft" | "published",
    coverImageUrl: post.coverImageUrl,
    categoryId: post.categoryId,
    publishedAt: post.publishedAt,
    translations: trs.map((t) => ({
      locale: t.locale as Locale,
      title: t.title,
      excerpt: t.excerpt,
      contentMarkdown: t.contentMarkdown,
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
    })),
    tagIds: tg.map((r) => r.tagId),
  };
}

export type AdminTaxonomyRow = {
  id: number;
  slug: string;
  nameId: string | null;
  nameEn: string | null;
};

export async function listCategoriesAdmin(): Promise<AdminTaxonomyRow[]> {
  const cid = alias(categoryTranslations, "cid");
  const cen = alias(categoryTranslations, "cen");
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      nameId: cid.name,
      nameEn: cen.name,
    })
    .from(categories)
    .leftJoin(cid, and(eq(cid.categoryId, categories.id), eq(cid.locale, "id")))
    .leftJoin(cen, and(eq(cen.categoryId, categories.id), eq(cen.locale, "en")))
    .orderBy(asc(categories.slug));
}

export async function listTagsAdmin(): Promise<AdminTaxonomyRow[]> {
  const tid = alias(tagTranslations, "tid");
  const ten = alias(tagTranslations, "ten");
  return db
    .select({
      id: tags.id,
      slug: tags.slug,
      nameId: tid.name,
      nameEn: ten.name,
    })
    .from(tags)
    .leftJoin(tid, and(eq(tid.tagId, tags.id), eq(tid.locale, "id")))
    .leftJoin(ten, and(eq(ten.tagId, tags.id), eq(ten.locale, "en")))
    .orderBy(asc(tags.slug));
}

export async function upsertTaxonomy(
  kind: "category" | "tag",
  data: { id?: number; slug: string; nameId: string; nameEn: string }
): Promise<void> {
  if (kind === "category") {
    let rowId = data.id;
    if (rowId) {
      await db
        .update(categories)
        .set({ slug: data.slug })
        .where(eq(categories.id, rowId));
    } else {
      const [created] = await db
        .insert(categories)
        .values({ slug: data.slug })
        .returning({ id: categories.id });
      rowId = created.id;
    }
    for (const [locale, name] of [
      ["id", data.nameId],
      ["en", data.nameEn],
    ] as const) {
      await db
        .insert(categoryTranslations)
        .values({ categoryId: rowId, locale, name })
        .onConflictDoUpdate({
          target: [categoryTranslations.categoryId, categoryTranslations.locale],
          set: { name },
        });
    }
  } else {
    let rowId = data.id;
    if (rowId) {
      await db.update(tags).set({ slug: data.slug }).where(eq(tags.id, rowId));
    } else {
      const [created] = await db
        .insert(tags)
        .values({ slug: data.slug })
        .returning({ id: tags.id });
      rowId = created.id;
    }
    for (const [locale, name] of [
      ["id", data.nameId],
      ["en", data.nameEn],
    ] as const) {
      await db
        .insert(tagTranslations)
        .values({ tagId: rowId, locale, name })
        .onConflictDoUpdate({
          target: [tagTranslations.tagId, tagTranslations.locale],
          set: { name },
        });
    }
  }
}

export async function deleteTaxonomy(
  kind: "category" | "tag",
  id: number
): Promise<void> {
  const table = kind === "category" ? categories : tags;
  await db.delete(table).where(eq(table.id, id));
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
  const ptA = alias(postTranslations, "pt_c");
  return db
    .select({
      id: comments.id,
      authorName: comments.authorName,
      authorEmail: comments.authorEmail,
      content: comments.content,
      status: comments.status,
      createdAt: comments.createdAt,
      postSlug: posts.slug,
      postTitle: ptA.title,
    })
    .from(comments)
    .innerJoin(posts, eq(posts.id, comments.postId))
    .leftJoin(ptA, and(eq(ptA.postId, posts.id), eq(ptA.locale, "id")))
    .where(status && status !== "all" ? eq(comments.status, status) : undefined)
    .orderBy(desc(comments.createdAt));
}

export async function setCommentStatus(
  id: number,
  status: "approved" | "rejected" | "pending"
): Promise<void> {
  await db.update(comments).set({ status }).where(eq(comments.id, id));
}

export async function deleteCommentById(id: number): Promise<void> {
  await db.delete(comments).where(eq(comments.id, id));
}

export async function listSubscribers() {
  return db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt));
}

export async function subscribeNewsletter(email: string): Promise<void> {
  await db
    .insert(newsletterSubscribers)
    .values({ email: email.toLowerCase() })
    .onConflictDoNothing();
}

export async function createComment(input: {
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
}): Promise<void> {
  await db.insert(comments).values(input);
}
