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

  // Fetch user profile plan and credits (from public.profiles)
  let profile = { plan: 'free', credits: 6 };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan, credits')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      profile = {
        plan: data.plan || 'free',
        credits: typeof data.credits === 'number' ? data.credits : 6
      };
    }
  } catch (e) {
    console.error('[dashboard] Error fetching profile details:', e);
  }

  // Fetch this user's greetings (graceful fallback if user_id column doesn't exist yet)
  let greetings: any[] = [];
  try {
    const { data, error } = await supabase
      .from('love_greetings')
      .select('id, slug, recipient_name, sender_name, occasion, theme, created_at, expires_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[dashboard] Error fetching greetings:', error.message);
    } else {
      greetings = data ?? [];
    }
  } catch (e) {
    console.error('[dashboard] Unexpected fetch error:', e);
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

