import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Greeting - Create a Surprise for Someone Special",
  description: "Create and share a beautiful, animated digital greeting card for birthdays, anniversaries, or just because. No login required.",
};

export default function DigitalGreetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
