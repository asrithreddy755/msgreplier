import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Initialize a Supabase client using the Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function POST(request: Request) {
    try {
        const { id, score } = await request.json();

        if (!id || typeof score !== 'number') {
            return NextResponse.json(
                { error: 'Missing quiz ID or valid score.' },
                { status: 400 }
            );
        }

        if (!supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server misconfiguration: missing service role key.' },
                { status: 500 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('love_quizzes')
            .update({
                score,
                completed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error("Supabase Admin Update Error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        console.error("Save Score Route Error:", err);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
