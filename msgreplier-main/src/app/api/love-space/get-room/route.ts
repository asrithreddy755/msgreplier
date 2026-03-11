import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data: room, error: fetchError } = await supabaseAdmin
            .from('love_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (fetchError || !room) {
            return NextResponse.json({ error: 'Room not found or expired' }, { status: 404 });
        }

        // --- 10 MINUTE EXPIRATION CHECK ---
        const roomAgeMs = Date.now() - new Date(room.created_at).getTime();
        const tenMinutesMs = 10 * 60 * 1000;

        if (roomAgeMs > tenMinutesMs) {
            const { count, error: countError } = await supabaseAdmin
                .from('love_room_members')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', roomId);

            if (!countError && count !== null && count < 2) {
                // Room is >10 mins old and empty. Terminate it.
                await supabaseAdmin.from('love_rooms').delete().eq('id', roomId);
                return NextResponse.json({ error: 'This room has expired due to inactivity.' }, { status: 404 });
            }
        }
        // ----------------------------------

        return NextResponse.json({ room });
    } catch (error) {
        console.error('API Error /api/love-space/get-room:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
