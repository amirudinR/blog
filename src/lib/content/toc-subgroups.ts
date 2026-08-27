import type { Locale } from "@/lib/i18n/config";

export type TocArticleLike = {
  slug: string;
  title: string;
  readingTime: number;
  type?: "prophet" | "blog";
};

export type TocSubgroup = {
  label: string | null;
  articles: TocArticleLike[];
};

type RuleGroup = {
  labelId: string;
  labelEn: string;
  keywords: string[];
};

type CategoryRule = {
  match: string[];
  groups: RuleGroup[];
  remainderLabelId?: string;
  remainderLabelEn?: string;
};

const EXCEL_KEYWORDS = [
  "excel",
  "pivot",
  "vlookup",
  "xlookup",
  "index-match",
  "sumif",
  "countif",
  "iferror",
  "if bertumpuk",
  "fungsi if",
  "concatenate",
  "textjoin",
  "left, right, mid",
  "datedif",
  "wildcard",
  "array formula",
  "named ranges",
  "flash fill",
  "text to columns",
  "goal seek",
  "solver:",
  "scenario manager",
  "freeze panes",
  "print excel",
  "dropdown list",
  "remove duplicates",
  "sort dan filter",
  "conditional formatting",
  "protect sheet",
  "csv",
  "google sheets",
  "workbook",
  "rumus pertamamu",
  "operasi dasar",
  "relative vs absolute",
  "trim dan clean",
  "budget pribadi",
  "invoice",
  "absensi",
  "grading nilai",
  "nama depan",
  "dashboard mini",
  "link antar sheet",
  "konsolidasi",
  "custom number format",
  "memilih chart",
  "styling chart",
  "$a$1",
  "tanggal excel",
];

const POWERPOINT_KEYWORDS = [
  "powerpoint",
  "ppt",
  "slide",
  "slides",
  "presentasi",
  "deck",
  "morph",
  "presenter view",
  "rehearse",
  "webinar",
  "kiosk",
  "ikon",
  "stock image",
  "compress media",
  "handout",
  "screen recording",
  "narasi suara",
  "menyisipkan video",
  "animasi",
  "transisi",
  "designer:",
  "dark mode deck",
  "font hilang",
  "laser pointer",
  "brand kit",
  "mockup",
  "agenda dan roadmap",
  "data storytelling",
  "quote slide",
  "timeline proyek",
  "align dan distribute",
  "palet warna",
  "tipografi",
  "slide master",
  "mindset desain",
  "laporan bulanan",
  "pitch deck",
  "infografis",
  "q&a",
  "checklist h-1",
  "zoom:",
  "google slides",
  "foto produk",
  "gambar high-quality",
  "kelas online",
  "mengajar",
];

