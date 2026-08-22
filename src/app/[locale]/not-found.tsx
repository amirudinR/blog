import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span
        className="font-heading text-7xl font-bold tracking-tight text-primary/20 sm:text-8xl"
        aria-hidden
      >
        404
      </span>
      <h1 className="max-w-md font-heading text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
        Page not found / Halaman tidak ditemukan
      </h1>
      <div className="flex gap-4">
        <Link
          href="/id"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/en"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
