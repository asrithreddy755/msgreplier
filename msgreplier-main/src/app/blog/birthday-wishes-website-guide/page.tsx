import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Tag, Clock, Heart, Check, Gift, Music, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Birthday Wishes Website Guide: Create an Interactive Birthday Surprise | MsgReplier",
  description:
    "Learn how to create a personalised, animated birthday wishes website in minutes. The perfect digital birthday surprise — no coding required.",
  alternates: { canonical: "/blog/birthday-wishes-website-guide" },
};

export default function BirthdayWishesWebsiteGuidePost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Create a Birthday Wishes Website",
    description: "A step-by-step guide to creating a personalised, animated birthday wishes website for someone special.",
    totalTime: "PT5M",
    step: [
      { "@type": "HowToStep", name: "Visit the Wishes Website Builder", text: "Go to msgreplier.com/digital-greeting and click 'Create Wishes Website'." },
      { "@type": "HowToStep", name: "Enter Recipient Details", text: "Fill in the recipient's name, your name, and select 'Birthday' as the occasion." },
      { "@type": "HowToStep", name: "Write Your Message", text: "Type your heartfelt birthday message in the message box." },
      { "@type": "HowToStep", name: "Choose a Theme and Music", text: "Select from beautiful animated themes and optional background music." },
      { "@type": "HowToStep", name: "Share Your Unique Link", text: "Copy the generated unique link and send it to your birthday person." },
    ],
    url: "https://msgreplier.com/blog/birthday-wishes-website-guide",
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/blog" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <Link href="/digital-greeting" className="hidden sm:inline-flex">
            <Button variant="default" className="gap-2">
              Create Wishes Website <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full font-medium text-xs">
              <Tag className="h-3 w-3" /> Feature Guide
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> June 1, 2026
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> 5 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Birthday Wishes Website Guide: Create a <span className="text-orange-500">Magical Surprise</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Forget generic birthday texts and boring e-cards. Here&apos;s how to create a personalised, animated
            birthday wishes website that will genuinely wow your loved one.
          </p>
        </header>

        <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">

            <h2 className="text-2xl font-bold">Why a Birthday Wishes Website Beats a Regular Message</h2>
            <p>
              A birthday text disappears into a scroll of notifications. A phone call lasts a minute. But a personalised
              birthday wishes website? That is something your recipient will open, re-open, and share with friends.
            </p>
            <p>
              Unlike static e-cards, a Wishes Website is a fully <strong>interactive, animated webpage</strong> built
              specifically for your recipient. It plays music, displays 3D animations, and showcases your heartfelt
              message in a way that genuinely feels magical.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
                <Gift className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Personalised</h4>
                <p className="text-xs text-muted-foreground mt-1">Their name, your message, your chosen occasion.</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
                <Music className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm">With Music</h4>
                <p className="text-xs text-muted-foreground mt-1">Add background music to make it extra special.</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
                <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Unforgettable</h4>
                <p className="text-xs text-muted-foreground mt-1">Beautiful 3D animations they&apos;ll remember forever.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8">How to Create Your Birthday Wishes Website (Step-by-Step)</h2>

            {[
              { step: 1, title: "Visit the Wishes Website Builder", desc: "Head to our Wishes Website builder page. You will see a simple form — no account or login needed." },
              { step: 2, title: "Enter the Recipient's Name", desc: "Type the name of the birthday person. This is what will appear on the animated greeting." },
              { step: 3, title: "Add Your Name and a Message", desc: "Add your own name so they know who it's from, and write a heartfelt birthday message in the text field. Be as personal as you like!" },
              { step: 4, title: "Choose a Theme", desc: "Select from beautiful themes — each with unique colours, animations, and visual style. Pick the one that best matches their personality." },
              { step: 5, title: "Enable Music (Optional)", desc: "Toggle on the music option to add a warm, celebratory background track to your wishes page." },
              { step: 6, title: "Generate and Share Your Link", desc: "Click 'Create' and your unique birthday wishes website is instantly generated! Copy the link and send it via WhatsApp, Instagram DM, email, or any messaging app." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 py-4 border-b border-border/30 last:border-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-orange-600 font-black text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}

            <h2 className="text-2xl font-bold mt-10">Tips for Writing the Perfect Birthday Message</h2>
            <ul className="space-y-3 list-none pl-0">
              {[
                "Be specific — mention a memory or quality you love about them.",
                "Keep it warm but authentic — write how you naturally speak.",
                "Add humour if it suits your relationship — a funny inside joke can make the message feel even more personal.",
                "End with a positive, forward-looking statement (e.g., 'Can't wait to celebrate together!').",
                "Avoid generic phrases like 'Have a great day!' — they feel copy-pasted.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold mt-10">Who Is a Wishes Website Perfect For?</h2>
            <p>
              Our Wishes Website builder works for any relationship and any occasion:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Partner/Boyfriend/Girlfriend:</strong> Create the most romantic birthday surprise they&apos;ve ever received.</li>
              <li><strong className="text-foreground">Best Friend:</strong> A personalised wishes site is a massive upgrade from a group chat birthday message.</li>
              <li><strong className="text-foreground">Parents:</strong> Show your parents how much you care with a thoughtful, beautifully animated tribute.</li>
              <li><strong className="text-foreground">Siblings:</strong> Whether you&apos;re nearby or in a different country, a birthday wishes website bridges the distance.</li>
            </ul>

            <div className="mt-12 text-center p-8 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
              <Gift className="h-10 w-10 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Create Your Birthday Wishes Website Now</h3>
              <p className="text-muted-foreground mb-6">
                Takes less than 2 minutes. No login required. Completely free.
              </p>
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                <Link href="/digital-greeting">
                  Build Wishes Website <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
