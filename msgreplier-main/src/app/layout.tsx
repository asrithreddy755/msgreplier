import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Navbar } from "@/components/navbar";
import Script from "next/script";

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
    default: "MsgReplier - Free Text Repeater, Slang Dictionary & AI Reply Generator",
    template: "%s | MsgReplier",
  },
  description:
    "The ultimate messaging toolkit. distinct features include a Text Repeater for WhatsApp/Instagram, a Gen Z Slang Dictionary (Shortcutpedia), and an AI Reply Generator. No login required.",
   icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/favicon-32x32.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MsgReplier",
    title: "MsgReplier – Shortcut Meanings & Text Repeater",
    description:
      "Understand chat shortcuts and slang meanings, and repeat text easily for any platform character limit. Simple, fast, and privacy-friendly.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MsgReplier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MsgReplier – Shortcut Meanings & Text Repeater",
    description:
      "Understand chat shortcuts and slang meanings, and repeat text easily for any platform character limit. Simple, fast, and privacy-friendly.",
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
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

        {/* Google AdSense verification script */}
        {process.env.NODE_ENV === "production" && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8011470049569108"
            crossOrigin="anonymous"
          ></script>
        )}
      </head>
      <body className="font-body antialiased">
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

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
