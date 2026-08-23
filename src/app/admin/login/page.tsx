import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--md-surface)] p-4">
      <div className="w-full max-w-sm">
        <div
          className="grid size-12 place-items-center rounded-2xl bg-[var(--md-primary)] text-xl font-bold text-[var(--md-on-primary)]"
          aria-hidden
        >
          B
        </div>
        <h1 className="mt-6 text-2xl font-normal tracking-tight">
          Masuk ke BlogKu
        </h1>
        <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">
          Panel admin untuk mengelola artikel, kategori, dan komentar.
        </p>
        <div className="mt-8 rounded-[28px] border border-[color-mix(in_srgb,var(--md-outline-variant)_60%,transparent)] bg-[var(--md-surface-container-lowest)] p-8 shadow-[var(--md-shadow-2)]">
          <LoginForm />
        </div>
        <p className="mt-6 text-xs text-[var(--md-on-surface-variant)]">
          Hanya email yang diizinkan yang dapat masuk.
        </p>
      </div>
    </div>
  );
}
