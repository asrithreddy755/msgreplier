import { NextResponse } from "next/server";
import { getSupabaseAdmin, getEnvStatus } from "@/app/api/love-space/_supabase";

export const dynamic = 'force-dynamic';


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

export async function GET() {
    const envStatus = getEnvStatus();
    const envCheck = {
        hasUrl: envStatus.hasSupabaseUrl,
        hasServiceRole: envStatus.hasServiceRoleKey
    };

    const { client: supabaseAdmin } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ ok: false, envCheck, error: "Missing Supabase config." }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
        .from("love_quizzes")
        .select("id")
        .limit(1);

    if (error) {
        return NextResponse.json({ ok: false, envCheck, error: summarizeSupabaseError(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, envCheck, sample: data?.[0] ?? null });
}
