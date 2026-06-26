import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Tag, Clock, Heart, MessageSquare, Star, Shield } from "lucide-react";
import AuthorCard from "@/components/AuthorCard";

export const metadata: Metadata = {
  title: "50 Cute Anniversary Message Ideas for Your Partner (2026) | MsgReplier",
  description:
    "Celebrate your love with the most heartfelt anniversary messages. From sweet one-liners to emotional paragraphs, find the perfect words for your partner.",
  alternates: { canonical: "https://msgreplier.com/blog/anniversary-message-ideas" },
};

const messages = [
  { cat: "Short & Sweet", items: [
    "Every day with you feels like the best day of my life.",
    "I fall in love with you a little more every single day.",
    "Thank you for choosing me, over and over again.",
    "Being with you is my favourite adventure.",
    "You are my person, my home, my everything.",
    "A year with you and I want a lifetime more.",
    "You make ordinary days feel extraordinary.",
    "My heart is yours, always and completely.",
    "I am so grateful our paths crossed when they did.",
    "You are everything I never knew I needed.",
  ]},
  { cat: "Romantic & Emotional", items: [
    "Before I met you, I did not know what it felt like to have someone who truly sees you. You know me better than I know myself, and that is the most beautiful, terrifying, and perfect thing I have ever experienced.",
    "Every morning I wake up and my first thought is you. Every night I close my eyes and my last thought is you. You are woven into every part of my day, and I would not have it any other way.",
    "On this anniversary, I want you to know: the best decision I ever made was letting you in. You have changed the way I see the world, the way I see myself, and the way I love.",
    "There is a kind of love that sneaks up on you quietly — a warmth that becomes so familiar you cannot imagine life without it. That is what you are to me.",
  ]},
  { cat: "Funny & Playful", items: [
    "Happy anniversary! Another year of tolerating my weirdness. You deserve a medal.",
    "On this special day, I want to thank you for ignoring all my red flags and swiping right anyway.",
    "I love you more than pizza, and if you knew me at all, you would know that is not a small statement.",
    "We are basically the cutest couple I know. I am biased, but I stand by it.",
    "Thanks for being the reason I smile at my phone like an idiot every day.",
  ]},
  { cat: "Long Distance", items: [
    "The miles between us do nothing to dim what I feel for you. If anything, this distance has only made me more certain that you are worth every second of the wait.",
    "Some days the distance feels unbearable. But then I remember that what we have is rare — a love strong enough to survive the miles — and I feel proud of us.",
    "I carry you with me everywhere I go. You are in every beautiful song, every sunset, every quiet moment. Distance cannot change that.",
  ]},
];

export default function AnniversaryMessageIdeasPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "50 Cute Anniversary Message Ideas for Your Partner (2026)",
    description: "A curated collection of heartfelt, funny, and romantic anniversary messages for couples.",
    datePublished: "2026-05-26",
    dateModified: "2026-05-26",
    author: { "@type": "Organization", name: "MsgReplier" },
    publisher: { "@type": "Organization", name: "MsgReplier", logo: { "@type": "ImageObject", url: "https://msgreplier.com/icon.png" } },
    url: "https://msgreplier.com/blog/anniversary-message-ideas",
  };

  return (
    <div className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `\n        h1, h2, h3, h4, h5, h6, .font-heading {\n          font-family: \'Unbounded\', sans-serif !important;\n        }\n      `}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/blog" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-[#110f0f] hover:text-[#948678] hover:bg-transparent font-heading font-medium text-xs uppercase tracking-wider">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          <Link href="/digital-greeting" className="hidden sm:inline-flex">
            <Button variant="default" className="gap-2">
              Create Anniversary Surprise <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-[#eedfc6] border border-[#d4c3ab] text-[#110f0f] px-2.5 py-0.5 rounded-full font-semibold text-xs">
              <Tag className="h-3 w-3" /> Relationships
            </span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> May 26, 2026</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 6 min read</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            50 Cute <span className="text-rose-500">Anniversary Messages</span> for Your Partner (2026)
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            From heartfelt one-liners to emotional paragraphs, funny texts to long-distance tributes — find the
            perfect words for your anniversary this year.
          </p>
        </header>

        <article className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm">
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

            <h2 className="text-2xl font-bold">How to Choose the Right Anniversary Message</h2>
            <p>
              The best anniversary message is one that feels <em>true to your relationship</em>. A playful couple might
              appreciate a funny message; a deeply romantic couple might prefer something more heartfelt. Use the
              categories below to find what resonates most — then make it yours by adding a specific memory, nickname,
              or personal detail.
            </p>

            {messages.map((cat) => (
              <section key={cat.cat}>
                <h2 className="text-2xl font-bold mt-10">{cat.cat}</h2>
                <div className="space-y-4 mt-4">
                  {cat.items.map((msg, i) => (
                    <div key={i} className="bg-muted/30 rounded-xl p-4 border border-border/40 flex items-start gap-3">
                      <Heart className="h-4 w-4 text-rose-400 fill-rose-200 shrink-0 mt-1" />
                      <p className="text-sm leading-relaxed">&quot;{msg}&quot;</p>
            <div className="my-8 not-prose">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80"
                alt="Couple celebrating their wedding anniversary with flowers and champagne"
                className="w-full rounded-2xl object-cover border border-[#d4c3ab] shadow-sm"
                loading="lazy"
                width="900"
                height="500"
              />
              <p className="text-xs text-center text-[#948678] mt-2 italic">Anniversary messages are a meaningful way to honour your shared journey.</p>
            </div>

                    </div>
                  ))}
                </div>
              </section>
            ))}

            <h2 className="text-2xl font-bold mt-10">Take It Further: Create an Anniversary Wishes Website</h2>
            <p>
              Words in a text message are beautiful. But imagine delivering your anniversary message as a fully
              personalised, animated, music-backed{" "}
              <Link href="/digital-greeting" className="text-primary hover:underline">Wishes Website</Link> — a
              digital experience your partner can open, re-read, and share with the world. It takes less than two
              minutes to create, and it is completely free.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {[
                { icon: Star, label: "Beautiful animations" },
                { icon: MessageSquare, label: "Personalised message" },
                { icon: Shield, label: "Private & shareable link" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30 text-center">
                  <Icon className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center p-8 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
              <Heart className="h-10 w-10 text-rose-500 fill-rose-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Make This Anniversary Unforgettable</h3>
              <p className="text-muted-foreground mb-6">
                Create a personalised Wishes Website with animations, music, and your heartfelt message.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600 text-white border-0">
                  <Link href="/digital-greeting">Create Anniversary Surprise</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/love-space">Open Love-Space</Link>
                </Button>
              </div>
            </div>
            <AuthorCard authorId="priya" />
          </div>
        </article>
      </div>
    </div>
  );
}
