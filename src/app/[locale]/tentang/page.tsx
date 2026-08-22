import { notFound } from "next/navigation";

import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const paragraphs =
    locale === "id"
      ? [
          "Halo! Selamat datang di blog pribadi saya. Di sini saya menuliskan cerita, catatan, dan hal-hal yang sedang saya pelajari — terutama seputar teknologi, pengembangan diri, dan kehidupan sehari-hari.",
          "Blog ini dibuat sebagai tempat untuk berbagi pengetahuan dan pengalaman. Saya percaya bahwa menulis adalah salah satu cara terbaik untuk belajar, dan semoga apa yang saya tulis bisa bermanfaat juga bagi kamu yang membacanya.",
          "Terima kasih sudah mampir. Jangan ragu untuk menjelajahi artikel-artikel yang tersedia, dan sampai jumpa di tulisan berikutnya!",
        ]
      : [
          "Hi there! Welcome to my personal blog. This is where I write stories, notes, and things I am currently learning — mostly about technology, self-development, and everyday life.",
          "This blog exists as a place to share knowledge and experiences. I believe writing is one of the best ways to learn, and I hope what I write here is useful for you too.",
          "Thanks for stopping by. Feel free to explore the articles, and see you in the next post!",
        ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {dict.site.name}
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {dict.about.title}
      </h1>
      <span className="mt-5 mb-8 flex items-center gap-3" aria-hidden>
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="h-px w-16 bg-primary/40" />
      </span>
      <div className="max-w-[65ch] space-y-5 leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
