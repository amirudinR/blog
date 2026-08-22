# Plan: Website Blog Bilingual (ID/EN) + Admin Panel

## Ringkasan Kebutuhan

| Aspek | Keputusan |
|---|---|
| Stack | Next.js 16 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui + @tailwindcss/typography |
| Database | Neon Postgres (free tier, Vercel marketplace) |
| ORM | Drizzle ORM (node-postgres + attachDatabasePool — Vercel Fluid compute) |
| Auth | Auth.js v5 credentials provider (single admin) |
| Markdown | react-markdown + remark-gfm + rehype-slug + Shiki (syntax highlighting) |
| Dark mode | next-themes |
| Upload gambar | Vercel Blob |
| OG image | next/og (ImageResponse dinamis) |
| Deploy | Vercel |
| Bahasa | Bilingual ID & EN (UI + artikel) |
| Komentar | DB + moderasi admin |
| Newsletter | Simpan ke DB + export CSV |

---

## Skema Database (Drizzle ORM)

### users
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| email | text unique | Email admin |
| password_hash | text | Bcrypt hash |
| name | text | Nama admin |
| role | text default 'admin' | |
| created_at | timestamp | |

### categories
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| slug | text unique | URL-friendly name |

### category_translations
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| category_id | integer FK -> categories.id | |
| locale | text ('id' atau 'en') | |
| name | text | Nama kategori |

### tags
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| slug | text unique | |

### tag_translations
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| tag_id | integer FK -> tags.id | |
| locale | text | |
| name | text | |

### posts
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| slug | text unique | URL-friendly title |
| cover_image_url | text nullable | Vercel Blob URL |
| status | text default 'draft' | draft / published |
| published_at | timestamp nullable | |
| reading_time_id | integer nullable | Menit baca (bahasa Indonesia) |
| reading_time_en | integer nullable | Menit baca (bahasa Inggris) |
| views_count | integer default 0 | Jumlah views |
| created_at | timestamp | |
| updated_at | timestamp | |

### post_translations
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| post_id | uuid FK -> posts.id | |
| locale | text ('id' atau 'en') | |
| title | text | Judul artikel |
| excerpt | text nullable | Ringkasan singkat |
| content_markdown | text | Isi artikel dalam markdown |
| meta_title | text nullable | SEO title |
| meta_description | text nullable | SEO description |

### post_tags
| Kolom | Tipe | Keterangan |
|---|---|---|
| post_id | uuid FK -> posts.id | |
| tag_id | integer FK -> tags.id | |

### comments
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| post_id | uuid FK -> posts.id | |
| author_name | text | Nama komentator |
| author_email | text | Email komentator |
| content | text | Isi komentar |
| status | text default 'pending' | pending / approved / rejected |
| created_at | timestamp | |

### newsletter_subscribers
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | serial PK | |
| email | text unique | |
| status | text default 'active' | active / unsubscribed |
| subscribed_at | timestamp | |

---

## Arsitektur Routing

```
src/
  middleware.ts                    -- Redirect locale + proteksi /admin
  i18n/
    config.ts                     -- { locales: ['id','en'], defaultLocale: 'id' }
    dictionaries/
      id.json                     -- Kamus UI Bahasa Indonesia
      en.json                     -- Kamus UI Bahasa Inggris
    get-dictionary.ts             -- Dynamic import dictionary

  lib/
    db/
      client.ts                   -- Drizzle client (attachDatabasePool)
      schema.ts                   -- Semua tabel Drizzle
      index.ts                    -- Re-export
    auth.ts                       -- Auth.js config (credentials provider)
    utils.ts                      -- Utility functions (readingTime, slugify, dll)
    constants.ts                  -- Site constants

  components/
    ui/                           -- shadcn/ui components
    blog/
      post-card.tsx               -- Card artikel di list
      post-content.tsx            -- Render markdown artikel
      toc.tsx                     -- Table of contents sidebar
      comment-section.tsx         -- Form + list komentar
      share-buttons.tsx           -- Share ke social media
      related-posts.tsx           -- Artikel terkait
    admin/
      post-editor.tsx             -- Editor markdown bilingual + preview
      stats-card.tsx              -- Dashboard stat cards
      data-table.tsx              -- Tabel data admin

  app/
    [locale]/                     -- PUBLIC (locale: id | en)
      layout.tsx                  -- Layout publik: navbar, footer, ThemeProvider
      page.tsx                    -- Home: hero + featured + latest posts
      blog/
        page.tsx                  -- List artikel + pagination + filter
        [slug]/page.tsx           -- Halaman artikel: TOC, content, komentar
      kategori/[slug]/page.tsx
      tag/[slug]/page.tsx
      tentang/page.tsx            -- About page
      cari/page.tsx               -- Search results
      rss.xml/route.ts            -- RSS feed

    admin/
      layout.tsx                  -- Admin layout (protected)
      login/page.tsx              -- Login form
      page.tsx                    -- Dashboard: stats overview
      posts/
        page.tsx                  -- List semua posts
        new/page.tsx              -- Buat post baru
        [id]/page.tsx             -- Edit post
      kategori/page.tsx           -- CRUD kategori
      tags/page.tsx               -- CRUD tags
      comments/page.tsx           -- Moderasi komentar
      subscribers/page.tsx        -- List subscriber + export CSV

    api/
      auth/[...nextauth]/route.ts
      og/route.tsx                -- OG image generator (ImageResponse)
      comments/route.ts           -- POST komentar publik
      comments/[id]/route.ts      -- PATCH/DELETE komentar (admin)
      newsletter/route.ts         -- POST subscribe

    sitemap.ts                    -- Sitemap generator
    robots.ts                     -- Robots.txt
    layout.tsx                    -- Root layout
    globals.css                   -- Global styles

  drizzle.config.ts               -- Drizzle Kit config
  next.config.ts                  -- Next.js config
  .env.example                    -- Template environment variables
  package.json
```

