"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Heart } from "lucide-react";

function Redirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const queryString = searchParams.toString();
      const suffix = queryString ? `?${queryString}` : "";
      
      if (user) {
        router.replace(`/digital-greeting/create/with-image${suffix}`);
      } else {
        router.replace(`/wishes/login?next=${encodeURIComponent(`/digital-greeting/create${suffix}`)}`);
      }
    };
    checkAuthAndRedirect();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
      <Heart className="w-10 h-10 animate-pulse text-pink-500" />
      <p className="mt-4 text-pink-500 font-bold uppercase tracking-widest text-xs">Loading Builder...</p>
    </div>
  );
}

export default function DigitalGreetingCreateRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
          <Heart className="w-10 h-10 animate-pulse text-pink-500" />
        </div>
      }
    >
      <Redirector />
    </Suspense>
  );
}
