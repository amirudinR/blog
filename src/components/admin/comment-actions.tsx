"use client";

import { Check, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { moderateComment, removeComment } from "@/app/admin/actions";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Button } from "@/components/ui/button";

type CommentActionsProps = {
  id: number;
  status: string;
};

export function CommentActions({ id, status }: CommentActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Terjadi kesalahan");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status !== "approved" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label="Setujui komentar"
          title="Setujui"
          onClick={() =>
            runAction(
              () => moderateComment(id, "approved"),
              "Komentar disetujui"
            )
          }
        >
          <Check className="size-4 text-[var(--md-tertiary)]" />
        </Button>
      )}
      {status !== "rejected" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label="Tolak komentar"
          title="Tolak"
          onClick={() =>
            runAction(() => moderateComment(id, "rejected"), "Komentar ditolak")
          }
        >
          <X className="size-4 text-[var(--md-error)]" />
        </Button>
      )}
      <DeleteConfirmButton
        title="Hapus komentar ini?"
        description="Komentar akan dihapus permanen dan tidak dapat dikembalikan."
        confirmLabel="Hapus Komentar"
        onConfirm={async () => {
          const result = await removeComment(id);
          if (result.ok) {
            toast.success("Komentar dihapus");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        }}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={pending}
            aria-label="Hapus komentar"
            title="Hapus"
          >
            <Trash2 className="size-4 text-[var(--md-error)]" />
          </Button>
        }
      />
    </div>
  );
}
