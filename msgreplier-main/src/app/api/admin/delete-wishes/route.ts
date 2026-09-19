import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../love-space/_supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, ids } = body || {};

        const adminPassword = process.env.ADMIN_PASSWORD || 'msgreplier-admin-2026';

        if (!password || password !== adminPassword) {
            return NextResponse.json({ error: 'Unauthorized: Invalid admin password' }, { status: 401 });
        }

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: "ids" must be a non-empty array of wish IDs' }, { status: 400 });
        }

        const { client: supabase } = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
        }

        const { error, count } = await supabase
            .from('love_greetings')
            .delete({ count: 'exact' })
            .in('id', ids);

        if (error) {
            console.error('[Delete Wishes API] Error deleting greetings:', error);
            return NextResponse.json({ error: error.message || 'Failed to delete wishes' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            deletedCount: count ?? ids.length,
            deletedIds: ids
        });
    } catch (error: any) {
        console.error('[Delete Wishes API] Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error?.message || error }, { status: 500 });
    }
}
