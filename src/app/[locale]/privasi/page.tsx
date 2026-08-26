import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_NAME } from "@/lib/constants";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

const CONTENT: Record<
  Locale,
  { title: string; updated: string; sections: { heading: string; body: string[] }[] }
> = {
  id: {
    title: "Kebijakan Privasi",
    updated: "Terakhir diperbarui: 2026",
    sections: [
      {
        heading: "Data yang kami kumpulkan",
        body: [
          `${SITE_NAME} tidak meminta akun untuk membaca artikel. Data teknis anonim (halaman yang dikunjungi, negara, perangkat) dikumpulkan melalui Vercel Analytics tanpa cookie pelacak pihak ketiga.`,
          "Jika kamu berlangganan newsletter atau menulis komentar, kami menyimpan alamat email dan nama yang kamu berikan.",
        ],
      },
      {
        heading: "Data di perangkatmu",
        body: [
          "Fitur seperti posisi mendengarkan (Lanjutkan), bookmark Baca Nanti, dan preferensi suara/ukuran huruf disimpan sepenuhnya di browsermu (localStorage). Data ini tidak pernah dikirim ke server kami dan bisa dihapus kapan saja lewat pengaturan browser.",
        ],
      },
      {
        heading: "Penggunaan data",
        body: [
          "Email newsletter hanya digunakan untuk mengirim pemberitahuan artikel baru. Kamu bisa berhenti berlangganan kapan saja dari tautan di email.",
          "Kami tidak menjual atau membagikan data pribadi kepada pihak ketiga.",
        ],
      },
      {
        heading: "Kontak",
        body: [
          "Ada pertanyaan tentang privasi? Hubungi kami melalui halaman Kontak.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          `${SITE_NAME} requires no account to read articles. Anonymous technical data (visited pages, country, device) is collected through Vercel Analytics without third-party tracking cookies.`,
          "If you subscribe to the newsletter or write a comment, we store the email address and name you provide.",
        ],
      },
      {
        heading: "Data on your device",
        body: [
          "Features like listening position (Resume), Read Later bookmarks, and voice/font preferences are stored entirely in your browser (localStorage). This data never leaves your device and can be cleared anytime via your browser settings.",
        ],
      },
      {
        heading: "How we use data",
        body: [
          "Newsletter emails are used only to notify you about new articles. You can unsubscribe anytime via the link in every email.",
          "We never sell or share personal data with third parties.",
        ],
      },
      {
        heading: "Contact",
        body: ["Questions about privacy? Reach us through the Contact page."],
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  return { title: CONTENT[locale].title };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const content = CONTENT[locale];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
        {content.title}
      </h1>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
        {content.updated}
      </p>
      <span className="mt-4 flex h-px w-16 bg-primary/40" aria-hidden />
      <div className="mt-8 space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-lg font-bold tracking-tight sm:text-xl">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
