import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatTone = "primary" | "secondary" | "tertiary" | "neutral" | "danger";

type StatCardProps = {
  icon: ReactNode;
  value: number;
  label: string;
  tone?: StatTone;
  href?: string;
};

const TONE_STYLES: Record<StatTone, CSSProperties> = {
  primary: {
    backgroundColor: "var(--md-primary-container)",
    color: "var(--md-on-primary-container)",
  },
  secondary: {
    backgroundColor: "var(--md-secondary-container)",
    color: "var(--md-on-secondary-container)",
  },
  tertiary: {
    backgroundColor: "var(--md-tertiary-container)",
    color: "var(--md-on-tertiary-container)",
  },
  neutral: {
    backgroundColor: "var(--md-surface-container)",
    color: "var(--md-on-surface)",
  },
  danger: {
    backgroundColor: "var(--md-error-container)",
    color: "var(--md-on-error-container)",
  },
};

export function StatCard({
  icon,
  value,
  label,
  tone = "neutral",
  href,
}: StatCardProps) {
  const formatted = new Intl.NumberFormat("id-ID").format(value);

  const body = (
    <div
      style={TONE_STYLES[tone]}
      className={cn(
        "flex flex-col gap-3 rounded-[24px] p-5 transition-all duration-300 ease-out",
        href
          ? "hover:shadow-[var(--md-shadow-2)]"
          : "shadow-[var(--md-shadow-1)]"
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-[color-mix(in_srgb,currentColor_12%,transparent)]">
        {icon}
      </span>
      <span className="text-3xl font-normal tracking-tight tabular-nums sm:text-4xl">
        {formatted}
      </span>
      <p className="text-[13px] font-medium opacity-80">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[24px] outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--md-primary)_40%,transparent)]"
      >
        {body}
      </Link>
    );
  }

  return body;
}
