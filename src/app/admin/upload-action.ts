"use server";

import { getSession } from "@/lib/session";
import { slugify } from "@/lib/utils/blog";

export type UploadCoverResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadCoverImage(
  formData: FormData
): Promise<UploadCoverResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Berkas tidak ditemukan" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Hanya berkas gambar yang diizinkan" };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Ukuran gambar maksimal 5 MB" };
  }

  try {
    const { put } = await import("@vercel/blob");
    const dotIndex = file.name.lastIndexOf(".");
    const baseName =
      slugify(dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name) ||
      "cover";
    const ext = dotIndex > 0 ? file.name.slice(dotIndex).toLowerCase() : "";
    const blob = await put(`covers/${Date.now()}-${baseName}${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { ok: true, url: blob.url };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengunggah gambar ke penyimpanan",
    };
  }
}
