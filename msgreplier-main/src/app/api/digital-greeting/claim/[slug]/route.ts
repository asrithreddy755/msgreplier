import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/digital-greeting/claim/[slug]
 *
 * Links an existing (unclaimed) greeting to the currently authenticated user.
 * Only works if:
 *   1. The user is authenticated
 *   2. The greeting's user_id is currently NULL (unclaimed)
 *
 * This is called after inline login in step 4 of the create flow.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce 12-website limit
    const { count, error: countError } = await supabase
      .from('love_greetings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('[claim-greeting] Count error:', countError.message);
      return NextResponse.json({ error: 'Failed to verify website limits' }, { status: 500 });
    }

    if (count !== null && count >= 12) {
      return NextResponse.json({ error: 'You can create a maximum of 12 websites only.' }, { status: 403 });
    }

    // Only claim if currently unclaimed (user_id IS NULL)
    // This prevents overwriting another user's greeting
    const { data, error } = await supabase
      .from('love_greetings')
      .update({ user_id: user.id })
      .eq('slug', slug)
      .is('user_id', null)  // only unclaimed greetings
      .select('slug')
      .single();

    if (error || !data) {
      // Either not found, already claimed, or other error — return 200 silently
      // so the UI doesn't show an error to the user for edge cases
      return NextResponse.json({ ok: true, claimed: false });
    }

    return NextResponse.json({ ok: true, claimed: true, slug: data.slug });
  } catch (err) {
    console.error('[claim-greeting]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
