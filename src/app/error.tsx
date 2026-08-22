"use client";

import { TriangleAlert } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <TriangleAlert className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 font-heading text-xl font-bold tracking-tight sm:text-2xl">
          Waduh, ada yang salah
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Oops, something went wrong. Coba lagi / Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Coba Lagi · Retry
        </button>
      </div>
    </div>
  );
}
