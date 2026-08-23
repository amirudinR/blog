"use client";

import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/kategori", label: "Kategori", icon: FolderOpen },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/comments", label: "Komentar", icon: MessageSquare },
  { href: "/admin/subscribers", label: "Subscriber", icon: Users },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[48px] items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]"
                : "text-[var(--md-on-surface-variant)] hover:bg-[color-mix(in_srgb,var(--md-on-surface)_6%,transparent)] hover:text-[var(--md-on-surface)]"
            )}
          >
            <Icon
              className="size-5 shrink-0"
              strokeWidth={active ? 2.5 : undefined}
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
