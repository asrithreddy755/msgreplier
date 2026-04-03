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
    default: "MsgReplier - Create Websites for Wishes & Private Love Spaces",
    template: "%s | MsgReplier",
  },
  description:
    "Build a custom website for wishes or create a private Love-Space. The ultimate digital toolkit for couples and special moments. Interactive, animated, and 100% private.",
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
        alt: "MsgReplier - Digital Wishes & Love Space",
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
  verification: {
    google: "REPLACE_WITH_ACTUAL_CODE",
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
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" sizes="180x180" />

        {/* Google AdSense verification script */}
        {process.env.NODE_ENV === "production" && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8011470049569108"
            crossOrigin="anonymous"
          ></script>
        )}
      </head>
      <body className="antialiased min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            <Navbar />
            <MainWrapper>
              {children}
            </MainWrapper>
            <CookieConsent />
          </div>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
          {process.env.NODE_ENV === "production" && <ServiceWorkerRegistration />}
        </ThemeProvider>

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
