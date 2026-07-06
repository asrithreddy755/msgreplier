import type { Metadata } from "next";
import TextRepeaterClient from "./TextRepeaterClient";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Text Repeater — Repeat Text Online for WhatsApp, Instagram, TikTok",
  description:
    "Free online text repeater tool. Instantly repeat any word, phrase, or emoji multiple times to fill WhatsApp, Instagram, TikTok, or Twitter character limits. No login, no ads, works in seconds.",
  alternates: {
    canonical: "https://msgreplier.com/text-repeater",
  },
  openGraph: {
    title: "Text Repeater Tool — Free Online | MsgReplier",
    description:
      "Repeat any text, phrase, or emoji instantly. Choose your platform, set a character limit, and generate repeated text in one click.",
    url: "https://msgreplier.com/text-repeater",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MsgReplier Text Repeater",
  description:
    "A free online tool that repeats any word, phrase, or emoji to fill platform character limits on WhatsApp, Instagram, TikTok, Twitter/X, Facebook, Telegram, and YouTube.",
  url: "https://msgreplier.com/text-repeater",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function TextRepeaterPage() {
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
            Text Repeater
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Instantly repeat any word, phrase, or emoji to meet platform character limits or add playful emphasis to your messages.
          </p>
        </div>

        {/* ── Interactive tool (client island) ─────────────────────────────── */}
        <TextRepeaterClient />

        {/* ── SSR content — fully crawlable ────────────────────────────────── */}

        {/* What is it */}
        <section id="what-is-text-repeater" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">What is a Text Repeater?</h2>
          <p className="text-muted-foreground leading-relaxed">
            A text repeater is a digital tool that takes any input — a single word, a full sentence, or even a single emoji — and duplicates it a specified number of times, or as many times as possible within a chosen character limit. The MsgReplier Text Repeater was built to make this instant, flexible, and completely free. You can choose between repeating your text in a single continuous row with or without spacing, or stacking each instance in a vertical column — perfect for creating dramatic, emphasis-heavy messages.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Unlike basic find-and-replace tools, this repeater is aware of each major social platform&apos;s character limit. Select Instagram (2,200 chars), WhatsApp (4,096 chars), Twitter/X (280 chars), YouTube Live (200 chars), Facebook (8,000 chars), Telegram (4,096 chars), or set a completely custom limit. The tool fills your text exactly up to that limit so you never accidentally go over.
          </p>
        </section>

        {/* How to use */}
        <section id="how-to-use-text-repeater" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">How to Use the Text Repeater</h2>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Select your platform:</strong> Choose from the dropdown — Instagram, WhatsApp, Twitter/X, Facebook, Telegram, YouTube Live, or Custom. Each preset automatically sets the correct character limit for that platform.
            </li>
            <li>
              <strong className="text-foreground">Enter your text:</strong> Type or paste the word, phrase, sentence, or emoji you want to repeat into the input box.
            </li>
            <li>
              <strong className="text-foreground">Choose formatting:</strong> Select <em>Row</em> to keep everything on a single line (with optional space between repetitions) or <em>Column</em> to put each instance on a new line.
            </li>
            <li>
              <strong className="text-foreground">Set a count (optional):</strong> Tick &quot;Specify how many times&quot; and enter a number if you want a precise count. Leave unchecked to fill the full platform limit automatically.
            </li>
            <li>
              <strong className="text-foreground">Generate and copy:</strong> Click <em>Generate</em>, then use the copy button on the output box to copy your repeated text to the clipboard in one tap.
            </li>
          </ol>
        </section>

        {/* Platform-specific use cases */}
        <section id="text-repeater-use-cases" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Platform-Specific Use Cases</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">📱 WhatsApp (4,096 chars)</h3>
              <p className="text-sm text-muted-foreground">
                Flood a group chat with emphasis — send &quot;😂😂😂&quot; repeated hundreds of times to react dramatically. Or use the column mode to stack kisses: &quot;💋&quot; on every line for a sweet goodnight message.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">📸 Instagram (2,200 chars)</h3>
              <p className="text-sm text-muted-foreground">
                Fill out your post caption to maximise reach, add repeating dot separators to push hashtags below the &quot;more&quot; fold, or create visually structured bio formatting with repeated symbols.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">🎵 TikTok Comments</h3>
              <p className="text-sm text-muted-foreground">
                TikTok comments trend with repeated phrases. Repeating &quot;no cap&quot; or &quot;let him cook 🔥&quot; multiple times signals approval in viral comment sections. Use row mode with space for natural-looking repeats.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">🐦 Twitter / X (280 chars)</h3>
              <p className="text-sm text-muted-foreground">
                Maximise the limited character count by creating thread-safe repeated hashtag sets, or use the tool to count exactly how many times your phrase fits before posting.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">👨‍💻 Developer Testing</h3>
              <p className="text-sm text-muted-foreground">
                Generate long strings of repeated text to stress-test text input fields, database varchar limits, or UI overflow handling. Far faster than typing manually.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">💌 Couple Messaging</h3>
              <p className="text-sm text-muted-foreground">
                Send &quot;I love you&quot; or &quot;❤️&quot; repeated 100 times for a dramatic good morning message. Pair this with the <Link href="/digital-greeting" className="text-primary hover:underline">Wishes Website builder</Link> for an even more personal surprise.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="text-repeater-faq" className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm space-y-5">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Is the Text Repeater completely free?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes — 100% free, no account required, and no hidden limits. The tool runs entirely in your browser, so your text is never sent to any server.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Is there a maximum number of repetitions?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There is no hard cap beyond your browser&apos;s memory. Generating several million characters is possible, though text areas may slow down above ~500,000 characters. For practical social media use, all platform limits are well within the comfortable range.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Can I repeat emojis?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Absolutely. Enter any emoji or combination of emojis and the tool handles them correctly — including multi-codepoint emojis like 🏳️‍🌈 or 👨‍👩‍👧‍👦. Each full emoji sequence is counted and repeated as a unit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Why does the output get cut off?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When running in &quot;fill to limit&quot; mode (no count specified), the tool fills up to — but never exceeds — the platform&apos;s character limit. If you need more characters, switch to Custom mode and set a higher limit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Does this work on mobile?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes. The tool is fully responsive and works on iOS and Android browsers. The copy button copies directly to your clipboard so you can paste it into WhatsApp or Instagram without leaving your phone browser.
              </p>
            </div>
          </div>
        </section>

        {/* Related tools */}
        <div className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold tracking-tight mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/shortcutpedia" className="block p-4 border rounded-lg hover:bg-accent/30 transition-colors">
              <p className="font-medium text-foreground">Shortcutpedia</p>
              <p className="text-sm text-muted-foreground mt-1">Decode internet slang, acronyms, and Gen Z expressions instantly.</p>
            </Link>
            <Link href="/flames" className="block p-4 border rounded-lg hover:bg-accent/30 transition-colors">
              <p className="font-medium text-foreground">FLAMES Calculator</p>
              <p className="text-sm text-muted-foreground mt-1">Test your compatibility with the classic childhood relationship game.</p>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
