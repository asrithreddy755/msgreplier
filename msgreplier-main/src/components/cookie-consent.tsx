"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-foreground/90 backdrop-blur-md text-background p-6 rounded-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-border/10">
          <div className="space-y-2 text-center md:text-left flex-1">
            <h3 className="font-bold text-lg">We value your privacy</h3>
            <p className="text-sm text-muted/90 leading-relaxed">
              We use cookies to enhance your experience and analyze our traffic. By continuing to visit this site, you agree to our use of cookies.
              <br className="hidden md:block" />
              Read our <Link href="/privacy-policy" className="underline hover:text-primary transition-colors">Privacy Policy</Link> to learn more.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-[280px]">
            <Button 
              onClick={handleDecline} 
              variant="outline" 
              className="flex-1 bg-transparent border-background/20 text-background hover:bg-background/10 hover:text-background"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAccept} 
              className="flex-1 bg-background text-foreground hover:bg-background/90"
            >
              Accept
            </Button>
          </div>
          <button 
            onClick={() => setShowConsent(false)}
            className="absolute top-2 right-2 p-1 text-background/50 hover:text-background md:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
