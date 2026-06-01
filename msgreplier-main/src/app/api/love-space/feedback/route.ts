import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { roomId, nickname, content } = body || {};

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'Feedback content is required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('suggestions_feedbacks')
            .insert([{ 
                room_id: roomId || null, 
                nickname: nickname || 'Anonymous', 
                content: content.trim()
            }])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, feedback: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
