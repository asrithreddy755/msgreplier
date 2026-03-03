
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
            .eq('room_id', roomId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ quizzes: data });
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
                room_id: quizData.room_id,
                creator_id: quizData.creator_id,
                title: quizData.title,
                sender_name: "Love Space User",
                receiver_name: "Partner",
                time_limit_seconds: 60,
                questions: quizData.questions,
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
            const questions = quiz.questions;

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