---

## Fitur Detail

### 1. i18n (Bilingual ID/EN)

- URL-based routing: /[locale]/... (contoh: /id/blog, /en/blog)
- Middleware detect Accept-Language -> redirect / -> /id atau /en
- UI dictionaries (id.json, en.json) dengan dynamic import
- Artikel fallback: jika versi EN belum ada -> tampilkan versi ID + banner "terjemahan belum tersedia"
- Language switcher di navbar

### 2. Halaman Publik

#### Home (/[locale])
- Hero section: judul site + deskripsi singkat + CTA
- Featured posts (2-3 artikel pilihan)
- Latest posts grid
- Newsletter subscribe form

#### List Blog (/[locale]/blog)
- Grid/list artikel dengan pagination
- Filter by kategori dan tag
- Card: cover image, judul, excerpt, waktu baca, tanggal publish

#### Halaman Artikel (/[locale]/blog/[slug])
- Cover image header
- Judul + metadata (tanggal, waktu baca, views, tags)
- Render markdown dengan syntax highlighting (Shiki)
- Table of contents sidebar (diekstrak dari headings)
- Share buttons (Twitter, Facebook, copy link)
- Related posts section
- Comment section (form + list komentar approved)
- Newsletter subscribe

#### Kategori (/[locale]/kategori/[slug])
- Filter artikel per kategori

#### Tag (/[locale]/tag/[slug])
- Filter artikel per tag

#### Tentang (/[locale]/tentang)
- Profil singkat penulis/blog

#### Cari (/[locale]/cari?q=)
- Full-text search Postgres (ILIKE title + excerpt + content)
- Filter per locale

#### RSS (/[locale]/rss.xml)
- RSS feed 10 artikel terbaru per locale

### 3. Admin Panel (/admin)

#### Login (/admin/login)
- Auth.js credentials provider
- Email + password form
- Redirect ke /admin setelah login

#### Dashboard (/admin)
- Total posts (draft + published)
- Total views
- Pending comments count
- Newsletter subscribers count
- Recent activity

#### CRUD Posts (/admin/posts)
- List posts: search, filter status, sort
- Post editor:
  - Tab ID / EN per bahasa
  - Markdown editor dengan live preview (react-markdown)
  - Auto slug dari judul
  - Auto reading time dari word count
  - Cover image upload (Vercel Blob)
  - Category select
  - Tags multi-select
  - SEO fields (meta title, meta description)
  - Status: draft / published
  - Save draft / Publish button

#### CRUD Kategori (/admin/kategori)
- Table list + add/edit/delete modal
- Input: name ID + name EN + auto slug

#### CRUD Tags (/admin/tags)
- Table list + add/edit/delete
- Input: name ID + name EN + auto slug

#### Moderasi Komentar (/admin/comments)
- Filter: pending / approved / rejected / all
- Actions: approve, reject, delete
- Tampilkan: nama, email, isi, post terkait, tanggal

#### Subscribers (/admin/subscribers)
- List semua subscribers
- Export CSV button
- Total count

### 4. API Endpoints

