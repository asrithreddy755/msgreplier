import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Use this in "use client" components for auth operations.
 * The existing src/lib/supabase.ts is kept untouched for Love Space / anonymous usage.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
