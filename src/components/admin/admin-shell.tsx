"use client";

import { ExternalLink, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

import { ADMIN_NAV_ITEMS, AdminNavLinks } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";

type AdminShellProps = {
  children: ReactNode;
  userName: string | null;
  userEmail: string | null;
};

function isActive(pathname: string | null, href: string): boolean {
  const path = pathname ?? "/admin";
  return href === "/admin" ? path === "/admin" : path.startsWith(href);
}

function getCurrentNavLabel(pathname: string | null): string {
  const sorted = [...ADMIN_NAV_ITEMS].sort(
    (a, b) => b.href.length - a.href.length
  );
  return (
    sorted.find((item) => isActive(pathname, item.href))?.label ?? "Dashboard"
  );
}

const footerItemClass =
  "flex h-12 items-center gap-3 rounded-full px-4 text-sm font-medium text-[var(--md-on-surface-variant)] transition-colors hover:bg-[color-mix(in_srgb,var(--md-on-surface)_6%,transparent)] hover:text-[var(--md-on-surface)]";

const brandChipClass =
  "rounded-full bg-[var(--md-primary-container)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--md-on-primary-container)]";

export function AdminShell({ children, userName, userEmail }: AdminShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }
  const initial = (userName ?? userEmail ?? "A").charAt(0).toUpperCase();
  const currentLabel = getCurrentNavLabel(pathname);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] md:flex">
        <div className="flex h-16 shrink-0 items-center gap-2 px-5">
          <Link
            href="/admin"
            className="text-lg font-medium tracking-tight"
          >
            BlogKu
          </Link>
          <span className={brandChipClass}>Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <AdminNavLinks />
        </nav>
        <div className="flex shrink-0 flex-col gap-1 border-t border-[var(--md-outline-variant)] p-3">
          <a
            href="/id/blog"
            target="_blank"
            rel="noreferrer"
            className={footerItemClass}
          >
            <ExternalLink className="size-5 shrink-0" />
            Lihat Blog
          </a>
          <LogoutButton />
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--md-outline-variant)] bg-[color-mix(in_srgb,var(--md-surface)_88%,transparent)] px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buka menu navigasi"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <span className="truncate text-lg font-normal">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden size-9 items-center justify-center rounded-full bg-[var(--md-primary-container)] text-sm font-semibold text-[var(--md-on-primary-container)] sm:flex">
              {initial}
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">
                {userName ?? "Admin"}
              </p>
              <p className="text-xs leading-tight text-[var(--md-on-surface-variant)]">
                {userEmail}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={closeDrawer}
            className="md3-mdrawer-scrim absolute inset-0 cursor-default bg-black/32"
          />
          <aside className="md3-mdrawer-panel absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--md-surface-container-low)] shadow-[var(--md-shadow-3)]">
            <div className="flex h-16 shrink-0 items-center justify-between pl-5 pr-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  onClick={closeDrawer}
                  className="text-lg font-medium tracking-tight"
                >
                  BlogKu
                </Link>
                <span className={brandChipClass}>Admin</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup menu navigasi"
                onClick={closeDrawer}
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              <AdminNavLinks onNavigate={closeDrawer} />
            </nav>
            <div className="flex shrink-0 flex-col gap-1 border-t border-[var(--md-outline-variant)] p-3">
              <a
                href="/id/blog"
                target="_blank"
                rel="noreferrer"
                onClick={closeDrawer}
                className={footerItemClass}
              >
                <ExternalLink className="size-5 shrink-0" />
                Lihat Blog
              </a>
              <LogoutButton onNavigate={closeDrawer} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
