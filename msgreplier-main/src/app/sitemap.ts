import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://msgreplier.com";

  return [
    {
      url: `${baseUrl}/love-space`,
      lastModified: new Date("2026-05-24"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/digital-greeting`,
      lastModified: new Date("2026-05-24"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/text-repeater`,
      lastModified: new Date("2026-07-06"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shortcutpedia`,
      lastModified: new Date("2026-07-06"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date("2026-07-06"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: baseUrl,
      lastModified: new Date("2026-07-06"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/flames`,
      lastModified: new Date("2026-05-24"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/love-score`,
      lastModified: new Date("2026-07-06"),
      changeFrequency: "weekly",
      priority: 0.7,
    },

    {
      url: `${baseUrl}/prompt`,
      lastModified: new Date("2026-05-24"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-05-24"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date("2026-06-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date("2026-06-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/community-guidelines`,
      lastModified: new Date("2026-06-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Blog Posts
    {
      url: `${baseUrl}/blog/create-website-for-wishes`,
      lastModified: new Date("2026-05-20"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/perfect-couple-prompts`,
      lastModified: new Date("2026-02-18"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/100-cute-nicknames`,
      lastModified: new Date("2026-02-25"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/how-flames-works`,
      lastModified: new Date("2026-03-04"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/text-repeater-tricks`,
      lastModified: new Date("2026-03-11"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/psychology-of-crushes`,
      lastModified: new Date("2026-04-01"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/love-score-guide`,
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/dating-app-conversation-starters`,
      lastModified: new Date("2026-05-13"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/confusing-chat-acronyms-explained`,
      lastModified: new Date("2026-05-06"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/texting-style-relationship-psychology`,
      lastModified: new Date("2026-04-29"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/long-distance-relationship-guide`,
      lastModified: new Date("2026-04-22"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/meaningful-digital-surprises`,
      lastModified: new Date("2026-04-08"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/evolution-of-text-messaging`,
      lastModified: new Date("2026-03-18"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog/ai-replies-for-couples`,
      lastModified: new Date("2026-05-27"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/birthday-wishes-website-guide`,
      lastModified: new Date("2026-06-03"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/anniversary-message-ideas`,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/cute-good-morning-messages`,
      lastModified: new Date("2026-06-17"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/relationship-communication-tips`,
      lastModified: new Date("2026-06-24"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/love-space-guide`,
      lastModified: new Date("2026-03-25"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
