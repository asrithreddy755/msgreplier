import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
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

          {/* Article 1 */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Tips & Tricks
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> February 14, 2026
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  How to Send a Blank Message on WhatsApp & Instagram (2026 Guide)
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <p>
                Have you ever wanted to confuse your friends by sending a message that contains... absolutely nothing?
                If you try to type a &quot;Space&quot; on WhatsApp or Instagram and hit send, the platform usually blocks you.
              </p>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Why Send a Blank Message?</h4>
                <p>
                  Aside from being a harmless prank, blank text is useful for Instagram Bios (clean line breaks) and testing apps.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Method 1: The &quot;Invisible Character&quot;</h4>
                <p>Computers use standard codes like the Zero Width Space.</p>
                <ol className="list-decimal pl-5 space-y-1 mt-2">
                  <li>Copy the text inside these brackets: [ ⠀ ]</li>
                  <li>Paste it into WhatsApp.</li>
                  <li>Hit send.</li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Method 2: Using the MsgReplier Text Repeater</h4>
                <p>
                  Copying manually is slow. Use our free tool:
                </p>
                <ol className="list-decimal pl-5 space-y-1 mt-2">
                  <li>Go to the <Link href="/text-repeater" className="text-primary hover:underline font-medium">MsgReplier Text Repeater</Link>.</li>
                  <li>Select &quot;Blank Text&quot;.</li>
                  <li>Click Generate.</li>
                </ol>
                <p className="mt-2">Now you&apos;ve sent a massive empty bubble!</p>
              </div>
            </div>
          </article>

          {/* Article 2 */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Internet Culture
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> February 13, 2026
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  Top 5 Gen Z Slang Terms You Need to Know in 2026
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <p>
                If you’ve opened TikTok recently and felt like you were reading a different language, you aren’t alone.
                Here is your cheat sheet from our <Link href="/shortcutpedia" className="text-primary hover:underline font-medium">Shortcutpedia Library</Link>.
              </p>

              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                  <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Rizz
                  </h4>
                  <p className="mt-1"><span className="font-semibold text-foreground">Definition:</span> Short for &quot;Charisma.&quot; It&apos;s your ability to flirt.</p>
                  <p className="text-sm italic mt-1">Example: &quot;He has unspoken rizz.&quot;</p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                  <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    No Cap
                  </h4>
                  <p className="mt-1"><span className="font-semibold text-foreground">Definition:</span> &quot;No lie&quot; or &quot;for real.&quot;</p>
                  <p className="text-sm italic mt-1">Example: &quot;That exam was hard, no cap.&quot;</p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                  <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                    GYAT
                  </h4>
                  <p className="mt-1"><span className="font-semibold text-foreground">Definition:</span> An exclamation used when seeing someone attractive. Short for &quot;God Damn.&quot;</p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                  <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                    Delulu
                  </h4>
                  <p className="mt-1"><span className="font-semibold text-foreground">Definition:</span> Short for &quot;Delusional.&quot; Being unrealistically optimistic about dating.</p>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 mt-6">
                <h4 className="text-lg font-bold text-foreground mb-2">Want to learn more?</h4>
                <p>
                  If you encounter acronyms like IYKYK or POV, search our full dictionary at <Link href="/shortcutpedia" className="text-primary hover:underline font-medium inline-flex items-center gap-1">Shortcutpedia <ArrowRight className="h-3 w-3" /></Link>.
                </p>
              </div>
            </div>
          </article>

          {/* Article 3 */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Dating & Social
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> February 12, 2026
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  The Art of the &apos;Dry Text&apos;: How to Reply to &apos;K&apos; and &apos;Lol&apos;
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <p>
                Getting a one-word reply like &quot;K&quot; or &quot;lol&quot; is painful. It usually kills the conversation.
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-foreground">Why it happens:</strong> They might be busy, bored, or just bad at texting.</li>
                <li><strong className="text-foreground">How to fix it:</strong> Don&apos;t just say &quot;wyd&quot;. Ask an open-ended question.</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                <h4 className="text-lg font-bold text-foreground mb-2">Use Msg Prompt</h4>
                <p>
                  If you are stuck, use our <Link href="/prompt" className="text-primary hover:underline font-medium">Msg Prompt library</Link>.
                  Copy a prompt, paste their dry text, and generate a comeback that demands a response.
                </p>
              </div>
            </div>
          </article>

          {/* Article 4 */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Social Media Hacks
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> February 10, 2026
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  How to Format Instagram Captions with Invisible Line Breaks
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <p>
                Instagram is notorious for ruining caption formatting. You write a nice list, hit post, and it becomes a giant wall of text.
              </p>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">The Fix</h4>
                <p>You need an invisible separator.</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">How to do it:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Write your caption in your notes app first.</li>
                  <li>Use the <Link href="/text-repeater" className="text-primary hover:underline font-medium">MsgReplier Text Repeater</Link> to generate a &quot;Blank Text&quot; character.</li>
                  <li>Paste this character between your lines.</li>
                  <li>Post to Instagram. Your paragraphs will stay perfectly separated.</li>
                </ol>
              </div>
            </div>
          </article>

          {/* Article 5 */}
          <article className="group bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
                    <Tag className="h-3 w-3" /> Fun & Pranks
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> February 08, 2026
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                  10 Best Pranks Using a Text Repeater App (Harmless Fun)
                </h3>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <p>
                Want to mess with your best friend? Here are harmless pranks using repeated text:
              </p>

              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <strong className="text-foreground">The &quot;Glitch&quot; Prank:</strong> Repeat the word &quot;Loading...&quot; 500 times.
                </li>
                <li>
                  <strong className="text-foreground">The Emoji Wall:</strong> Send 1000 &quot;❤️&quot; emojis to show aggressive love.
                </li>
                <li>
                  <strong className="text-foreground">The Void:</strong> Send a blank message so long they have to scroll for 10 seconds.
                </li>
              </ol>

              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 mt-2">
                <p className="text-sm font-medium text-destructive">
                  <strong>Warning:</strong> Don&apos;t do this to strangers or businesses. Keep it to friends who can take a joke!
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
