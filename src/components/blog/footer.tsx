import Link from "next/link";

import enDict from "@/lib/i18n/dictionaries/en.json";
import idDict from "@/lib/i18n/dictionaries/id.json";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type FooterProps = {
  locale: Locale;
};

export function Footer({ locale }: FooterProps) {
  const dict = (locale === "id" ? idDict : enDict) as Dictionary;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/70">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-heading text-lg font-bold tracking-tight text-foreground">
              {dict.site.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {dict.site.description}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link
              href={`/${locale}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dict.nav.blog}
            </Link>
            <Link
              href={`/${locale}/tentang`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dict.nav.about}
            </Link>
            <Link
              href={`/${locale}/cari`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dict.nav.search}
            </Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year}{" "}
            <Link href={`/${locale}`} className="hover:text-foreground">
              {dict.site.name}
            </Link>
            {" · "}
            {dict.footer.rights}
          </p>
          <p>{dict.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
