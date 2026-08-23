import type { Metadata } from "next";

import { listTagsAdmin } from "@/lib/db/queries";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function AdminTagsPage() {
  const rows = await listTagsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Tags
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola tag artikel untuk kedua bahasa.
        </p>
      </div>
      <TaxonomyManager kind="tag" rows={rows} />
    </div>
  );
}
