import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const { roomId, nickname } = await request.json();

        if (!roomId || !nickname) {
            return NextResponse.json({ error: 'Room ID and nickname are required' }, { status: 400 });
        }

        // Check if the room exists
        const { data: room, error: roomError } = await supabase
            .from('love_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (roomError || !room) {
            return NextResponse.json({ error: 'Room not found or expired' }, { status: 404 });
        }

        // Check member count
        const { count } = await supabase
            .from('love_room_members')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', roomId);

        if (count !== null && count >= 2) {
            return NextResponse.json({ error: 'Room is full! Only 2 people allowed.' }, { status: 403 });
        }

        // Check if nickname is taken (must be unique per room)
        const { data: existingMembers } = await supabase
            .from('love_room_members')
            .select('nickname')
            .eq('room_id', roomId);

        if (existingMembers?.some(m => m.nickname.toLowerCase() === nickname.toLowerCase())) {
            return NextResponse.json({ error: 'That name is already taken in this room.' }, { status: 400 });
        }

        // Insert new member
        const { data: member, error: insertError } = await supabase
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
