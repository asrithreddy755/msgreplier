import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env.local file. Quiz functionality will not work without them.');
}

// Ensure we don't crash on build or if env vars are missing, but warn loudly
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

// Check if we are in the browser
const isClient = typeof window !== 'undefined';

// Use proxy on the client to avoid ISP DNS blocks in India (like Jio), use real URL on server
const clientUrl = isClient ? `${window.location.origin}/api/supabase` : url;

export const supabase = createClient(clientUrl, key, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});
