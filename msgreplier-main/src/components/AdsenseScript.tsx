"use client";

import Script from "next/script";
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

  if (!consented) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8011470049569108"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
