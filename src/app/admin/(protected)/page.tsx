import type { Metadata } from "next";
import {
  Eye,
  FileText,
  MessageSquare,
  PenLine,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";

import {
  adminListPosts,
  getAdminStats,
} from "@/lib/db/queries";

import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

function formatDateShort(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const [stats, posts] = await Promise.all([getAdminStats(), adminListPosts()]);
  const recent = posts.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-normal tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">
          Ringkasan aktivitas blog kamu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<FileText className="size-5" />}
          value={stats.totalPosts}
          label="Total Post"
          tone="primary"
          href="/admin/posts"
        />
        <StatCard
          icon={<Send className="size-5" />}
          value={stats.publishedPosts}
          label="Terpublikasi"
          tone="tertiary"
        />
        <StatCard
          icon={<PenLine className="size-5" />}
          value={stats.draftPosts}
          label="Draft"
          tone="neutral"
          href="/admin/posts"
        />
        <StatCard
          icon={<Eye className="size-5" />}
          value={stats.totalViews}
          label="Total Dilihat"
          tone="secondary"
        />
        <StatCard
          icon={<MessageSquare className="size-5" />}
          value={stats.pendingComments}
          label="Komentar Pending"
          tone={stats.pendingComments > 0 ? "danger" : "neutral"}
          href="/admin/comments"
        />
        <StatCard
          icon={<Users className="size-5" />}
          value={stats.subscribers}
          label="Subscriber"
          tone="neutral"
          href="/admin/subscribers"
        />
      </div>

      <Card>
        <CardHeader className="border-b [.border-b]:pb-(--card-spacing)">
          <CardTitle>Post Terbaru</CardTitle>
          <CardDescription>5 post yang terakhir diperbarui.</CardDescription>
          <CardAction>
            <Link
              href="/admin/posts"
              className="text-sm font-medium text-[var(--md-primary)] underline-offset-4 hover:underline"
            >
              Kelola Posts
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-[var(--md-on-surface-variant)]">
              Belum ada post.{" "}
              <Link
                href="/admin/posts/new"
                className="font-medium text-[var(--md-primary)] underline-offset-4 hover:underline"
              >
                Buat post pertama
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-[color-mix(in_srgb,var(--md-outline-variant)_70%,transparent)]">
              {recent.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusBadge status={post.status} />
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="min-w-0 truncate text-sm font-medium hover:text-[var(--md-primary)] hover:underline hover:underline-offset-4"
                    >
                      {post.titleId ?? post.titleEn ?? post.slug}
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-[var(--md-on-surface-variant)]">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3" />
                      {new Intl.NumberFormat("id-ID").format(post.viewsCount)}
                    </span>
                    <span>{formatDateShort(post.publishedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
