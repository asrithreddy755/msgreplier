import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { LoveQuiz, DetailedQuizResult } from '@/types/quiz';

export const runtime = 'edge';

const getEnvStatus = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
    return {
        supabaseUrl,
        supabaseServiceKey,
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(supabaseServiceKey)
    };
};

const getSupabaseAdmin = () => {
    const { supabaseUrl, supabaseServiceKey, hasSupabaseUrl, hasServiceRoleKey } = getEnvStatus();
    if (!hasSupabaseUrl || !hasServiceRoleKey) {
        return { client: null, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
    }
    return {
        client: createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }),
        envStatus: { hasSupabaseUrl, hasServiceRoleKey }
    };
};

const buildDetailedResult = (quiz: LoveQuiz, answers: Record<string, number>): DetailedQuizResult => {
    const questions = quiz.questions || [];
    const questionResults = questions.map((question) => {
        const userIndex = answers[question.id];
        const correctAnswer = question.options[question.correctOptionIndex] ?? "";
        const userAnswer = typeof userIndex === "number" ? (question.options[userIndex] ?? "") : "Not answered";
        const isCorrect = typeof userIndex === "number" && userIndex === question.correctOptionIndex;
        return {
            questionId: question.id,
            questionText: question.text,
            options: question.options,
            correctAnswer,
            userAnswer,
            isCorrect
        };
    });
    const totalCorrect = questionResults.filter((item) => item.isCorrect).length;
    const totalQuestions = questions.length;
    const scorePercentage = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);
    return {
        scorePercentage,
        totalQuestions,
        totalCorrect,
        questions: questionResults
    };
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing quiz ID.' }, { status: 400 });
        }

        const quizId = typeof id === 'string' ? id.trim() : '';
        if (!quizId) {
            return NextResponse.json({ error: 'Missing quiz ID.' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('love_quizzes')
            .select('id, questions, answers, score, completed_at')
            .eq('id', quizId)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
        }

        const quiz = data as LoveQuiz;
        const answers = (data as LoveQuiz).answers || {};

        const result = buildDetailedResult(quiz, answers);
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        console.log("POST /api/love-score-result: Received request");
        const body = await request.json();
        const { id, answers } = body;
        console.log(`POST /api/love-score-result: ID=${id}, answers=${JSON.stringify(answers)}`);

        const quizId = typeof id === 'string' ? id.trim() : '';
        if (!quizId || typeof answers !== 'object' || Array.isArray(answers)) {
            console.error("POST /api/love-score-result: Missing or invalid ID/answers");
            return NextResponse.json({ error: 'Missing quiz ID or valid answers.' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error("POST /api/love-score-result: Failed to create Supabase client", envStatus);
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        console.log(`POST /api/love-score-result: Fetching quiz ${quizId}`);
        const { data, error } = await supabaseAdmin
            .from('love_quizzes')
            .select('id, questions')
            .eq('id', quizId)
            .single();

        if (error) {
            console.error(`POST /api/love-score-result: Supabase select error: ${error.message}`);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
             console.error(`POST /api/love-score-result: Quiz not found for ID ${quizId}`);
            return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
        }
        console.log(`POST /api/love-score-result: Quiz found`);

        const quiz = data as LoveQuiz;
        const normalizedAnswers = Object.fromEntries(
            Object.entries(answers).map(([key, value]) => [key, typeof value === "number" ? value : Number(value)])
        );

        const result = buildDetailedResult(quiz, normalizedAnswers);
        console.log(`POST /api/love-score-result: Result calculated: ${result.scorePercentage}%`);

        console.log(`POST /api/love-score-result: Updating quiz...`);
        const { error: updateError } = await supabaseAdmin
            .from('love_quizzes')
            .update({
                score: result.scorePercentage,
                completed_at: new Date().toISOString(),
                answers: normalizedAnswers
            })
            .eq('id', quizId);

        if (updateError) {
             console.error(`POST /api/love-score-result: Supabase update error: ${updateError.message}`);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        console.log(`POST /api/love-score-result: Update successful`);

        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/love-score-result: Unexpected error:", error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
