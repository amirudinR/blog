import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLatestPosts } from "@/lib/db/queries";
import { isValidLocale } from "@/lib/i18n/config";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return new Response("Not Found", { status: 404 });
  }

  const latest = await getLatestPosts(locale, 1, 10);

  const items = latest.posts
    .map((post) => {
      const link = `${SITE_URL}/${locale}/blog/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : "";
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid>${escapeXml(link)}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
        post.excerpt
          ? `      <description>${escapeXml(post.excerpt)}</description>`
          : null,
        "    </item>",
      ].flatMap((line) => (line === null ? [] : [line]));
    })
    .map((itemLines) => itemLines.join("\n"))
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(`${SITE_NAME} (${locale})`)}</title>`,
    `    <link>${escapeXml(`${SITE_URL}/${locale}`)}</link>`,
    `    <description>${escapeXml(SITE_NAME)}</description>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
