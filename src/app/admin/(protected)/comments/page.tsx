import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { listComments, type AdminCommentRow } from "@/lib/db/queries";

import { CommentActions } from "@/components/admin/comment-actions";
import { CommentContent } from "@/components/admin/comment-content";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Komentar",
};

const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
] as const;

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function CommentStatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        Disetujui
      </Badge>
    );
  }
  if (status === "rejected") {
    return <Badge variant="destructive">Ditolak</Badge>;
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
      Pending
    </Badge>
  );
}

function countByStatus(rows: AdminCommentRow[], status: string): number {
  if (status === "all") return rows.length;
  return rows.filter((row) => row.status === status).length;
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = FILTERS.some((f) => f.value === status)
    ? (status as string)
    : "pending";

  const allComments = await listComments();
  const rows =
    activeFilter === "all"
      ? allComments
      : allComments.filter((row) => row.status === activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Komentar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderasi komentar pembaca sebelum tampil di artikel.
        </p>
      </div>

      <nav
        aria-label="Filter status komentar"
        className="inline-flex w-fit items-center gap-0.5 rounded-lg bg-muted p-[3px]"
      >
        {FILTERS.map((filter) => {
          const active = filter.value === activeFilter;
          return (
            <Link
              key={filter.value}
              href={`/admin/comments?status=${filter.value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
              <span className="text-xs tabular-nums opacity-70">
                {countByStatus(allComments, filter.value)}
              </span>
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <MessageSquare className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">
            {activeFilter === "all"
              ? "Belum ada komentar"
              : `Tidak ada komentar ${FILTERS.find((f) => f.value === activeFilter)?.label.toLowerCase()}`}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Komentar baru dari pembaca akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Komentar</TableHead>
                <TableHead>Artikel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(comment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-44">
                      <span className="truncate font-medium">
                        {comment.authorName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {comment.authorEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CommentContent content={comment.content} />
                  </TableCell>
                  <TableCell>
                    {comment.postSlug ? (
                      <Link
                        href={`/id/blog/${comment.postSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 max-w-40 text-sm hover:text-primary hover:underline hover:underline-offset-4"
                        title={comment.postTitle ?? comment.postSlug}
                      >
                        {comment.postTitle ?? `/${comment.postSlug}`}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <CommentStatusBadge status={comment.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <CommentActions id={comment.id} status={comment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3 md:hidden">
          {rows.map((comment) => (
            <div
              key={comment.id}
              className="space-y-2 rounded-lg border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{comment.authorName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {comment.authorEmail}
                  </p>
                </div>
                <CommentStatusBadge status={comment.status} />
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
              {comment.postSlug ? (
                <Link
                  href={`/id/blog/${comment.postSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm hover:text-primary hover:underline hover:underline-offset-4"
                >
                  {comment.postTitle ?? `/${comment.postSlug}`}
                </Link>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {formatDateTime(comment.createdAt)}
              </p>
              <CommentActions id={comment.id} status={comment.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
