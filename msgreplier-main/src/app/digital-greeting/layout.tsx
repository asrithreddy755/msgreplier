import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishes Website Builder - Interactive Greeting Cards | MsgReplier",
  description: "Create a beautiful, interactive wishes website for birthdays, anniversaries, or any special occasion. Personalise with music, themes, and animations. Login required — free and paid plans available.",
  keywords: ["wishes website", "create website for wishes", "digital birthday card", "animated anniversary wish", "interactive greeting maker", "birthday wish website"],
  alternates: {
    canonical: "https://msgreplier.com/digital-greeting",
  },
  openGraph: {
    title: "Build a Magical Wishes Website | MsgReplier",
    description: "Transform your wishes into an interactive experience. Create a personalized greeting website with music and animations that they will cherish forever.",
    images: [
      {
        url: "/opengraph-image", 
        width: 1200,
        height: 630,
        alt: "Create Digital Wishes Website",
      }
    ]
  }
};

export default function DigitalGreetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
