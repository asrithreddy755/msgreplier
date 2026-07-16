import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export const dynamic = 'force-dynamic';

async function fetchAllRows(
    supabase: any,
    tableName: string,
    selectQuery: string = '*',
    orderColumn?: string,
    orderOptions?: { ascending?: boolean }
) {
    let allRows: any[] = [];
    let from = 0;
    const limit = 1000;
    let totalCount: number | null = null;

    while (totalCount === null || from < totalCount) {
        let query = supabase
            .from(tableName)
            .select(selectQuery, from === 0 ? { count: 'exact' } : undefined)
            .range(from, from + limit - 1);
        
        if (orderColumn) {
            query = query.order(orderColumn, orderOptions || { ascending: false });
        }

        const { data, error, count } = await query;
        if (error) {
            throw error;
        }

        if (totalCount === null && count !== null) {
            totalCount = count;
        }

        if (data && data.length > 0) {
            allRows = allRows.concat(data);
            from += limit;
            if (data.length < limit) {
                break;
            }
        } else {
            break;
        }
    }
    return allRows;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body || {};

        const adminPassword = process.env.ADMIN_PASSWORD || 'msgreplier-admin-2026';

        if (!password || password !== adminPassword) {
            return NextResponse.json({ error: 'Unauthorized: Invalid admin password' }, { status: 401 });
        }

        const { client: supabase, envStatus } = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Server configuration error: Supabase admin client not initialized.', env: envStatus },
                { status: 500 }
            );
        }

        // 1. Fetch all rooms
        let rooms: any[] = [];
        try {
            rooms = await fetchAllRows(supabase, 'love_rooms', '*', 'created_at', { ascending: false });
        } catch (error: any) {
            return NextResponse.json({ error: `Rooms fetch error: ${error.message || error}` }, { status: 500 });
        }

        // 2. Fetch all members
        let members: any[] = [];
        try {
            members = await fetchAllRows(supabase, 'love_room_members', '*');
        } catch (error: any) {
            return NextResponse.json({ error: `Members fetch error: ${error.message || error}` }, { status: 500 });
        }

        // 3. Fetch all messages
        let messages: any[] = [];
        try {
            messages = await fetchAllRows(supabase, 'love_messages', '*', 'created_at', { ascending: true });
        } catch (error: any) {
            return NextResponse.json({ error: `Messages fetch error: ${error.message || error}` }, { status: 500 });
        }

        // 4. Fetch all digital greetings
        let greetings: any[] = [];
        try {
            greetings = await fetchAllRows(supabase, 'love_greetings', '*', 'created_at', { ascending: false });
        } catch (error: any) {
            return NextResponse.json({ error: `Greetings fetch error: ${error.message || error}` }, { status: 500 });
        }

        // 5. Fetch all profiles (to map user_id to email)
        let profiles: any[] = [];
        try {
            profiles = await fetchAllRows(supabase, 'profiles', 'id, email');
        } catch (e: any) {
            console.error('[Admin API] Profiles exception:', e);
        }

        // 6. Fetch all gallery images
        let gallery: any[] = [];
        try {
            gallery = await fetchAllRows(supabase, 'user_gallery', '*', 'created_at', { ascending: false });
        } catch (e: any) {
            console.error('[Admin API] Gallery exception:', e);
        }

        return NextResponse.json({
            rooms: rooms ?? [],
            members: members ?? [],
            messages: messages ?? [],
            greetings: greetings ?? [],
            profiles: profiles,
            gallery: gallery
        });
    } catch (error: any) {
        console.error('[Admin API] Error fetching admin data:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
