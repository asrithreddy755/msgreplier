import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';


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

type QuizQuestion = {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    hint?: string;
};

type LoveQuiz = {
    id: string;
    sender_name: string;
    receiver_name: string;
    time_limit_seconds: number;
    questions: QuizQuestion[];
    created_at: string;
    score?: number;
    completed_at?: string;
    answers?: Record<string, number>;
};

type DetailedQuestionResult = {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
};

type DetailedQuizResult = {
    scorePercentage: number;
    totalQuestions: number;
    totalCorrect: number;
    questions: DetailedQuestionResult[];
};

const summarizeSupabaseError = (error: unknown) => {
    if (!error || typeof error !== "object") {
        return { message: "Unknown error" };
    }
    const err = error as { message?: string; code?: string; details?: string; hint?: string };
    return {
        message: err.message ?? "Unknown error",
        code: err.code,
        details: err.details,
        hint: err.hint
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

export async function POST(request: Request) {
    try {
        const envStatus = getEnvStatus();
        console.info("save-score: env status", { hasSupabaseUrl: envStatus.hasSupabaseUrl, hasServiceRoleKey: envStatus.hasServiceRoleKey });
        const url = new URL(request.url);
        if (url.searchParams.get("debug") === "1") {
            return NextResponse.json({ envCheck: { hasUrl: envStatus.hasSupabaseUrl, hasServiceRole: envStatus.hasServiceRoleKey } });
        }
        const body = await request.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            console.error("save-score: invalid payload", { payloadType: typeof body });
            return NextResponse.json({ error: "Invalid payload.", stage: "validate" }, { status: 400 });
        }

        const { quiz_id, score, answers } = body as {
            quiz_id?: string;
            score?: number;
            answers?: Record<string, number>;
        };

        if (!quiz_id || typeof score !== "number") {
            console.error("save-score: missing fields", { hasQuizId: Boolean(quiz_id), scoreType: typeof score });
            return NextResponse.json({ error: "Missing quiz_id or valid score.", stage: "validate" }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus: runtimeEnv } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error("save-score: missing supabase admin", runtimeEnv);
            return NextResponse.json({ error: "Server misconfiguration: missing Supabase config.", stage: "init", env: runtimeEnv }, { status: 500 });
        }

        const normalizedAnswers = typeof answers === "object" && !Array.isArray(answers)
            ? Object.fromEntries(
                Object.entries(answers).map(([key, value]) => [key, typeof value === "number" ? value : Number(value)])
            )
            : {};

        const { data: quizData, error: quizError } = await supabaseAdmin
            .from("love_quizzes")
            .select("id, sender_name, receiver_name, time_limit_seconds, questions, created_at, score, completed_at, answers")
            .eq("id", quiz_id)
            .single();

        if (quizError || !quizData) {
            console.error("save-score: quiz lookup failed", summarizeSupabaseError(quizError));
            return NextResponse.json({ error: quizError?.message || "Quiz not found.", stage: "lookup", details: summarizeSupabaseError(quizError) }, { status: 500 });
        }

        const quiz = quizData as LoveQuiz;
        const result = buildDetailedResult(quiz, normalizedAnswers);

        const { error: updateError } = await supabaseAdmin
            .from("love_quizzes")
            .update({
                score: result.scorePercentage,
                completed_at: new Date().toISOString(),
                answers: normalizedAnswers
            })
            .eq("id", quiz_id);

        if (updateError) {
            console.error("save-score: quiz update failed", summarizeSupabaseError(updateError));
            return NextResponse.json({ error: updateError.message, stage: "update", details: summarizeSupabaseError(updateError) }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("save-score: unexpected error", summarizeSupabaseError(error));
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json({ error: message, stage: "unexpected" }, { status: 500 });
    }
}
