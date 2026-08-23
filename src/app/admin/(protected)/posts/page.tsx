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
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <FileText className="size-8 text-muted-foreground/50" />
          {q ? (
            <>
              <p className="text-sm font-medium">
                Tidak ada hasil untuk &ldquo;{q}&rdquo;
              </p>
              <Link
                href="/admin/posts"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Reset pencarian
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">Belum ada post</p>
              <Link
                href="/admin/posts/new"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Buat post pertama
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                          className="truncate font-medium hover:text-primary hover:underline hover:underline-offset-4"
                        >
                          {primaryTitle}
                        </Link>
                        {secondaryTitle ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {secondaryTitle}
                          </span>
                        ) : (
                          <span className="truncate text-xs text-muted-foreground">
                            /{post.slug}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatNumber(post.viewsCount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
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
                className="space-y-2 rounded-lg border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="min-w-0 flex-1 truncate font-medium hover:text-primary hover:underline hover:underline-offset-4"
                  >
                    {primaryTitle}
                  </Link>
                  <StatusBadge status={post.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {secondaryTitle ?? `/${post.slug}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(post.viewsCount)} dilihat ·{" "}
                  {formatDateShort(post.publishedAt)}
                </p>
                <PostRowActions id={post.id} title={primaryTitle} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
