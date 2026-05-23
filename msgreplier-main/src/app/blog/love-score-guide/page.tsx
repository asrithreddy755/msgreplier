import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Love Score Guide: How It Works & What Your Score Means | MsgReplier",
  description:
    "Discover how MsgReplier's Love Score calculator works, what the different score ranges mean, and how to interpret your compatibility result. A complete guide.",
  alternates: {
    canonical: "/blog/love-score-guide",
  },
};

export default function LoveScoreGuide() {
  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
      <Link href="/blog" className="inline-flex mb-8">
        <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <header className="mb-10 not-prose">
          <p className="text-sm text-muted-foreground mb-3">Relationships · 6 min read</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Love Score Guide: How It Works &amp; What Your Score Means
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            You&apos;ve entered your names, hit calculate, and got a number. But what does your Love
            Score actually mean? This complete guide walks you through the algorithm, the score
            ranges, and how to use the result for fun — not fortune-telling.
          </p>
        </header>

        <div className="space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What Is the Love Score Calculator?</h2>
            <p>
              The MsgReplier Love Score calculator is a lighthearted compatibility tool that takes
              two names and produces a percentage score between 0% and 100%. It&apos;s designed to
              be a fun icebreaker, a conversation starter, or a playful way to explore your
              connection with someone special — not a scientifically validated relationship
              assessment.
            </p>
            <p className="mt-3">
              Think of it like a digital version of the FLAMES game you might have played in school.
              It&apos;s not meant to predict your romantic future — it&apos;s meant to make you smile,
              spark a conversation, and add a little playfulness to your relationship.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">How the Algorithm Works</h2>
            <p>
              The Love Score is calculated using a character-frequency analysis of the two names you
              enter. Here&apos;s the basic process:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-3">
              <li>Both names are combined and converted to lowercase.</li>
              <li>Each unique letter is counted across both names.</li>
              <li>The letter counts are progressively summed and reduced — similar to the classic
                FLAMES algorithm — until two single digits remain.</li>
              <li>Those two digits are combined to form the final percentage score.</li>
            </ol>
            <p className="mt-3">
              This means the result is deterministic: the same two names will always produce the
              same score. However, the order of the names doesn&apos;t matter — &quot;Alice &amp;
              Bob&quot; and &quot;Bob &amp; Alice&quot; will yield the same result.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What Each Score Range Means</h2>
            <p>Here&apos;s a fun breakdown of what different score ranges suggest:</p>

            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground">🔥 90–100% — Soulmate Level</p>
                <p className="mt-1 text-sm">
                  An incredibly rare score. The stars — and the letters in your names — seem to
                  align perfectly. Whether or not you believe in fate, this is a great excuse to
                  celebrate your connection.
                </p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground">💕 70–89% — Deeply Compatible</p>
                <p className="mt-1 text-sm">
                  You two have a strong natural affinity. This range suggests a comfortable, warm
                  compatibility — the kind that makes spending time together feel effortless.
                </p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground">😊 50–69% — Good Match</p>
                <p className="mt-1 text-sm">
                  A solid score. You have enough in common to build something meaningful, with
                  enough differences to keep things interesting. Most healthy couples fall somewhere
                  in this range.
                </p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground">🌱 30–49% — Room to Grow</p>
                <p className="mt-1 text-sm">
                  Don&apos;t panic! Some of the most powerful relationships are between people who
                  seem like opposites on the surface. This score just means you&apos;ll need to put
                  in the effort to understand each other — and that effort is always worth it.
                </p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground">😅 0–29% — Opposites Attract?</p>
                <p className="mt-1 text-sm">
                  A low score just means the algorithm wasn&apos;t impressed — your real-life
                  chemistry is a completely different story. Use this as a laugh and move on.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Is It Accurate?</h2>
            <p>
              Let&apos;s be honest: the Love Score is not a scientifically validated compatibility
              test. Genuine relationship compatibility is shaped by shared values, communication
              styles, emotional intelligence, life goals, and many other complex factors that no
              name-based algorithm can capture.
            </p>
            <p className="mt-3">
              What the Love Score <em>is</em> good for is starting conversations. Try it with a
              crush, share the result on a first date, or compete with your partner to see who gets
              the highest score with a fictional character. The point is to have fun and connect —
              not to make life decisions based on the number.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Tips for Getting the Most Out of the Tool</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Try it with nicknames — sometimes a pet name produces a higher score than your real name.</li>
              <li>Compare your score with the classic <Link href="/flames" className="text-primary hover:underline">FLAMES calculator</Link> for a second opinion.</li>
              <li>Screenshot your result and share it with your partner — it&apos;s a sweet, low-effort way to show you&apos;re thinking of them.</li>
              <li>If you get a low score, try the <Link href="/love-score" className="text-primary hover:underline">Love Score page</Link> again with a variation of the names — full name versus first name only often produces different results.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What to Do After You Get Your Score</h2>
            <p>
              Whether your score is 14% or 99%, the real question is what you do next. Here are a
              few ideas to keep the romance alive:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong className="text-foreground">Create a Digital Greeting:</strong> Send your partner a personalized
                surprise using our <Link href="/digital-greeting" className="text-primary hover:underline">Wishes Website Builder</Link>.
                It&apos;s free and takes less than two minutes.
              </li>
              <li>
                <strong className="text-foreground">Start a Love-Space Session:</strong> Join a private, real-time chat
                room with your partner on our <Link href="/love-space" className="text-primary hover:underline">Love-Space</Link> — complete with couple games and an interactive private space just for two.
              </li>
              <li>
                <strong className="text-foreground">Send a Love Letter:</strong> Write something heartfelt using our <Link href="/love-letter" className="text-primary hover:underline">Love Letter generator</Link> and share it in a way that feels personal and meaningful.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Final Thoughts</h2>
            <p>
              The Love Score is exactly what it&apos;s meant to be — a fun, joyful little tool that
              gives you an excuse to think about someone you care about. Real love is built on
              communication, trust, and shared experiences, not on letter frequencies. But
              sometimes, a silly number is all you need to spark a conversation, share a laugh, or
              remind someone that they&apos;re on your mind.
            </p>
            <p className="mt-3">
              Ready to find out your score?{" "}
              <Link href="/love-score" className="text-primary hover:underline font-medium">
                Try the Love Score calculator now →
              </Link>
            </p>
          </section>

        </div>
      </article>
    </div>
  );
}
