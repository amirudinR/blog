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
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan aktivitas blog kamu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<FileText className="size-4" />}
          value={stats.totalPosts}
          label="Total Post"
          href="/admin/posts"
        />
        <StatCard
          icon={<Send className="size-4" />}
          value={stats.publishedPosts}
          label="Terpublikasi"
        />
        <StatCard
          icon={<PenLine className="size-4" />}
          value={stats.draftPosts}
          label="Draft"
          href="/admin/posts"
        />
        <StatCard
          icon={<Eye className="size-4" />}
          value={stats.totalViews}
          label="Total Dilihat"
        />
        <StatCard
          icon={<MessageSquare className="size-4" />}
          value={stats.pendingComments}
          label="Komentar Pending"
          tone={stats.pendingComments > 0 ? "amber" : "default"}
          href="/admin/comments"
        />
        <StatCard
          icon={<Users className="size-4" />}
          value={stats.subscribers}
          label="Subscriber"
          href="/admin/subscribers"
        />
      </div>

      <Card>
        <CardHeader className="border-b [.border-b]:pb-(--card-spacing)">
          <CardTitle>Post Terbaru</CardTitle>
          <CardDescription>5 post yang terakhir diperbarui.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {recent.length === 0 ? (
            <p className="px-(--card-spacing) py-6 text-sm text-muted-foreground">
              Belum ada post.{" "}
              <Link
                href="/admin/posts/new"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Buat post pertama
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-3 px-(--card-spacing) py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusBadge status={post.status} />
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="min-w-0 truncate text-sm font-medium hover:text-primary hover:underline hover:underline-offset-4"
                    >
                      {post.titleId ?? post.titleEn ?? post.slug}
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3" />
                      {new Intl.NumberFormat("id-ID").format(post.viewsCount)}
                    </span>
                    <span>{formatDateShort(post.publishedAt)}</span>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Kelola
                    </Link>
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
