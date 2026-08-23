import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        Terpublikasi
      </Badge>
    );
  }
  return <Badge variant="secondary">Draft</Badge>;
}