const RULES: CategoryRule[] = [
  {
    match: ["office", "dokumen", "document"],
    groups: [
      {
        labelId: "Microsoft Excel",
        labelEn: "Microsoft Excel",
        keywords: EXCEL_KEYWORDS,
      },
      {
        labelId: "Microsoft PowerPoint",
        labelEn: "Microsoft PowerPoint",
        keywords: POWERPOINT_KEYWORDS,
      },
    ],
    remainderLabelId: "Microsoft Word",
    remainderLabelEn: "Microsoft Word",
  },
  {
    match: ["teknologi", "technolog"],
    groups: [
      {
        labelId: "Vibe Coding",
        labelEn: "Vibe Coding",
        keywords: [
          "vibe coding",
          "git masalahmu",
          "app jadi dalam satu weekend",
          "dari prototype ke produksi",
          "iterasi cepat",
          "coding dengan prompt",
          "hak cipta kode",
          "vibe coding cocok",
        ],
      },
      {
        labelId: "AI Agent",
        labelEn: "AI Agents",
        keywords: [
          "agent",
          "agentic",
          "mcp:",
          "claude code",
          "cursor",
          "human-in-the-loop",
        ],
      },
      {
        labelId: "SaaS & Micro-SaaS",
        labelEn: "SaaS & Micro-SaaS",
        keywords: [
          "saas",
          "mrr dan arr",
          "churn",
          "freemium",
          "bootstrapping",
          "cac dan ltv",
          "product-led",
          "b2b sales",
          "niche down",
          "white label",
          "community-led",
          "annual vs monthly",
          "feature request",
          "playbook launch",
          "playbook mencegah",
          "solopreneur",
          "scaling infrastruktur",
          "otomatisasi support",
          "onboarding yang bikin",
          "customer success",
          "integrasi billing",
          "multi-tenant",
          "api-first",
        ],
      },
      {
        labelId: "AI & LLM",
        labelEn: "AI & LLM",
        keywords: [
          "ai",
          "llm",
          "chatgpt",
          "rag",
          "prompt",
          "machine learning",
          "deep learning",
          "transformer",
          "embedding",
          "context window",
          "multimodal",
          "fine-tuning",
          "hallucination",
          "open-source vs proprietary",
          "agi:",
          "synthetic data",
          "guardrails",
          "structured output",
          "chain-of-thought",
          "zero-shot",
          "temperature dan top-p",
          "quantization",
          "knowledge distillation",
          "hemat biaya api",
          "deteksi tulisan buatan",
          "tutor pribadi",
          "menulis lebih baik dengan bantuan",
          "produktivitas kerjamu",
          "masa depan kerja",
          "sering tak kita sadari",
          "openai",
          "claude",
          "gemini",
          "karir di bidang ai",
        ],
      },
      {
        labelId: "Web Development",
        labelEn: "Web Development",
        keywords: ["next.js"],
      },
    ],
  },
  {
    match: ["bisnis", "business"],
    groups: [
      {
        labelId: "Marketing & Penjualan",
        labelEn: "Marketing & Sales",
        keywords: [
          "seo",
          "ads",
          "email marketing",
          "social media",
          "content marketing",
          "copywriting",
          "sales funnel",
          "digital marketing",
          "e-commerce",
          "branding:",
          "negoisasi",
        ],
      },
      {
        labelId: "Keuangan & Investasi",
        labelEn: "Finance & Investment",
        keywords: [
          "crypto",
          "saham",
          "real estate",
          "passive income",
          "cash flow",
        ],
      },
      {
        labelId: "Karier & Personal Branding",
        labelEn: "Career & Personal Branding",
        keywords: ["freelancing", "personal branding", "side hustle", "leadership"],
      },
      {
        labelId: "Strategi & Operasional",
        labelEn: "Strategy & Operations",
        keywords: [
          "business plan",
          "lean startup",
          "startup funding",
          "pricing strategy",
          "kpi",
          "partnership:",
          "partner bisnis",
          "customer retention",
          "crisis management",
          "exit strategy:",
          "toko online",
        ],
      },
    ],
  },
  {
    match: ["motivasi", "motiv", "pengembangan"],
    groups: [
      {
        labelId: "Produktivitas & Fokus",
        labelEn: "Productivity & Focus",
        keywords: [
          "deep work",
          "time blocking",
          "prokrastinasi",
          "digital detox",
          "energy management",
          "the power of no",
          "goal setting",
          "sleep optimization",
          "produktivitas",
          "keuangan pribadi",
        ],
      },
      {
        labelId: "Mindset & Mental",
        labelEn: "Mindset & Mental",
        keywords: [
          "stoicism",
          "ikigai",
          "growth mindset",
          "law of attraction",
          "gratitude",
          "keberanian",
          "fear of failure",
          "self-discipline",
          "overthinking",
          "confidence",
          "resiliensi",
          "keberhasilan",
          "compound effect",
          "5-second",
          "mindfulness",
          "power of silence",
          "emotional intelligence",
          "public speaking",
        ],
      },
      {
        labelId: "Kebiasaan & Gaya Hidup",
        labelEn: "Habits & Lifestyle",
        keywords: [
          "habit stacking",
          "kebiasaan",
          "morning rituals",
          "night owls",
          "journaling",
          "cold shower",
          "intermittent fasting",
          "minimalisme",
        ],
      },
    ],
  },
  {
    match: ["sejarah", "histor"],
    groups: [
      {
        labelId: "Dinosaurus & Prasejarah",
        labelEn: "Dinosaurs & Prehistory",
        keywords: [
          "dinosaurus",
          "t-rex",
          "velociraptor",
          "triceratops",
          "spinosaurus",
          "brachiosaurus",
          "pterosaurus",
          "mosasaurus",
          "megalodon",
          "mamut",
          "mammalia",
          "kepunahan massal",
        ],
      },
      {
        labelId: "Misteri & Artefak Purba",
        labelEn: "Mysteries & Ancient Artifacts",
        keywords: [
          "loch ness",
          "bulan",
          "uss indianapolis",
          "area 51",
          "tutankhamun",
          "piri reis",
          "stonehenge",
          "voynich",
          "artefak bagdad",
          "atlantik",
          "segitiga bermuda",
          "antikythera",
          "piramida giza",
        ],
      },
      {
        labelId: "Peradaban Kuno",
        labelEn: "Ancient Civilizations",
        keywords: [
          "dinasti han",
          "phoenicia",
          "yunani kuno",
          "romawi kuno",
          "lembah indus",
          "mesir kuno",
          "toltec",
          "tenochtitlan",
          "kota tertua",
        ],
      },
      {
        labelId: "Ekonomi & Perdagangan Kuno",
        labelEn: "Ancient Economy & Trade",
        keywords: ["ekonomi", "perdagangan", "uang", "silk road"],
      },
      {
        labelId: "Sejarah Jepang",
        labelEn: "Japanese History",
        keywords: [
          "jepang",
          "japan",
          "edo",
          "meiji",
          "genpei",
          "bushido",
          "samurai",
          "shogun",
          "tokugawa",
          "tokyo",
          "yen",
          "tsunami",
          "tohoku",
          "ainu",
          "geisha",
          "hiroshima",
          "nagasaki",
          "kamikaze",
          "feodal",
          "oni:",
          "heian",
          "heisei",
          "sengoku",
          "kofun",
          "yamato",
          "musashi",
          "nara",
          "ninja",
          "shinobi",
          "pasal 9",
          "pearl harbor",
          "shimabara",
          "boshin",
          "onin",
          "pasifik",
          "midway",
          "ronin",
          "sankin-kotai",
          "seppuku",
          "ashikaga",
          "muromachi",
          "asuka",
          "soga",
          "mononobe",
          "yakuza",
          "bubble economy",
          "yoshitsune",
          "minamoto",
          "daimyo",
          "konstitusi",
        ],
      },
    ],
  },
  {
    match: ["desain", "design"],
    groups: [
      {
        labelId: "CorelDRAW",
        labelEn: "CorelDRAW",
        keywords: [
          "coreldraw",
          "corel",
          "convert to curves",
          "spanduk",
          "banner ukuran besar",
          "kartu nama",
          "percetakan",
        ],
      },
      {
        labelId: "Photoshop",
        labelEn: "Photoshop",
        keywords: [
          "photoshop",
          "psd",
          "dodge",
          "burn",
          "liquify",
          "retouch",
          "panorama",
          "stitching",
          "brightness",
          "levels",
          "hue/saturation",
          "color balance",
          "actions",
          "batch processing",
          "layer mask",
          "smart object",
          "pen tool",
          "seleksi",
        ],
      },
    ],
    remainderLabelId: "Fondasi & Praktik Desain",
    remainderLabelEn: "Design Foundations & Practice",
  },
  {
    match: ["akademik", "skripsi"],
    groups: [
      {
        labelId: "Mendeley, Zotero & Sitasi",
        labelEn: "Mendeley, Zotero & Citations",
        keywords: [
          "mendeley",
          "zotero",
          "endnote",
          "sitasi",
          "citation",
          "bibliografi",
          "referensi",
          "reference",
          "gaya sitasi",
          "edit citation",
          "cite",
          "library",
        ],
      },
      {
        labelId: "Skripsi & Penelitian",
        labelEn: "Thesis & Research",
        keywords: [
          "skripsi",
          "thesis",
          "penelitian",
          "sample size",
          "slovin",
          "raosoft",
          "uji-t",
          "statistik",
          "regresi",
          "kuesioner",
          "wawancara",
          "fgd",
          "metodologi",
          "populasi",
          "validitas",
          "reliabilitas",
          "hipotesis",
        ],
      },
    ],
    remainderLabelId: "Tools Akademik",
    remainderLabelEn: "Academic Tools",
  },
  {
    match: ["bahasa-jepang", "bahasa jepang"],
    groups: [
      {
        labelId: "Pemula, Kanji & JLPT",
        labelEn: "Beginners, Kanji & JLPT",
        keywords: [
          "pemula",
          "dari nol",
          "roadmap",
          "jlpt",
          "n5",
          "n4",
          "n3",
          "n2",
          "n1",
          "kanji",
          "hiragana",
          "katakana",
          "huruf",
          "kesalahan umum",
          "persiapan total",
          "angka",
          "romaji",
        ],
      },
      {
        labelId: "Tata Bahasa",
        labelEn: "Grammar",
        keywords: [
          "te-form",
          "kondisional",
          "tara",
          "partikel",
          "pasif",
          "tata bahasa",
          "grammar",
          "kata kerja",
          "bentuk",
          "kalimat",
          "wa dan ga",
          "counter words",
          "counter",
          "desu/masu",
          "kata sifat",
          "kata ganti",
          "watashi",
        ],
      },
      {
        labelId: "Kosakata & Ekspresi",
        labelEn: "Vocabulary & Expressions",
        keywords: [
          "kosakata",
          "percakapan",
          "menyapa",
          "ohayou",
          "kotowaza",
          "pepatah",
          "ucapan",
          "idiom",
          "email bisnis",
          "keigo",
          "sopan",
          "pitch accent",
          "dialek",
          "kansai",
          "hashi",
          "kata pertama",
          "giongo",
          "gitaigo",
          "onomatope",
          "jikoshoukai",
          "memperkenalkan diri",
          "kenjougo",
          "merendah",
          "mora",
          "irama",
          "rirekisho",
          "slang",
          "yabai",
          "wawancara kerja",
          "frasa",
          "akhiran nama",
        ],
      },
      {
        labelId: "Metode Belajar",
        labelEn: "Learning Methods",
        keywords: [
          "immersion",
          "ajatt",
          "anki",
          "flashcard",
          "mandiri",
          "tips belajar",
          "aplikasi belajar",
          "aplikasi terbaik",
          "anime",
          "textbook",
          "genki",
          "minna no nihongo",
          "listening",
          "shadowing",
          "rutinitas harian",
        ],
      },
    ],
  },
  {
    match: ["budaya"],
    groups: [
      {
        labelId: "Festival & Tradisi",
        labelEn: "Festivals & Traditions",
        keywords: [
          "festival",
          "obon",
          "kodomo",
          "hanami",
          "matsuri",
          "tradisi",
          "empat musim",
          "musiman",
          "tahun baru",
          "upacara",
          "layang-layang",
          "hanabi",
          "setsubun",
          "kembang api",
        ],
      },
      {
        labelId: "Kuliner Jepang",
        labelEn: "Japanese Cuisine",
        keywords: [
          "sushi",
          "wagashi",
          "makanan",
          "kuliner",
          "masakan",
          "ramen",
          "sake",
          "minuman",
          "onigiri",
          "matcha",
          "ikan",
          "bento",
          "izakaya",
          "kaiseki",
        ],
      },
      {
        labelId: "Seni, Pakaian & Olahraga Tradisional",
        labelEn: "Traditional Arts, Dress & Sports",
        keywords: [
          "origami",
          "ikebana",
          "bonsai",
          "shodo",
          "kaligrafi",
          "kuas",
          "sumo",
          "judo",
          "karate",
          "kendo",
          "aikido",
          "budo",
          "bela diri",
          "tarian",
          "odori",
          "kimono",
          "yukata",
          "pakaian",
          "taman",
          "lanskap",
        ],
      },
      {
        labelId: "Agama, Legenda & Kepercayaan",
        labelEn: "Religion, Legends & Beliefs",
        keywords: [
          "shinto",
          "buddha",
          "buddhis",
          "amaterasu",
          "dewi",
          "kami",
          "mitologi",
          "legenda",
          "kuil",
          "cerita rakyat",
          "yokai",
          "krisantemum",
          "daruma",
          "maneki-neko",
          "zen",
          "keberuntungan",
          "rezeki",
          "pengusir setan",
        ],
      },
      {
        labelId: "Pop Culture & Hiburan",
        labelEn: "Pop Culture & Entertainment",
        keywords: [
          "manga",
          "anime",
          "harajuku",
          "pachinko",
          "cosplay",
          "game",
          "j-pop",
          "idol",
          "fashion",
          "gaya jalanan",
          "hiburan",
          "komik",
          "ghibli",
          "dongeng",
        ],
      },
      {
        labelId: "Kehidupan Sehari-hari",
        labelEn: "Daily Life",
        keywords: [
          "genkan",
          "kotatsu",
          "konbini",
          "vending",
          "onsen",
          "sento",
          "ryokan",
          "tatami",
          "futon",
          "shinkansen",
          "kereta",
          "sekolah",
          "seragam",
          "bukatsu",
          "rumah",
          "minimarket",
          "mandi",
        ],
      },
      {
        labelId: "Filosofi & Cara Hidup",
        labelEn: "Philosophy & Way of Life",
        keywords: [
          "kaizen",
          "budaya kerja",
          "karoshi",
          "nomikai",
          "dedikasi",
          "etika",
          "kerja keras",
          "filosofi",
          "perbaikan",
          "wabi-sabi",
          "mono no aware",
          "kintsugi",
          "omotenashi",
          "keramahan",
          "keindahan",
          "presisi",
        ],
      },
    ],
  },
];

