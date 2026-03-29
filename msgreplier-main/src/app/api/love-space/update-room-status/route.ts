import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';


export async function POST(request: Request) {
    try {
        const { roomId, isActive } = await request.json();

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { client: supabaseAdmin } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('love_rooms')
            .update({ is_active: isActive })
            .eq('id', roomId);
        
        if (error) {
            console.error('API Error /api/love-space/update-room-status:', error);
            return NextResponse.json({ error: 'Failed to update room status' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error /api/love-space/update-room-status:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
