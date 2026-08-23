"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

export async function performLogout(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } finally {
    window.location.href = "/admin/login";
  }
}

export function LogoutButton({ onNavigate }: { onNavigate?: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        onNavigate?.();
        startTransition(async () => {
          await performLogout();
        });
      }}
      className="flex h-12 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-medium text-[var(--md-on-surface-variant)] transition-colors hover:bg-[color-mix(in_srgb,var(--md-on-surface)_6%,transparent)] hover:text-[var(--md-on-surface)] disabled:pointer-events-none disabled:opacity-50"
    >
      <LogOut className="size-5 shrink-0" />
      Keluar
    </button>
  );
}
