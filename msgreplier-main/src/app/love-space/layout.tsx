import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Space - Private Chat Rooms & Games for Couples",
  description:
    "Create a private, 100% secure space for you and your partner. Play Ludo, Tic Tac Toe, and Snake & Ladder while chatting in a real-time private room. No login required.",
  alternates: {
    canonical: "https://msgreplier.com/love-space",
  },
  openGraph: {
    title: "Love Space - Private Chat & Games for Couples | MsgReplier",
    description:
      "A dedicated private space for couples to bond. Real-time chat, interactive games like Ludo and XOX, and live status updates. 100% private, no account needed.",
    url: "https://msgreplier.com/love-space",
    type: "website",
    images: [
      {
        url: "/opengraph-image", // Reusing site-wide OG for now or specific if exists
        width: 1200,
        height: 630,
        alt: "Love Space Private Couple Room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Space - The Ultimate Private Space for Couples",
    description: "Play games and chat in your own private room. No login, 100% private.",
    images: ["/twitter-image"],
  },
};

export default function LoveSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
