import type { Metadata } from "next";
import { PLATFORMS } from "@/lib/constants";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://") ? base : `https://${base.replace(/^http:\/\//, "")}`;
};

const homeTitle = "MsgReplier – Shortcut Meanings, Slang Dictionary & Text Repeater";
const homeDescription =
  "MsgReplier helps you understand chat shortcuts and slang meanings, and repeat text easily to match platform character limits. Fast, simple, and privacy-first.";

const repeaterTitle = "Text Repeater Tool – Repeat Text for Any Character Limit";
const repeaterDescription =
  "Repeat text instantly for WhatsApp, Instagram, Twitter, and other platforms. Match maximum character limits easily.";

const aiTitle = "AI Reply Generator – Smart Replies for Chats (Coming Soon)";
const aiDescription =
  "Generate smart replies for chats, social media, and work conversations in different tones. Coming soon on MsgReplier.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const { platform: slug } = await params;


  const platformConfig = PLATFORMS.find((p) => p.slug === slug);

  let title = homeTitle;
  let description = homeDescription;

  if (slug === "custom-text-repeater") {
    title = repeaterTitle;
    description = repeaterDescription;
  } else if (slug === "cham-ai") {
    title = aiTitle;
    description = aiDescription;
  } else if (platformConfig && platformConfig.id !== "shortcutpedia") {
    const platformName = platformConfig.name;
    title = `${platformName} Character Limit Tool – Text Repeater & Shortcut Meanings`;
    description = `Check ${platformName} character limits, repeat text to fit the limit, and understand popular chat shortcuts and slang used on ${platformName}.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}/${slug}`,
      siteName: "MsgReplier",
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "MsgReplier",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

