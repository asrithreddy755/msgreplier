import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "100+ Cute Nicknames for Your Partner (2026 Edition)",
  description:
    "A curated list of sweet, funny, and romantic nicknames for your partner. Plus, learn how to spam them with love using our Text Repeater tool.",
  alternates: {
    canonical: "/blog/100-cute-nicknames",
  },
};

export default function NicknamesPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "100+ Cute Nicknames for Your Partner (2026 Edition)",
    "description": "A curated list of sweet, funny, and romantic nicknames for your partner. Plus, learn how to spam them with love using our Text Repeater tool.",
    "datePublished": "2026-02-20T08:00:00+00:00",
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
      "@id": "https://msgreplier.com/blog/100-cute-nicknames"
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
          <Link href="/text-repeater" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2">
              Send it 100x
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
              <Tag className="h-3 w-3" /> Relationships
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> February 20, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            100+ Cute Nicknames for Your Partner (2026 Edition)
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Stuck on what to call your significant other? We&apos;ve compiled the ultimate list of nicknames, from the classic &quot;Babe&quot; to the unique and hilarious.
          </p>
        </header>

        <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              Finding the perfect nickname is a rite of passage in any relationship. It&apos;s a secret code, a sign of affection, and sometimes, a way to tease each other. Here is our massive list of nicknames categorized for every mood.
            </p>

            <h2>Sweet & Classic</h2>
            <p>These never go out of style. Perfect for when you&apos;re feeling sentimental.</p>
            <ul>
              <li>Babe / Baby</li>
              <li>Honey / Hun</li>
              <li>Sweetheart</li>
              <li>Love</li>
              <li>Darling</li>
              <li>My World</li>
              <li>Soulmate</li>
              <li>Sunshine</li>
              <li>Angel</li>
              <li>Beautiful / Handsome</li>
            </ul>

            <h2>Funny & Playful</h2>
            <p>For the couple that loves to laugh. These are great for lighthearted roasting.</p>
            <ul>
              <li>Goofball</li>
              <li>Trouble</li>
              <li>Monster</li>
              <li>Stinker</li>
              <li>Potato</li>
              <li>Weirdo</li>
              <li>Nerd</li>
              <li>Bossy</li>
              <li>Munchkin</li>
              <li>Captain</li>
            </ul>

            <h2>Romantic & Deep</h2>
            <p>Save these for special moments or when you&apos;re feeling extra affectionate.</p>
            <ul>
              <li>My Forever</li>
              <li>The One</li>
              <li>Better Half</li>
              <li>Dream Girl / Dream Guy</li>
              <li>My Everything</li>
              <li>Treasure</li>
              <li>Beloved</li>
              <li>Heartbeat</li>
              <li>Moon & Stars</li>
              <li>Destiny</li>
            </ul>

            <h2>Food-Inspired</h2>
            <p>Because who doesn&apos;t love food? Cute and delicious.</p>
            <ul>
              <li>Pumpkin</li>
              <li>Cookie</li>
              <li>Cupcake</li>
              <li>Sugar</li>
              <li>Peanut</li>
              <li>Muffin</li>
              <li>Jellybean</li>
              <li>Dumpling</li>
              <li>Sweetie Pie</li>
              <li>Honeybun</li>
            </ul>

            <h2>How to Use These Nicknames</h2>
            <p>
              Once you&apos;ve picked a favorite, why not have some fun with it? You can use our <Link href="/text-repeater">Text Repeater</Link> tool to send them their new nickname 100 times in a row on WhatsApp or Instagram. It&apos;s a funny way to grab their attention!
            </p>
            <p>
              Just type the nickname (e.g., &quot;Good morning Sunshine ☀️&quot;), set the repetition count to 100, and hit generate. Copy and paste for instant impact.
            </p>

            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/text-repeater">Try Text Repeater</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/blog">Back to Blog</Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
