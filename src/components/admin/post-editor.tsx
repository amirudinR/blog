"use client";

import {
  ArrowLeft,
  Eye,
  ImageIcon,
  Loader2,
  PencilLine,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { savePost } from "@/app/admin/actions";
import { uploadCoverImage } from "@/app/admin/upload-action";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils/blog";

type EditorTranslation = {
  locale: "id" | "en";
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type SerializedPost = {
  id: string;
  slug: string;
  status: "draft" | "published";
  coverImageUrl: string | null;
  categoryId: string | null;
  publishedAt: string | null;
  translations: EditorTranslation[];
  tagIds: string[];
};

type EditorCategory = { id: string; nameId: string };
type EditorTag = { id: string; nameId: string; nameEn: string | null };

type PostEditorProps = {
  mode: "create" | "edit";
  initial?: SerializedPost;
  categories: EditorCategory[];
  tags: EditorTag[];
};

function translationFor(
  translations: EditorTranslation[] | undefined,
  locale: "id" | "en"
) {
  const found = translations?.find((t) => t.locale === locale);
  return {
    title: found?.title ?? "",
    excerpt: found?.excerpt ?? "",
    contentMarkdown: found?.contentMarkdown ?? "",
    metaTitle: found?.metaTitle ?? "",
    metaDescription: found?.metaDescription ?? "",
  };
}

function formatDateTimeId(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PostEditor({
  mode,
  initial,
  categories,
  tags,
}: PostEditorProps) {
  const router = useRouter();
  const idTr = translationFor(initial?.translations, "id");
  const enTr = translationFor(initial?.translations, "en");

  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status ?? "draft"
  );
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.coverImageUrl ?? ""
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.categoryId ?? null
  );
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);

  const [titleId, setTitleId] = useState(idTr.title);
  const [excerptId, setExcerptId] = useState(idTr.excerpt);
  const [contentId, setContentId] = useState(idTr.contentMarkdown);
  const [metaTitleId, setMetaTitleId] = useState(idTr.metaTitle);
  const [metaDescId, setMetaDescId] = useState(idTr.metaDescription);

  const [titleEn, setTitleEn] = useState(enTr.title);
  const [excerptEn, setExcerptEn] = useState(enTr.excerpt);
  const [contentEn, setContentEn] = useState(enTr.contentMarkdown);
  const [metaTitleEn, setMetaTitleEn] = useState(enTr.metaTitle);
  const [metaDescEn, setMetaDescEn] = useState(enTr.metaDescription);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTitleIdChange(value: string) {
    setTitleId(value);
    if (!slugTouched) setSlug(slugify(value));
    clearError("titleId");
  }

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (!slugTouched) setSlug(slugify(value));
    clearError("titleEn");
  }

  function clearError(key: string) {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function toggleTag(id: string) {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya berkas gambar yang diizinkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadCoverImage(formData);
      if (result.ok) {
        setCoverImageUrl(result.url);
        toast.success("Cover berhasil diunggah");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Gagal upload gambar. Coba lagi atau tempel URL.");
    } finally {
      setUploading(false);
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!titleId.trim()) next.titleId = "Judul (ID) wajib diisi";
    if (!contentId.trim()) next.contentId = "Konten (ID) wajib diisi";
    if (!slug.trim()) next.slug = "Slug wajib diisi";
    if (titleEn.trim() && !contentEn.trim()) {
      next.contentEn = "Konten EN wajib jika judul EN diisi";
    }
    if (!titleEn.trim() && contentEn.trim()) {
      next.titleEn = "Judul EN wajib jika konten EN diisi";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function doSave(target: "draft" | "published") {
    setStatus(target);
    if (!validate()) {
      toast.error("Lengkapi data yang belum valid");
      return;
    }

    setSaving(true);
    try {
      const translations = [
        {
          locale: "id" as const,
          title: titleId.trim(),
          excerpt: excerptId.trim() || null,
          contentMarkdown: contentId,
          metaTitle: metaTitleId.trim() || null,
          metaDescription: metaDescId.trim() || null,
        },
        ...(titleEn.trim()
          ? [
              {
                locale: "en" as const,
                title: titleEn.trim(),
                excerpt: excerptEn.trim() || null,
                contentMarkdown: contentEn,
                metaTitle: metaTitleEn.trim() || null,
                metaDescription: metaDescEn.trim() || null,
              },
            ]
          : []),
      ];

      const result = await savePost({
        id: initial?.id,
        slug: slug.trim(),
        status: target,
        coverImageUrl: coverImageUrl,
        categoryId,
        publishedAt: initial?.publishedAt ?? null,
        translations,
        tagIds,
      });

      if (result.ok) {
        toast.success(
          target === "published"
            ? mode === "create"
              ? "Post berhasil dipublikasikan"
              : "Post diperbarui dan dipublikasikan"
            : mode === "create"
              ? "Draft berhasil disimpan"
              : "Perubahan draft tersimpan"
        );
        if (mode === "create") {
          router.push("/admin/posts");
        } else {
          router.refresh();
          setLastSavedAt(new Date());
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void doSave(status);
  }

  function renderLocaleFields(locale: "id" | "en") {
    const isId = locale === "id";
    const title = isId ? titleId : titleEn;
    const setTitle = isId ? handleTitleIdChange : handleTitleEnChange;
    const excerpt = isId ? excerptId : excerptEn;
    const setExcerpt = isId ? setExcerptId : setExcerptEn;
    const content = isId ? contentId : contentEn;
    const setContent = isId ? setContentId : setContentEn;
    const errorKey = isId ? "titleId" : "titleEn";
    const contentErrorKey = isId ? "contentId" : "contentEn";

    return (
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor={`judul-${locale}`}>
            Judul {isId ? "(Indonesia)" : "(English)"}
            {!isId && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                opsional
              </span>
            )}
          </Label>
          <Input
            id={`judul-${locale}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorKey) clearError(errorKey);
            }}
            placeholder={isId ? "Judul artikel…" : "Post title…"}
            aria-invalid={Boolean(errors[errorKey])}
          />
          {errors[errorKey] && (
            <p className="text-xs text-destructive">{errors[errorKey]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`excerpt-${locale}`}>Excerpt</Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {excerpt.length}/300
            </span>
          </div>
          <Textarea
            id={`excerpt-${locale}`}
            value={excerpt}
            maxLength={300}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Ringkasan singkat artikel…"
            className="min-h-20"
          />
        </div>

        <Tabs defaultValue="sunting">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`konten-${locale}`}>Konten Markdown</Label>
            <TabsList>
              <TabsTrigger value="sunting">
                <PencilLine className="size-3.5" data-icon="inline-start" />
                Sunting
              </TabsTrigger>
              <TabsTrigger value="pratinjau">
                <Eye className="size-3.5" data-icon="inline-start" />
                Pratinjau
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="sunting" className="mt-2 space-y-1.5">
            <Textarea
              id={`konten-${locale}`}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                clearError(contentErrorKey);
              }}
              placeholder="Tulis konten dalam format Markdown…"
              className={cn(
                "min-h-[400px] font-mono text-sm leading-relaxed",
                errors[contentErrorKey] && "border-destructive"
              )}
              aria-invalid={Boolean(errors[contentErrorKey])}
            />
            {errors[contentErrorKey] && (
              <p className="text-xs text-destructive">
                {errors[contentErrorKey]}
              </p>
            )}
          </TabsContent>
          <TabsContent value="pratinjau" className="mt-2">
            {content.trim() ? (
              <div className="max-h-[480px] overflow-y-auto rounded-lg border bg-card p-5">
                <MarkdownContent markdown={content} />
              </div>
            ) : (
              <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Belum ada konten untuk dipratinjau
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  function renderSeoGroup(
    label: string,
    title: string,
    setTitle: (v: string) => void,
    description: string,
    setDescription: (v: string) => void
  ) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-normal">Meta title</Label>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {title.length}/60
            </span>
          </div>
          <Input
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-normal">Meta description</Label>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {description.length}/160
            </span>
          </div>
          <Textarea
            value={description}
            maxLength={160}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            render={<Link href="/admin/posts" />}
            aria-label="Kembali ke daftar post"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Badge
            className={
              status === "published"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : ""
            }
            variant={status === "published" ? undefined : "secondary"}
          >
            {status === "published" ? "Terpublikasi" : "Draft"}
          </Badge>
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            /{slug || "slug-belum-diisi"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastSavedAt && (
            <span className="mr-1 hidden text-xs text-muted-foreground md:inline">
              Tersimpan {formatDateTimeId(lastSavedAt)}
            </span>
          )}
          {status === "published" ? (
            <Button
              type="button"
              disabled={saving}
              onClick={() => void doSave("published")}
            >
              {saving ? <Loader2 className="animate-spin" /> : null}
              Simpan
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => void doSave("draft")}
              >
                Simpan Draft
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={() => void doSave("published")}
              >
                {saving ? <Loader2 className="animate-spin" /> : null}
                Publikasikan
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 contents lg:block lg:space-y-6">
          <Card className="order-3">
            <CardContent className="pt-(--card-spacing)">
              <Tabs defaultValue="id">
                <TabsList className="w-full max-w-xs">
                  <TabsTrigger value="id" className="flex-1">
                    Bahasa Indonesia
                  </TabsTrigger>
                  <TabsTrigger value="en" className="flex-1">
                    English
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="id" className="pt-5">
                  {renderLocaleFields("id")}
                </TabsContent>
                <TabsContent value="en" className="pt-5">
                  {renderLocaleFields("en")}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="order-6">
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {renderSeoGroup(
                "SEO ID",
                metaTitleId,
                setMetaTitleId,
                metaDescId,
                setMetaDescId
              )}
              {renderSeoGroup(
                "SEO EN",
                metaTitleEn,
                setMetaTitleEn,
                metaDescEn,
                setMetaDescEn
              )}
            </CardContent>
          </Card>
        </div>

        <div className="contents lg:block lg:space-y-6">
          <Card size="sm" className="order-1">
            <CardHeader>
              <CardTitle>Publikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                    clearError("slug");
                  }}
                  placeholder="judul-artikel"
                  aria-invalid={Boolean(errors.slug)}
                />
                {errors.slug ? (
                  <p className="text-xs text-destructive">{errors.slug}</p>
                ) : (
                  <p className="truncate text-xs text-muted-foreground">
                    /id/blog/{slug || "…"}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    const next = value as "draft" | "published";
                    if (
                      next === "draft" &&
                      status === "published" &&
                      !window.confirm(
                        "Ubah jadi draft? Post akan hilang dari blog."
                      )
                    ) {
                      return;
                    }
                    setStatus(next);
                  }}
                >
                  <SelectTrigger className="w-full" aria-label="Status post">
                    <SelectValue>
                      {status === "published" ? "Terpublikasi" : "Draft"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Terpublikasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="rounded-md bg-muted/60 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
                {initial?.publishedAt
                  ? `Diterbitkan ${formatDateTimeId(new Date(initial.publishedAt))}`
                  : "Tanggal terbit diisi otomatis saat pertama kali publikasi."}
              </p>
            </CardContent>
          </Card>

          <Card size="sm" className="order-2">
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coverImageUrl ? (
                <div className="relative overflow-hidden rounded-lg border">
                  <Image
                    src={coverImageUrl}
                    alt="Pratinjau cover"
                    width={640}
                    height={360}
                    unoptimized
                    className="h-36 w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    className="absolute top-1.5 right-1.5"
                    aria-label="Hapus cover"
                    onClick={() => setCoverImageUrl("")}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-36 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground">
                  <ImageIcon className="size-6 opacity-50" />
                  <span className="text-xs">Belum ada cover</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                id="cover-upload-input"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                render={<label htmlFor="cover-upload-input" />}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Upload data-icon="inline-start" />
                )}
                {uploading ? "Mengunggah…" : "Unggah Gambar"}
              </Button>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="cover-url" className="text-xs">
                  atau tempel URL gambar
                </Label>
                <Input
                  id="cover-url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="order-4">
            <CardHeader>
              <CardTitle>Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={categoryId === null ? "none" : String(categoryId)}
                onValueChange={(value) =>
                  setCategoryId(value === "none" ? null : value)
                }
              >
                <SelectTrigger className="w-full" aria-label="Kategori post">
                  <SelectValue>
                    {categoryId === null
                      ? "Tanpa kategori"
                      : (categories.find((c) => c.id === categoryId)?.nameId ??
                        "Tanpa kategori")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.nameId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card size="sm" className="order-5">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Belum ada tag tersedia.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const active = tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        {tag.nameId}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
