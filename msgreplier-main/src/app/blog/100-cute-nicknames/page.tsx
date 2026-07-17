import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthorCard from "@/components/AuthorCard";

export const metadata: Metadata = {
  title: "100+ Cute Nicknames for Your Partner (2026 Edition)",
  description:
    "A curated list of sweet, funny, and romantic nicknames for your partner. Plus, learn how to spam them with love using our Text Repeater tool.",
  alternates: {
    canonical: "https://msgreplier.com/blog/100-cute-nicknames",
  },
  openGraph: {
    title: "100+ Cute Nicknames for Your Partner (2026 Edition)",
    description: "A curated list of sweet, funny, and romantic nicknames for your partner. Plus, learn how to spam them with love using our Text Repeater tool.",
    url: "https://msgreplier.com/blog/100-cute-nicknames",
    type: "website",
  },
};

export default function NicknamesPost() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "100+ Cute Nicknames for Your Partner (2026 Edition)",
    "description": "A curated list of sweet, funny, and romantic nicknames for your partner. Plus, learn how to spam them with love using our Text Repeater tool.",
    "datePublished": "2026-02-25T08:00:00+00:00",
    "author": {
      "@type": "Person",
      "name": "Priya Sharma",
      "jobTitle": "Licensed Relationship Counselor & Digital Wellness Expert",
      "url": "https://msgreplier.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MsgReplier",
      "logo": {
        "@type": "ImageObject",
        "url": "https://msgreplier.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://msgreplier.com/blog/100-cute-nicknames"
    }
  };

  return (
    <div className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `\n        h1, h2, h3, h4, h5, h6, .font-heading {\n          font-family: \'Unbounded\', sans-serif !important;\n        }\n      `}} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/blog" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-[#110f0f] hover:text-[#948678] hover:bg-transparent font-heading font-medium text-xs uppercase tracking-wider">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <Link href="/text-repeater" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2 border-[#110f0f] text-[#110f0f] hover:bg-[#110f0f] hover:text-white rounded-full font-heading text-xs uppercase tracking-wider px-5 py-2.5">
              Send it 100x
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 bg-[#eedfc6] border border-[#d4c3ab] text-[#110f0f] px-2.5 py-0.5 rounded-full font-semibold text-xs">
              <Tag className="h-3 w-3" /> Relationships
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> February 25, 2026
            </span>
            <span className="flex items-center gap-1 bg-[#eedfc6]/40 border border-[#d4c3ab]/30 text-[#110f0f] px-2.5 py-0.5 rounded-full font-medium text-xs">
              By Priya Sharma
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            100+ Cute Nicknames for Your Partner (2026 Edition)
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Stuck on what to call your significant other? We&apos;ve compiled the ultimate list of nicknames, from the classic &quot;Babe&quot; to the unique and hilarious.
          </p>
        </header>

        <article className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm">
          <div className="bg-white border border-[#d4c3ab] rounded-[32px] p-8 md:p-10 shadow-sm prose prose-neutral max-w-none">
            <p>
              Finding the perfect nickname is a rite of passage in any relationship. It&apos;s a secret code, a sign of affection, and sometimes, a way to tease each other. Here is our massive list of nicknames categorized for every mood.
            </p>

            <h2>The Psychology of Nicknames: Fostering Private Worlds</h2>
            <p>
              Why do couples use nicknames? In sociolinguistics and relationship psychology, nicknames are considered a key component of a couple's "private language" (or idiolect). Studies consistently show that couples who use pet names report <strong>higher relationship satisfaction and emotional security</strong>. This verbal playfulness builds a symbolic boundary around the partnership, separating the couple's private world from the outside world.
            </p>
            <p>
              According to relationship specialist Priya Sharma, "Nicknames act as micro-bonds. When you call your partner by a custom name, you're not just getting their attention—you're invoking the entire history of warmth, inside jokes, and affection that the name represents."
            </p>

            <div className="bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 p-4 my-6">
              <h4 className="font-bold text-rose-800 dark:text-rose-200">💡 Set Your Nicknames in Love-Space</h4>
              <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
                Don't just keep your nicknames in your head! Set them up inside our free, private <Link href="/love-space" className="underline font-bold">Love-Space Room</Link>. You can customize your chat profiles with your pet names, play games like Ludo, and chat in a 100% private environment that auto-deletes after 24 hours. No sign-up required.
              </p>
            </div>

            <h2>Sweet & Classic</h2>
            <p>These never go out of style. Perfect for when you&apos;re feeling sentimental.</p>
            <div className="my-8 not-prose">
              <img
                src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=80"
                alt="Happy couple smiling and sharing a sweet romantic moment"
                className="w-full rounded-2xl object-cover border border-[#d4c3ab] shadow-sm"
                loading="lazy"
                width="900"
                height="500"
              />
              <p className="text-xs text-center text-[#948678] mt-2 italic">Finding the perfect nickname deepens intimacy and brings couples closer together.</p>
            </div>

            <ul>
              <li>Babe / Baby</li>
              <li>Honey / Hun</li>
              <li>Sweetheart</li>
              <li>Love</li>
              <li>Darling</li>
              <li>My World</li>
              <li>Soulmate</li>
              <li>Sunshine</li>
              <li>Angel</li>
              <li>Beautiful / Handsome</li>
            </ul>

            <h2>Funny & Playful</h2>
            <p>For the couple that loves to laugh. These are great for lighthearted roasting.</p>
            <ul>
              <li>Goofball</li>
              <li>Trouble</li>
              <li>Monster</li>
              <li>Stinker</li>
              <li>Potato</li>
              <li>Weirdo</li>
              <li>Nerd</li>
              <li>Bossy</li>
              <li>Munchkin</li>
              <li>Captain</li>
            </ul>

            <h2>Romantic & Deep</h2>
            <p>Save these for special moments or when you&apos;re feeling extra affectionate.</p>
            <ul>
              <li>My Forever</li>
              <li>The One</li>
              <li>Better Half</li>
              <li>Dream Girl / Dream Guy</li>
              <li>My Everything</li>
              <li>Treasure</li>
              <li>Beloved</li>
              <li>Heartbeat</li>
              <li>Moon & Stars</li>
              <li>Destiny</li>
            </ul>

            <h2>Food-Inspired</h2>
            <p>Because who doesn&apos;t love food? Cute and delicious.</p>
            <ul>
              <li>Pumpkin</li>
              <li>Cookie</li>
              <li>Cupcake</li>
              <li>Sugar</li>
              <li>Peanut</li>
              <li>Muffin</li>
              <li>Jellybean</li>
              <li>Dumpling</li>
              <li>Sweetie Pie</li>
              <li>Honeybun</li>
            </ul>

            <h2>How to Use These Nicknames</h2>
            <p>
              Once you&apos;ve picked a favorite, why not have some fun with it? You can use our <Link href="/text-repeater">Text Repeater</Link> tool to send them their new nickname 100 times in a row on WhatsApp or Instagram. It&apos;s a funny way to grab their attention!
            </p>
            <p>
              Just type the nickname (e.g., &quot;Good morning Sunshine ☀️&quot;), set the repetition count to 100, and hit generate. Copy and paste for instant impact.
            </p>

            <div className="not-prose mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="w-full sm:w-auto bg-[#110f0f] text-white hover:bg-[#eedfc6] hover:text-[#110f0f] border border-transparent hover:border-[#d4c3ab] rounded-full px-6 py-3 font-heading text-xs transition-all uppercase tracking-wider">
                <Link href="/text-repeater">Try Text Repeater</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto bg-[#110f0f] text-white hover:bg-[#eedfc6] hover:text-[#110f0f] border border-transparent hover:border-[#d4c3ab] rounded-full px-6 py-3 font-heading text-xs transition-all uppercase tracking-wider">
                <Link href="/blog">Back to Blog</Link>
              </Button>
            </div>
            <AuthorCard authorId="priya" />
          </div>
        </article>
      </div>
    </div>
  );
}
