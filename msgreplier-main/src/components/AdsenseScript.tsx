"use client";

import { useEffect, useState } from "react";

export default function AdsenseScript() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => {
      const consent = localStorage.getItem("cookieConsent");
      setConsented(consent === "true");
    };

    check();

    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  useEffect(() => {
    if (!consented) return;

    // Inject native script to avoid Next.js next/script data-nscript attribute warnings
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8011470049569108";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(script);
      } catch {
        // Safe check
      }
    };
  }, [consented]);

  return null;
}
