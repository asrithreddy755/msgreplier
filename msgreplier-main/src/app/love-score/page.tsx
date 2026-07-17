import type { Metadata } from "next";
import Link from "next/link";
import LoveScoreClient from "./LoveScoreClient";

export const metadata: Metadata = {
  title: "Love Score Quiz Creator — Build a Custom Couples Compatibility Quiz",
  description:
    "Create a personalised Love Score quiz for your partner. Add custom questions, set a countdown timer, and share a secret link. Discover how well they really know you — free, no login required.",
  alternates: {
    canonical: "https://msgreplier.com/love-score",
  },
  openGraph: {
    title: "Love Score Quiz Creator | MsgReplier",
    description:
      "Build a custom quiz for your partner and test how well they know you. Share a private link, add a timer, and reveal your Love Score.",
    url: "https://msgreplier.com/love-score",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Love Score Quiz Creator",
  description:
    "A free tool to create personalised couple compatibility quizzes. Add custom questions, set a timer, and share a private link with your partner to reveal your Love Score.",
  url: "https://msgreplier.com/love-score",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LoveScorePage() {
  return (
    <div className="min-h-screen bg-rose-50 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Interactive quiz builder (client-side) ─────────────────────── */}
      <LoveScoreClient />

      {/* ── SSR content block — fully crawlable by Googlebot ──────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-12 text-left">

        {/* How It Works */}
        <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Create</h3>
              <p className="text-sm text-slate-500">Pick your questions and set a ruthless time limit.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Share</h3>
              <p className="text-sm text-slate-500">Send them the secret generated link.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Score</h3>
              <p className="text-sm text-slate-500">Watch them panic as the clock ticks, and view their final score!</p>
            </div>
          </div>
          <div className="mt-8 text-center bg-rose-50/50 dark:bg-slate-950/50 p-4 rounded-xl border border-rose-100 dark:border-slate-800/80">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Need more details? Check out our full{" "}
              <Link href="/blog/love-score-guide" className="text-rose-600 hover:underline font-medium">
                Ultimate Guide to the Love Score Quiz
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Main SEO Content */}
        <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 backdrop-blur-sm space-y-8">

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What is the MsgReplier Love Score Quiz?</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The Love Score Quiz is an interactive, fully customisable relationship game designed to test how well your partner, crush, or best friend actually knows you. Unlike standard online quizzes with generic questions, MsgReplier allows you to craft your own custom questions, set unique answer options, and define which one is correct. You can also specify a countdown timer to add exciting pressure. Once you complete the setup, a private, secure link is generated for you to share directly with your recipient.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why Create a Compatibility Quiz for Your Partner?</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              In any relationship, sharing trivia, reminiscing about first dates, and laughing over inside jokes builds a deeper connection. A custom couple quiz is a playful way to celebrate your unique story. It sparks conversations about memories you might have forgotten — like the exact movie you watched on your first date, your partner&apos;s pet peeve, or your dream travel destination. By testing each other, you can enjoy lighthearted competition and see who holds the highest Love Score.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The Love Score Quiz is also a fantastic way to celebrate milestones. Send one as a birthday surprise, an anniversary gift, or just a random Tuesday pick-me-up. Because you write every question yourself, the quiz is guaranteed to feel personal — something your partner cannot Google.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tips for Creating the Ultimate Couple Quiz</h2>
            <ul className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong className="text-slate-900 dark:text-white">Mix the Easy and Hard:</strong> Include a few obvious questions (like your birthday or favourite colour) alongside deeper memory tests (like what you wore when you first met or your first impressions).</li>
              <li><strong className="text-slate-900 dark:text-white">Add Playful Hints:</strong> Use the optional Hint field to give subtle clues or tease your partner about the answer. A well-placed hint can keep the game fun rather than frustrating.</li>
              <li><strong className="text-slate-900 dark:text-white">Use the Pressure Timer:</strong> Setting a 1 or 2-minute time limit keeps the quiz fast-paced and prevents them from cheating or looking up answers. The timer is your secret weapon.</li>
              <li><strong className="text-slate-900 dark:text-white">Use the Preset Questions:</strong> Not sure what to ask? Hit the Presets button to load 5 randomly selected conversation-starter questions from our curated library. Customise them to match your relationship.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Are my quiz answers kept private?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Absolutely. MsgReplier values privacy first. All quiz questions, options, and scores are handled securely and are only accessible by you and the person who receives the unique link. No other user can see your quiz.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">How is the Love Score calculated?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  The final score is a simple percentage of questions answered correctly before the timer runs out. When your partner finishes, they will see their compatibility level instantly — from &quot;You Barely Know Me&quot; to &quot;Perfect Match.&quot;
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Can I create multiple quizzes?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Yes, you can create as many custom quizzes as you want. You can generate distinct links for different friends or test your partner on different topics — favourite films, childhood memories, shared goals.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Does my partner need an account to take the quiz?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  No account is required on either end. You create the quiz without logging in, and your partner opens the link in any browser and starts answering immediately. No sign-up, no friction.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">What happens after the quiz is completed?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Once your partner submits their answers, their final score is displayed with a fun compatibility message. You can also share the results with each other for a great conversation starter.
                </p>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
