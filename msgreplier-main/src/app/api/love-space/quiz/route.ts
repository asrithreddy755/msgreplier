
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    try {
        // Reuse the existing 'love_quizzes' table but look for quizzes tagged with this room_id
        // Note: The original love_quizzes table might not have room_id, creator_id as UUIDs linked to love_rooms
        // However, based on the previous error, the table exists. We will use the 'answers' column (jsonb) to store
        // metadata like 'room_id' if the column doesn't exist, OR we assume the user added the columns from the previous step.
        // Given the user said "relation already exists", it's safer to check if we can query by room_id.
        // If room_id column doesn't exist in the old table, we might need to filter by a metadata field or add the column.
        // But since I provided SQL to add 'room_id' if not exists, we assume it's there or we should add it.

        // Actually, the best approach is to query normally. If room_id was added by my previous SQL, it works.
        // If it wasn't added (because the user didn't run it), this will fail. 
        // But the user *tried* to run it and got "already exists".

        const { data, error } = await supabase
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
    try {
        const body = await request.json();
        const { action, quizData, quizId, answers, takerId } = body;

        if (action === 'create') {
            // Map our Love Space quiz format to the existing love_quizzes table format
            // The existing table expects: sender_name, receiver_name, time_limit_seconds, questions
            // We will add room_id and creator_id as well (assuming columns exist from my previous SQL or we add them)

            const dbPayload = {
                room_id: quizData.room_id,
                creator_id: quizData.creator_id,
                title: quizData.title,
                // Map sender/receiver names for compatibility if needed, or just use title
                sender_name: "Love Space User", // Placeholder or fetch actual name
                receiver_name: "Partner",
                time_limit_seconds: 60, // Default for now
                questions: quizData.questions,
                status: 'pending'
            };

            const { data, error } = await supabase
                .from('love_quizzes')
                .insert([dbPayload])
                .select();

            if (error) throw error;
            return NextResponse.json({ quiz: data[0] });
        }

        if (action === 'submit') {
            // Calculate score
            const { data: quiz, error: fetchError } = await supabase
                .from('love_quizzes')
                .select('questions')
                .eq('id', quizId)
                .single();

            if (fetchError) throw fetchError;

            let correctCount = 0;
            const questions = quiz.questions;

            // Handle both array of answers (Love Space) and object of answers (Love Score original)
            // Love Space sends array of indices: [0, 2, 1]
            // Love Score expects object: { "q1_id": 0, "q2_id": 2 }

            questions.forEach((q: any, index: number) => {
                const answerIndex = Array.isArray(answers) ? answers[index] : answers[q.id];
                if (answerIndex === q.correctAnswer || answerIndex === q.correctOptionIndex) {
                    correctCount++;
                }
            });

            const score = Math.round((correctCount / questions.length) * 100);

            // Save answers in the format the DB expects (likely JSONB)
            const { data, error } = await supabase
                .from('love_quizzes')
                .update({
                    score,
                    status: 'completed',
                    taker_id: takerId,
                    taker_answers: answers // Save raw answers
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
