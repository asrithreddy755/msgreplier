import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Evolution of Text Messaging: From T9 SMS to WebRTC Reacts",
  description:
    "Explore the history of texting. From counting characters on a flip phone to real-time chat spaces.",
};

export default function TextMessagingEvolution() {
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
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-[#eedfc6] border border-[#d4c3ab] text-[#110f0f] px-2.5 py-0.5 rounded-full font-semibold text-xs">
              <Tag className="h-3 w-3" /> Tech History
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> March 12, 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            The Evolution of Text Messaging: From T9 to Real-Time Context
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            It is hard to believe that we used to pay 10 cents per message and had to press the number '7' four times just to type the letter 'S'.
          </p>
        </header>

        <article className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>
              In just a few decades, human communication was completely rewritten. Text messaging has gone from a clumsy, expensive feature on early cell phones to the dominant form of communication on earth. 
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Dark Ages: 160 Characters and T9</h2>
            <p>
              In the late 1990s and early 2000s, SMS (Short Message Service) was severely limited. You had exactly 160 characters. Because of this artificial limit, humans invented a whole new language. Vowels were deleted. "See you later" became "c u l8r". 
            </p>
            <p>
              Typing required a T9 multi-tap keyboard layout. You memorized the physical layout of your Nokia brick phone so well that you could draft an entire message while making eye contact with your teacher under your desk. It was an era of intense brevity and mechanical skill.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The BlackBerry Messenger Boom</h2>
            <p>
               BBM changed the game. It introduced two massive features that altered relationships forever: Delivery receipts and "Read" receipts. Suddenly, the plausible deniability of "I didn't get your text" vanished. You knew exactly when someone saw your message. It also introduced typing indicators—those three dots that show the other person is drafting a thought, creating an entirely new form of digital anxiety.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Internet Protocol Takeover (WhatsApp & iMessage)</h2>
            <p>
               Once smartphones became ubiquitous, we realized that sending texts over cell carrier networks was outdated. iMessage (2011) and WhatsApp (2009) pushed messaging completely over to data and Wi-Fi. This meant free international messaging, massive group chats, high-resolution multimedia, and voice notes.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Modern Era: Privacy and Real-Time Experience</h2>
            <p>
               Today, we are moving away from permanent chat logs. The popularity of Snapchat proved that humans crave ephemeral, private conversations. People are tired of platforms storing their communication history to run through advertising algorithms.
            </p>
            <p>
               This is why tools like <strong>Love-Space</strong> exist. By stripping away logins, accounts, and server-side databases (using WebRTC peer-to-peer connections), we've returned to the essence of a conversation: two people talking right now, with complete privacy, and when the browser closes, the history vanishes.
            </p>

            <p className="mt-8 italic">
              Communication will always evolve, but the core desire remains the same: we just want to feel connected.
            </p>

          </div>
        </article>
      </div>
    </div>
  );
}
