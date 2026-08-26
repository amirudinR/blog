"use client";

import {
  BookOpen,
  Bookmark,
  Compass,
  Home,
  Info,
  Menu,
  Newspaper,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/blog/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";

import enDict from "@/lib/i18n/dictionaries/en.json";
import idDict from "@/lib/i18n/dictionaries/id.json";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type NavbarProps = {
  locale: Locale;
};

const NAV_LINKS = [
  { key: "home", href: "", icon: Home },
  { key: "blog", href: "/blog", icon: Newspaper },
  { key: "toc", href: "/daftar-isi", icon: Compass },
  { key: "about", href: "/tentang", icon: Info },
] as const;

function stripLocale(pathname: string | null): string {
  return (pathname ?? "").replace(/^\/(id|en)(?=\/|$)/, "");
}

function isActive(current: string, href: string): boolean {
  if (href === "") return current === "" || current === "/";
  return current === href || current.startsWith(`${href}/`);
}

export function Navbar({ locale }: NavbarProps) {
  const dict = (locale === "id" ? idDict : enDict) as Dictionary;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          {dict.site.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(stripLocale(pathname), link.href);
            return (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
                {dict.nav[link.key]}
              </Link>
            );
          })}
          <div className="mx-2 h-5 w-px bg-border" aria-hidden />
          <Link
            href={`/${locale}/cari`}
            aria-label={dict.nav.search}
            title={dict.nav.search}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="size-[18px]" aria-hidden />
          </Link>
          <Link
            href={`/${locale}/tersimpan`}
            aria-label={dict.saved.title}
            title={dict.saved.title}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bookmark className="size-[18px]" aria-hidden />
          </Link>
          <ThemeToggle />
          <LanguageSwitcher locale={locale} className="ml-1" />
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px]"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-16 z-50 border-b border-border/70 bg-background shadow-lg md:hidden">
            <nav className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = isActive(stripLocale(pathname), link.href);
                return (
                  <Link
                    key={link.key}
                    href={`/${locale}${link.href}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden />
                    {dict.nav[link.key]}
                  </Link>
                );
              })}
              <Link
                href={`/${locale}/cari`}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setOpen(false)}
              >
                <Search className="size-[18px] shrink-0" aria-hidden />
                {dict.nav.search}
              </Link>
              <Link
                href={`/${locale}/tersimpan`}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setOpen(false)}
              >
                <Bookmark className="size-[18px] shrink-0" aria-hidden />
                {dict.saved.title}
              </Link>
              <Link
                href={`/${locale}/kisah-nabi`}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setOpen(false)}
              >
                <BookOpen className="size-[18px] shrink-0" aria-hidden />
                {dict.nav.prophets}
              </Link>
              <div className="mt-2 flex items-center gap-2 px-3 pb-2">
                <ThemeToggle />
                <LanguageSwitcher locale={locale} />
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
