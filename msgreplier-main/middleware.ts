import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware-client";

// Routes under /wishes/* that are publicly accessible (no auth required)
const WISHES_PUBLIC_PATHS = ["/wishes/login", "/wishes/signup"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const original = url.pathname;

  // --- 1. Bypass static assets, API routes, and Next.js internals ---
  const apiOrNext = original.startsWith("/api/") || original.startsWith("/_next/");
  const isStaticFile = /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff)$/i.test(original);
  const isSpecialFile =
    original === "/favicon.ico" ||
    original === "/robots.txt" ||
    original === "/sitemap.xml" ||
    original === "/ads.txt";

  if (apiOrNext || isStaticFile || isSpecialFile) {
    return NextResponse.next();
  }

  // --- 2. URL normalization (existing behavior — preserved as-is) ---
  let normalized = original.toLowerCase();

  if (normalized === "/cham-ai") {
    normalized = "/prompt";
  }

  if (normalized !== original) {
    url.pathname = normalized;
    return NextResponse.redirect(url, 308);
  }

  // --- 3. Supabase session refresh (required for /wishes/* routes) ---
  // Restrict session check to /wishes routes to avoid running database/auth CPU on every public page request.
  if (original.startsWith("/wishes")) {
    const { supabase, supabaseResponse } = createSupabaseMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // --- 4. Protect /wishes/dashboard and /wishes/edit/* ---
    const isProtectedWishesRoute =
      original.startsWith("/wishes/dashboard") ||
      original.startsWith("/wishes/edit");

    const isPublicWishesAuth = WISHES_PUBLIC_PATHS.some(
      (p) => original === p || original.startsWith(p + "/")
    );

    if (isProtectedWishesRoute && !user) {
      // Unauthenticated — redirect to login, preserve intended destination
      const loginUrl = new URL("/wishes/login", request.url);
      loginUrl.searchParams.set("next", original);
      return NextResponse.redirect(loginUrl);
    }

    // If logged in and hitting login/signup, redirect to dashboard
    if (isPublicWishesAuth && user) {
      return NextResponse.redirect(new URL("/wishes/dashboard", request.url));
    }

    // Return the supabaseResponse (which carries updated auth cookies)
    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files. Supabase needs to run on all pages
    // to keep sessions alive, but we only redirect on specific /wishes/* routes.
    "/((?!api|_next/static|_next/image|_next|favicon.ico|robots.txt|sitemap.xml|ads.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff)).*)",
  ],
};
