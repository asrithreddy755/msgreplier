import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Space - Private Couple Rooms, Chat & Games",
  description:
    "Join a 100% private, no-login couple chat room with games like Ludo and XOX. Your Love Space auto-deletes after 24 hours. Free forever — no account needed.",
  keywords: ["private love space", "couple chat room", "no login chat", "secure couple games", "private room for two", "ludo for couples", "online sanctuary"],
  alternates: {
    canonical: "https://msgreplier.com/love-space",
  },
  openGraph: {
    title: "Love Space - Your Private Couple Sanctuary | MsgReplier",
    description:
      "A dedicated private space for couples to bond. Real-time chat, interactive games like Ludo and XOX, and live status updates. 100% secure and no login required.",
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
