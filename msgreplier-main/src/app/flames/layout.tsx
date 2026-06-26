import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FLAMES Love Calculator - Check Your Relationship Compatibility | MsgReplier",
  description:
    "Play the classic FLAMES love compatibility test online. Enter two names and instantly discover if your relationship is Friendship, Love, Affection, Marriage, Enemy, or Sibling. Free, no login.",
  keywords: [
    "FLAMES game",
    "Love Calculator",
    "Relationship Test",
    "Crush Compatibility",
    "Valentine's Day Prank",
    "Real Love Test",
    "FLAMES Online",
    "Couple Test",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://msgreplier.com/flames",
  },
  openGraph: {
    title: "❤️ FLAMES Calculator - Are you Lovers or Enemies?",
    description:
      "I just checked my relationship destiny! Find out yours now on MsgReplier.",
    url: "https://msgreplier.com/flames",
    type: "website",
  },
};

export default function FlamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
