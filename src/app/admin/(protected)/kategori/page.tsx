import type { Metadata } from "next";

import { listCategoriesAdmin } from "@/lib/db/queries";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori",
};

export default async function AdminCategoriesPage() {
  const rows = await listCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-normal tracking-tight">
          Kategori
        </h1>
        <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">
          Kelola kategori artikel untuk kedua bahasa.
        </p>
      </div>
      <TaxonomyManager kind="category" rows={rows} />
    </div>
  );
}
