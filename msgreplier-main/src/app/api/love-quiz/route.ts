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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const quizId = typeof id === "string" ? id.trim() : "";

        if (!quizId) {
            return NextResponse.json({ error: "Missing quiz ID." }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server misconfiguration: missing Supabase config." }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from("love_quizzes")
            .select("*")
            .eq("id", quizId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: error?.message || "Quiz not found." }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server misconfiguration: missing Supabase config." }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from("love_quizzes")
            .insert([payload])
            .select("id")
            .single();

        if (error || !data) {
            return NextResponse.json({ error: error?.message || "Failed to create quiz." }, { status: 500 });
        }

        return NextResponse.json({ id: data.id });
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
