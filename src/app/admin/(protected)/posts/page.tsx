import type { Metadata } from "next";
import { FileText, Search } from "lucide-react";
import Link from "next/link";

import { adminListPosts } from "@/lib/db/queries";

import { PostRowActions } from "@/components/admin/post-row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts",
};

function formatDateShort(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const posts = await adminListPosts(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-normal tracking-tight">
            Posts
          </h1>
          <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">
            Kelola seluruh artikel blog kamu.
          </p>
        </div>
        <Button render={<Link href="/admin/posts/new" />}>
          Buat Post
        </Button>
      </div>

      <form
        action="/admin/posts"
        method="get"
        className="flex max-w-sm items-center gap-2"
      >
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari judul atau slug…"
          aria-label="Cari post"
        />
        <Button type="submit" variant="outline">
          <Search data-icon="inline-start" />
          Cari
        </Button>
      </form>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[var(--md-on-surface-variant)]">
          <FileText className="mb-2 size-8 opacity-50" />
          {q ? (
            <>
              <p>Tidak ada hasil untuk &ldquo;{q}&rdquo;</p>
              <Link
                href="/admin/posts"
                className="mt-1 text-[var(--md-primary)] underline-offset-4 hover:underline"
              >
                Reset pencarian
              </Link>
            </>
          ) : (
            <>
              <p>Belum ada post</p>
              <Link
                href="/admin/posts/new"
                className="mt-1 text-[var(--md-primary)] underline-offset-4 hover:underline"
              >
                Buat post pertama
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-2xl border border-[var(--md-outline-variant)] md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Dilihat</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const primaryTitle = post.titleId ?? post.titleEn ?? post.slug;
                const secondaryTitle =
                  post.titleId && post.titleEn && post.titleId !== post.titleEn
                    ? post.titleEn
                    : null;
                return (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="truncate font-medium hover:underline hover:underline-offset-4"
                        >
                          {primaryTitle}
                        </Link>
                        {secondaryTitle ? (
                          <span className="truncate text-xs text-[var(--md-on-surface-variant)]">
                            {secondaryTitle}
                          </span>
                        ) : (
                          <span className="truncate text-xs text-[var(--md-on-surface-variant)]">
                            /{post.slug}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[var(--md-on-surface-variant)]">
                      {formatNumber(post.viewsCount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[var(--md-on-surface-variant)]">
                      {formatDateShort(post.publishedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <PostRowActions id={post.id} title={primaryTitle} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-3 md:hidden">
          {posts.map((post) => {
            const primaryTitle = post.titleId ?? post.titleEn ?? post.slug;
            const secondaryTitle =
              post.titleId && post.titleEn && post.titleId !== post.titleEn
                ? post.titleEn
                : null;
            return (
              <div
                key={post.id}
                className="space-y-1.5 rounded-2xl bg-[var(--md-surface-container-low)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="min-w-0 flex-1 truncate font-medium hover:underline hover:underline-offset-4"
                  >
                    {primaryTitle}
                  </Link>
                  <StatusBadge status={post.status} />
                </div>
                <p className="truncate text-xs text-[var(--md-on-surface-variant)]">
                  {secondaryTitle ?? `/${post.slug}`}
                </p>
                <p className="text-xs tabular-nums text-[var(--md-on-surface-variant)]">
                  {formatNumber(post.viewsCount)} dilihat ·{" "}
                  {formatDateShort(post.publishedAt)}
                </p>
                <div className="flex justify-end">
                  <PostRowActions id={post.id} title={primaryTitle} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
