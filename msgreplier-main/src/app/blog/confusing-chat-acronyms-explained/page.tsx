import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Understanding IYKYK, TFW, and Other Confusing Chat Acronyms",
  description:
    "Feeling lost in group chats? Here is a complete guide to understanding modern internet slang, from IYKYK to TFW.",
};

export default function ConfusingChatAcronyms() {
  return (
    <div className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `\n        h1, h2, h3, h4, h5, h6, .font-heading {\n          font-family: \'Unbounded\', sans-serif !important;\n        }\n      `}} />
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/blog" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-[#110f0f] hover:text-[#948678] hover:bg-transparent font-heading font-medium text-xs uppercase tracking-wider">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <Link href="/shortcutpedia" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2 border-[#110f0f] text-[#110f0f] hover:bg-[#110f0f] hover:text-white rounded-full font-heading text-xs uppercase tracking-wider px-5 py-2.5">
              Search Shortcutpedia
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-[#eedfc6] border border-[#d4c3ab] text-[#110f0f] px-2.5 py-0.5 rounded-full font-semibold text-xs">
              <Tag className="h-3 w-3" /> Internet Culture
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> April 08, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Understanding IYKYK, TFW, and Other Confusing Chat Acronyms
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            If reading a group chat feels like deciphering a secret code, you aren't alone. Let's break down the most confusing slang of the year.
          </p>
        </header>

        <article className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>
              Language evolves rapidly on the internet. What started with simple abbreviations like "BRB" (Be Right Back) and "LOL" (Laugh Out Loud) in the early days of AOL Instance Messenger has transformed into a complex dialect of memes, TikTok trends, and hyper-specific acronyms. 
            </p>
            <p>
              If you've recently been sent a message that looks like complete gibberish, don't worry. We're here to help you decode it.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Big Ones Analyzed</h2>

            <div className="space-y-6">
              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-2">1. IYKYK</h3>
                <p><strong>Stands for:</strong> "If You Know, You Know"</p>
                <p className="mt-2">
                  <strong>Meaning:</strong> This acronym is used when sharing an inside joke, a niche meme, or referencing a relatable but highly specific experience. It implies that only a certain group of people will understand what is being posted. 
                </p>
                <p className="mt-2 italic text-foreground/80">Example: "That one specific smell in Blockbuster Video on a Friday night... IYKYK."</p>
              </div>

              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-2">2. TFW / MFW</h3>
                <p><strong>Stands for:</strong> "That Feeling When" / "My Face When"</p>
                <p className="mt-2">
                  <strong>Meaning:</strong> Usually accompanied by an image or a reaction GIF, TFW is used to describe a relatable emotional reaction to an everyday situation.
                </p>
                <p className="mt-2 italic text-foreground/80">Example: "TFW you hit the snooze button and accidentally sleep for 4 hours."</p>
              </div>

              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-2">3. POV</h3>
                <p><strong>Stands for:</strong> "Point of View"</p>
                <p className="mt-2">
                  <strong>Meaning:</strong> Borrowed from film terminology, POV took over TikTok as a way to set the scene for a joke. It asks the viewer to imagine themselves in a specific perspective.
                </p>
                <p className="mt-2 italic text-foreground/80">Example: "POV: You are my microwave watching me eat shredded cheese at 3 AM."</p>
              </div>

              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <h3 className="text-xl font-bold text-foreground mb-2">4. TL;DR</h3>
                <p><strong>Stands for:</strong> "Too Long; Didn't Read"</p>
                <p className="mt-2">
                  <strong>Meaning:</strong> A summary. If someone sends a massive wall of text detailing unnecessary facts, they usually put a "TL;DR" at the bottom to give you the one-sentence executive summary.
                </p>
                <p className="mt-2 italic text-foreground/80">Example: "TL;DR: The date went horribly and I'm never using dating apps again."</p>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 mt-10">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <BookText className="h-5 w-5 text-primary" />
                Never Get Confused Again
              </h3>
              <p className="mb-4 text-foreground/80">
                Did someone send you an abbreviation that isn't on this list? We have a massive, continuously updated dictionary of chat slang. Check out <strong>Shortcutpedia</strong> to decode any text message instantly.
              </p>
              <Button asChild>
                <Link href="/shortcutpedia">Search Shortcutpedia</Link>
              </Button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Do We Use These?</h2>
            <p>
              You might be asking, "Why don't people just type out the full words?" The answer is two-fold: speed and community.
            </p>
            <p>
              Typing fast on glass screens is annoying. Anything that saves thumb-taps is naturally going to catch on. Furthermore, using specific slang signals that you are "in the know" and part of the online community. Slang creates a sense of belonging among digital natives. Understanding these acronyms helps bridge the gap between generations.
            </p>

          </div>
        </article>
      </div>
    </div>
  );
}
