'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Post-login landing page.
 * After OAuth redirect, this page:
 *  1. Reads `pendingClaimSlug` from sessionStorage (set when user clicked Google in create flow)
 *  2. Calls the claim API if slug exists
 *  3. Redirects to `next` (dashboard by default)
 *
 * This is needed because sessionStorage is browser-only and can't be read in the
 * server-side OAuth callback route.
 */
function PostLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/wishes/dashboard';

  useEffect(() => {
    const run = async () => {
      const slug = sessionStorage.getItem('pendingClaimSlug');
      if (slug) {
        sessionStorage.removeItem('pendingClaimSlug');
        try {
          await fetch(`/api/digital-greeting/claim/${slug}`, { method: 'POST' });
        } catch {
          // Claim failed silently — user can still use the dashboard
        }
      }
      router.replace(next);
    };
    run();
  }, [next, router]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: '#64748b',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid #fecdd3',
          borderTopColor: '#f43f5e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0, fontSize: '0.9rem' }}>Setting things up…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PostLoginPage() {
  return (
    <Suspense fallback={null}>
      <PostLoginContent />
    </Suspense>
  );
}
