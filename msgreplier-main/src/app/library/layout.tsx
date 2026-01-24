import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shortcutpedia – Chat Shortcuts & Slang Meanings Explained",
  description:
    "Find the meaning of chat shortcuts, slang words, and emojis with tone indicators. Shortcutpedia helps you understand modern texting clearly.",
  alternates: {
    canonical: "/library",
  },
  openGraph: {
    title: "Shortcutpedia – Chat Shortcuts & Slang Meanings Explained",
    description:
      "Find the meaning of chat shortcuts, slang words, and emojis with tone indicators. Shortcutpedia helps you understand modern texting clearly.",
    url: "/library",
  },
  twitter: {
    title: "Shortcutpedia – Chat Shortcuts & Slang Meanings Explained",
    description:
      "Find the meaning of chat shortcuts, slang words, and emojis with tone indicators. Shortcutpedia helps you understand modern texting clearly.",
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

