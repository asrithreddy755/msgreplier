import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "What Your Texting Style Says About Your Relationship",
  description:
    "Do you double text? Use too many emojis? Learn what your digital communication habits say about the health of your relationship.",
};

export default function TextingStylePsychology() {
  return (
    <div className="min-h-screen bg-background">
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
              Calculate Love Score
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
              <Calendar className="h-3 w-3" /> April 05, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            What Your Texting Style Says About Your Relationship
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Do you double text? Leave them on read? Use too many emojis? Learn what your digital communication habits silently communicate to your partner.
          </p>
        </header>

        <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>
              In modern relationships, how you text is just as important as how you talk in person. Texts are concrete; they sit there in your chat history to be analyzed, re-read, and sometimes misunderstood. Your texting habits provide a unique window into your attachment style and the health of your relationship.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Response Time Imbalance</h2>
            <p>
              Are you the person who replies instantly, while your partner takes hours? Or vice versa? An imbalance in response times can create underlying relationship tension. 
            </p>
            <p>
              Psychologists suggest that if there is a severe mismatch, it triggers anxiety in the "fast replier" and a feeling of being smothered in the "slow replier." If you consistently take hours to respond to a simple question, it signals low prioritization. Conversely, demanding an immediate reply to non-urgent texts signals an anxious attachment style. Healthy couples tend to match each other's pace or communicate when they are unable to reply quickly.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Double-Texter vs. The Ghoster</h2>
            <p>
              <strong>The Double Texter:</strong> Sending multiple texts in a row before the other person replies isn't always a bad thing! Among secure couples, "double texting" is just a stream of consciousness. It shows you feel totally comfortable with your partner. However, in early dating, excessive double texting can signal insecurity.
            </p>
            <p>
               <strong>The Ghoster / "On Read" Leaver:</strong> Habitually leaving someone on read is a power move. If you read a message and don't reply or acknowledge it for days, you are subconsciously establishing dominance over the communication cadence. This is one of the most cited reasons for completely breaking off early-stage dating.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Emoji Overload vs. Punctuation Police</h2>
            <p>
              Do you use five laughing emojis when something is barely funny? Or do you end every sentence with a strict, formal period?
            </p>
            <p>
              Using periods at the end of short texts (e.g., "Sounds good.") is often interpreted as passive-aggressive or angry in text-speak. Emojis, on the other hand, soften the tone and add crucial emotional context that is lost without body language. If your partner suddenly stops using emojis, it's often an early warning sign of emotional withdrawal. 
            </p>

            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 mt-10">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Curious About Your Love Destiny?
              </h3>
              <p className="mb-4 text-foreground/80">
                Want to know if your specific texting style aligns perfectly with your crush? While psychology is great, sometimes you just need to consult the algorithm.
              </p>
              <Button asChild>
                <Link href="/flames">Test Your FLAMES Connection</Link>
              </Button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Mirroring</h2>
            <p>
              The healthiest texting relationships feature a concept called "Texting Mirroring." This is when both partners subconsciously adopt the same typing cadence, emoji usage, and message length. If you notice your partner using your favorite slang words, take it as a sign of deep connection!
            </p>

          </div>
        </article>
      </div>
    </div>
  );
}
