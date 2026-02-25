import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const getSupabaseAdmin = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
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

export async function GET() {
    const envCheck = {
        hasUrl: Boolean(supabaseUrl),
        hasServiceRole: Boolean(supabaseServiceKey)
    };

    const supabaseAdmin = getSupabaseAdmin();
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
