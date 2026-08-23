"use client";

import { Check, ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

import { ADMIN_NAV_ITEMS, AdminSidebarNav } from "@/components/admin/admin-nav";
import { LogoutButton, performLogout } from "@/components/admin/logout-button";

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

export function AdminShell({
  children,
  userName,
  userEmail,
}: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const initial = (userName ?? userEmail ?? "A").charAt(0).toUpperCase();
  const currentLabel = getCurrentNavLabel(pathname);

  function handleLogout() {
    void performLogout();
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
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      render={<Link href={item.href} />}
                      className={cn(active && "bg-accent text-accent-foreground")}
                    >
                      <Icon className="size-4" />
                      {item.label}
                      {active && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                  );
                })}
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
              {currentLabel}
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
