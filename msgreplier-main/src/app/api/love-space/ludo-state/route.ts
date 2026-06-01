import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../_supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    console.log(`[Ludo State GET] Received request for roomId: ${roomId}`);

    if (!roomId) {
        return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    try {
        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error('[Ludo State GET] Supabase admin client is not available.', envStatus);
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('love_games')
            .select('room_id, game_state, updated_at')
            .eq('room_id', roomId)
            .eq('game_type', 'ludo')
            .maybeSingle();

        if (error) {
            // This is a database error, but we don't want to crash the client sync flow.
            // Return a successful response with a null game state to prevent breaking the frontend.
            console.error(`[Ludo State GET] Supabase error fetching state for roomId ${roomId}:`, error);
            const response = NextResponse.json({ game: null, message: `Supabase error: ${error.message}` });
            response.headers.set('Cache-Control', 'no-store, max-age=0');
            return response;
        }

        // Map updated_at back to last_updated for frontend compatibility if needed
        const mappedData = data ? {
            ...data,
            last_updated: data.updated_at
        } : null;

        console.log(`[Ludo State GET] Found game state for roomId ${roomId}:`, !!data);
        const response = NextResponse.json({ game: mappedData });
        response.headers.set('Cache-Control', 'no-store, max-age=0');
        return response;

    } catch (e: any) {
        console.error(`[Ludo State GET] Unhandled exception for roomId ${roomId}:`, e);
        return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let body: any;
    try {
        body = await request.json();
    } catch (e: any) {
        console.error('[Ludo State POST] Failed to parse request body:', e);
        return NextResponse.json({ error: 'Invalid JSON body', details: e.message }, { status: 400 });
    }

    const { roomId, gameState, lastUpdated } = body || {};
    console.log(`[Ludo State POST] Received request for roomId: ${roomId}`);

    if (!roomId || !gameState) {
        return NextResponse.json({ error: 'roomId and gameState are required' }, { status: 400 });
    }

    try {
        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error('[Ludo State POST] Supabase admin client is not available.', envStatus);
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const timestampIso = typeof lastUpdated === 'number'
            ? new Date(lastUpdated).toISOString()
            : new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('love_games')
            .upsert(
                { 
                    room_id: roomId, 
                    game_type: 'ludo',
                    game_state: gameState, 
                    updated_at: timestampIso 
                },
                { onConflict: 'room_id,game_type' }
            )
            .select('room_id, game_state, updated_at')
            .single();

        if (error) {
            console.error(`[Ludo State POST] Supabase error upserting state for roomId ${roomId}:`, error);
            // A failed write is a server-side problem, so a 5xx error is appropriate.
            return NextResponse.json({ error: 'Failed to save game state', details: error.message }, { status: 502 });
        }

        // Map updated_at back to last_updated for frontend compatibility
        const mappedData = data ? {
            ...data,
            last_updated: data.updated_at
        } : null;

        console.log(`[Ludo State POST] Successfully saved state for roomId ${roomId}`);

        // Update last_active_at on the room so the inactivity cron can track activity
        await supabaseAdmin
            .from('love_rooms')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', roomId);

        return NextResponse.json({ game: mappedData });

    } catch (e: any) {
        console.error(`[Ludo State POST] Unhandled exception for roomId ${roomId}:`, e);
        return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    console.log(`[Ludo State DELETE] Received request for roomId: ${roomId}`);

    if (!roomId) {
        return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    try {
        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            console.error('[Ludo State DELETE] Supabase admin client is not available.', envStatus);
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('love_games')
            .upsert(
                {
                    room_id: roomId,
                    game_type: 'ludo',
                    game_state: {},
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'room_id,game_type' }
            );

        if (error) {
            console.error(`[Ludo State DELETE] Supabase error clearing state for roomId ${roomId}:`, error);
            return NextResponse.json({ error: 'Failed to clear game state', details: error.message }, { status: 502 });
        }

        console.log(`[Ludo State DELETE] Successfully cleared state for roomId ${roomId}`);
        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(`[Ludo State DELETE] Unhandled exception for roomId ${roomId}:`, e);
        return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 });
    }
}
