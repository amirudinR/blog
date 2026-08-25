import type { Locale } from "@/lib/i18n/config";
import type { TocArticle } from "@/lib/db/firestore";

export type TocSubgroup = {
  label: string | null;
  articles: TocArticle[];
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

const RULES: CategoryRule[] = [
  {
    match: ["office", "dokumen", "document"],
    groups: [
      {
        labelId: "Microsoft Excel",
        labelEn: "Microsoft Excel",
        keywords: [
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
        ],
      },
      {
        labelId: "Microsoft PowerPoint",
        labelEn: "Microsoft PowerPoint",
        keywords: [
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
        ],
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
          "negoisasi",
          "crisis management",
          "exit strategy:",
          "branding",
        ],
      },
    ],
  },
  {
    match: ["motivasi", "motiv"],
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
    ],
  },
];

const regexCache = new Map<string, RegExp>();

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesTitle(title: string, keywords: string[]): boolean {
  for (const keyword of keywords) {
    let regex = regexCache.get(keyword);
    if (!regex) {
      regex = new RegExp(
        `(^|[^\\p{L}])${escapeRegExp(keyword)}([^\\p{L}]|$)`,
        "iu"
      );
      regexCache.set(keyword, regex);
    }
    if (regex.test(title)) return true;
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

export function subgroupArticles(
  articles: TocArticle[],
  categoryName: string,
  locale: Locale
): TocSubgroup[] {
  const rule = ruleFor(categoryName);
  if (!rule) return [{ label: null, articles }];

  const buckets: TocSubgroup[] = rule.groups.map((group) => ({
    label: locale === "id" ? group.labelId : group.labelEn,
    articles: [],
  }));
  const rest: TocArticle[] = [];

  for (const article of articles) {
    let placed = false;
    for (let i = 0; i < rule.groups.length; i++) {
      if (matchesTitle(article.title, rule.groups[i].keywords)) {
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
