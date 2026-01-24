import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://") ? base : `https://${base.replace(/^http:\/\//, "")}`;
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MsgReplier – Shortcut Meanings & Text Repeater",
    template: "%s | MsgReplier",
  },
  description:
    "Understand chat shortcuts and slang meanings, and repeat text easily for any platform character limit. Simple, fast, and privacy-friendly.",
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
  width: 'device-width',
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
