
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('love_quizzes')
            .select('*')
            // Match room_id that was encoded into the receiver_name column
            .eq('receiver_name', roomId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Restore mapped properties transparently to the UI components
        const formattedQuizzes = data.map(quiz => {
            const hasMeta = quiz.questions[0]?._meta;
            const meta = hasMeta ? quiz.questions[0]._meta : {};
            const actualQuestions = hasMeta ? quiz.questions.slice(1) : quiz.questions;
            return {
                ...quiz,
                room_id: meta.room_id || quiz.receiver_name,
                creator_id: meta.creator_id || quiz.sender_name,
                title: meta.title || 'Love Quiz',
                questions: actualQuestions
            };
        });

        return NextResponse.json({ quizzes: formattedQuizzes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { action, quizData, quizId, answers, takerId } = body;

        if (action === 'create') {
            const dbPayload = {
                sender_name: quizData.creator_id, // Map creator onto sender
                receiver_name: quizData.room_id,  // Map room onto receiver to filter later
                time_limit_seconds: 60,
                // Embed extra metadata securely inside questions since it's JSONB
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

            if (error) throw error;
            return NextResponse.json({ quiz: data[0] });
        }

        if (action === 'submit') {
            const { data: quiz, error: fetchError } = await supabaseAdmin
                .from('love_quizzes')
                .select('questions')
                .eq('id', quizId)
                .single();

            if (fetchError) throw fetchError;

            let correctCount = 0;
            const hasMeta = quiz.questions[0]?._meta;
            const questions = hasMeta ? quiz.questions.slice(1) : quiz.questions;

            questions.forEach((q: any, index: number) => {
                const answerIndex = Array.isArray(answers) ? answers[index] : answers[q.id];
                if (answerIndex === q.correctAnswer || answerIndex === q.correctOptionIndex) {
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

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
