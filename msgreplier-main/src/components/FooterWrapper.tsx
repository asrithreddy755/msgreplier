"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on all love-space pages (landing + both users inside the room) and greeting pages
  if (pathname?.startsWith("/love-space") || pathname?.startsWith("/greet")) return null;

  return <Footer />;
}
