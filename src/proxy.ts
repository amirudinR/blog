import { NextResponse, type NextRequest } from "next/server";

const locales = ["id", "en"];
const defaultLocale = "id";

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.trim().split("-")[0].toLowerCase();
    if (locales.includes(code)) return code;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLogin = pathname.startsWith("/admin/login");
    const hasSession = request.cookies.has("blog_session");
    if (!isLogin && !hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (!hasLocale) {
    const locale = detectLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export const middleware = proxy;
export default proxy;
