import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Start a Conversation on Dating Apps (Without Being Boring)",
  description:
    "Tired of sending 'Hey' on Tinder and Bumble? Learn how to start a conversation that guarantees a reply. Includes examples and free copyable prompts.",
};

export default function DatingAppConversationStarters() {
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
          <Link href="/prompt" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2">
              Get Copyable Prompts
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium text-xs">
              <Tag className="h-3 w-3" /> Dating & Social
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> April 10, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            How to Start a Conversation on Dating Apps (Without Being Boring)
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Tired of sending "Hey" on Tinder and Bumble? Learn exactly how to break the ice and start a conversation that actually gets a reply.
          </p>
        </header>

        <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>
              We've all been there. You get a match on Tinder, Bumble, or Hinge. The adrenaline kicks in. You open their profile, stare at the blinking cursor, and your mind goes completely blank. What do you say?
            </p>
            <p>
              If your first instinct is to send "Hey," "What's up," or a waving hand emoji 👋, stop right there. In 2026, dating app inboxes are crowded. A generic greeting is almost guaranteed to be ignored. Instead, you need to stand out. Here is the ultimate guide to sparking a conversation that actually leads to a date.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. The "Two Truths and a Lie" Approach</h2>
            <p>
              Why tell them about yourself when you can make it a game? Playing a quick mini-game immediately lowers the pressure of small talk and gives them an easy, fun way to respond.
            </p>
            <p className="border-l-4 border-primary pl-4 bg-muted/30 py-2 italic text-foreground">
              "Let's play two truths and a lie. I've never broken a bone, I met Taylor Swift in an elevator, and my favorite food is Hawaiian pizza. Go!"
            </p>
            <p>
              This not only gets a reply, but it naturally sets up three different topics of conversation depending on what they guess.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. The "Profile Inspector"</h2>
            <p>
              People spend a lot of time choosing their dating app photos. If you notice a detail in their background, call it out. It shows you actually looked at their profile and didn't just swipe blindly.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>If they have a dog:</strong> "Okay, I'm going to need to know your dog's name immediately. They look like a very good boy."</li>
              <li><strong>If they are traveling:</strong> "That second photo looks amazing. Is that Italy? I've been dying to go there."</li>
              <li><strong>If they are eating:</strong> "I consider myself a pizza connoisseur, and that slice in your third pic looks 10/10. Where is that?"</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. The Controversial Opinion</h2>
            <p>
              Nothing sparks a conversation faster than a mild, funny debate. By stating an unpopular (but harmless) opinion, you invite them to agree or playfully disagree with you.
            </p>
            <p className="border-l-4 border-primary pl-4 bg-muted/30 py-2 italic text-foreground">
              "Unpopular opinion: Marvel movies peaked in 2019 and everything since then has been a blur. Agree or disagree?"
            </p>
            <p>
              Or keep it simple: "Pineapple absolutely belongs on pizza." Boom. Instant debate.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. The "Would You Rather" Icebreaker</h2>
            <p>
              If their profile is completely empty and gives you absolutely nothing to work with, a "Would you rather" question is your best friend. Make it bizarre or highly situational.
            </p>
            <p className="border-l-4 border-primary pl-4 bg-muted/30 py-2 italic text-foreground">
              "Would you rather fight one horse-sized duck or 100 duck-sized horses?"
            </p>
            <p>
              It's weird, it's funny, and it requires more thought than answering "how are you today?"
            </p>

            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 mt-10">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Want More Perfect Replies?
              </h3>
              <p className="mb-4 text-foreground/80">
                Are you tired of dry conversations? We've built a library of perfectly crafted, copy-and-paste prompts that you can use with AI to generate the most charismatic replies possible. Never run out of things to say again.
              </p>
              <Button asChild>
                <Link href="/prompt">Open Msg Prompt Library</Link>
              </Button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Golden Rule: Ditch the Interview</h2>
            <p>
              Whatever opener you choose, avoid asking "interview" questions. "Where do you work?", "How many siblings do you have?", and "What do you do for fun?" feel like a chore to answer. Treat them like a friend you already know, and the conversation will flow naturally.
            </p>

          </div>
        </article>
      </div>
    </div>
  );
}
