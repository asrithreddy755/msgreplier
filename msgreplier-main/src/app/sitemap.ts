import type { MetadataRoute } from "next";
import { PLATFORMS } from "@/lib/constants";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://") ? base : `https://${base.replace(/^http:\/\//, "")}`;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified,
    },
    {
      url: `${siteUrl}/library`,
      lastModified,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified,
    },
    {
      url: `${siteUrl}/terms-conditions`,
      lastModified,
    },
  ];

  const platformRoutes: MetadataRoute.Sitemap = PLATFORMS.map((p) => ({
    url: `${siteUrl}/${p.slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...platformRoutes];
}

