export type CategoryMeta = {
  slug: string;
  taglineId: string;
  taglineEn: string;
  descId: string;
  descEn: string;
  svg: string;
  gradient: string;
  subcategories: { slug: string; labelId: string; labelEn: string }[];
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  sejarah: {
    slug: "sejarah",
    taglineId: "Menjelajah Masa Lalu, Memahami Masa Kini",
    taglineEn: "Explore the Past, Understand the Present",
    descId:
      "Dari raja dinosaurus sampai misteri yang belum terpecahkan — cerita-cerita nyata yang membuatmu lebih pintar setelah membacanya.",
    descEn:
      "From dinosaur kings to unsolved mysteries — true stories that leave you smarter after every read.",
    svg: "/images/topics/dinosaurus.svg",
    gradient: "from-[#c2593a] via-[#a34a2e] to-[#8a5a44]",
    subcategories: [
      { slug: "dinosaurus", labelId: "Dinosaurus", labelEn: "Dinosaurs" },
      { slug: "ekonomi-kuno", labelId: "Ekonomi Kuno", labelEn: "Ancient Economy" },
      { slug: "misteri", labelId: "Misteri", labelEn: "Mysteries" },
    ],
  },
  motivasi: {
    slug: "motivasi",
    taglineId: "Versi Terbaikmu Dimulai di Sini",
    taglineEn: "Your Best Self Starts Here",
    descId:
      "Panduan praktis growth mindset, produktivitas, dan ketahanan mental — ditulis bahasa manusia, langsung bisa dipraktikkan hari ini.",
    descEn:
      "Practical guides on growth mindset, productivity, and resilience — written in plain language, actionable today.",
    svg: "/images/topics/motivasi-alt.svg",
    gradient: "from-[#c2593a] via-[#d97b52] to-[#eed7c6]",
    subcategories: [
      { slug: "mindset", labelId: "Mindset", labelEn: "Mindset" },
      { slug: "produktivitas", labelId: "Produktivitas", labelEn: "Productivity" },
      { slug: "mental", labelId: "Mental", labelEn: "Mental" },
      { slug: "filosofi", labelId: "Filosofi", labelEn: "Philosophy" },
    ],
  },
  bisnis: {
    slug: "bisnis",
    taglineId: "Dari Ide Jadi Bisnis yang Jalan",
    taglineEn: "From Idea to a Running Business",
    descId:
      "Startup, marketing, nego, sampai strategi exit — bekal praktis untuk pemula yang serius naik level.",
    descEn:
      "Startups, marketing, negotiation, to exit strategies — practical ammo for beginners serious about leveling up.",
    svg: "/images/topics/startup.svg",
    gradient: "from-[#33241c] via-[#8a5a44] to-[#c2593a]",
    subcategories: [
      { slug: "startup", labelId: "Startup", labelEn: "Startup" },
      { slug: "marketing", labelId: "Marketing", labelEn: "Marketing" },
      { slug: "keuangan", labelId: "Keuangan", labelEn: "Finance" },
      { slug: "manajemen", labelId: "Manajemen", labelEn: "Management" },
    ],
  },
  teknologi: {
    slug: "teknologi",
    taglineId: "Paham AI, Jago Coding, Siap Saas",
    taglineEn: "Get AI, Code Smart, Build SaaS",
    descId:
      "AI, agentic coding, vibe coding, sampai membangun SaaS — dijelaskan sederhana untuk semua level, tanpa jargon yang bikin pusing.",
    descEn:
      "AI, agentic coding, vibe coding, to building SaaS — explained simply for every level, no confusing jargon.",
    svg: "/images/topics/ai.svg",
    gradient: "from-[#33241c] via-[#c2593a] to-[#d97b52]",
    subcategories: [
      { slug: "ai", labelId: "AI", labelEn: "AI" },
      { slug: "agentic-coding", labelId: "Agentic Coding", labelEn: "Agentic Coding" },
      { slug: "vibe-coding", labelId: "Vibe Coding", labelEn: "Vibe Coding" },
      { slug: "saas", labelId: "SaaS", labelEn: "SaaS" },
    ],
  },
  office: {
    slug: "office",
    taglineId: "Kuasai Word, Excel & PowerPoint Sekali For-all",
    taglineEn: "Master Word, Excel & PowerPoint Once and For All",
    descId:
      "Tutorial langkah demi langkah bahasa manusia: dari dokumen pertama sampai trik pro yang menghemat jam kerjamu tiap minggu.",
    descEn:
      "Step-by-step tutorials in plain language: from your first document to pro tricks that save you hours every week.",
    svg: "/images/topics/office-alt.svg",
    gradient: "from-[#c2593a] via-[#8a5a44] to-[#33241c]",
    subcategories: [
      { slug: "word", labelId: "Word", labelEn: "Word" },
      { slug: "excel", labelId: "Excel", labelEn: "Excel" },
      { slug: "powerpoint", labelId: "PowerPoint", labelEn: "PowerPoint" },
    ],
  },
  akademik: {
    slug: "akademik",
    taglineId: "Skripsi Lancar, Referensi Beres",
    taglineEn: "Smooth Thesis, Sorted References",
    descId:
      "Mendeley, Zotero, Turnitin, Overleaf, sampai SPSS — semua alat skripsi dijelaskan langkah demi langkah biar wisuda tepat waktu.",
    descEn:
      "Mendeley, Zotero, Turnitin, Overleaf, to SPSS — every thesis tool explained step by step so you graduate on time.",
    svg: "/images/topics/akademik-alt.svg",
    gradient: "from-[#8a5a44] via-[#33241c] to-[#c2593a]",
    subcategories: [
      { slug: "mendeley", labelId: "Mendeley", labelEn: "Mendeley" },
      { slug: "alat-skripsi", labelId: "Alat Skripsi", labelEn: "Thesis Tools" },
    ],
  },
};
