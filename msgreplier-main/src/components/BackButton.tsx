'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function BackButtonContent({ defaultBackHref = "/" }: { defaultBackHref?: string }) {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  
  let backHref = defaultBackHref;
  let backText = "Back to Home";
  
  if (from === "love-space" || from === "love-score") {
    backHref = `/${from}`;
    backText = from === "love-space" ? "Back to Love Space" : "Back to Love Score";
  }

  return (
    <Link href={backHref} className="inline-flex">
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {backText}
      </Button>
    </Link>
  );
}

export default function BackButton({ defaultBackHref = "/" }: { defaultBackHref?: string }) {
  return (
    <Suspense fallback={
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" disabled>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    }>
      <BackButtonContent defaultBackHref={defaultBackHref} />
    </Suspense>
  );
}
