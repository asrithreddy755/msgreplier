import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import WishesEditClient from './WishesEditClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Wish | MsgReplier',
  robots: { index: false },
};

export default async function WishesEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/wishes/login?next=/wishes/edit/${slug}`);
  }

  // Fetch the greeting — must belong to this user
  const { data: greeting, error } = await supabase
    .from('love_greetings')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single();

  if (error || !greeting) {
    notFound();
  }

  return <WishesEditClient greeting={greeting} />;
}
