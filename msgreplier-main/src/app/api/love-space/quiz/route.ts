
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

const getRecord = (value: unknown) => {
    if (typeof value === 'object' && value !== null) return value as Record<string, unknown>;
    return null;
};

const isFallbackError = (error: unknown) => {
    const err = error as { message?: unknown; code?: unknown };
    const message = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
    const code = typeof err?.code === 'string' ? err.code : '';
    if (code === '42P01' || code === '42501') return true;
    return message.includes('relation') || message.includes('permission') || message.includes('does not exist');
};

const normalizeQuestions = (quiz: unknown) => {
    const record = getRecord(quiz);
    const rawQuestions = record?.questions;
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];
    const first = questions[0];
    const firstRecord = getRecord(first);
    const metaValue = firstRecord?.['_meta'];
    const meta = getRecord(metaValue) ?? {};
    const actualQuestions = firstRecord && '_meta' in firstRecord ? questions.slice(1) : questions;
    return { meta, questions: actualQuestions };
};

const formatQuizRow = (quiz: unknown) => {
    const record = getRecord(quiz) ?? {};
    const { meta, questions } = normalizeQuestions(record);
    const receiverName = typeof record.receiver_name === 'string' ? record.receiver_name : '';
    const senderName = typeof record.sender_name === 'string' ? record.sender_name : '';
    const roomId = typeof meta.room_id === 'string' ? meta.room_id : receiverName;
    const creatorId = typeof meta.creator_id === 'string' ? meta.creator_id : senderName;
    const title = typeof meta.title === 'string' ? meta.title : 'Love Quiz';
    return {
        ...record,
        room_id: roomId,
        creator_id: creatorId,
        title,
        questions
    };
};

const formatFallbackQuiz = (row: unknown) => {
    const rowRecord = getRecord(row) ?? {};
    const gameState = getRecord(rowRecord.game_state) ?? {};
    const id = typeof gameState.id === 'string' ? gameState.id : (typeof rowRecord.id === 'string' ? rowRecord.id : '');
    const createdAt = typeof gameState.created_at === 'string' ? gameState.created_at : (typeof rowRecord.updated_at === 'string' ? rowRecord.updated_at : '');
    const roomId = typeof gameState.room_id === 'string' ? gameState.room_id : (typeof rowRecord.room_id === 'string' ? rowRecord.room_id : '');
    return {
        ...gameState,
        id,
        created_at: createdAt,
        room_id: roomId
    };
};

const getAnswerIndex = (answersValue: unknown, index: number, questionId: string | undefined) => {
    if (Array.isArray(answersValue)) return answersValue[index];
    const answersRecord = getRecord(answersValue);
    if (!questionId || !answersRecord) return undefined;
    const raw = answersRecord[questionId];
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return Number(raw);
    return undefined;
};

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json(
            { error: 'Supabase client unavailable. Set SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC prefix) in deployment.', env: envStatus },
            { status: 500 }
        );
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('love_quizzes')
            .select('*')
            .eq('receiver_name', roomId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedQuizzes = data.map(formatQuizRow);
        return NextResponse.json({ quizzes: formattedQuizzes });
    } catch (error) {
        // If reading from the primary love_quizzes table fails for ANY reason,
        // fall back to the generic love_games storage. This keeps the Love Space
        // quiz UI working even if migrations are out of sync or permissions differ.
        try {
            const { data, error: fallbackError } = await supabaseAdmin
                .from('love_games')
                .select('*')
                .eq('room_id', roomId)
                .eq('game_type', 'love_quiz')
                .order('updated_at', { ascending: false });
            if (fallbackError) throw fallbackError;
            const formattedQuizzes = (data || []).map(formatFallbackQuiz);
            return NextResponse.json({ quizzes: formattedQuizzes });
        } catch (fallbackErr) {
            console.error('Love quiz GET failed on both primary and fallback tables:', {
                primaryError: (error as { message?: string })?.message,
                fallbackError: (fallbackErr as { message?: string })?.message,
            });
            // Gracefully return an empty list instead of a 500 so the
            // Love Space page still loads and allows quiz creation.
            return NextResponse.json({ quizzes: [] });
        }
    }
}

