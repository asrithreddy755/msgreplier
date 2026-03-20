import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/love-space$"],
        disallow: [
          "/dashboard",
          "/login",
          "/register",
          "/love-space/*",
          "/api/*",
          "/test-snake",
        ],
      },
    ],
    sitemap: "https://msgreplier.com/sitemap.xml",
  };
}
