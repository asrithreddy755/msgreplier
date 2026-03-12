import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { client: supabaseAdmin } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
        }

        const { error } = await supabaseAdmin.from('love_rooms').delete().eq('id', roomId);
        
        if (error) {
            console.error('API Error /api/love-space/delete-room:', error);
            return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error /api/love-space/delete-room:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
