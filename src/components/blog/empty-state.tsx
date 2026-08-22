import type { LucideIcon } from "lucide-react";
import { Newspaper } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  message: string;
};

export function EmptyState({ icon: Icon = Newspaper, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
