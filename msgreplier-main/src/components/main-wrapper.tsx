"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define logic for immersive pages that should not have standard layout padding/ID
  const isGreetingPage = pathname?.includes("/greet/");
  const isDigitalGreetingLanding = pathname === "/digital-greeting";
  const hideLayout = isGreetingPage || isDigitalGreetingLanding;

  return (
    <main 
      id={hideLayout ? undefined : "main-content"} 
      className="flex-grow"
    >
      {children}
    </main>
  );
}
