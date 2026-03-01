import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

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

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data: room, error: insertDbError } = await supabaseAdmin
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
        const { data: member, error: memberError } = await supabaseAdmin
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
