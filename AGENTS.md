# BlogKu App

## Stack
Next.js 16.3 · React 19.2 · TypeScript · Tailwind 4 · shadcn/ui · @base-ui/react · lucide-react · next-themes

## Commands
```bash
npm run dev       # localhost:3000
npm run build     # production build
npm run lint      # eslint
npm run db:seed   # seed Firestore
npm run db:snapshot # export snapshot JSON
```

## Conventions
- **Locale:** `/id/` or `/en/` slug — use `isValidLocale()` guard
- **i18n:** `getDictionary(locale)` → `dict.*` keys in `src/lib/i18n/dictionaries/{id,en}.json`
- **Components:** `src/components/` — `"use client"` directive for client components
- **Pages:** `src/app/[locale]/` — server components by default
- **Styling:** Tailwind 4 + `cn()` from `src/lib/utils.ts`
- **Data:** `src/lib/db/` — Firestore queries. `firestore.ts` = server-only, `queries.ts` re-exports
- **Content:** `src/lib/content/` — TOC, categories, subgroups
- **Utils:** `src/lib/utils.ts` — `cn()`, `slugify()`, `calculateReadingTime()`, `formatDate()`

## Rules
- Never import `src/lib/db/firestore.ts` in client components
- Always serialize Dates to ISO strings when passing from server → client components
- Use `isValidLocale(locale)` before accessing locale-dependent functions
- Static assets: SVG topics in `public/images/topics/`, icons in `public/icons/`
- Admin auth uses Firebase session cookie via `src/proxy.ts`
