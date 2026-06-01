import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';


export async function POST(request: Request) {
    try {
        const { roomId, nickname } = await request.json();

        if (!roomId || !nickname) {
            return NextResponse.json({ error: 'Room ID and nickname are required' }, { status: 400 });
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

        const [roomRes, membersRes] = await Promise.all([
            supabaseAdmin.from('love_rooms').select('*').eq('id', roomId).single(),
            supabaseAdmin.from('love_room_members').select('*').eq('room_id', roomId)
        ]);

        const { data: room, error: roomError } = roomRes;
        const { data: existingMembers } = membersRes;

        if (roomError || !room) {
            return NextResponse.json({ error: 'Room not found or expired' }, { status: 404 });
        }

        // --- RENEWED EXPIRATION CHECK ---
        const expiresAtMs = new Date(room.expires_at).getTime();

        if (Date.now() > expiresAtMs) {
            // Room is expired. Soft-close it — data is kept, only realtime is freed.
            await supabaseAdmin.from('love_rooms').update({ is_active: false }).eq('id', roomId);
            return NextResponse.json({ error: 'This room has expired. Private rooms are only active for 24 hours after creation.' }, { status: 404 });
        }
        // ----------------------------------

        if (existingMembers && existingMembers.length >= 2) {
            return NextResponse.json({ error: 'Room is full! Only 2 people allowed.' }, { status: 403 });
        }

        if (existingMembers?.some(m => m.nickname.toLowerCase() === nickname.toLowerCase())) {
            return NextResponse.json({ error: 'That name is already taken in this room.' }, { status: 400 });
        }

        // Insert new member
        const { data: member, error: insertError } = await supabaseAdmin
            .from('love_room_members')
            .insert([{ room_id: roomId, nickname: nickname.trim() }])
            .select()
            .single();

        if (insertError) {
            console.error('Supabase member insert error:', insertError);
            return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
        }

        return NextResponse.json({ room, member });

    } catch (error) {
        console.error('API Error /api/love-space/join-room:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
