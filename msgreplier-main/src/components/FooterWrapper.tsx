"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on all love-space pages (landing + both users inside the room)
  if (pathname?.startsWith("/love-space")) return null;

  return <Footer />;
}
