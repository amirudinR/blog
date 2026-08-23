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

  const uploadUrl = process.env.R2_UPLOAD_URL;
  const uploadSecret = process.env.R2_UPLOAD_SECRET;
  if (!uploadUrl || !uploadSecret) {
    return {
      ok: false,
      error: "Konfigurasi Cloudflare R2 belum lengkap (R2_UPLOAD_URL / R2_UPLOAD_SECRET)",
    };
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
    const dotIndex = file.name.lastIndexOf(".");
    const baseName =
      slugify(dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name) ||
      "cover";
    const ext = dotIndex > 0 ? file.name.slice(dotIndex).toLowerCase() : "";
    const key = `covers/${Date.now()}-${baseName}${ext}`;

    const res = await fetch(`${uploadUrl}/upload?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        "x-upload-secret": uploadSecret,
        "x-file-type": file.type,
      },
      body: await file.arrayBuffer(),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; url?: string; error?: string }
      | null;

    if (!res.ok || !json?.ok || !json.url) {
      const reason =
        json?.error === "too_large"
          ? "Ukuran gambar melebihi batas"
          : json?.error === "unauthorized"
            ? "Kredensial upload ditolak"
            : json?.error ?? `HTTP ${res.status}`;
      return { ok: false, error: `Gagal unggah ke R2: ${reason}` };
    }

    return { ok: true, url: json.url };
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
