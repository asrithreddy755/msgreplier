'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const getSiteUrl = () => {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.startsWith('http') ? url : `https://${url}`;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
};

/** Sign up a new user with email and password */
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

/** Sign in an existing user with email and password */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

/** Initiate Google OAuth login — redirects the browser to Google */
export async function signInWithGoogle(redirectToPath?: string) {
  const supabase = createSupabaseBrowserClient();
  const nextParam = redirectToPath ? `?next=${encodeURIComponent(redirectToPath)}` : '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback${nextParam}`,
    },
  });
  if (error) return { error: error.message };
  return { error: null };
}

/** Sign out the current user */
export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return { error: null };
}

/** Get the current user session (client-side) */
export async function getSession() {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Send a password reset email */
export async function sendResetPasswordEmail(email: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/wishes/dashboard`,
  });
  if (error) return { error: error.message };
  return { error: null };
}
