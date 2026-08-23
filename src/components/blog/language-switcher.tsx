"use client";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
  className?: string;
};

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

function setLocaleCookie(value: Locale) {
  document.cookie = `locale=${value};path=/;max-age=31536000`;
}

export function LanguageSwitcher({ locale, className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    const current = pathname ?? `/${locale}`;
    const target = current.replace(/^\/(id|en)/, `/${next}`);
    setLocaleCookie(next);
    router.push(target);
  }

  return (
    <div
      role="group"
      aria-label="Ganti bahasa / Switch language"
      className={cn(
        "flex h-8 items-center rounded-full border border-border/70 bg-muted/50 p-0.5",
        className
      )}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === locale;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            aria-label={`Bahasa ${opt.label === "ID" ? "Indonesia" : "English"}`}
            onClick={() => switchTo(opt.value)}
            className={cn(
              "h-7 rounded-full px-3 text-xs font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
