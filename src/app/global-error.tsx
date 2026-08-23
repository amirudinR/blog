"use client";

import { TriangleAlert } from "lucide-react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "26rem", padding: "2rem", textAlign: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "9999px",
              backgroundColor:
                "color-mix(in oklch, oklch(0.55 0.13 40) 12%, transparent)",
            }}
            aria-hidden
          >
            <TriangleAlert size={24} color="oklch(0.55 0.13 40)" />
          </span>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginTop: "1.5rem",
              fontFamily: "var(--font-heading), Georgia, serif",
            }}
          >
            Waduh, ada yang salah
          </h1>
          <p style={{ fontSize: "0.875rem", color: "oklch(0.47 0.02 60)", marginTop: "0.5rem" }}>
            Oops, something went wrong.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "oklch(0.55 0.13 40)",
              color: "oklch(0.99 0.008 85)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Coba Lagi · Retry
          </button>
        </main>
      </body>
    </html>
  );
}
