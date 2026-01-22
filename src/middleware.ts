import { NextRequest, NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export function middleware(request: NextRequest) {
  if (!isProduction) {
    return NextResponse.next();
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps = forwardedProto ? forwardedProto === "https" : request.nextUrl.protocol === "https:";

  if (!isHttps) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    const response = NextResponse.redirect(url, 308);
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

