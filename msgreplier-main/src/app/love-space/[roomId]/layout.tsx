import type { Metadata } from "next";

// Individual love-space rooms are user-specific private sessions.
// They contain no crawlable content and should not be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoveSpaceRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
