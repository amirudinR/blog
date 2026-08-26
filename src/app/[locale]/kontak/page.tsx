import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_NAME } from "@/lib/constants";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

const CONTENT: Record<
  Locale,
  {
    title: string;
    intro: string;
    emailLabel: string;
    emailNote: string;
    topicsHeading: string;
    topics: string[];
  }
> = {
  id: {
    title: "Kontak",
    intro: `Punya pertanyaan, masukan, atau ingin bekerja sama? Kami senang mendengar dari kamu.`,
    emailLabel: "Email",
    emailNote: "Biasanya dibalas dalam 1-3 hari kerja.",
    topicsHeading: "Topik yang sering ditanyakan",
    topics: [
      "Koreksi atau masukan isi artikel",
      "Permintaan topik tutorial baru",
      "Kerja sama konten dan iklan",
      "Laporan bug di situs",
    ],
  },
  en: {
    title: "Contact",
    intro: `Questions, feedback, or collaboration? We'd love to hear from you.`,
    emailLabel: "Email",
    emailNote: "Usually replied within 1-3 business days.",
    topicsHeading: "Common topics",
    topics: [
      "Corrections or article feedback",
      "New tutorial topic requests",
      "Content and advertising partnerships",
      "Bug reports on the site",
    ],
  },
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  return { title: CONTENT[locale].title };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const content = CONTENT[locale];
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@blogku.id";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
        {content.title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {content.intro}
      </p>
      <span className="mt-6 flex h-px w-16 bg-primary/40" aria-hidden />

      <a
        href={`mailto:${email}`}
        className="mt-8 flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {content.emailLabel}
          </span>
          <span className="block truncate text-sm font-medium sm:text-base">
            {email}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {content.emailNote}
          </span>
        </span>
      </a>

      <h2 className="mt-10 font-heading text-lg font-bold tracking-tight sm:text-xl">
        {content.topicsHeading}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {content.topics.map((topic) => (
          <li key={topic} className="flex items-start gap-2.5 text-sm text-muted-foreground sm:text-[15px]">
            <span
              className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            {topic}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}
      </p>
    </div>
  );
}
