import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FLAMES Love Calculator - Check Your Relationship Compatibility | MsgReplier",
  description:
    "Discover your destiny with the classic FLAMES Love Calculator! Enter your names to see if you are Friends, Lovers, Affectionate, Marriage, Enemies, or Siblings. The viral Valentine's Day relationship test.",
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
