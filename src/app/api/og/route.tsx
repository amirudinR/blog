import { ImageResponse } from "next/og";

const CREAM = "#faf6f0";
const TERRACOTTA = "#c2593a";
const INK = "#33241c";
const MUTED = "#8a5a44";

function resolveTitle(raw: string | null): string {
  const fallback = process.env.NEXT_PUBLIC_SITE_NAME ?? "BlogKu";
  const trimmed = raw?.trim();
  return trimmed ? trimmed.slice(0, 200) : fallback;
}

function resolveLocale(raw: string | null): "id" | "en" {
  return raw === "en" ? "en" : "id";
}

function titleFontSize(length: number): number {
  if (length > 120) return 52;
  if (length > 90) return 62;
  if (length > 60) return 76;
  if (length > 36) return 90;
  return 104;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = resolveTitle(searchParams.get("title"));
  const locale = resolveLocale(searchParams.get("locale"));
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "BlogKu";

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            backgroundImage: `linear-gradient(135deg, ${CREAM} 0%, #f8f1e8 55%, #eed7c6 100%)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 28,
              backgroundColor: TERRACOTTA,
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "72px 84px 56px 132px",
            }}
          >
            <div
              style={{
                display: "flex",
                overflow: "hidden",
                maxHeight: 400,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: titleFontSize(title.length),
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: INK,
                  maxWidth: 940,
                }}
              >
                {title}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: TERRACOTTA,
                  color: CREAM,
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  padding: "12px 28px",
                  borderRadius: 10,
                }}
              >
                {siteName}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 24,
                  fontWeight: 600,
                  color: MUTED,
                  border: `2px solid ${TERRACOTTA}`,
                  borderRadius: 999,
                  padding: "8px 22px",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {locale}
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 80,
            backgroundColor: CREAM,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: INK,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 28,
              color: TERRACOTTA,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            {siteName}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
