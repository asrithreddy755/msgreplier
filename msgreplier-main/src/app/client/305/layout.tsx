import { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Special Surprise for Priya Mareddy 💝 | MsgReplier",
  description: "A customized digital surprise built with love on MsgReplier.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "A Digital Surprise is Waiting for You! 🎁",
    description: "Experience a personalized digital greeting built just for you. Interactive, animated, and full of love. Tap to open your gift.",
    images: [
      {
        url: "https://images.msgreplier.com/wishes/a4828006-1ffe-4b31-bc82-747ffeda72a0/1786727800184-007d66af-1a0b-429c-a74c-3805264b970c.webp",
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
    images: ["https://images.msgreplier.com/wishes/a4828006-1ffe-4b31-bc82-747ffeda72a0/1786727800184-007d66af-1a0b-429c-a74c-3805264b970c.webp"],
  }
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
