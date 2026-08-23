import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { listComments, type AdminCommentRow } from "@/lib/db/queries";

import { CommentActions } from "@/components/admin/comment-actions";
import { CommentContent } from "@/components/admin/comment-content";
import { StatusBadge } from "@/components/admin/status-badge";
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
        <h1 className="font-heading text-2xl font-normal tracking-tight">
          Komentar
        </h1>
        <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">
          Moderasi komentar pembaca sebelum tampil di artikel.
        </p>
      </div>

      <nav
        aria-label="Filter status komentar"
        className="inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-[var(--md-surface-container-high)] p-1"
      >
        {FILTERS.map((filter) => {
          const active = filter.value === activeFilter;
          return (
            <Link
              key={filter.value}
              href={`/admin/comments?status=${filter.value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]"
                  : "text-[var(--md-on-surface-variant)] hover:bg-[color-mix(in_srgb,var(--md-on-surface)_8%,transparent)]"
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
        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[var(--md-on-surface-variant)]">
          <MessageSquare className="mb-2 size-8 opacity-50" />
          <p>
            {activeFilter === "all"
              ? "Belum ada komentar"
              : `Tidak ada komentar ${FILTERS.find((f) => f.value === activeFilter)?.label.toLowerCase()}`}
          </p>
          <p className="max-w-xs">
            Komentar baru dari pembaca akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-2xl border border-[var(--md-outline-variant)] md:block">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell className="whitespace-nowrap text-sm tabular-nums text-[var(--md-on-surface-variant)]">
                    {formatDateTime(comment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-44 flex-col">
                      <span className="truncate font-medium">
                        {comment.authorName}
                      </span>
                      <span className="truncate text-xs text-[var(--md-on-surface-variant)]">
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
                        className="line-clamp-2 max-w-40 text-sm hover:underline hover:underline-offset-4"
                        title={comment.postTitle ?? comment.postSlug}
                      >
                        {comment.postTitle ?? `/${comment.postSlug}`}
                      </Link>
                    ) : (
                      <span className="text-sm text-[var(--md-on-surface-variant)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={comment.status} />
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
              className="space-y-2 rounded-2xl bg-[var(--md-surface-container-low)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{comment.authorName}</p>
                  <p className="truncate text-xs text-[var(--md-on-surface-variant)]">
                    {comment.authorEmail}
                  </p>
                </div>
                <StatusBadge status={comment.status} />
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
              {comment.postSlug ? (
                <Link
                  href={`/id/blog/${comment.postSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm hover:underline hover:underline-offset-4"
                >
                  {comment.postTitle ?? `/${comment.postSlug}`}
                </Link>
              ) : null}
              <p className="text-xs tabular-nums text-[var(--md-on-surface-variant)]">
                {formatDateTime(comment.createdAt)}
              </p>
              <div className="flex justify-end">
                <CommentActions id={comment.id} status={comment.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