const regexCache = new Map<string, RegExp>();

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesText(text: string, keywords: string[]): boolean {
  for (const keyword of keywords) {
    let regex = regexCache.get(keyword);
    if (!regex) {
      regex = new RegExp(
        `(^|[^\\p{L}])${escapeRegExp(keyword)}([^\\p{L}]|$)`,
        "iu"
      );
      regexCache.set(keyword, regex);
    }
    if (regex.test(text)) return true;
  }
  return false;
}

function ruleFor(categoryName: string): CategoryRule | null {
  const name = categoryName.toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some((anchor) => name.includes(anchor))) return rule;
  }
  return null;
}

const CATEGORY_MERGE_LABELS: Record<string, string> = {
  "pengembangan diri": "motivasi",
  "self improvement": "motivation",
};

function sortAlphabetically(
  articles: TocArticleLike[],
  locale: Locale
): TocArticleLike[] {
  const collator = new Intl.Collator(locale === "id" ? "id" : "en", {
    sensitivity: "base",
    numeric: true,
  });
  return [...articles].sort((a, b) => collator.compare(a.title, b.title));
}

export function subgroupArticles(
  articles: TocArticleLike[],
  categoryName: string,
  locale: Locale
): TocSubgroup[] {
  const normalizedCategory = CATEGORY_MERGE_LABELS[categoryName.toLowerCase()] ?? categoryName;
  const rule = ruleFor(normalizedCategory);
  const sorted = sortAlphabetically(articles, locale);
  if (!rule) return [{ label: null, articles: sorted }];

  const buckets: TocSubgroup[] = rule.groups.map((group) => ({
    label: locale === "id" ? group.labelId : group.labelEn,
    articles: [],
  }));
  const rest: TocArticleLike[] = [];

  for (const article of sorted) {
    const searchable = `${article.title} ${article.slug}`;
    let placed = false;
    for (let i = 0; i < rule.groups.length; i++) {
      if (matchesText(searchable, rule.groups[i].keywords)) {
        buckets[i].articles.push(article);
        placed = true;
        break;
      }
    }
    if (!placed) rest.push(article);
  }

  const fallback =
    locale === "id" ? "Topik Lainnya" : "Other Topics";
  const remainderLabel =
    rule.remainderLabelId !== undefined
      ? locale === "id"
        ? rule.remainderLabelId
        : rule.remainderLabelEn ?? rule.remainderLabelId
      : fallback;

  const result = buckets.filter((bucket) => bucket.articles.length > 0);
  if (rest.length > 0) {
    result.push({ label: remainderLabel, articles: rest });
  }
  return result;
}
