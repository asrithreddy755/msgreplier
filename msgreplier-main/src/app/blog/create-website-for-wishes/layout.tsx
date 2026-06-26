import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Create a Website for Wishes in Seconds | MsgReplier Blog",
  description: "Learn how to build a custom, interactive digital greeting website for birthdays and anniversaries with 3D animations and music.",
  alternates: {
    canonical: "https://msgreplier.com/blog/create-website-for-wishes",
  },
};

export default function WishesBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "How to Create a Website for Wishes in Seconds",
    "description": "Learn how to build a custom, interactive digital greeting website for birthdays and anniversaries with 3D animations and music.",
    "datePublished": "2026-05-15T08:00:00+00:00",
    "author": {
      "@type": "Organization",
      "name": "MsgReplier",
      "url": "https://msgreplier.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MsgReplier",
      "logo": {
        "@type": "ImageObject",
        "url": "https://msgreplier.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://msgreplier.com/blog/create-website-for-wishes"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
