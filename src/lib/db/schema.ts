import {
  pgTable,
  text,
  uuid,
  serial,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
});

export const categoryTranslations = pgTable(
  "category_translations",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(), // 'id' | 'en'
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("category_translations_unique").on(t.categoryId, t.locale)]
);

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
});

export const tagTranslations = pgTable(
  "tag_translations",
  {
    id: serial("id").primaryKey(),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(), // 'id' | 'en'
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("tag_translations_unique").on(t.tagId, t.locale)]
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    coverImageUrl: text("cover_image_url"),
    status: text("status").notNull().default("draft"), // 'draft' | 'published'
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    readingTimeId: integer("reading_time_id"),
    readingTimeEn: integer("reading_time_en"),
    viewsCount: integer("views_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("posts_status_published_idx").on(t.status, t.publishedAt),
  ]
);

export const postTranslations = pgTable(
  "post_translations",
  {
    id: serial("id").primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(), // 'id' | 'en'
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    contentMarkdown: text("content_markdown").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
  },
  (t) => [
    uniqueIndex("post_translations_unique").on(t.postId, t.locale),
    index("post_translations_locale_idx").on(t.locale),
  ]
);

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("post_tags_unique").on(t.postId, t.tagId)]
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    authorEmail: text("author_email").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("comments_post_status_idx").on(t.postId, t.status)]
);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("active"), // 'active' | 'unsubscribed'
  subscribedAt: timestamp("subscribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostTranslation = typeof postTranslations.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
