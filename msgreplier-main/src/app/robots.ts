import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/login",
          "/register",
          "/admin",
          "/love-space/*",
          "/api/*",
          "/test-snake",
        ],
      },
    ],
    sitemap: "https://msgreplier.com/sitemap.xml",
  };
}
