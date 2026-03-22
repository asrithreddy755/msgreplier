import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code || !/^\d{5}$/.test(code)) {
            return NextResponse.json(
                { error: 'Please enter a valid 5-digit code.' },
                { status: 400 }
            );
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data: room, error: fetchError } = await supabaseAdmin
            .from('love_rooms')
            .select('id, room_code, status, is_active')
            .eq('room_code', code)
            .neq('status', 'closed')
            .eq('is_active', true)
            .maybeSingle();

        if (fetchError || !room) {
            return NextResponse.json(
                { error: 'No active room found for this code.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ roomId: room.id, roomCode: room.room_code });
    } catch (error) {
        console.error('API Error /api/love-space/join-by-code:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
