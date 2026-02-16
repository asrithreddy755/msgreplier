import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const original = url.pathname;

  const ignored =
    /^\/(?:api|_next)(?:\/|$)/i.test(original) ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff)$/i.test(original) ||
    original === "/favicon.ico" ||
    original === "/robots.txt" ||
    original === "/sitemap.xml";
  if (ignored) return NextResponse.next();

  let normalized = original;

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.replace(/\/+$/, "");
  }

  if (normalized.length > 1 && normalized.endsWith(".")) {
    normalized = normalized.replace(/\.+$/, "");
  }

  normalized = normalized.toLowerCase();

  if (normalized === "/cham-ai") {
    normalized = "/prompt";
  }

  if (normalized !== original) {
    url.pathname = normalized;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff)).*)",
  ],
};
