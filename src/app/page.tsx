"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const defaultPlatform = PLATFORMS.find(p => p.id === 'x');
    if (defaultPlatform) {
      router.replace(`/${defaultPlatform.slug}`);
    } else {
      router.replace('/custom-text-repeater');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
