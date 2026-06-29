import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export const dynamic = 'force-dynamic';

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
        const { data: rooms, error: roomsError } = await supabase
            .from('love_rooms')
            .select('*')
            .order('created_at', { ascending: false });

        if (roomsError) {
            return NextResponse.json({ error: `Rooms fetch error: ${roomsError.message}` }, { status: 500 });
        }

        // 2. Fetch all members
        const { data: members, error: membersError } = await supabase
            .from('love_room_members')
            .select('*');

        if (membersError) {
            return NextResponse.json({ error: `Members fetch error: ${membersError.message}` }, { status: 500 });
        }

        // 3. Fetch all messages
        const { data: messages, error: messagesError } = await supabase
            .from('love_messages')
            .select('*')
            .order('created_at', { ascending: true });

        if (messagesError) {
            return NextResponse.json({ error: `Messages fetch error: ${messagesError.message}` }, { status: 500 });
        }

        // 4. Fetch all digital greetings
        const { data: greetings, error: greetingsError } = await supabase
            .from('love_greetings')
            .select('*')
            .order('created_at', { ascending: false });

        if (greetingsError) {
            return NextResponse.json({ error: `Greetings fetch error: ${greetingsError.message}` }, { status: 500 });
        }

        // 5. Fetch all profiles (to map user_id to email)
        let profiles: any[] = [];
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email');
            if (error) {
                console.error('[Admin API] Profiles fetch error:', error.message);
            } else {
                profiles = data ?? [];
            }
        } catch (e: any) {
            console.error('[Admin API] Profiles exception:', e);
        }

        // 6. Fetch all gallery images
        let gallery: any[] = [];
        try {
            const { data, error } = await supabase
                .from('user_gallery')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('[Admin API] Gallery fetch error:', error.message);
            } else {
                gallery = data ?? [];
            }
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
