import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Wishes Website',
  description: 'Sign in to manage your Wishes Website pages on MsgReplier.',
  robots: { index: false },
};

/**
 * Layout for auth pages (/wishes/login, /wishes/signup).
 * Inherits root layout (html/body/navbar) — provides the auth-specific styling wrapper.
 */
export default function WishesAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
