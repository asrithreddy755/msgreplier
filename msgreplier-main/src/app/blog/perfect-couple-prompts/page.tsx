import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "New Feature: Creative AI Prompts for Couple Photos (Goodbye Chat, Hello Creativity!)",
  description:
    "We’ve pivoted from general chat to Couple Photo Prompts — a library of creative prompts for matching AI images and real-life couple photoshoots.",
  alternates: {
    canonical: "/blog/perfect-couple-prompts",
  },
};

export default function PerfectCouplePromptsPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "New Feature: Creative AI Prompts for Couple Photos (Goodbye Chat, Hello Creativity!)",
    "description": "We’ve pivoted from general chat to Couple Photo Prompts — a library of creative prompts for matching AI images and real-life couple photoshoots.",
    "datePublished": "2026-02-18T08:00:00+00:00",
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
      "@id": "https://msgreplier.com/blog/perfect-couple-prompts"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/blog" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <Link href="/" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2">
              Try it on Home
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
              <Tag className="h-3 w-3" /> Product Update
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> February 18, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-pink-500 bg-clip-text text-transparent">
              New Feature: Creative AI Prompts for Couple Photos
            </span>
            <span className="block text-foreground mt-2">
              (Goodbye Chat, Hello Creativity!)
            </span>
          </h1>

          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            We’ve made a big change: we removed the old Cham AI chat idea and replaced it with a new tool built for couples who want better photo ideas and better AI image prompts.
          </p>
        </header>

        <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2>The Pivot</h2>
            <p>
              Our original direction was a general chat-style assistant. It was flexible, but we realized flexibility wasn’t the real win for most people.
              The best tools are the ones that help you create something specific, fast, and shareable. So we pivoted.
            </p>
            <p>
              Instead of a “chat for everything”, we’re building focused tools that help people connect visually — especially couples who want more creative photos and memories.
            </p>

            <h2>The Problem</h2>
            <p>
              Couples run into the same two issues again and again:
            </p>
            <ul>
              <li>
                <strong>Photoshoot ideas get repetitive.</strong> After a few cute poses, it starts to feel like every picture looks the same.
              </li>
              <li>
                <strong>AI image prompts feel confusing.</strong> Even with a great AI image generator, it’s hard to describe two people, matching outfits, the vibe, lighting, and the scene in a way that gets consistent results.
              </li>
            </ul>

            <h2>The Solution: Couple Photo Prompts</h2>
            <p>
              Introducing <strong>Couple Photo Prompts</strong> — a curated library of detailed, ready-to-copy prompts designed for couples.
              Each prompt is written to help you generate matching AI images or plan a real-life photoshoot with a clear concept.
            </p>

            <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/10 via-transparent to-pink-500/10 p-5 md:p-6">
              <h3 className="mt-0">What you’ll find inside</h3>
              <ul>
                <li><strong>Romantic styles:</strong> golden hour, soft film looks, cozy indoor vibes.</li>
                <li><strong>Funny concepts:</strong> playful “opposites”, meme-worthy scenes, light teasing poses.</li>
                <li><strong>Artistic looks:</strong> editorial lighting, cinematic frames, minimal studio sets.</li>
              </ul>
            </div>

            <h2>How to use it</h2>
            <ol>
              <li>Pick a prompt style that matches your vibe.</li>
              <li>Copy the prompt.</li>
              <li>Paste into your favorite AI image generator, or use it as a real-life pose + setting guide.</li>
              <li>Customize details like outfits, location, and mood.</li>
            </ol>

            <h2>Try it now</h2>
            <p>
              Ready to make your couple photos look intentional, creative, and unique? Head to the homepage and try <strong>Couple Photo Prompts</strong> today.
            </p>

            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">Go to Home</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/blog">Read More Articles</Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

