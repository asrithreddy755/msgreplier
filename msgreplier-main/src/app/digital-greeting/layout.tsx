import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Website for Wishes - Free Digital Greeting Cards",
  description: "Want to create a custom website for wishes? Our free tool lets you build an interactive, animated digital greeting card for birthdays and anniversaries in seconds.",
  keywords: ["create website for wishes", "digital birthday card", "animated anniversary wish", "online greeting card maker", "interactive wishes website"],
};

export default function DigitalGreetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
