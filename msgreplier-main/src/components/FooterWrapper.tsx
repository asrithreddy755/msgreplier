"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on all love-space pages, greeting pages, digital-greeting pages, wishes pages, and client page
  if (
    pathname?.startsWith("/love-space") || 
    pathname?.startsWith("/greet") || 
    pathname?.startsWith("/digital-greeting") ||
    pathname?.startsWith("/wishes") ||
    pathname === "/client/305"
  ) return null;

  return <Footer />;
}
