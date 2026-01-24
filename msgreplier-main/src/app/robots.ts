import type { MetadataRoute } from "next";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://") ? base : `https://${base.replace(/^http:\/\//, "")}`;
};

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

