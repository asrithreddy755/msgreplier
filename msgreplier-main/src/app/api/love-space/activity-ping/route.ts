import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';

export async function POST(request: Request) {
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

        // Update the last_activity_at timestamp to now()
        const { error } = await supabaseAdmin
            .from('love_rooms')
            .update({ 
                last_activity_at: new Date().toISOString(),
                status: 'active' // Ensure it's active if activity is happening
            })
            .eq('id', roomId);
        
        if (error) {
            console.error('API Error /api/love-space/activity-ping:', error);
            // If the column doesn't exist yet, this will fail but we'll return 200 for fire-and-forget robustness
            // Actually, we should return error if it's a real failure
            return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error /api/love-space/activity-ping:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
