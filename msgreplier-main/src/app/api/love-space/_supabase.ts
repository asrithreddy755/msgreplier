import { createClient } from "@supabase/supabase-js";

export const getEnvStatus = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
    return {
        supabaseUrl,
        supabaseServiceKey,
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(supabaseServiceKey)
    };
};

export const getSupabaseAdmin = () => {
    const { supabaseUrl, supabaseServiceKey, hasSupabaseUrl, hasServiceRoleKey } = getEnvStatus();
    if (!hasSupabaseUrl || !hasServiceRoleKey) {
        return { client: null, envStatus: { hasSupabaseUrl, hasServiceRoleKey } };
    }
    return {
        client: createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }),
        envStatus: { hasSupabaseUrl, hasServiceRoleKey }
    };
};
