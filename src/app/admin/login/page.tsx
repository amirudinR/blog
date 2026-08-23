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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-sm ring-1 ring-foreground/10">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-primary">
            BlogKu
          </h1>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Panel Admin
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
