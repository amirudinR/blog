import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  adminGetPost,
  listCategoriesAdmin,
  listTagsAdmin,
} from "@/lib/db/queries";

import { PostEditor } from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Post",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    adminGetPost(id),
    listCategoriesAdmin(),
    listTagsAdmin(),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Edit Post
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perbarui konten dan pengaturan artikel.
        </p>
      </div>
      <PostEditor
        mode="edit"
        initial={{
          ...post,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
          translations: post.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt ?? null,
            contentMarkdown: t.contentMarkdown,
            metaTitle: t.metaTitle ?? null,
            metaDescription: t.metaDescription ?? null,
          })),
        }}
        categories={categories.map((c) => ({
          id: c.id,
          nameId: c.nameId ?? c.slug,
        }))}
        tags={tags.map((t) => ({
          id: t.id,
          nameId: t.nameId ?? t.slug,
          nameEn: t.nameEn,
        }))}
      />
    </div>
  );
}
