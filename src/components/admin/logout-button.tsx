"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export async function performLogout(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } finally {
    window.location.href = "/admin/login";
  }
}

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await performLogout();
        })
      }
    >
      <LogOut className="size-4 shrink-0" />
      Keluar
    </Button>
  );
}
