"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CommentContentProps = {
  content: string;
};

const CLAMP_LENGTH = 160;

export function CommentContent({ content }: CommentContentProps) {
  const [open, setOpen] = useState(false);
  const isLong = content.length > CLAMP_LENGTH || /\n/.test(content.trim());

  if (!isLong) {
    return (
      <p
        className="max-w-xs text-sm whitespace-pre-wrap"
        title={content}
      >
        {content}
      </p>
    );
  }

  return (
    <div className="flex max-w-xs items-start gap-2">
      <p className="line-clamp-2 min-w-0 flex-1 text-sm" title={content}>
        {content}
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button type="button" variant="link" size="xs" className="shrink-0 px-0">
              Lihat
            </Button>
          }
        />
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Isi Komentar</DialogTitle>
            <DialogDescription>Komentar lengkap dari pembaca.</DialogDescription>
          </DialogHeader>
          <p className="max-h-80 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
