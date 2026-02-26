import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const { roomId, nickname } = await request.json();

        if (!roomId || !nickname) {
            return NextResponse.json({ error: 'Room ID and nickname are required' }, { status: 400 });
        }

        // Run checks in parallel to save time
        const [roomRes, membersRes] = await Promise.all([
            supabase.from('love_rooms').select('*').eq('id', roomId).single(),
            supabase.from('love_room_members').select('*').eq('room_id', roomId)
        ]);

        const { data: room, error: roomError } = roomRes;
        const { data: existingMembers, error: membersError } = membersRes;

        if (roomError || !room) {
            return NextResponse.json({ error: 'Room not found or expired' }, { status: 404 });
        }

        if (existingMembers && existingMembers.length >= 2) {
            return NextResponse.json({ error: 'Room is full! Only 2 people allowed.' }, { status: 403 });
        }

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
