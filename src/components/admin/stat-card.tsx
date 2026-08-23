import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: ReactNode;
  value: number;
  label: string;
  tone?: "default" | "amber";
  href?: string;
};

export function StatCard({
  icon,
  value,
  label,
  tone = "default",
  href,
}: StatCardProps) {
  const formatted = new Intl.NumberFormat("id-ID").format(value);

  const body = (
    <Card
      size="sm"
      className={cn(
        "gap-2 transition-shadow hover:shadow-sm",
        tone === "amber" && "bg-amber-500/5 ring-amber-500/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            tone === "amber"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "font-heading text-3xl font-bold tracking-tight tabular-nums",
            tone === "amber" && "text-amber-600 dark:text-amber-400"
          )}
        >
          {formatted}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {body}
      </Link>
    );
  }

  return body;
}