export async function POST(request: Request) {
    const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json(
            { error: 'Supabase client unavailable. Set SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC prefix) in deployment.', env: envStatus },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { action, quizData, quizId, answers, takerId } = body;

        if (action === 'create') {
            const dbPayload = {
                sender_name: quizData.creator_id,
                receiver_name: quizData.room_id,
                time_limit_seconds: 60,
                questions: [
                    { _meta: { title: quizData.title, room_id: quizData.room_id, creator_id: quizData.creator_id } },
                    ...quizData.questions
                ],
                status: 'pending'
            };

            const { data, error } = await supabaseAdmin
                .from('love_quizzes')
                .insert([dbPayload])
                .select();

            if (!error && data && data[0]) {
                // Happy path: quiz stored in dedicated love_quizzes table
                return NextResponse.json({ quiz: data[0] });
            }

            // If inserting into love_quizzes fails for ANY reason (missing table,
            // RLS, wrong schema, etc), gracefully fall back to the generic
            // love_games storage so the Love Space quiz still works.
            const now = new Date().toISOString();
            const fallbackState = {
                id: crypto.randomUUID(),
                room_id: quizData.room_id,
                creator_id: quizData.creator_id,
                title: quizData.title,
                questions: quizData.questions,
                score: null,
                status: 'pending',
                created_at: now,
                taker_id: null,
                taker_answers: []
            };
            const { data: fallbackData, error: fallbackError } = await supabaseAdmin
                .from('love_games')
                .insert([{
                    room_id: quizData.room_id,
                    game_type: 'love_quiz',
                    game_state: fallbackState,
                    updated_at: now
                }])
                .select()
                .single();

            if (fallbackError || !fallbackData) {
                const primaryMsg = (error as { message?: string } | null)?.message;
                const fallbackMsg = (fallbackError as { message?: string } | null)?.message;
                console.error('Love quiz CREATE failed on both love_quizzes and love_games:', {
                    primaryError: primaryMsg,
                    fallbackError: fallbackMsg,
                });
                return NextResponse.json(
                    { error: fallbackMsg || primaryMsg || 'Failed to create quiz' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ quiz: formatFallbackQuiz(fallbackData) });
        }

        if (action === 'submit') {
            const { data: quiz, error: fetchError } = await supabaseAdmin
                .from('love_quizzes')
                .select('questions')
                .eq('id', quizId)
                .single();

            if (fetchError) {
                if (!isFallbackError(fetchError)) throw fetchError;
                const { data: fallbackQuiz, error: fallbackFetchError } = await supabaseAdmin
                    .from('love_games')
                    .select('*')
                    .eq('id', quizId)
                    .eq('game_type', 'love_quiz')
                    .single();
                if (fallbackFetchError) throw fallbackFetchError;
                const fallbackState = getRecord(fallbackQuiz.game_state) ?? {};
                const questions = Array.isArray(fallbackState.questions) ? fallbackState.questions : [];
                let correctCount = 0;
                questions.forEach((q, index) => {
                    const question = getRecord(q) ?? {};
                    const questionId = typeof question.id === 'string' ? question.id : undefined;
                    const answerIndex = getAnswerIndex(answers, index, questionId);
                    const correctAnswer = question.correctAnswer;
                    const correctOptionIndex = question.correctOptionIndex;
                    if (answerIndex === correctAnswer || answerIndex === correctOptionIndex) {
                        correctCount++;
                    }
                });
                const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
                const updatedState = {
                    ...fallbackState,
                    score,
                    status: 'completed',
                    taker_id: takerId,
                    taker_answers: answers
                };
                const { data: updatedRow, error: updateError } = await supabaseAdmin
                    .from('love_games')
                    .update({
                        game_state: updatedState,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', quizId)
                    .select()
                    .single();
                if (updateError) throw updateError;
                return NextResponse.json({ quiz: formatFallbackQuiz(updatedRow) });
            }

            let correctCount = 0;
            const { questions } = normalizeQuestions(quiz);

            questions.forEach((q, index) => {
                const question = getRecord(q) ?? {};
                const questionId = typeof question.id === 'string' ? question.id : undefined;
                const answerIndex = getAnswerIndex(answers, index, questionId);
                const correctAnswer = question.correctAnswer;
                const correctOptionIndex = question.correctOptionIndex;
                if (answerIndex === correctAnswer || answerIndex === correctOptionIndex) {
                    correctCount++;
                }
            });

            const score = Math.round((correctCount / questions.length) * 100);

            const { data, error } = await supabaseAdmin
                .from('love_quizzes')
                .update({
                    score,
                    status: 'completed',
                    taker_id: takerId,
                    taker_answers: answers
                })
                .eq('id', quizId)
                .select();

            if (error) throw error;
            return NextResponse.json({ quiz: data[0] });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
    }
}
