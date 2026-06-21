import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Wishes Website - Birthday, Anniversary, Love, Apology & Flower Surprises | MsgReplier",
  description: "Build a personalized animated wishes website with music and custom messages for birthdays, anniversaries, love greetings, apologies, special moments, or flowers. Free, interactive, and no login required.",
  keywords: ["wishes website creator", "create website for wishes", "wishes maker", "happy birthday wishes website", "love greeting website", "apology greeting website", "flower greeting website"],
  alternates: {
    canonical: "/digital-greeting/create",
  },
  openGraph: {
    title: "Create a Wishes Website | MsgReplier",
    description: "Build a personalized animated wishes website with music and custom messages for birthdays, anniversaries, love, apology, or flower greetings in seconds.",
    images: [
      {
        url: "/opengraph-image", 
        width: 1200,
        height: 630,
        alt: "Build Wishes Website",
      }
    ]
  }
};

export default function CreateGreetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
