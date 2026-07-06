import { Metadata } from "next";

// This layout file handles metadata for the dynamic wishes page
// Note: We can't use generateMetadata easily here because it's a dynamic route
// but we can provide a compelling default for sharing.

export const metadata: Metadata = {
  title: "A Special Surprise for You 💝",
  description: "Someone special has built a custom digital surprise for you! Open this link to experience a magical celebration with 3D animations and music.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "A Digital Surprise is Waiting for You! 🎁",
    description: "Experience a personalized digital greeting built just for you. Interactive, animated, and full of love. Tap to open your gift.",
    images: [
      {
        url: "/opengraph-image", // Or a specific gift-related image if you have one
        width: 1200,
        height: 630,
        alt: "A Special Digital Gift",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "A Digital Surprise is Waiting for You! 🎁",
    description: "Open your personalized digital celebration. Built with love on MsgReplier.",
    images: ["/twitter-image"],
  }
};

export default function GreetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
