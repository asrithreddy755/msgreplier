import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const { roomId } = await request.json();

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { client: supabaseAdmin } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
        }

        // Push expiration out by another 10 minutes from now
        const { error } = await supabaseAdmin.from('love_rooms').update({
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }).eq('id', roomId);
        
        if (error) {
            console.error('API Error /api/love-space/heartbeat:', error);
            return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error /api/love-space/heartbeat:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
