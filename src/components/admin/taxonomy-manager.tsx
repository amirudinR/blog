"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteCategory,
  deleteTag,
  upsertCategory,
  upsertTag,
} from "@/app/admin/actions";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminTaxonomyRow } from "@/lib/db/queries";
import { slugify } from "@/lib/utils/blog";

type TaxonomyManagerProps = {
  kind: "category" | "tag";
  rows: AdminTaxonomyRow[];
};

function getLabels(kind: "category" | "tag") {
  return kind === "category"
    ? {
        singular: "Kategori",
        plural: "Kategori",
        description: "Kategori memudahkan pembaca menelusuri artikel.",
      }
    : {
        singular: "Tag",
        plural: "Tags",
        description: "Tag memberi konteks tambahan pada setiap artikel.",
      };
}

type TaxonomyFormProps = {
  kind: "category" | "tag";
  editing: AdminTaxonomyRow | null;
  onSuccess: () => void;
};

function TaxonomyForm({ kind, editing, onSuccess }: TaxonomyFormProps) {
  const labels = getLabels(kind);
  const [nameId, setNameId] = useState(editing?.nameId ?? "");
  const [nameEn, setNameEn] = useState(editing?.nameEn ?? "");
  const [pending, startTransition] = useTransition();

  const slugPreview = slugify(nameEn.trim() || nameId.trim());

  function handleSubmit() {
    if (!nameId.trim()) return;
    startTransition(async () => {
      const payload = {
        id: editing?.id,
        nameId: nameId.trim(),
        nameEn: nameEn.trim(),
      };
      const result =
        kind === "category"
          ? await upsertCategory(payload)
          : await upsertTag(payload);

      if (result.ok) {
        toast.success(
          editing
            ? `${labels.singular} diperbarui`
            : `${labels.singular} ditambahkan`
        );
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor={`${kind}-name-id`}>Nama (ID)</Label>
          <Input
            id={`${kind}-name-id`}
            value={nameId}
            onChange={(e) => setNameId(e.target.value)}
            placeholder={`Nama ${labels.singular.toLowerCase()} bahasa Indonesia`}
            disabled={pending}
            autoFocus
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${kind}-name-en`}>Nama (EN)</Label>
          <Input
            id={`${kind}-name-en`}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={`Nama ${labels.singular.toLowerCase()} bahasa Inggris`}
            disabled={pending}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Slug:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            {slugPreview || "—"}
          </code>
        </p>
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={pending || !nameId.trim()}
        >
          {pending ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Menyimpan…
            </>
          ) : (
            "Simpan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TaxonomyManager({ kind, rows }: TaxonomyManagerProps) {
  const labels = getLabels(kind);
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTaxonomyRow | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: AdminTaxonomyRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  async function handleDelete(row: AdminTaxonomyRow) {
    const result =
      kind === "category"
        ? await deleteCategory(row.id)
        : await deleteTag(row.id);
    if (result.ok) {
      toast.success(`${labels.singular} dihapus`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length} {labels.plural.toLowerCase()}
        </p>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Tambah {labels.singular}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium">
            Belum ada {labels.plural.toLowerCase()}
          </p>
          <p className="text-sm text-muted-foreground">
            Tambahkan {labels.singular.toLowerCase()} pertama kamu.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Nama ID</TableHead>
                <TableHead>Nama EN</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-20 text-right">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.nameId ?? (
                      <span className="italic text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.nameEn ?? (
                      <span className="italic text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {row.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label={`Edit ${row.slug}`}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteConfirmButton
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Hapus ${row.slug}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        }
                        title={`Hapus ${labels.singular.toLowerCase()} ini?`}
                        description={`${labels.singular} "${row.nameId ?? row.slug}" akan dihapus permanen.`}
                        onConfirm={() => handleDelete(row)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? `Edit ${labels.singular}`
                : `Tambah ${labels.singular}`}
            </DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </DialogHeader>
          <TaxonomyForm
            key={editing?.id ?? "new"}
            kind={kind}
            editing={editing}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
