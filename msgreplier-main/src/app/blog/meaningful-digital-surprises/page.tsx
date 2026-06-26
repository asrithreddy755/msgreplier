import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthorCard from "@/components/AuthorCard";

export const metadata: Metadata = {
  title: "How to Plan a Meaningful Digital Surprise for Your Partner",
  description:
    "Distance shouldn't stop you from celebrating. Learn how to craft unforgettable virtual gifts, from custom wishes websites to surprise online dates.",
  alternates: {
    canonical: "https://msgreplier.com/blog/meaningful-digital-surprises",
  }
};

export default function MeaningfulDigitalSurprises() {
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
          <Link href="/digital-greeting" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2 border-[#110f0f] text-[#110f0f] hover:bg-[#110f0f] hover:text-white rounded-full font-heading text-xs uppercase tracking-wider px-5 py-2.5">
              Create a Digital Greeting
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-[#eedfc6] border border-[#d4c3ab] text-[#110f0f] px-2.5 py-0.5 rounded-full font-semibold text-xs">
              <Tag className="h-3 w-3" /> Celebration Ideas
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> March 20, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            How to Plan a Meaningful Digital Surprise for Your Partner
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Whether due to long-distance or just a busy schedule, learning how to assemble a digital surprise can save an anniversary. Here are the best virtual gift ideas.
          </p>
        </header>

        <article className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>
              In a world where physical gifts often get delayed by shipping or stuck in transit, the digital surprise has become an essential tool in every romantic's toolkit. Digital surprises are instant, environmentally friendly, and when done correctly, highly emotional.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Build a Custom Wishes Website</h2>
            <p>
              Forget sending an e-card to their email spam folder. You can now build dedicated, personalized mini-websites entirely dedicated to wishing them a Happy Birthday or Happy Anniversary. 
            </p>
            <div className="my-8 not-prose">
              <img
                src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&q=80"
                alt="Person opening a surprise gift box with a joyful expression on their face"
                className="w-full rounded-2xl object-cover border border-[#d4c3ab] shadow-sm"
                loading="lazy"
                width="900"
                height="500"
              />
              <p className="text-xs text-center text-[#948678] mt-2 italic">Digital surprises can feel just as personal and meaningful as a physical gift.</p>
            </div>

            
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 mt-6 mb-6">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Build One in 60 Seconds
              </h3>
              <p className="mb-4 text-foreground/80">
                You don't need to know how to code. Using our <strong>Digital Greeting Tool</strong>, you enter their name, type a heartfelt message, and we instantly generate a secure, animated website link that you can text to them. When they open it, confetti drops, music plays, and your personalized message appears.
              </p>
              <Button asChild>
                <Link href="/digital-greeting">Start Building For Free</Link>
              </Button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. The Digital Scavenger Hunt</h2>
            <p>
              Make them work for their surprise. A digital scavenger hunt requires planning but is incredibly rewarding. 
            </p>
            <p>
              Start by sending them a cryptic text that leads to a specific URL (like a funny YouTube video). Tell them to read the pinned comment under the video. The comment contains a password and instructions to log into an old shared Pinterest board. On the Pinterest board, they find a photo of a QR code. When they scan the QR code, it opens up a digital gift card for their favorite restaurant. 
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. The Collaborative Spotify Playlist</h2>
            <p>
              Music is heavily tied to memory. Create a new, blank Spotify playlist and set it to collaborative. Add a song that reminds you of them, share the link, and challenge them to add the next track. Over the course of the week, build a playlist full of inside jokes and memories. It's completely free but deeply meaningful.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Cameo Shoutouts</h2>
            <p>
               If your partner is obsessed with a specific reality TV show or a niche B-list celebrity, hop onto Cameo. For surprisingly affordable prices, you can hire that celebrity to record a custom 30-second video wishing your partner a happy birthday. To execute this perfectly, casually text them the video file without any context and wait for their reaction.
            </p>
            
            <p className="mt-8 italic">
              Digital surprises prove that it's the thought, time, and creativity that count, not the physical price tag. Next time you forget to order a physical present 5 weeks in advance, use these instant digital ideas!
            </p>

            <AuthorCard authorId="priya" />
          </div>
        </article>
      </div>
    </div>
  );
}
