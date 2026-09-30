import { createClient } from "@supabase/supabase-js";

export const getEnvStatus = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    return {
        supabaseUrl,
        supabaseServiceKey,
        supabaseAnonKey,
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(supabaseServiceKey),
        hasAnonKey: Boolean(supabaseAnonKey)
    };
};

let cachedAdminClient: any = null;
let cachedKey = "";

export const getSupabaseAdmin = () => {
    const { supabaseUrl, supabaseServiceKey, supabaseAnonKey, hasSupabaseUrl, hasServiceRoleKey, hasAnonKey } = getEnvStatus();
    if (!hasSupabaseUrl) {
        return { client: null, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
    }

    const key = supabaseServiceKey || supabaseAnonKey;
    if (!key) {
        return { client: null, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
    }

    if (cachedAdminClient && cachedKey === key) {
        return { client: cachedAdminClient, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
    }

    cachedAdminClient = createClient(supabaseUrl, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    cachedKey = key;

    return { client: cachedAdminClient, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
};

