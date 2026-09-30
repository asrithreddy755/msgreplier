import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const url = new URL(request.url);

  // If a code parameter is present in the URL (e.g. from Google OAuth fallback redirect)
  // and we are not on the callback route, redirect to `/auth/callback` to exchange it.
  const code = url.searchParams.get('code');
  if (code && url.pathname !== '/auth/callback') {
    const callbackUrl = new URL('/auth/callback', url.origin);
    callbackUrl.search = url.search;
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static files (.webp, .png, .jpg, .svg, .mp3, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:webp|png|jpg|jpeg|gif|svg|mp3|ico|txt)$).*)',
  ],
};

