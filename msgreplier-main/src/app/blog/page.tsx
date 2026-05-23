import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL('https://msgreplier.com'),
  alternates: {
    canonical: "/blog",
  },
  title: "MsgReplier Blog - Messaging Tips, Tricks & Slang",
  description: "Welcome to the official MsgReplier blog. From mastering WhatsApp formatting tricks to decoding the latest Gen Z slang, we break it all down.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-2">
            The MsgReplier Hub: <br className="hidden sm:block" />
            Messaging Tips, Tricks & Trends
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground">
            Decoding the internet, one text at a time.
          </p>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground/80 leading-relaxed">
            Welcome to the official MsgReplier blog. In the digital age, communication is evolving faster than ever.
            From mastering WhatsApp formatting tricks to decoding the latest Gen Z slang, we break it all down.
          </p>
        </section>

        {/* Recent Articles Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 pb-2 border-b border-border/40">
            <h2 className="text-2xl font-bold tracking-tight">Recent Articles</h2>
          </div>

          {/* New Article 6: Dating App Openers */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Dating & Social
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> April 10, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 5 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  How to Start a Conversation on Dating Apps (Without Being Boring)
                </h3>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                Tired of sending "Hey" on Tinder and Bumble? Learn exactly how to break the ice and start a conversation that actually gets a reply.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/dating-app-conversation-starters" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 7: Confusing Chat Acronyms */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Internet Culture
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> April 08, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 6 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  Understanding IYKYK, TFW, and Other Confusing Chat Acronyms
                </h3>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                If reading a group chat feels like deciphering a secret code, you aren't alone. Let's break down the most confusing slang of the year.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/confusing-chat-acronyms-explained" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 8: Texting Style Psychology */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Psychology
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> April 05, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 4 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  What Your Texting Style Says About Your Relationship
                </h3>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                Do you double text? Leave them on read? Use too many emojis? Learn what your digital communication habits silently communicate to your partner.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/texting-style-relationship-psychology" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 9: Long Distance Relationships */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Relationships
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> March 29, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 7 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  The Ultimate Guide to Long-Distance Relationships in 2026
                </h3>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                Surviving a Long Distance Relationship is notoriously tough. But with the right mindset and the right digital tools, you can close the gap.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/long-distance-relationship-guide" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 10: Meaningful Digital Surprises */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Celebration Ideas
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> March 20, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 5 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  How to Plan a Meaningful Digital Surprise for Your Partner
                </h3>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                Distance shouldn't stop you from celebrating. Learn how to craft unforgettable virtual gifts, from custom wishes websites to surprise online dates.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/meaningful-digital-surprises" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 11: Evolution of Text Messaging */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Tech History
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> March 12, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 4 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  The Evolution of Text Messaging: From T9 to Real-Time Context
                </h3>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                It is hard to believe that we used to pay 10 cents per message and had to press the number '7' four times just to type the letter 'S'.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/evolution-of-text-messaging" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article: Create Website for Wishes */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect width="20" height="5" x="2" y="7" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Feature Guide
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> May 15, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 4 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  How to Create a Website for Wishes in Seconds
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                Learn how to build a custom, interactive digital greeting website for birthdays and anniversaries with 3D animations and music.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/create-website-for-wishes" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 0: Love Space Guide */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-rose-500">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Love & Connection
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> March 19, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 6 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Love-Space: The Ultimate Private Room for Couples
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4 relative z-10">
              <p>
                Discover how to create a 100% private, secure space for you and your partner. Chat, play games like Ludo and XOX, and stay connected with no login required.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white">
                  <Link href="/blog/love-space-guide" className="inline-flex items-center gap-2">
                    Explore Love-Space <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 1: Psychology of Crushes */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Psychology
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Feb 26, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 4 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  Why Do We Have Crushes? The Psychology of Attraction
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                It starts with a glance, then a thought, and soon you&apos;re checking their Instagram every hour. Why do our brains obsess over someone we barely know?
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/psychology-of-crushes" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 2: Text Repeater Tricks */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Tech Tips
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Feb 24, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 3 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  5 Creative Ways to Use a Text Repeater on WhatsApp
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                A text repeater isn&apos;t just for spamming. Discover clever ways to use this tool to make your messages stand out, from apologies to note-taking.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/text-repeater-tricks" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 3: FLAMES Science */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Love & Fun
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Feb 22, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 5 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  The Science Behind the FLAMES Game: Is It Accurate?
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                We&apos;ve all played it in the back of a notebook. But how does FLAMES actually work, and why has it stood the test of time? Let&apos;s dive into the algorithm of childhood love.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/how-flames-works" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          {/* New Article 4: 100 Cute Nicknames */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Relationships
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Feb 20, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 6 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  100+ Cute Nicknames for Your Partner (2026 Edition)
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Stuck on what to call your significant other? We&apos;ve compiled the ultimate list of nicknames, from the classic &quot;Babe&quot; to the unique and hilarious.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/100-cute-nicknames" className="inline-flex items-center gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>

          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Product Update
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Feb 18, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 3 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  New Feature: Creative AI Prompts for Couple Photos
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                We&apos;ve pivoted! Discover how our new prompt tool helps couples create the perfect AI images and photoshoot ideas.
              </p>
              <div className="not-prose">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/blog/perfect-couple-prompts" className="inline-flex items-center gap-2">
                    Read the Announcement <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>


        </section>
      </div>
    </div>
  );
}
