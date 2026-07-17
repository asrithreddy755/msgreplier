import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import shortcutsData from "@/lib/shortcuts.json";
import LibrarySearch from "./LibrarySearch";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Internet Slang Dictionary — 500+ Terms | Shortcutpedia Library",
  description:
    "Browse the complete Shortcutpedia library of internet slang, chat abbreviations, Gen Z expressions, and emoji meanings. 500+ terms defined with tone labels — free to search and copy.",
  alternates: {
    canonical: "https://msgreplier.com/library",
  },
  openGraph: {
    title: "Internet Slang Dictionary — 500+ Terms | Shortcutpedia Library",
    description: "Browse the complete Shortcutpedia library of internet slang, chat abbreviations, Gen Z expressions, and emoji meanings. 500+ terms defined with tone labels — free to search and copy.",
    url: "https://msgreplier.com/library",
    type: "website",
  },
};

type Shortcut = {
  type: string;
  shortcut: string;
  meaning: string;
  tone: string;
};

const allShortcuts = (shortcutsData as Shortcut[])
  .filter((item) => item.type !== "emoji")
  .sort((a, b) => {
    const isANum = /^\d/.test(a.shortcut);
    const isBNum = /^\d/.test(b.shortcut);
    if (isANum && !isBNum) return 1;
    if (!isANum && isBNum) return -1;
    return a.shortcut.toLowerCase().localeCompare(b.shortcut.toLowerCase());
  });

// First 150 terms rendered as static HTML for Googlebot
const INITIAL_STATIC_COUNT = 150;
const staticCards = allShortcuts.slice(0, INITIAL_STATIC_COUNT);

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background font-body p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <Link
              href="/shortcutpedia"
              className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="Back to Shortcutpedia"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Shortcutpedia Library</h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                The complete dictionary of internet slang, abbreviations, and acronyms. Browse the full collection or search to find meanings instantly.
              </p>
            </div>
          </div>
        </div>

        {/* ── Editorial intro — server-rendered, fully crawlable ─────────── */}
        <section className="prose prose-slate dark:prose-invert max-w-none text-left">
          <div className="bg-card rounded-xl border p-6 md:p-8 space-y-5 not-prose">
            <h2 className="text-xl font-bold tracking-tight">What Is an Internet Slang Dictionary?</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Internet slang is a constantly evolving shorthand language born out of digital communication. From the early days of SMS when character limits forced creative abbreviations, to the explosion of social media where brevity and speed define the conversation, internet slang has become an essential part of how people communicate online. Shortcutpedia is a curated, searchable dictionary of these terms — covering classic chat acronyms, Gen Z expressions, platform-specific jargon, and coded numeric phrases.
            </p>

            <h2 className="text-xl font-bold tracking-tight">The Evolution of Digital Linguistics</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Digital communication differs from face-to-face conversations in one key aspect: the absence of non-verbal cues. In person, tone of voice, facial expressions, and body language provide essential context. Online, acronyms, emojis, and internet slang serve as the substitute for these cues. Over the years, slang has transitioned from functional character-saving acronyms (like SMS abbreviations) to complex cultural identifiers. Understanding these terms helps bridge communication gaps across generations and platforms, ensuring that your digital messages are received with the exact intent you planned.
            </p>

            <h2 className="text-xl font-bold tracking-tight">How to Use This Dictionary</h2>
            <ol className="space-y-2 text-sm md:text-base text-muted-foreground leading-relaxed list-decimal list-inside">
              <li><strong className="text-foreground">Search:</strong> Type any term, acronym, or word into the search box above to instantly filter results. Results update as you type.</li>
              <li><strong className="text-foreground">Browse:</strong> Scroll through the full alphabetical list of 500+ terms. Terms are sorted A–Z, with numeric shortcuts at the end.</li>
              <li><strong className="text-foreground">Copy:</strong> Hover over any card and click the copy icon to copy the shortcut to your clipboard in one tap.</li>
              <li><strong className="text-foreground">Tone labels:</strong> Every entry includes a tone label (e.g. Casual, Sarcastic, Romantic, Positive) to help you understand when and how to use the term appropriately.</li>
            </ol>

            <h2 className="text-xl font-bold tracking-tight">Tone Labels in Relationship Texting</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              When messaging a partner, nuance is everything. A simple phrase like &quot;we need to talk&quot; or even &quot;fine&quot; can be interpreted in multiple ways. This is why Shortcutpedia integrates tone labels. E-messaging tone indicators clarify whether a statement is meant playfully, sarcastically, or seriously. By classifying terms into categories like Romantic, Casual, Sarcastic, and Supportive, our library helps couples decode not just the literal meaning of a slang term, but the emotional subtext behind it. Using slang with appropriate tone labels prevents texting misunderstandings and keeps digital communication lighthearted and positive.
            </p>

            <h2 className="text-xl font-bold tracking-tight">Categories of Internet Slang in This Dictionary</h2>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground leading-relaxed list-disc list-inside">
              <li><strong className="text-foreground">Classic Acronyms:</strong> The timeless building blocks of internet chat — LOL (Laugh Out Loud), BRB (Be Right Back), BTW (By The Way), ASAP, FYI, TBH, and hundreds more.</li>
              <li><strong className="text-foreground">Gen Z Slang:</strong> Expressions popularised through TikTok, Instagram, and Discord — Rizz, No Cap, Slay, Gyatt, Sigma, Bussin, Lowkey, Vibe Check, and more.</li>
              <li><strong className="text-foreground">Relationship &amp; Romance Shorthand:</strong> Digital shorthand for expressing affection — 143 (I Love You), ILY, WYD, NSFW, Situationship, Soft Launch, and similar terms used in couple messaging.</li>
              <li><strong className="text-foreground">Reaction Expressions:</strong> Single-sound or repeating words used to convey emotion quickly — Hmm, Lmao, Omg, Eww, Aww, Bruh, Sus, and similar abbreviated reactions.</li>
              <li><strong className="text-foreground">Platform-Specific Jargon:</strong> Terms unique to specific communities — Twitch emotes, Discord terms, Twitter/X vocabulary, and WhatsApp-specific messaging habits.</li>
            </ul>
          </div>
        </section>

        {/* ── Interactive search (client) ──────────────────────────────────── */}
        <LibrarySearch shortcuts={allShortcuts} />

        {/* ── Static SSR card grid (first 150 for Googlebot) ──────────────── */}
        {/* 
          These cards are rendered as static HTML so crawlers can index the content
          directly. The LibrarySearch component above replaces this grid visually
          once JS hydrates, but the static markup remains in the HTML response.
        */}
        <noscript>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staticCards.map((item, index) => (
              <div
                key={`static-${item.shortcut}-${index}`}
                className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
              >
                <span className="text-lg font-semibold">{item.shortcut}</span>
                <p className="text-sm text-muted-foreground">{item.meaning}</p>
                <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {item.tone}
                </span>
              </div>
            ))}
          </div>
        </noscript>

      </div>
    </div>
  );
}
