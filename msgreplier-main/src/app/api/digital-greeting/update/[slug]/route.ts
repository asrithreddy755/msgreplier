import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_name, sender_name, message, occasion, theme, photo_url } = body;

    if (!recipient_name || !sender_name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update — the .eq('user_id', user.id) ensures ownership
    const { data, error } = await supabase
      .from('love_greetings')
      .update({ recipient_name, sender_name, message, occasion, theme, photo_url })
      .eq('slug', slug)
      .eq('user_id', user.id)  // only update if this user owns it
      .select()
      .single();

    if (error || !data) {
      console.error('[update-greeting] Error:', error?.message);
      return NextResponse.json(
        { error: 'Greeting not found or you do not have permission to edit it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ slug: data.slug });
  } catch (err) {
    console.error('[update-greeting] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
