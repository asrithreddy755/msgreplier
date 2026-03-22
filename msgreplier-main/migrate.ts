import { getSupabaseAdmin } from './src/app/api/love-space/_supabase';

async function migrate() {
    const { client: supabaseAdmin } = getSupabaseAdmin();
    if (!supabaseAdmin) {
        console.error('Failed to get supabase admin');
        return;
    }

    try {
        console.log('Running migration...');
        // Note: Supabase JS client doesn't support raw SQL. 
        // This script assumes you have an RPC called 'exec_sql' defined in your DB.
        // If not, use the Supabase SQL Editor with the SQL provided in walkthrough.md.
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
            sql_query: `
                ALTER TABLE love_rooms ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now();
                ALTER TABLE love_rooms ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
            `
        });
        
        if (error) {
            console.error('Migration error (rpc):', error);
        } else {
            console.log('Migration successful');
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
