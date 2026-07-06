import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Special Surprise for You 💝",
  description: "Open your personalised digital greeting built with love on MsgReplier.",
  robots: { index: false, follow: false },
};

export default function GreetWithImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
