import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why Do We Have Crushes? The Psychology of Attraction",
  description:
    "Explore the science behind why we develop crushes, the role of dopamine and limerence, and why we obsess over compatibility tests.",
  alternates: {
    canonical: "/blog/psychology-of-crushes",
  },
};

export default function PsychologyOfCrushesPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Why Do We Have Crushes? The Psychology of Attraction",
    "description": "Explore the science behind why we develop crushes, the role of dopamine and limerence, and why we obsess over compatibility tests.",
    "datePublished": "2026-02-26T08:00:00+00:00",
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
      "@id": "https://msgreplier.com/blog/psychology-of-crushes"
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
          <Link href="/flames" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2">
              Test Compatibility
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
              <Tag className="h-3 w-3" /> Psychology
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> February 26, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Why Do We Have Crushes? The Psychology of Attraction
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            It starts with a glance, then a thought, and soon you&apos;re checking their Instagram every hour. Why do our brains obsess over someone we barely know?
          </p>
        </header>

        <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              Having a crush feels like a rollercoaster. One minute you&apos;re euphoric because they liked your story, the next you&apos;re anxious because they left you on read. But why does this happen? The answer lies in your brain chemistry.
            </p>

            <h2>The Dopamine Effect</h2>
            <p>
              When you see your crush or get a text from them, your brain releases dopamine—the &quot;feel-good&quot; neurotransmitter. It&apos;s the same chemical associated with rewards, like eating chocolate or winning a game.
            </p>
            <p>
              This creates a cycle: you seek interaction to get that dopamine hit. The uncertainty (&quot;Do they like me back?&quot;) actually *increases* dopamine, making the crush even more intense.
            </p>

            <h2>Limerence: When a Crush Becomes Obsession</h2>
            <p>
              Psychologists use the term **limerence** to describe an involuntary state of intense romantic desire. It&apos;s characterized by intrusive thoughts, a fear of rejection, and a longing for reciprocation.
            </p>
            <p>
              This is often why we turn to tools like <Link href="/flames">FLAMES calculators</Link> or zodiac compatibility. When we feel out of control, we look for signs and reassurance that the feeling is mutual.
            </p>

            <h2>Idealization</h2>
            <p>
              A crush is often more about fantasy than reality. We project our ideal partner onto the person, ignoring their flaws. This &quot;halo effect&quot; makes everything they do seem perfect.
            </p>

            <h2>Is It Love?</h2>
            <p>
              While a crush is intense, it&apos;s often short-lived. Love, on the other hand, is built on attachment and deep knowledge of the other person (flaws and all). However, a crush is often the necessary spark that leads to love.
            </p>

            <h2>Curious About Your Chances?</h2>
            <p>
              If you&apos;re currently in the throes of a crush, why not have some fun with it? Check your name compatibility with our classic <Link href="/flames">FLAMES game</Link>. It won&apos;t tell you the future, but it might give you the courage to make a move!
            </p>

            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/flames">Try FLAMES</Link>
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
