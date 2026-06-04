import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const room_code: string | undefined = body?.room_code;
        const name: string | undefined = body?.name;

        if (!room_code?.trim() || !name?.trim()) {
            return NextResponse.json(
                { error: 'room_code and name are required.' },
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

        const normalizedCode = room_code.trim().toUpperCase();

        // Find an active, waiting session with this code that has not expired
        const { data: session, error: fetchError } = await supabase
            .from('love_rapid_sessions')
            .select('id, partner_a_name, questions, expires_at')
            .eq('room_code', normalizedCode)
            .eq('status', 'waiting')
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (fetchError) {
            console.error('[love-rapid/join] Fetch error:', fetchError);
            return NextResponse.json({ error: 'Database error.' }, { status: 500 });
        }

        if (!session) {
            return NextResponse.json(
                { error: 'No waiting session found for that code. The code may be wrong or the session has already started / expired.' },
                { status: 404 }
            );
        }

        // Update: set partner_b_name and advance status to in_progress
        // This single UPDATE is what triggers Partner A's Realtime subscription
        const { error: updateError } = await supabase
            .from('love_rapid_sessions')
            .update({
                partner_b_name: name.trim(),
                status: 'in_progress',
            })
            .eq('id', session.id);

        if (updateError) {
            console.error('[love-rapid/join] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to join session.' }, { status: 500 });
        }

        return NextResponse.json({
            session_id: session.id,
            questions: session.questions,
            partner_a_name: session.partner_a_name,
        });
    } catch (err) {
        console.error('[love-rapid/join] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
