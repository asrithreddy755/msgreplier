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

        if (room.is_active === false) {
            return NextResponse.json({ error: 'This room is currently offline due to 10 minutes of inactivity.' }, { status: 404 });
        }

        // --- RENEWED EXPIRATION CHECK ---
        const expiresAtMs = new Date(room.expires_at).getTime();

        if (Date.now() > expiresAtMs) {
            // Room is expired. Set to inactive.
            await supabaseAdmin.from('love_rooms').update({ is_active: false }).eq('id', roomId);
            return NextResponse.json({ error: 'This room has expired due to 10 minutes of inactivity.' }, { status: 404 });
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
