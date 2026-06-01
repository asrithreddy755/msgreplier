import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';


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

        // Soft-close expired rooms: mark as inactive instead of deleting, so all historical data is preserved.
        try {
            await supabaseAdmin.from('love_rooms').update({ is_active: false }).lt('expires_at', new Date().toISOString()).eq('is_active', true);
        } catch (gcErr) {
            console.error('GC Error soft-closing expired rooms:', gcErr);
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
            return NextResponse.json({ error: 'This room has expired. Private rooms are only active for 24 hours after creation.' }, { status: 404 });
        }

        // --- RENEWED EXPIRATION CHECK ---
        const expiresAtMs = new Date(room.expires_at).getTime();

        if (Date.now() > expiresAtMs) {
            // Room is expired. Soft-close it — data is kept, only realtime is freed.
            await supabaseAdmin.from('love_rooms').update({ is_active: false }).eq('id', roomId);
            return NextResponse.json({ error: 'This room has expired. Private rooms are only active for 24 hours after creation.' }, { status: 404 });
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
