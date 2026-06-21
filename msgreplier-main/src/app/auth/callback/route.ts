import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/wishes/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to a small client-side page that:
      //  1. Checks sessionStorage for a pendingClaimSlug (from Google OAuth in create flow)
      //  2. Claims it if present, then goes to dashboard
      //  3. Otherwise goes directly to next
      const destination = new URL('/auth/post-login', requestUrl.origin);
      destination.searchParams.set('next', next);
      return NextResponse.redirect(destination);
    }
  }

  console.error('[auth/callback] Code exchange failed or code missing');
  return NextResponse.redirect(
    new URL('/wishes/login?error=auth-failed', requestUrl.origin)
  );
}
