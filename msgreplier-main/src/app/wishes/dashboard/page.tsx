import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import WishesDashboardClient from './WishesDashboardClient';

// Required for cookies() to work in Next.js 15 App Router with Cloudflare
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Wishes Dashboard | MsgReplier',
  description: 'View and manage all the Wishes pages you have created.',
  robots: { index: false },
};

export default async function WishesDashboardPage() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (e) {
    console.error('[dashboard] Failed to create supabase client:', e);
    redirect('/wishes/login?next=/wishes/dashboard');
  }

  // Check auth — redirect to login if no session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/wishes/login?next=/wishes/dashboard');
  }

  // Fetch profile plan/credits and user's love greetings in parallel
  let profile = { plan: 'free', credits: 6 };
  let greetings: any[] = [];

  try {
    const [profileResult, greetingsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('plan, credits')
        .eq('id', user.id)
        .single(),
      supabase
        .from('love_greetings')
        .select('id, slug, recipient_name, sender_name, occasion, theme, created_at, expires_at, birthday_date, fit_mode')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    if (!profileResult.error && profileResult.data) {
      profile = {
        plan: profileResult.data.plan || 'free',
        credits: typeof profileResult.data.credits === 'number' ? profileResult.data.credits : 6
      };
    } else if (profileResult.error) {
      console.error('[dashboard] Error fetching profile details:', profileResult.error.message);
    }

    if (!greetingsResult.error && greetingsResult.data) {
      greetings = greetingsResult.data;
    } else if (greetingsResult.error) {
      console.error('[dashboard] Error fetching greetings:', greetingsResult.error.message);
    }
  } catch (e) {
    console.error('[dashboard] Unexpected parallel fetch error:', e);
  }

  return (
    <WishesDashboardClient
      user={{
        email: user.email ?? '',
        id: user.id,
        plan: profile.plan,
        credits: profile.credits
      }}
      greetings={greetings}
    />
  );
}

