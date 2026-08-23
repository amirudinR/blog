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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
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
        <p className="text-xs text-[var(--md-on-surface-variant)]">
          Slug:{" "}
          <code className="rounded-md bg-[var(--md-surface-container-highest)] px-1.5 py-0.5 font-mono">
            {slugPreview || "—"}
          </code>
        </p>
      </div>
      <DialogFooter>
        <Button
          type="submit"
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
        <p className="text-sm text-[var(--md-on-surface-variant)]">
          {rows.length} {labels.plural.toLowerCase()}
        </p>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Tambah {labels.singular}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[var(--md-on-surface-variant)]">
          <p>Belum ada {labels.plural.toLowerCase()}</p>
          <p>
            Tambahkan {labels.singular.toLowerCase()} pertama kamu.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--md-outline-variant)] md:block">
          <Table>
            <TableHeader>
              <TableRow>
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
                      <span className="italic text-[var(--md-on-surface-variant)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.nameEn ?? (
                      <span className="italic text-[var(--md-on-surface-variant)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-[var(--md-surface-container-highest)] px-1.5 py-0.5 font-mono text-xs text-[var(--md-on-surface-variant)]">
                      {row.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[var(--md-on-surface-variant)]"
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
                            className="text-[var(--md-on-surface-variant)] hover:text-[var(--md-error)]"
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

          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--md-outline-variant)] px-4 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium">
                    {row.nameId ?? (
                      <span className="font-normal italic text-[var(--md-on-surface-variant)]">
                        —
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--md-on-surface-variant)]">
                    {row.nameEn ?? (
                      <span className="italic">—</span>
                    )}
                  </p>
                  <code className="rounded-md bg-[var(--md-surface-container-highest)] px-1.5 py-0.5 font-mono text-xs text-[var(--md-on-surface-variant)]">
                    {row.slug}
                  </code>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[var(--md-on-surface-variant)]"
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
                        className="text-[var(--md-on-surface-variant)] hover:text-[var(--md-error)]"
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
              </div>
            ))}
          </div>
        </>
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
