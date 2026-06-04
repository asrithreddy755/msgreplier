import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session_id: string | undefined = body?.session_id;
        const partner: 'a' | 'b' | undefined = body?.partner;
        const answers: unknown = body?.answers;

        if (!session_id || (partner !== 'a' && partner !== 'b') || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'session_id, partner ("a" or "b"), and answers (array) are required.' },
                { status: 400 }
            );
        }

        if ((answers as string[]).length !== 5) {
            return NextResponse.json(
                { error: 'Exactly 5 answers are required.' },
                { status: 400 }
            );
        }

        const { client: supabase, envStatus } = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Server misconfiguration: missing Supabase config.', env: envStatus },
                { status: 500 }
            );
        }

        // Read current submission state to decide whether both are now done
        const { data: current, error: fetchError } = await supabase
            .from('love_rapid_sessions')
            .select('a_submitted, b_submitted')
            .eq('id', session_id)
            .single();

        if (fetchError || !current) {
            console.error('[love-rapid/submit] Fetch error:', fetchError);
            return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
        }

        // Determine final submitted state after this update
        const aWillBeSubmitted = partner === 'a' ? true : current.a_submitted;
        const bWillBeSubmitted = partner === 'b' ? true : current.b_submitted;
        const bothSubmitted = aWillBeSubmitted && bWillBeSubmitted;

        // Build update payload
        const updatePayload: Record<string, unknown> =
            partner === 'a'
                ? { answers_a: answers, a_submitted: true }
                : { answers_b: answers, b_submitted: true };

        if (bothSubmitted) {
            updatePayload.status = 'revealing';
        }

        const { error: updateError } = await supabase
            .from('love_rapid_sessions')
            .update(updatePayload)
            .eq('id', session_id);

        if (updateError) {
            console.error('[love-rapid/submit] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to submit answers.' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[love-rapid/submit] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
