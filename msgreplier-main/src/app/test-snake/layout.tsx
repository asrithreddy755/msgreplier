import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sandbox Test Mode - Snake & Ladder",
  robots: { index: false, follow: false },
};

export default function SnakeLadderTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
