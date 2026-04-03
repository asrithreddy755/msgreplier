import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Space - Private Chat Rooms & Games for Couples",
  description:
    "Create a private, 100% secure space for you and your partner. Play Ludo, Tic Tac Toe, and Snake & Ladder while chatting in a real-time private room. No login required. A dedicated sanctuary for your relationship.",
  alternates: {
    canonical: "https://msgreplier.com/love-space",
  },
  openGraph: {
    title: "Love Space - Your Private Couple Sanctuary | MsgReplier",
    description:
      "A dedicated private space for couples to bond. Real-time chat, interactive games like Ludo and XOX, and live status updates. This is your personal, secure room for sharing special moments.",
    url: "https://msgreplier.com/love-space",
    type: "website",
    images: [
      {
        url: "/opengraph-image", 
        width: 1200,
        height: 630,
        alt: "Love Space Private Couple Room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Space - The Ultimate Private Space for Couples",
    description: "Your own private digital room. Play games, chat, and bond in a 100% secure environment designed just for two.",
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
