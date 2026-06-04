import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';
import { QUESTIONS, CHOICE_QUESTIONS } from '@/lib/love-rapid-questions';

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
        const roomId: string | undefined = body?.roomId;

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required.' }, { status: 400 });
        }

        const { client: supabase, envStatus } = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Server misconfiguration: missing Supabase config.', env: envStatus },
                { status: 500 }
            );
        }

        // 1. Fetch room members to get their names
        const { data: members, error: membersError } = await supabase
            .from('love_room_members')
            .select('*')
            .eq('room_id', roomId)
            .order('joined_at', { ascending: true });

        if (membersError) {
            console.error('[love-rapid/init-room] Members fetch error:', membersError);
            return NextResponse.json({ error: 'Failed to fetch room members.' }, { status: 500 });
        }

        if (!members || members.length < 2) {
            return NextResponse.json({ 
                error: 'waiting_for_partner',
                message: 'Waiting for your partner to join the Love Space room first.' 
            }, { status: 200 }); // Status 200 with error key so client can render friendly UI
        }

        const partnerAName = members[0].nickname;
        const partnerBName = members[1].nickname;

        // 2. Check if a session already exists with this roomId
        const { data: existingSession, error: existingError } = await supabase
            .from('love_rapid_sessions')
            .select('*')
            .eq('room_code', roomId)
            .maybeSingle();

        if (existingError) {
            console.error('[love-rapid/init-room] Existing session fetch error:', existingError);
            return NextResponse.json({ error: 'Database error.' }, { status: 500 });
        }

        if (existingSession) {
            return NextResponse.json({
                session_id: existingSession.id,
                room_code: existingSession.room_code,
                questions: existingSession.questions,
                partner_a_name: existingSession.partner_a_name,
                partner_b_name: existingSession.partner_b_name,
                status: existingSession.status,
                a_submitted: existingSession.a_submitted,
                b_submitted: existingSession.b_submitted,
                answers_a: existingSession.answers_a,
                answers_b: existingSession.answers_b,
            });
        }

        // 3. Create a new session
        const questions = pickQuestions(partnerAName, partnerBName);
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

        const { data: session, error: insertError } = await supabase
            .from('love_rapid_sessions')
            .insert({
                room_code: roomId,
                partner_a_name: partnerAName,
                partner_b_name: partnerBName,
                questions,
                status: 'in_progress', // Start in_progress immediately
                expires_at: expiresAt,
            })
            .select('*')
            .single();

        if (insertError || !session) {
            if (insertError?.code === '23505') {
                const { data: retrySession, error: retryError } = await supabase
                    .from('love_rapid_sessions')
                    .select('*')
                    .eq('room_code', roomId)
                    .maybeSingle();

                if (retrySession && !retryError) {
                    return NextResponse.json({
                        session_id: retrySession.id,
                        room_code: retrySession.room_code,
                        questions: retrySession.questions,
                        partner_a_name: retrySession.partner_a_name,
                        partner_b_name: retrySession.partner_b_name,
                        status: retrySession.status,
                        a_submitted: retrySession.a_submitted,
                        b_submitted: retrySession.b_submitted,
                        answers_a: retrySession.answers_a,
                        answers_b: retrySession.answers_b,
                    });
                }
            }
            console.error('[love-rapid/init-room] Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
        }

        return NextResponse.json({
            session_id: session.id,
            room_code: session.room_code,
            questions: session.questions,
            partner_a_name: session.partner_a_name,
            partner_b_name: session.partner_b_name,
            status: session.status,
            a_submitted: session.a_submitted,
            b_submitted: session.b_submitted,
        });

    } catch (err) {
        console.error('[love-rapid/init-room] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
