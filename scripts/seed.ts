import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { hash } from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgTable } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";
import { calcReadingTime } from "../src/lib/utils/blog";

const { users, categories, categoryTranslations, tags, tagTranslations, posts, postTranslations, postTags, comments, newsletterSubscribers } = schema;

type LocaleContent = { title: string; excerpt: string; contentMarkdown: string };

type PostSeed = {
  slug: string;
  status: "published" | "draft";
  categorySlug: string | null;
  tagSlugs: string[];
  daysAgo: number | null;
  id: LocaleContent;
  en: LocaleContent;
};

const categorySeeds = [
  { slug: "teknologi", nameId: "Teknologi", nameEn: "Technology" },
  { slug: "pengembangan-diri", nameId: "Pengembangan Diri", nameEn: "Self Improvement" },
];

const tagSeeds = [
  { slug: "nextjs", nameId: "Next.js", nameEn: "Next.js" },
  { slug: "javascript", nameId: "JavaScript", nameEn: "JavaScript" },
  { slug: "produktivitas", nameId: "Produktivitas", nameEn: "Productivity" },
  { slug: "refleksi", nameId: "Refleksi", nameEn: "Reflection" },
];

const postSeeds: PostSeed[] = [
  {
    slug: "belajar-nextjs-app-router",
    status: "published",
    categorySlug: "teknologi",
    tagSlugs: ["nextjs", "javascript"],
    daysAgo: 21,
    id: {
      title: "Belajar Next.js App Router dari Nol",
      excerpt: "Catatan perjalanan migrasi blog pribadi ke Next.js App Router: konsep dasar, anatomi folder app, dan fetching data di server components.",
      contentMarkdown: `Pada awal tahun lalu saya memutuskan membangun ulang blog pribadi ini menggunakan Next.js versi terbaru. Sebelumnya saya cukup nyaman dengan pendekatan lama, tetapi dokumentasi resmi sudah jelas-jelas bergerak ke arah lain, jadi ya sudah, saya ikuti saja arus. Tulisan ini adalah catatan perjalanan saya belajar App Router dari nol, lengkap dengan kesalahan-kesalahan awal yang lumayan bikin pusing.

## Konsep Dasar yang Perlu Dipahami

Inti dari App Router sebenarnya sederhana: folder di dalam direktori app menjadi segmen URL, sedangkan file dengan nama tertentu menentukan perilaku segmen tersebut. File page.tsx wajib ada agar sebuah rute bisa diakses, sedangkan layout.tsx membungkus antarmuka bersama yang tidak ikut dirender ulang saat navigasi terjadi.

### Anatomi Folder app

Selama minggu pertama saya memaksakan diri menghafal beberapa konvensi penting berikut:

- page.tsx sebagai pintu masuk sebuah rute
- layout.tsx untuk kerangka UI yang dipertahankan antar navigasi
- loading.tsx otomatis menjadi batas Suspense saat data dimuat
- error.tsx menangkap kesalahan pada segmen tempat ia berada
- route.ts dipakai ketika kita butuh endpoint API murni

Setelah seminggu, struktur ini justru membuat saya lebih cepat menemukan kode dibanding struktur lama yang menumpuk semua halaman dalam satu folder pages.

> Pesan terbesar dari pengalaman saya: jangan migrasikan seluruh proyek sekaligus. Mulailah dari satu halaman statis, rasakan alurnya, baru lanjut ke halaman dinamis. Migrasi bertahap menyelamatkan kewarasan saya.

## Fetching Data Tanpa Drama

Tidak ada lagi getServerSideProps atau getStaticProps. Komponen boleh async, fetch bisa dipanggil langsung, dan caching dikendalikan lewat opsi sederhana di level permintaan:

\`\`\`ts
async function getPosts() {
  const res = await fetch("/api/posts", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat artikel");
  return (await res.json()) as Post[];
}

export default async function BlogPage() {
  return <PostList items={await getPosts()} />;
}
\`\`\`

Setelah dua pekan, kesan saya positif. Kurva belajarnya memang ada, tetapi begitu model mentalnya mulai klik, menambah fitur baru terasa lebih cepat dan bundle yang dikirim ke browser juga jauh lebih ramping daripada sebelumnya.`,
    },
    en: {
      title: "Learning the Next.js App Router from Scratch",
      excerpt: "My journal of migrating a personal blog to the Next.js App Router: core concepts, the app folder anatomy, and data fetching in server components.",
      contentMarkdown: `At the start of last year I decided to rebuild this personal blog using the latest version of Next.js. I was reasonably comfortable with the old approach, but the official documentation was clearly moving in a different direction, so I went with the flow. This post is my journal of learning the App Router from scratch, complete with the early mistakes that gave me quite a headache.

## The Core Concepts Worth Understanding

The heart of the App Router is simple: folders inside the app directory become URL segments, while specially named files define how each segment behaves. A page.tsx file is required for a route to be reachable, and layout.tsx wraps shared UI that does not re-render during navigation.

### The Anatomy of the app Folder

For my first week I forced myself to memorize these conventions:

- page.tsx as the entry point of a route
- layout.tsx for a shell that persists across navigation
- loading.tsx which automatically becomes a Suspense boundary
- error.tsx catching failures within its segment
- route.ts when you need a pure API endpoint

After a week this structure actually made me faster at finding code than the old setup where every page piled into a single folder called pages.

> The biggest lesson from my experience: do not migrate an entire project at once. Start with one static page, feel the flow, then move on to dynamic pages. An incremental migration saved my sanity.

## Data Fetching Without the Drama

No more getServerSideProps or getStaticProps. Components can be async, fetch can be called directly, and caching is controlled through simple options at the request level:

\`\`\`ts
async function getPosts() {
  const res = await fetch("/api/posts", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load posts");
  return (await res.json()) as Post[];
}

export default async function BlogPage() {
  return <PostList items={await getPosts()} />;
}
\`\`\`

Two weeks in, my impression is positive. There is a learning curve, but once the mental model clicks, shipping new features feels faster and the bundle sent to the browser is far slimmer than before.`,
    },
  },
  {
    slug: "kebiasaan-kecil-produktivitas",
    status: "published",
    categorySlug: "pengembangan-diri",
    tagSlugs: ["produktivitas", "refleksi"],
    daysAgo: 14,
    id: {
      title: "Kebiasaan Kecil yang Mengubah Produktivitasku",
      excerpt: "Bukan aplikasi mahal yang menyelamatkan produktivitas saya, melainkan lima kebiasaan kecil yang terlalu mudah untuk gagal dan rantainya saya jaga.",
      contentMarkdown: `Dua tahun lalu saya terjebak dalam siklus kerja yang buruk: begadang, tenggat yang terus molor, dan merasa sibuk tanpa hasil nyata. Yang akhirnya menyelamatkan saya bukan aplikasi pencatat termahal, melainkan beberapa kebiasaan kecil yang saya jalankan konsisten sampai hari ini.

## Mulai dari yang Terlalu Mudah untuk Gagal

Kesalahan saya dulu adalah menetapkan target besar tanpa fondasi. Sekarang setiap kebiasaan baru saya mulai dari versi yang hampir mustahil gagal: menulis satu paragraf, membaca dua halaman, atau sekadar membuka editor dan merapikan satu file. Kedengarannya remeh, tetapi rantai kecil itulah yang menjaga momentum ketika motivasi sedang hilang.

### Sistem Pencatatan Sederhana

Saya hanya mencatat di satu tempat dan menaati beberapa aturan main:

- Maksimal lima kebiasaan aktif dalam satu periode
- Jangan biarkan rantai putus dua hari berturut-turut
- Tinjau ulang sepuluh menit setiap Minggu malam
- Buang kebiasaan yang tidak memberi efek setelah satu bulan

Untuk memantau streak, saya pakai skrip kecil yang jumlahnya cuma beberapa baris:

\`\`\`ts
type Habit = { name: string; streak: number };

const habits = loadHabits();
habits.forEach((habit) => {
  habit.streak += isDoneToday(habit.name) ? 1 : 0;
});
saveHabits(habits.sort((a, b) => b.streak - a.streak));
\`\`\`

> Konsistensi tujuh puluh persen selama setahun jauh lebih berharga daripada perfeksionisme yang hanya bertahan dua minggu.

## Hasilnya Setelah Dua Tahun

Hari ini saya menyelesaikan pekerjaan dalam blok waktu yang pendek namun fokus, tidur lebih awal, dan jarang lagi bekerja sampai larut malam. Tidak ada momen dramatis ketika hidup saya tiba-tiba berubah; yang ada hanya ratusan hari biasa ketika saya memilih melanjutkan rantai, bukan memutusnya. Kalau kamu sedang mencari titik awal, pilih satu kebiasaan yang terasa terlalu mudah, jalankan tujuh hari, lalu tambahkan kebiasaan berikutnya.`,
    },
    en: {
      title: "Tiny Habits That Changed My Productivity",
      excerpt: "No fancy app saved my productivity. It was five tiny habits, almost too easy to fail, whose chains I protected day after day.",
      contentMarkdown: `Two years ago I was stuck in a miserable work cycle: late nights, deadlines sliding week after week, and feeling busy without anything real to show for it. What eventually saved me was not the most expensive productivity app but a handful of tiny habits I have kept up consistently ever since.

## Start Too Easy to Fail

My old mistake was setting huge targets with no foundation. Now every new habit begins in a version that is almost impossible to fail: writing one paragraph, reading two pages, or simply opening the editor and tidying a single file. It sounds trivial, yet that small chain is what preserves momentum when motivation disappears.

### A Simple Tracking System

I keep notes in one place and follow a few ground rules:

- At most five active habits per period
- Never let a chain break two days in a row
- Ten minutes of review every Sunday night
- Drop any habit that shows no effect after a month

To watch my streaks I rely on a tiny script that is only a few lines long:

\`\`\`ts
type Habit = { name: string; streak: number };

const habits = loadHabits();
habits.forEach((habit) => {
  habit.streak += doneToday(habit.name) ? 1 : 0;
});
saveHabits(habits.sort((a, b) => b.streak - a.streak));
\`\`\`

> Seventy percent consistency over a year beats two weeks of perfectionism.

## Where I Am Two Years Later

These days I work in short focused blocks, sleep earlier, and rarely push past midnight anymore. There was no dramatic moment when everything changed; there were only hundreds of ordinary days when I chose to continue the chain instead of breaking it. If you are looking for a starting point, pick one habit that feels too easy, run it for seven days, then add the next one.`,
    },
  },
  {
    slug: "mengelola-keuangan-pribadi",
    status: "published",
    categorySlug: "pengembangan-diri",
    tagSlugs: ["refleksi"],
    daysAgo: 7,
    id: {
      title: "Mengelola Keuangan Pribadi dengan Sederhana",
      excerpt: "Sistem keuangan pribadi yang sederhana: tiga amplop digital, otomatisasi di hari gajian, dan evaluasi bulanan selama sepuluh menit.",
      contentMarkdown: `Dulu saya menghindari melihat kondisi keuangan sendiri karena takut dengan apa yang akan saya temukan. Ternyata kegelapan itu lebih mahal daripada kenyataannya. Setelah setahun menerapkan sistem yang sangat sederhana, saya bisa tidur lebih tenang dan akhirnya punya tabungan dengan target yang jelas.

## Sistem Amplop Versi Digital

Saya membagi setiap gaji menjadi tiga pos utama: kebutuhan, keinginan, lalu tabungan beserta investasi. Rasionya boleh berubah tiap bulan, tetapi pembagiannya harus selesai di hari gajian, sebelum uang sempat menguap ke belanja impulsif yang selalu menunggu di aplikasi belanja.

### Otomatiskan Sebisa Mungkin

Beberapa langkah kecil ini yang paling banyak menyelamatkan dompet saya:

- Debit otomatis ke rekening tabungan di tanggal gajian
- Tagihan rutin dipindah ke kartu khusus agar mudah dilacak
- Belanja besar didinginkan tiga hari sebelum benar-benar dibayar
- Catat pengeluaran harian cukup lewat satu aplikasi saja

Setiap akhir bulan saya meringkas kondisi lewat fungsi kecil seperti ini:

\`\`\`ts
function ringkasAnggaran(gaji: number, belanja: number[]) {
  const total = belanja.reduce((a, b) => a + b, 0);
  const sisa = gaji - total;
  const persenSisa = Math.round((sisa / gaji) * 100);
  return { total, sisa, persenSisa };
}

const laporanAgustus = ringkasAnggaran(6000000, [1500000, 900000, 450000]);
\`\`\`

> Angka yang tidak pernah kamu lihat tidak akan pernah bisa kamu kelola. Sepuluh menit mencatat setiap minggu lebih berguna daripada audit panik sekali setahun.

## Evaluasi Bulanan yang Ringan

Di akhir bulan saya hanya membaca ringkasan di atas, menandai pos yang bocor, lalu menyesuaikan persentase bulan berikutnya. Tidak ada spreadsheet rumit atau aplikasi berbayar. Keuangan yang sehat ternyata bukan soal disiplin besi, melainkan soal sistem yang cukup sederhana sehingga tidak pernah kita tinggalkan.`,
    },
    en: {
      title: "Managing Personal Finances Simply",
      excerpt: "A simple personal finance system: three digital envelopes, automation on payday, and a ten minute monthly review.",
      contentMarkdown: `For years I avoided looking at my own finances because I was afraid of what I would find. That darkness turned out to be more expensive than the truth. After a year of running a very simple system, I sleep better and I finally have savings pointed at clear goals.

## A Digital Envelope System

Each paycheck gets split into three buckets: needs, wants, then savings plus investments. The ratio can shift from month to month, but the split must happen on payday, before the money evaporates into impulse purchases that are always waiting in shopping apps.

### Automate Whatever You Can

A few small steps have saved my wallet more than anything else:

- Automatic transfer to savings on payday
- Recurring bills moved to one dedicated card for easy tracking
- Big purchases cooled down for three days before actually paying
- Daily expenses logged through a single app only

At the end of every month I summarize the situation with a tiny function like this:

\`\`\`ts
function summarizeBudget(income: number, expenses: number[]) {
  const spent = expenses.reduce((a, b) => a + b, 0);
  const left = income - spent;
  const leftPercent = Math.round((left / income) * 100);
  return { spent, left, leftPercent };
}

const augustReport = summarizeBudget(6000000, [1500000, 900000, 450000]);
\`\`\`

> Numbers you never see are numbers you cannot manage. Ten minutes of weekly logging beats a panicked once-a-year audit.

## A Light Monthly Review

At the end of the month I read the summary above, mark the leaking categories, and adjust next month's percentages. No complicated spreadsheets, no paid subscriptions. Healthy personal finance turns out to be less about iron discipline and more about a system simple enough that you never abandon it.`,
    },
  },
  {
    slug: "draft-rencana-konten",
    status: "draft",
    categorySlug: null,
    tagSlugs: ["refleksi"],
    daysAgo: null,
    id: {
      title: "Draft: Rencana Konten 2027",
      excerpt: "Catatan kasar topik yang ingin kugarap pada 2027: AI lokal, monorepo, desain sistem skala kecil, dan refleksi setahun menulis konsisten.",
      contentMarkdown: `Catatan kasar untuk diri saya sendiri di masa depan. Ide-ide di bawah masih mentah dan belum ada yang saya komitmenkan, tapi menuliskannya di sini rasanya lebih aman daripada membiarkannya tercecer di aplikasi catatan ponsel yang sering saya hapus tanpa sengaja.

## Topik yang Ingin Kugarap

Tiga tema besar sedang mengganggu kepala saya belakangan ini, dan semuanya bermuara pada satu hal yang sama: membuat blog ini lebih mudah dirawat tanpa mengubah menulis menjadi kewajiban yang berat.

### Prioritas Awal

Urutan sementara berdasarkan antusiasme, bukan kemudahan:

- Riset mendalam soal model AI lokal untuk blog statis
- Eksperimen monorepo untuk situs dan tooling penulis
- Seri singkat tentang desain sistem skala kecil
- Tulisan refleksi satu tahun menulis secara konsisten

Untuk gambaran jadwal kasarnya, saya coba petakan lewat potongan kode berikut:

\`\`\`ts
const topics = ["ai-lokal", "monorepo", "design-system"];
const schedule = topics.map((topic, index) => ({
  month: index + 1,
  title: "Riset awal: " + topic,
  status: "ide",
}));
console.table(schedule);
\`\`\`

> Rencana yang tidak ditulis hanyalah harapan; tulis dulu, nanti kita debat kelayakannya.

## Pertanyaan Terbuka

Saya masih ragu apakah seri teknis sepanjang empat bagian akan saya sanggupi sambil bekerja. Kemungkinan besar formatnya dipecah menjadi catatan mingguan yang lebih pendek. Draft ini akan saya tinjau ulang di awal tahun depan; kalau kamu kebetulan membacanya, anggap saja sedang melihat dapur yang belum dirapikan.`,
    },
    en: {
      title: "Draft: Content Plan 2027",
      excerpt: "Rough draft of what I want to explore in 2027: local AI, monorepos, small scale design systems, and a year of consistent writing.",
      contentMarkdown: `Rough notes for my future self. The ideas below are raw and nothing here is committed yet, but writing them down feels safer than letting them scatter across a phone notes app I keep accidentally wiping.

## Topics I Want to Explore

Three big themes have been occupying my head lately, and they all lead back to the same thing: keeping this blog easier to maintain without turning writing into a heavy obligation.

### Early Priorities

Tentative order based on enthusiasm rather than ease:

- A deep dive into local AI models for static blogs
- A monorepo experiment for the site and author tooling
- A short series about small scale design systems
- A reflection piece on one year of consistent writing

To sketch the rough schedule I mapped things out with a small snippet:

\`\`\`ts
const topics = ["local-ai", "monorepo", "design-system"];
const schedule = topics.map((topic, index) => ({
  month: index + 1,
  title: "Early research: " + topic,
  status: "idea",
}));
console.table(schedule);
\`\`\`

> A plan you never wrote down is just a wish; write it first, debate its feasibility later.

## Open Questions

I am still unsure whether I can sustain a four part technical series alongside work. Most likely it would break into shorter weekly notes. I will revisit this draft early next year; if you happen to read it before then, consider yourself peeking into a kitchen that has not been cleaned yet.`,
    },
  },
];

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
    console.error("DATABASE_URL belum diisi. Daftar Neon gratis di https://neon.tech lalu isi .env.local");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@blogku.test").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
    const passwordHash = await hash(adminPassword, 10);

    await db
      .insert(users)
      .values({ email: adminEmail, passwordHash, name: "Admin" })
      .onConflictDoUpdate({ target: users.email, set: { passwordHash, name: "Admin" } });
    console.log("Admin user siap:", adminEmail);

    const categoryIds = new Map<string, number>();
    for (const seed of categorySeeds) {
      const existing = await db.select().from(categories).where(eq(categories.slug, seed.slug)).limit(1);
      if (existing.length > 0) {
        categoryIds.set(seed.slug, existing[0].id);
        continue;
      }
      const [created] = await db.insert(categories).values({ slug: seed.slug }).returning();
      await db.insert(categoryTranslations).values([
        { categoryId: created.id, locale: "id", name: seed.nameId },
        { categoryId: created.id, locale: "en", name: seed.nameEn },
      ]);
      categoryIds.set(seed.slug, created.id);
      console.log("Kategori dibuat:", seed.slug);
    }

    const tagIds = new Map<string, number>();
    for (const seed of tagSeeds) {
      const existing = await db.select().from(tags).where(eq(tags.slug, seed.slug)).limit(1);
      if (existing.length > 0) {
        tagIds.set(seed.slug, existing[0].id);
        continue;
      }
      const [created] = await db.insert(tags).values({ slug: seed.slug }).returning();
      await db.insert(tagTranslations).values([
        { tagId: created.id, locale: "id", name: seed.nameId },
        { tagId: created.id, locale: "en", name: seed.nameEn },
      ]);
      tagIds.set(seed.slug, created.id);
      console.log("Tag dibuat:", seed.slug);
    }

    const firstPostIdBySlug = new Map<string, string>();
    let post1CreatedThisRun = false;

    for (const seed of postSeeds) {
      const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, seed.slug)).limit(1);
      if (existing.length > 0) {
        firstPostIdBySlug.set(seed.slug, existing[0].id);
        continue;
      }

      const [created] = await db
        .insert(posts)
        .values({
          slug: seed.slug,
          status: seed.status,
          categoryId: seed.categorySlug !== null ? (categoryIds.get(seed.categorySlug) ?? null) : null,
          publishedAt: seed.status === "published" && seed.daysAgo !== null ? daysAgo(seed.daysAgo) : null,
          readingTimeId: calcReadingTime(seed.id.contentMarkdown),
          readingTimeEn: calcReadingTime(seed.en.contentMarkdown),
          viewsCount: Math.floor(Math.random() * 261) + 40,
        })
        .returning();
      firstPostIdBySlug.set(seed.slug, created.id);

      for (const locale of ["id", "en"] as const) {
        const content = seed[locale];
        await db.insert(postTranslations).values({
          postId: created.id,
          locale,
          title: content.title,
          excerpt: content.excerpt,
          contentMarkdown: content.contentMarkdown,
          metaTitle: `${content.title} | BlogKu`,
          metaDescription: content.excerpt,
        });
      }

      for (const tagSlug of seed.tagSlugs) {
        const tagId = tagIds.get(tagSlug);
        if (tagId === undefined) throw new Error(`Tag tidak ditemukan: ${tagSlug}`);
        await db.insert(postTags).values({ postId: created.id, tagId });
      }

      if (seed.slug === "belajar-nextjs-app-router") post1CreatedThisRun = true;
      console.log("Post dibuat:", seed.slug);
    }

    if (post1CreatedThisRun) {
      const post1Id = firstPostIdBySlug.get("belajar-nextjs-app-router");
      if (!post1Id) throw new Error("Post pertama tidak ditemukan");
      await db.insert(comments).values([
        { postId: post1Id, authorName: "Budi", authorEmail: "budi@example.com", content: "Artikelnya membantu banget, makasih!", status: "approved" },
        { postId: post1Id, authorName: "Sari", authorEmail: "sari@example.com", content: "Turunya jelas sekali.", status: "approved" },
        { postId: post1Id, authorName: "Anon", authorEmail: "anon@example.com", content: "Boleh bahas testing juga?", status: "pending" },
      ]);
      console.log("Komentar contoh ditambahkan.");
    }

    await db
      .insert(newsletterSubscribers)
      .values({ email: "test@example.com", status: "active" })
      .onConflictDoNothing();
    console.log("Subscriber contoh siap.");

    const inventory: [string, PgTable][] = [
      ["users", users],
      ["categories", categories],
      ["category_translations", categoryTranslations],
      ["tags", tags],
      ["tag_translations", tagTranslations],
      ["posts", posts],
      ["post_translations", postTranslations],
      ["post_tags", postTags],
      ["comments", comments],
      ["newsletter_subscribers", newsletterSubscribers],
    ];

    console.log("\nRingkasan data:");
    for (const [label, table] of inventory) {
      const [row] = await db.select({ value: count() }).from(table);
      console.log(`${label}: ${row.value}`);
    }

    console.log("\nSeed selesai.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
