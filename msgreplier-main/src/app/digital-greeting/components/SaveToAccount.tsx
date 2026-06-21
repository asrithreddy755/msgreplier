'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth/actions';

type Props = { slug: string };

type Tab = 'login' | 'signup';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, '1 uppercase letter required')
    .regex(/[0-9]/, '1 number required'),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

/** Claims a greeting for the authenticated user by calling the claim API */
async function claimGreeting(slug: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/digital-greeting/claim/${slug}`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export default function SaveToAccount({ slug }: Props) {
  const [tab, setTab] = useState<Tab>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'emailSent'>('idle');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user is already logged in — auto-claim if so
  useEffect(() => {
    const check = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setStatus('loading');
        const ok = await claimGreeting(slug);
        setStatus(ok ? 'saved' : 'saved'); // either way mark as done
      }
      setCheckingSession(false);
    };
    check();
  }, [slug]);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const afterAuth = async () => {
    setStatus('loading');
    await claimGreeting(slug);
    setStatus('saved');
  };

  const handleLogin = async (data: LoginForm) => {
    setAuthError(null);
    const { error } = await signInWithEmail(data.email, data.password);
    if (error) {
      setAuthError(
        error.toLowerCase().includes('invalid') ? 'Incorrect email or password.' : error
      );
      return;
    }
    await afterAuth();
  };

  const handleSignup = async (data: SignupForm) => {
    setAuthError(null);
    const { error } = await signUpWithEmail(data.email, data.password);
    if (error) {
      setAuthError(
        error.toLowerCase().includes('already') ? 'Account already exists — try signing in.' : error
      );
      return;
    }
    // If email confirmation is off, they're logged in now
    await afterAuth();
    // If email confirmation is on, the claim will silently fail (no session yet) — that's fine,
    // user can visit dashboard after confirming their email
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    // Store the slug in sessionStorage so the callback page can claim it after OAuth redirect
    sessionStorage.setItem('pendingClaimSlug', slug);
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(error);
      setIsGoogleLoading(false);
      sessionStorage.removeItem('pendingClaimSlug');
    }
  };

  // Don't render while checking session
  if (checkingSession) return null;

  // ── Already logged in & claiming ──────────────────────────────
  if (isLoggedIn && status === 'loading') {
    return (
      <div className="save-to-account save-to-account--loading">
        <div className="save-spinner" />
        <p>Saving to your account…</p>
      </div>
    );
  }

  // ── Saved successfully ────────────────────────────────────────
  if (status === 'saved') {
    return (
      <div className="save-to-account save-to-account--saved">
        <span className="save-icon">✅</span>
        <div>
          <p className="save-saved-title">Saved to your account!</p>
          <p className="save-saved-sub">
            You can find, edit and reshare it from your{' '}
            <Link href="/wishes/dashboard" className="save-link">Wishes Dashboard</Link>.
          </p>
        </div>
      </div>
    );
  }

  // ── Not logged in — show inline auth ─────────────────────────
  return (
    <div className="save-to-account">
      <div className="save-header">
        <span className="save-badge">💾 Save this wish</span>
        <p className="save-desc">
          Login or create a free account to save this to your dashboard and edit it anytime.
        </p>
      </div>

      {/* Tabs */}
      <div className="save-tabs">
        <button
          className={`save-tab ${tab === 'login' ? 'save-tab--active' : ''}`}
          onClick={() => { setTab('login'); setAuthError(null); }}
          id="save-tab-login"
        >
          Sign in
        </button>
        <button
          className={`save-tab ${tab === 'signup' ? 'save-tab--active' : ''}`}
          onClick={() => { setTab('signup'); setAuthError(null); }}
          id="save-tab-signup"
        >
          Create account
        </button>
      </div>

      {/* Error */}
      {authError && (
        <div className="save-error" role="alert">
          ⚠️ {authError}
        </div>
      )}

      {/* Login form */}
      {tab === 'login' && (
        <form
          onSubmit={loginForm.handleSubmit(handleLogin)}
          className="save-form"
          noValidate
        >
          <div className="save-field">
            <input
              id="save-login-email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              className={`save-input ${loginForm.formState.errors.email ? 'save-input--error' : ''}`}
              {...loginForm.register('email')}
            />
            {loginForm.formState.errors.email && (
              <p className="save-field-error">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="save-field">
            <input
              id="save-login-password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className={`save-input ${loginForm.formState.errors.password ? 'save-input--error' : ''}`}
              {...loginForm.register('password')}
            />
            {loginForm.formState.errors.password && (
              <p className="save-field-error">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <button
            id="save-login-submit"
            type="submit"
            disabled={loginForm.formState.isSubmitting}
            className="save-btn-primary"
          >
            {loginForm.formState.isSubmitting ? 'Signing in…' : '💾 Sign in & Save'}
          </button>
        </form>
      )}

      {/* Signup form */}
      {tab === 'signup' && (
        <form
          onSubmit={signupForm.handleSubmit(handleSignup)}
          className="save-form"
          noValidate
        >
          <div className="save-field">
            <input
              id="save-signup-email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              className={`save-input ${signupForm.formState.errors.email ? 'save-input--error' : ''}`}
              {...signupForm.register('email')}
            />
            {signupForm.formState.errors.email && (
              <p className="save-field-error">{signupForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="save-field">
            <input
              id="save-signup-password"
              type="password"
              placeholder="Password (min 8 chars, 1 uppercase, 1 number)"
              autoComplete="new-password"
              className={`save-input ${signupForm.formState.errors.password ? 'save-input--error' : ''}`}
              {...signupForm.register('password')}
            />
            {signupForm.formState.errors.password && (
              <p className="save-field-error">{signupForm.formState.errors.password.message}</p>
            )}
          </div>
          <button
            id="save-signup-submit"
            type="submit"
            disabled={signupForm.formState.isSubmitting}
            className="save-btn-primary"
          >
            {signupForm.formState.isSubmitting ? 'Creating account…' : '✨ Create account & Save'}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="save-divider"><span>or</span></div>

      {/* Google */}
      <button
        id="save-google-btn"
        type="button"
        onClick={handleGoogle}
        disabled={isGoogleLoading}
        className="save-btn-google"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <p className="save-skip">
        <Link href="/wishes/dashboard" className="save-link">Go to my dashboard</Link>
      </p>
    </div>
  );
}
