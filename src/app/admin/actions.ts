"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPost,
  deleteCommentById,
  deletePostById,
  deleteTaxonomy,
  setCommentStatus,
  updatePost,
  upsertTaxonomy,
  type PostInput,
} from "@/lib/db/queries";
import { getSession } from "@/lib/session";
import {
  postInputSchema,
  taxonomyInputSchema,
  type PostInputSchema,
} from "@/lib/validation/post";
import { slugify } from "@/lib/utils/blog";
import { INDEXNOW_KEY, IS_LOCALHOST, SITE_URL } from "@/lib/constants";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SavePostResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

function revalidateBlog(): void {
  revalidatePath("/");
  revalidatePath("/id/blog");
  revalidatePath("/en/blog");
  updateTag("posts");
}

async function pingIndexNow(slug: string): Promise<void> {
  if (IS_LOCALHOST) return;
  try {
    await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [
          `${SITE_URL}/id/blog/${slug}`,
          `${SITE_URL}/en/blog/${slug}`,
          `${SITE_URL}/id/blog`,
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // fire-and-forget: indexing ping failure must not block saving
  }
}

function toPostInput(data: PostInputSchema): PostInput {
  return {
    slug: data.slug.trim(),
    status: data.status,
    coverImageUrl: data.coverImageUrl ? data.coverImageUrl : null,
    categoryId: data.categoryId ?? null,
    publishedAt: data.publishedAt
      ? new Date(data.publishedAt)
      : data.status === "published"
        ? new Date()
        : null,
    translations: data.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      excerpt: t.excerpt ?? null,
      contentMarkdown: t.contentMarkdown,
      metaTitle: t.metaTitle ?? null,
      metaDescription: t.metaDescription ?? null,
    })),
    tagIds: data.tagIds,
  };
}

export async function savePost(input: PostInputSchema): Promise<SavePostResult> {
  await requireAdmin();

  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data post tidak valid",
    };
  }

  const postInput = toPostInput(parsed.data);
  const { id } = parsed.data;

  try {
    if (id) {
      await updatePost(id, postInput);
      revalidateBlog();
      if (postInput.status === "published") {
        await pingIndexNow(postInput.slug);
      }
      return { ok: true, id };
    }
    const createdId = await createPost(postInput);
    revalidateBlog();
    if (postInput.status === "published") {
      await pingIndexNow(postInput.slug);
    }
    return { ok: true, id: createdId };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal menyimpan post",
    };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await deletePostById(id);
    revalidateBlog();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menghapus post",
    };
  }
}

async function upsertTaxonomyAction(
  kind: "category" | "tag",
  input: unknown
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = taxonomyInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Nama tidak valid",
    };
  }

  const slug = slugify(parsed.data.nameEn || parsed.data.nameId);
  if (!slug) {
    return { ok: false, error: "Slug tidak valid" };
  }

  try {
    await upsertTaxonomy(kind, {
      id: parsed.data.id,
      slug,
      nameId: parsed.data.nameId,
      nameEn: parsed.data.nameEn || parsed.data.nameId,
    });
    revalidateBlog();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data. Slug mungkin sudah dipakai.",
    };
  }
}

async function deleteTaxonomyAction(
  kind: "category" | "tag",
  id: string
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await deleteTaxonomy(kind, id);
    revalidateBlog();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menghapus data",
    };
  }
}

export async function upsertCategory(input: unknown): Promise<ActionResult> {
  return upsertTaxonomyAction("category", input);
}

export async function upsertTag(input: unknown): Promise<ActionResult> {
  return upsertTaxonomyAction("tag", input);
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return deleteTaxonomyAction("category", id);
}

export async function deleteTag(id: string): Promise<ActionResult> {
  return deleteTaxonomyAction("tag", id);
}

export async function moderateComment(
  id: number,
  status: "approved" | "rejected" | "pending"
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await setCommentStatus(id, status);
    updateTag("comments");
    revalidatePath("/admin/comments");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal memperbarui komentar",
    };
  }
}

export async function removeComment(id: number): Promise<ActionResult> {
  await requireAdmin();

  try {
    await deleteCommentById(id);
    updateTag("comments");
    revalidatePath("/admin/comments");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menghapus komentar",
    };
  }
}
