import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Navbar } from "@/components/navbar";
import { MainWrapper } from "@/components/main-wrapper";
import Script from "next/script";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { FooterWrapper } from "@/components/FooterWrapper";
import AdsenseScript from "@/components/AdsenseScript";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://")
    ? base
    : `https://${base.replace(/^http:\/\//, "")}`;
};

const siteUrl = getSiteUrl();
const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-1XPYWEPPGJ";

export const metadata: Metadata = {
  metadataBase: new URL('https://msgreplier.com'),
  title: {
    default: "MsgReplier - Private Love Space & Wishes Website Builder",
    template: "%s | MsgReplier",
  },
  description:
    "Build a custom Wishes Website or join your partner in a private Love-Space. The ultimate digital toolkit for couples. Create interactive, animated surprises and private chat rooms. No login required.",
  keywords: ["wishes website", "private love space", "couple chat room", "birthday wishes website", "anniversary wishes website", "digital greeting card", "couple games online"],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/icon.png"],
    apple: [{ url: "/icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MsgReplier",
    title: "MsgReplier – Interactive Wishes & Private Couple Spaces",
    description:
      "Create a magical digital surprise with our wishes website builder or join your partner in a private Love-Space. Simple, fast, and unforgettable.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MsgReplier - Private Love Space & Wishes Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MsgReplier – Interactive Wishes & Private Couple Spaces",
    description:
      "Create a magical digital surprise with our wishes website builder or join your partner in a private Love-Space. Simple, fast, and unforgettable.",
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Unbounded:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" sizes="180x180" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.__name = window.__name || function(target, value) {
                  return Object.defineProperty(target, 'name', { value: value, configurable: true });
                };
              }
            `.replace(/\r\n/g, "\n")
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: #000000;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
              }
              #global-loader-bar {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #f43f5e, #e11d48);
                width: 0%;
                box-shadow: 0 0 8px rgba(244, 63, 94, 0.6);
                z-index: 1000000;
                animation: progress-loading 4.5s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
              }
              @keyframes progress-loading {
                0% { width: 0%; }
                100% { width: 85%; }
              }
              @media (prefers-reduced-motion: reduce) {
                #global-loader-bar {
                  animation: none !important;
                  width: 85% !important;
                }
              }
            `.replace(/\r\n/g, "\n")
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background">
        {/* 
          This wrapper uses dangerouslySetInnerHTML to prevent React hydration from reconciling 
          or throwing warnings for elements modified/removed by the inline loader script.
        */}
        <div id="global-loader-wrapper" suppressHydrationWarning>
          <div id="global-loader" suppressHydrationWarning>
            <div id="global-loader-bar" suppressHydrationWarning />
          </div>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var loader = document.getElementById('global-loader');
                  var bar = document.getElementById('global-loader-bar');
                  var isFinished = false;

                  function finishLoading() {
                    if (isFinished) return;
                    isFinished = true;

                    // Snap progress bar to 100%
                    if (bar) {
                      bar.style.animation = 'none';
                      bar.offsetHeight; // force reflow/repaint
                      bar.style.transition = 'width 150ms ease-out';
                      bar.style.width = '100%';
                    }

                    // Fade out overlay
                    setTimeout(function() {
                      if (loader) {
                        loader.style.transition = 'opacity 250ms ease';
                        loader.style.opacity = '0';
                        setTimeout(function() {
                          loader.style.display = 'none';
                        }, 250);
                      }
                    }, 200);
                  }

                  // Hard 5-second timeout fallback
                  var timeoutId = setTimeout(function() {
                    finishLoading();
                  }, 5000);

                  function handleLoad() {
                    clearTimeout(timeoutId);
                    finishLoading();
                  }

                  if (document.readyState === 'complete') {
                    handleLoad();
                  } else {
                    window.addEventListener('load', handleLoad);
                  }
                })();
              `.replace(/\r\n/g, "\n")
            }}
          />
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            <Navbar />
            <MainWrapper>
              {children}
            </MainWrapper>
            <FooterWrapper />
            <CookieConsent />
          </div>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
          {process.env.NODE_ENV === "production" && <ServiceWorkerRegistration />}
        </ThemeProvider>

        {process.env.NODE_ENV === "production" && <AdsenseScript />}

        {/* Google Analytics */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
