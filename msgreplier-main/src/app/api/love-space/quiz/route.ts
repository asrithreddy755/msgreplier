
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';


// This route is ONLY for the Love Space page quiz.
// It uses its own dedicated table: love_space_quizzes
// and does NOT touch the generic love_quizzes table used by love-score.

type QuizQuestion = {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
};

type LoveSpaceQuizRow = {
    id: string;
    room_id: string;
    creator_id: string;
    taker_id: string | null;
    title: string;
    questions: QuizQuestion[];
    score: number | null;
    status: 'pending' | 'completed';
    created_at: string;
    taker_answers: number[] | null;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json(
            {
                error: 'Supabase client unavailable. Set SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC prefix) in deployment.',
                env: envStatus,
            },
            { status: 500 },
        );
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('love_space_quizzes')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Love Space quiz GET error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ quizzes: (data ?? []) as LoveSpaceQuizRow[] });
    } catch (error) {
        const err = error as { message?: string };
        console.error('Love Space quiz GET unexpected error:', err?.message || error);
        return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json(
            {
                error: 'Supabase client unavailable. Set SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC prefix) in deployment.',
                env: envStatus,
            },
            { status: 500 },
        );
    }

    try {
        const body = await request.json();
        const { action, quizData, quizId, answers, takerId } = body;

        if (action === 'create') {
            if (!quizData || !quizData.room_id || !quizData.creator_id || !Array.isArray(quizData.questions)) {
                return NextResponse.json({ error: 'Invalid quiz data' }, { status: 400 });
            }

            const insertPayload = {
                room_id: quizData.room_id,
                creator_id: quizData.creator_id,
                title: quizData.title || 'Love Quiz',
                questions: quizData.questions as QuizQuestion[],
                status: 'pending' as const,
                score: null as number | null,
                taker_id: null as string | null,
                taker_answers: null as number[] | null,
            };

            const { data, error } = await supabaseAdmin
                .from('love_space_quizzes')
                .insert([insertPayload])
                .select('*')
                .single();

            if (error) {
                console.error('Love Space quiz CREATE error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ quiz: data as LoveSpaceQuizRow });
        }

        if (action === 'submit') {
            if (!quizId || !Array.isArray(answers) || typeof takerId !== 'string') {
                return NextResponse.json({ error: 'Invalid submit payload' }, { status: 400 });
            }

            const { data: quiz, error: fetchError } = await supabaseAdmin
                .from('love_space_quizzes')
                .select('*')
                .eq('id', quizId)
                .single();

            if (fetchError || !quiz) {
                console.error('Love Space quiz SUBMIT fetch error:', fetchError);
                return NextResponse.json({ error: fetchError?.message || 'Quiz not found' }, { status: 404 });
            }

            const questions = (quiz.questions || []) as QuizQuestion[];
            let correctCount = 0;

            questions.forEach((q: QuizQuestion, index: number) => {
                const answerIndex = answers[index];
                if (typeof answerIndex === 'number' && answerIndex === q.correctAnswer) {
                    correctCount++;
                }
            });

            const score =
                questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

            const { data: updated, error: updateError } = await supabaseAdmin
                .from('love_space_quizzes')
                .update({
                    score,
                    status: 'completed',
                    taker_id: takerId,
                    taker_answers: answers,
                })
                .eq('id', quizId)
                .select('*')
                .single();

            if (updateError || !updated) {
                console.error('Love Space quiz SUBMIT update error:', updateError);
                return NextResponse.json(
                    { error: updateError?.message || 'Failed to update quiz' },
                    { status: 500 },
                );
            }

            return NextResponse.json({ quiz: updated as LoveSpaceQuizRow });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        const err = error as { message?: string };
        console.error('Love Space quiz POST unexpected error:', err?.message || error);
        return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
    }
}
