import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Website for Wishes - Free Digital Greeting Cards",
  description: "Want to create a custom website for wishes? Our free tool lets you build an interactive, animated digital greeting card for birthdays and anniversaries in seconds. Make their special day unforgettable with a personalized digital surprise.",
  keywords: ["create website for wishes", "digital birthday card", "animated anniversary wish", "online greeting card maker", "interactive wishes website"],
  openGraph: {
    title: "Build a Magical Website for Wishes | MsgReplier",
    description: "Transform your wishes into an interactive 3D experience. Create a personalized greeting website with music and animations that they will cherish forever.",
    images: [
      {
        url: "/opengraph-image", // Or a specific one if you have it
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