- POST /api/comments -> submit komentar publik (honeypot + rate limit)
- PATCH/DELETE /api/comments/[id] -> moderasi (admin only)
- POST /api/newsletter -> subscribe email
- GET/POST /api/og -> OG image generator (ImageResponse)

### 5. SEO

- Metadata dinamis per halama (title, description, og:image)
- OG image otomatis via next/og ImageResponse
- JSON-LD Article schema di halaman artikel
- sitemap.ts -> sitemap.xml (generate dari DB)
- robots.ts -> robots.txt

### 6. Caching & Performance

- ISR + revalidateTag pattern: admin publish/edit -> revalidate
- Static generation untuk halaman publik (generateStaticParams)
- Client-side search (debounced) -> API endpoint

### 7. Anti-spam Komentar

- Honeypot field (hidden input)
- Rate limit sederhana (in-memory atau Upstash later)
- Zod validation

---

## Fase Implementasi

### Fase 1: Scaffold Proyek
- create-next-app (TypeScript, Tailwind, App Router)
- Install dependencies: shadcn/ui, drizzle-orm, @neondatabase/serverless, auth.js, next-themes, react-markdown, remark-gfm, rehype-slug, rehype-pretty-code, shiki, @vercel/blob, lucide-react, date-fns
- Setup shadcn/ui
- Setup struktur folder
- Konfigurasi .env.example

### Fase 2: Database & ORM
- Definisikan skema Drizzle (semua tabel di schema.ts)
- Konfigurasi drizzle.config.ts
- Setup Drizzle client dengan attachDatabasePool pattern
- Jalankan migrasi
- Seed script: admin default (email/password) + 3-4 artikel contoh bilingual + kategori + tags

### Fase 3: Auth & Middleware
- Setup Auth.js v5 (credentials provider)
- Middleware: redirect locale + proteksi /admin (except /admin/login)
- Login page

### Fase 4: Admin Panel
- Admin layout (sidebar navigation)
- Dashboard dengan stats cards
- CRUD Posts: list, create, edit (editor markdown bilingual + preview)
- CRUD Kategori & Tags
- Moderasi Komentar
- Subscribers + export CSV

### Fase 5: i18n & Layout Publik
- i18n config + dictionaries (id.json, en.json)
- getDictionary function
- Public layout: navbar (dark mode toggle, language switcher, navigation), footer
- ThemeProvider setup (next-themes)
- Responsive design

### Fase 6: Halaman Publik
- Home page (hero, featured, latest)
- List blog + pagination
- Halaman artikel (markdown render, TOC, reading time, syntax highlight)
- Kategori & tag pages
- About page
- Search page
- RSS feed

### Fase 7: API & Interaksi
- Comment form + API (POST, honeypot, rate limit)
- Newsletter subscribe + API
- View counter (client beacon)
- Upload cover image (Vercel Blob)
- Admin moderasi integrasi

### Fase 8: SEO & Polish
- Dynamic metadata per halaman
- OG image generator (next/og)
- sitemap.ts + robots.ts
- JSON-LD Article schema
- Revalidation on publish/edit

### Fase 9: Deploy
- Git init + commit
- Push ke GitHub
- Vercel: connect repo, set env vars
- Neon: setup database via Vercel marketplace
- Jalankan migrasi di production
- Verifikasi E2E

---

## Environment Variables

```
DATABASE_URL=postgres://...               # Neon Postgres
AUTH_SECRET=...                           # Auth.js secret
ADMIN_EMAIL=admin@example.com             # Seed admin email
ADMIN_PASSWORD=hashed_password            # Seed admin password
BLOB_READ_WRITE_TOKEN=...                 # Vercel Blob (upload gambar)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Site URL (production: https://...)
NEXT_PUBLIC_SITE_NAME=My Blog             # Nama blog
```

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^16.3",
    "react": "^19",
    "react-dom": "^19",
    "next-auth": "^5",
    "@auth/drizzle-adapter": "^1",
    "next-themes": "^0.4",
    "drizzle-orm": "^0.44",
    "pg": "^8",
    "@vercel/functions": "^2",
    "@vercel/blob": "^0.30",
    "react-markdown": "^9",
    "remark-gfm": "^4",
    "rehype-slug": "^6",
    "rehype-pretty-code": "^0.14",
    "shiki": "^3",
    "lucide-react": "^0.500",
    "date-fns": "^4",
    "zod": "^3.24"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22",
    "@types/react": "^19",
    "drizzle-kit": "^0.31",
    "@neondatabase/serverless": "^0.10",
    "@types/pg": "^8",
    "tailwindcss": "^4",
    "@tailwindcss/typography": "^0.5"
  }
}
```
