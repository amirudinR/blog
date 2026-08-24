"use client";

import { Menu, Search, X } from "lucide-react";
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

type NavbarProps = {
  locale: Locale;
};

const NAV_LINKS = [
  { key: "home", href: "" },
  { key: "blog", href: "/blog" },
  { key: "prophets", href: "/kisah-nabi" },
  { key: "toc", href: "/daftar-isi" },
  { key: "about", href: "/tentang" },
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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          {dict.site.name}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className={`text-sm font-medium transition-colors ${
                isActive(stripLocale(pathname), link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dict.nav[link.key]}
            </Link>
          ))}
          <Link
            href={`/${locale}/cari`}
            aria-label={dict.nav.search}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-5" />
          </Link>
          <ThemeToggle />
          <LanguageSwitcher locale={locale} />
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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={`/${locale}${link.href}`}
                  className={`rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(stripLocale(pathname), link.href)
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {dict.nav[link.key]}
                </Link>
              ))}
              <Link
                href={`/${locale}/cari`}
                className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setOpen(false)}
              >
                <Search className="size-4" />
                {dict.nav.search}
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
