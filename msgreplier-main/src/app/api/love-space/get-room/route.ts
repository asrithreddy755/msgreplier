import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { data: room, error: fetchError } = await supabase
            .from('love_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (fetchError || !room) {
            return NextResponse.json({ error: 'Room not found or expired' }, { status: 404 });
        }

        return NextResponse.json({ room });
    } catch (error) {
        console.error('API Error /api/love-space/get-room:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
