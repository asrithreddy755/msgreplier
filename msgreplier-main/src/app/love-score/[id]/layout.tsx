import type { Metadata } from "next";

// Individual love-score quiz pages are user-specific shared links.
// They contain no crawlable static content and should not be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoveScoreQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
