"use client";

import { ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AdminMenuNavItems,
  AdminSidebarNav,
} from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";

type AdminShellProps = {
  children: ReactNode;
  userName: string | null;
  userEmail: string | null;
};

export function AdminShell({
  children,
  userName,
  userEmail,
}: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (userName ?? userEmail ?? "A").charAt(0).toUpperCase();

  function handleLogout() {
    void (async () => {
      await fetch("/api/auth/session", { method: "DELETE" });
      window.location.href = "/admin/login";
    })();
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <Link
            href="/admin"
            className="font-heading text-xl font-bold tracking-tight"
          >
            BlogKu
          </Link>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <AdminSidebarNav />
        </nav>
        <div className="space-y-1 border-t border-sidebar-border p-3">
          <a
            href="/id/blog"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <ExternalLink className="size-4 shrink-0" />
            Lihat Blog
          </a>
          <LogoutButton />
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-1 md:hidden">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Buka menu navigasi"
                  >
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="w-52">
                <AdminMenuNavItems />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <a href="/id/blog" target="_blank" rel="noreferrer" />
                  }
                >
                  <ExternalLink className="size-4" />
                  Lihat Blog
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="font-heading text-lg font-bold tracking-tight">
              BlogKu
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary max-sm:hidden sm:flex">
              {initial}
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">
                {userName ?? "Admin"}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">
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
    </div>
  );
}
