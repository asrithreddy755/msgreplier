import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const { createdBy } = await request.json();

        if (!createdBy || typeof createdBy !== 'string') {
            return NextResponse.json(
                { error: 'Creator name is required' },
                { status: 400 }
            );
        }

        const { data: room, error: insertDbError } = await supabase
            .from('love_rooms')
            .insert([{ status: 'active', created_by: createdBy.trim() }])
            .select()
            .single();

        if (insertDbError) {
            console.error('Supabase room insert error:', insertDbError);
            return NextResponse.json(
                { error: 'Failed to create room in database' },
                { status: 500 }
            );
        }

        // Automatically join the creator to the room
        const { data: member, error: memberError } = await supabase
            .from('love_room_members')
            .insert([{ room_id: room.id, nickname: createdBy.trim() }])
            .select()
            .single();

        if (memberError) {
            console.error('Supabase member insert error:', memberError);
            return NextResponse.json(
                { error: 'Room created but failed to join member' },
                { status: 500 }
            );
        }

        return NextResponse.json({ room, member });
    } catch (error) {
        console.error('API Error /api/love-space/create-room:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
