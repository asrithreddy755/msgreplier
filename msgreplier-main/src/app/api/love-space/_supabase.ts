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

export const getSupabaseAdmin = () => {
    const { supabaseUrl, supabaseServiceKey, supabaseAnonKey, hasSupabaseUrl, hasServiceRoleKey, hasAnonKey } = getEnvStatus();
    if (!hasSupabaseUrl) {
        return { client: null, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
    }
    if (hasServiceRoleKey) {
        return {
            client: createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }),
            envStatus: { hasSupabaseUrl, hasServiceRoleKey }
        };
    }
    if (hasAnonKey) {
        return {
            client: createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }),
            envStatus: { hasSupabaseUrl, hasServiceRoleKey }
        };
    }
    return { client: null, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
};
