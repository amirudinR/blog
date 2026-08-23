import type { Metadata } from "next";

import {
  listCategoriesAdmin,
  listTagsAdmin,
} from "@/lib/db/queries";

import { PostEditor } from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Post",
};

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    listCategoriesAdmin(),
    listTagsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Buat Post
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tulis artikel baru dalam dua bahasa.
        </p>
      </div>
      <PostEditor
        mode="create"
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
