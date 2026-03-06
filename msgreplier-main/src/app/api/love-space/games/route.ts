import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const gameType = searchParams.get('gameType');

        if (!roomId || !gameType) {
            return NextResponse.json({ error: 'roomId and gameType are required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('love_games')
            .select('*')
            .eq('room_id', roomId)
            .eq('game_type', gameType)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const response = NextResponse.json({ game: data ?? null });
        response.headers.set('Cache-Control', 'no-store, max-age=0');
        return response;
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { roomId, gameType, gameState } = body || {};

        if (!roomId || !gameType || !gameState) {
            return NextResponse.json({ error: 'roomId, gameType, and gameState are required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        // UPSERT (not INSERT) so that every move updates the SAME row for (room_id, game_type).
        // INSERT creates a new row on every move — new rows trigger an INSERT postgres_changes event,
        // NOT an UPDATE event, so the opponent's Realtime listener never fires.
        // UPSERT ensures there is exactly one row per game session and every write
        // fires an UPDATE event that all subscribed clients receive.
        const { data, error } = await supabaseAdmin
            .from('love_games')
            .upsert(
                { room_id: roomId, game_type: gameType, game_state: gameState, updated_at: new Date().toISOString() },
                { onConflict: 'room_id,game_type' }
            )
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ game: data });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
