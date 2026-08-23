import { z } from "zod";

export const postTranslationSchema = z.object({
  locale: z.enum(["id", "en"]),
  title: z.string().min(1, "Judul tidak boleh kosong"),
  excerpt: z.string().nullish(),
  contentMarkdown: z.string().min(1, "Konten tidak boleh kosong"),
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
});

export const postInputSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().min(1, "Slug tidak boleh kosong"),
  status: z.enum(["draft", "published"]),
  coverImageUrl: z
    .union([z.url("URL cover tidak valid"), z.literal("")])
    .nullish(),
  categoryId: z.string().min(1).nullable(),
  publishedAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal tidak valid")
    .nullish(),
  translations: z.array(postTranslationSchema),
  tagIds: z.array(z.string()),
});

export type PostTranslationSchema = z.infer<typeof postTranslationSchema>;
export type PostInputSchema = z.input<typeof postInputSchema>;

export const taxonomyInputSchema = z.object({
  id: z.string().min(1).optional(),
  nameId: z.string().trim().min(1, "Nama (ID) tidak boleh kosong"),
  nameEn: z.string().trim().default(""),
});

export type TaxonomyInputSchema = z.input<typeof taxonomyInputSchema>;
