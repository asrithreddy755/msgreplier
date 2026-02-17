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
