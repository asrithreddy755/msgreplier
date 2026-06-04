import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';
import { QUESTIONS } from '@/lib/love-rapid-questions';

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous chars (0/O, 1/I)
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function pickQuestions(n = 5): string[] {
    return [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, n);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name: string | undefined = body?.name;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const { client: supabase, envStatus } = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Server misconfiguration: missing Supabase config.', env: envStatus },
                { status: 500 }
            );
        }

        // Piggyback cleanup: hard-delete expired sessions on every create
        try {
            await supabase
                .from('love_rapid_sessions')
                .delete()
                .lt('expires_at', new Date().toISOString());
        } catch (gcErr) {
            console.error('[love-rapid/create] GC cleanup error (non-fatal):', gcErr);
        }

        // Generate a unique 6-char alphanumeric room code
        let roomCode = '';
        let isUnique = false;
        let attempts = 0;

        while (attempts < 10 && !isUnique) {
            roomCode = generateRoomCode();
            const { data: existing } = await supabase
                .from('love_rapid_sessions')
                .select('id')
                .eq('room_code', roomCode)
                .maybeSingle();

            if (!existing) isUnique = true;
            attempts++;
        }

        if (!isUnique) {
            return NextResponse.json(
                { error: 'Could not generate a unique room code. Please try again.' },
                { status: 500 }
            );
        }

        const questions = pickQuestions(5);
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

        const { data: session, error: insertError } = await supabase
            .from('love_rapid_sessions')
            .insert({
                room_code: roomCode,
                partner_a_name: name.trim(),
                questions,
                status: 'waiting',
                expires_at: expiresAt,
            })
            .select('id, room_code, questions')
            .single();

        if (insertError || !session) {
            console.error('[love-rapid/create] Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
        }

        return NextResponse.json({
            session_id: session.id,
            room_code: session.room_code,
            questions: session.questions,
        });
    } catch (err) {
        console.error('[love-rapid/create] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
