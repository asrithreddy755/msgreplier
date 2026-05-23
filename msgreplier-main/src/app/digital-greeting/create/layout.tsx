import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Wishes Website - Birthday & Anniversary Surprises | MsgReplier",
  description: "Build a personalized animated wishes website with music and custom messages for birthdays or anniversaries in seconds. Free, interactive, and no login required.",
  keywords: ["wishes website creator", "create website for wishes", "wishes maker", "happy birthday wishes website"],
  alternates: {
    canonical: "/digital-greeting/create",
  },
  openGraph: {
    title: "Create a Wishes Website | MsgReplier",
    description: "Build a personalized animated wishes website with music and custom messages in seconds.",
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
