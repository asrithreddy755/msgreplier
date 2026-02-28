import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "edge";

const getEnvStatus = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
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
