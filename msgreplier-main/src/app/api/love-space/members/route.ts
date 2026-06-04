import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('love_room_members')
            .select('*')
            .eq('room_id', roomId)
            .order('joined_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ members: data ?? [] }, {
            headers: {
                'Cache-Control': 's-maxage=5, stale-while-revalidate=10'
            }
        });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
