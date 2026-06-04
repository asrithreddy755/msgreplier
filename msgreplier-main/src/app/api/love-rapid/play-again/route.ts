import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';
import { QUESTIONS, CHOICE_QUESTIONS } from '@/lib/love-rapid-questions';

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function pickQuestions(partnerAName: string, partnerBName: string) {
    const chosenChoices = [...CHOICE_QUESTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(text => ({
            text,
            type: 'choice' as const,
            options: [partnerAName, partnerBName]
        }));

    const chosenWritten = [...QUESTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(text => ({
            text,
            type: 'written' as const
        }));

    return [...chosenChoices, ...chosenWritten];
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const old_session_id: string | undefined = body?.old_session_id;

        if (!old_session_id) {
            return NextResponse.json({ error: 'old_session_id is required.' }, { status: 400 });
        }

        const { client: supabase, envStatus } = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Server misconfiguration: missing Supabase config.', env: envStatus },
                { status: 500 }
            );
        }

        // Fetch partner names from old session
        const { data: oldSession, error: fetchError } = await supabase
            .from('love_rapid_sessions')
            .select('partner_a_name, partner_b_name')
            .eq('id', old_session_id)
            .single();

        if (fetchError || !oldSession) {
            console.error('[love-rapid/play-again] Fetch error:', fetchError);
            return NextResponse.json({ error: 'Original session not found.' }, { status: 404 });
        }

        // Generate a unique new room code
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

        const questions = pickQuestions(oldSession.partner_a_name, oldSession.partner_b_name || '');
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

        // Create new session with both names already set and status = in_progress
        // (No waiting room needed — both partners are already playing)
        const { data: newSession, error: insertError } = await supabase
            .from('love_rapid_sessions')
            .insert({
                room_code: roomCode,
                partner_a_name: oldSession.partner_a_name,
                partner_b_name: oldSession.partner_b_name,
                questions,
                status: 'in_progress',
                expires_at: expiresAt,
            })
            .select('id, room_code, questions')
            .single();

        if (insertError || !newSession) {
            console.error('[love-rapid/play-again] Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create new session.' }, { status: 500 });
        }

        // Update old session with next_session_id / next_room_code
        // This triggers Partner B's Realtime subscription on the old session,
        // letting them auto-advance to the new game without re-entering a code.
        await supabase
            .from('love_rapid_sessions')
            .update({
                next_session_id: newSession.id,
                next_room_code: newSession.room_code,
            })
            .eq('id', old_session_id);

        return NextResponse.json({
            new_session_id: newSession.id,
            new_room_code: newSession.room_code,
            questions: newSession.questions,
        });
    } catch (err) {
        console.error('[love-rapid/play-again] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
