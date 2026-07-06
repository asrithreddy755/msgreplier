import type { Metadata } from "next";
import Link from "next/link";
import ShortcutpediaClient from "./ShortcutpediaClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Shortcutpedia — Internet Slang Dictionary & Chat Acronym Lookup",
  description:
    "Decode internet slang, Gen Z expressions, and chat acronyms instantly with Shortcutpedia. Search 500+ terms including lol, brb, rizz, no cap, 143, and more. Free, private, no login.",
  alternates: {
    canonical: "https://msgreplier.com/shortcutpedia",
  },
  openGraph: {
    title: "Shortcutpedia — Instant Slang & Chat Acronym Lookup | MsgReplier",
    description:
      "Search 500+ internet slang terms, Gen Z expressions, and chat shortcuts. Understand every message — from lol and brb to rizz and no cap.",
    url: "https://msgreplier.com/shortcutpedia",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Shortcutpedia",
  description:
    "A searchable internet slang dictionary covering 500+ chat acronyms, Gen Z expressions, numeric shortcuts, and platform-specific jargon.",
  url: "https://msgreplier.com/shortcutpedia",
  applicationCategory: "EducationApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// Statically showcase popular terms for Googlebot
const POPULAR_TERMS = [
  { shortcut: "lol", meaning: "Laugh Out Loud", tone: "casual" },
  { shortcut: "brb", meaning: "Be Right Back", tone: "neutral" },
  { shortcut: "btw", meaning: "By The Way", tone: "casual" },
  { shortcut: "idk", meaning: "I Don't Know", tone: "casual" },
  { shortcut: "omg", meaning: "Oh My God", tone: "expressive" },
  { shortcut: "tbh", meaning: "To Be Honest", tone: "casual" },
  { shortcut: "rizz", meaning: "Natural charm or charisma, especially in flirting", tone: "positive / Gen Z" },
  { shortcut: "no cap", meaning: "No lie, seriously, for real", tone: "Gen Z / assertive" },
  { shortcut: "143", meaning: "I Love You (letter count: I=1, Love=4, You=3)", tone: "romantic" },
  { shortcut: "slay", meaning: "To do something exceptionally well or look amazing", tone: "positive / Gen Z" },
  { shortcut: "ngl", meaning: "Not Gonna Lie", tone: "casual / honest" },
  { shortcut: "imo", meaning: "In My Opinion", tone: "neutral" },
];

const CATEGORIES = [
  {
    name: "Classic Acronyms",
    description:
      "Shortened phrases where each letter stands for a word. Built in the SMS era and still universal: LOL, BRB, BTW, ASAP, FYI, TBH, IDK, OMG, IRL, TTYL.",
    examples: "LOL, BRB, BTW, ASAP",
  },
  {
    name: "Gen Z Slang",
    description:
      "Expressions popularised through TikTok, Instagram Reels, and Discord servers. Evolve quickly and often go viral overnight: Rizz, No Cap, Slay, Gyatt, Sigma, Bussin, Lowkey, Vibe Check.",
    examples: "Rizz, No Cap, Slay, Sigma",
  },
  {
    name: "Romantic & Relationship Codes",
    description:
      "Shorthand used in couple messaging and flirting. Ranges from timeless codes like 143 (I Love You) to modern terms like Situationship, Soft Launch, and Talking Stage.",
    examples: "143, ILY, WYD, Situationship",
  },
  {
    name: "Reaction Expressions",
    description:
      "Quick sound-based or repeating-letter words that convey emotions. Used to respond quickly without typing a full sentence: Hmm, Lmao, Smh, Bruh, Sus, Eww, Aww.",
    examples: "Hmm, Lmao, Bruh, Sus",
  },
  {
    name: "Platform-Specific Jargon",
    description:
      "Terms unique to specific digital communities — Twitch streamer chat (PogChamp, LUL), Discord server vocabulary (GG, AFK), and Twitter-native language (RT, Ratio, Thread).",
    examples: "GG, AFK, RT, PogChamp",
  },
];

export default function ShortcutpediaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex flex-1 w-full flex-col items-center justify-start p-6 md:p-12 max-w-3xl mx-auto space-y-8">

        {/* Page header */}
        <div className="text-center space-y-3 mb-4">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground/90">
            Shortcutpedia
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Your instant internet slang dictionary. Search 500+ chat shortcuts, Gen Z expressions, and acronyms — understand every message, instantly.
          </p>
        </div>

        {/* ── Interactive search (client island) ─────────────────────────────── */}
        <ShortcutpediaClient />

        {/* ── SSR content — fully crawlable by Googlebot ────────────────────── */}

        {/* What is Shortcutpedia */}
        <section id="what-is-shortcutpedia" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">What is Shortcutpedia?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Shortcutpedia is a curated, searchable dictionary of internet slang, chat abbreviations, and digital communication shorthand. It covers over 500 terms — from classic SMS-era acronyms like LOL, BRB, and BTW, to modern Gen Z expressions like Rizz, Sigma, and No Cap. Each entry is defined clearly and tagged with a tone label (Casual, Romantic, Sarcastic, Expressive, Neutral) so you understand not just what the term means, but when and how to use it appropriately.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Unlike a generic dictionary, Shortcutpedia is built specifically for digital communication. Every term has been verified against actual usage across WhatsApp, Instagram, TikTok, Discord, and Twitter/X. The database is updated regularly as new terms go viral. All searches are completely private — nothing you type is tracked, stored, or sent to any server.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/library"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Browse Full Library (500+ Terms) →
            </Link>
          </div>
        </section>

        {/* Static popular terms — crawlable by Googlebot */}
        <section id="popular-slang-terms" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Most Looked-Up Slang Terms</h2>
          <p className="text-sm text-muted-foreground">
            These are the most frequently searched terms in Shortcutpedia. Click any term to copy it, or use the search box above for the full dictionary.
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            {POPULAR_TERMS.map((term) => (
              <div key={term.shortcut} className="flex flex-col gap-0.5 border-b border-border/40 pb-3">
                <dt className="font-bold text-foreground">{term.shortcut.toUpperCase()}</dt>
                <dd className="text-sm text-muted-foreground">{term.meaning}</dd>
                <span className="text-xs text-muted-foreground/70 italic capitalize">{term.tone}</span>
              </div>
            ))}
          </dl>
        </section>

        {/* Categories */}
        <section id="slang-categories" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Categories of Internet Slang</h2>
          <p className="text-muted-foreground">
            Internet slang is not a single vocabulary — it is a collection of overlapping dialects that developed across different platforms, generations, and communities. Here is how Shortcutpedia categorises them:
          </p>
          <div className="space-y-5">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
                <p className="text-xs text-primary font-medium">Examples: {cat.examples}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to use */}
        <section id="how-to-use-shortcutpedia" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">How to Use Shortcutpedia</h2>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Search instantly:</strong> Type the slang term, acronym, or even a partial word into the search box. Results update as you type — no need to press Enter.
            </li>
            <li>
              <strong className="text-foreground">Read the meaning and tone:</strong> Each result shows the definition and a tone label. The tone tells you whether the term is casual, sarcastic, romantic, or platform-specific.
            </li>
            <li>
              <strong className="text-foreground">Browse the full library:</strong> Use the <Link href="/library" className="text-primary hover:underline">Full Library</Link> to scroll through all 500+ terms sorted alphabetically — useful when you want to explore rather than search.
            </li>
            <li>
              <strong className="text-foreground">Copy for use:</strong> Click the copy icon on any card to copy the shortcut to your clipboard and paste it directly into your chat or caption.
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section id="shortcutpedia-faq" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-5">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">How many terms does Shortcutpedia have?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Over 500 verified terms covering acronyms, Gen Z slang, numeric shortcuts, romantic codes, and platform-specific jargon. New terms are added regularly as they emerge on social media.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Are my searches tracked or saved?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No. All searches run entirely in your browser. No search term, result, or usage data is ever sent to our servers or linked to your device.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Why does Shortcutpedia use tone labels?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Knowing what a term means is only half the story. &quot;Lmao&quot; and &quot;smh&quot; can both indicate disapproval, but they carry very different tones. Tone labels help you understand the social context — so you reply appropriately, not just accurately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Can I suggest a new slang term?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes — <Link href="/contact" className="text-primary hover:underline">send us a message</Link> with the term and its context. We review community suggestions weekly and add verified new entries to the database.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">What is the difference between Shortcutpedia and the Library?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Shortcutpedia is the search-focused tool — type to find any term instantly. The <Link href="/library" className="text-primary hover:underline">Library</Link> is the full alphabetical browse view of all 500+ terms, useful when you want to explore the complete dictionary at your own pace.
              </p>
            </div>
          </div>
        </section>

        {/* Related tools */}
        <div className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold tracking-tight mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/library" className="block p-4 border rounded-lg hover:bg-accent/30 transition-colors">
              <p className="font-medium text-foreground">Shortcutpedia Library</p>
              <p className="text-sm text-muted-foreground mt-1">Browse all 500+ terms in full alphabetical dictionary view.</p>
            </Link>
            <Link href="/text-repeater" className="block p-4 border rounded-lg hover:bg-accent/30 transition-colors">
              <p className="font-medium text-foreground">Text Repeater</p>
              <p className="text-sm text-muted-foreground mt-1">Repeat any slang, emoji, or phrase to fill character limits.</p>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
