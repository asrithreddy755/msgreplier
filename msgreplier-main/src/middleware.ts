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

  const headers = new Headers(request.headers);
  headers.set('x-url', url.pathname);

  return NextResponse.next({
    request: {
      headers: headers,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
