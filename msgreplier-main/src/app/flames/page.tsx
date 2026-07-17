import { Metadata } from "next";
import Link from "next/link";
import { Mail, Plus } from "lucide-react";
import FlamesCalculator from "@/components/flames-calculator";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "FLAMES Calculator - Real Love Compatibility Test (2026)",
  description: "Play the classic FLAMES love compatibility test online. Enter two names and instantly discover if your relationship is Friendship, Love, Affection, Marriage, Enemy, or Sibling. Free, no login.",
  alternates: {
    canonical: "https://msgreplier.com/flames",
  },
  openGraph: {
    title: "FLAMES Calculator - Real Love Compatibility Test (2026)",
    description: "Play the classic FLAMES love compatibility test online. Enter two names and instantly discover if your relationship is Friendship, Love, Affection, Marriage, Enemy, or Sibling. Free, no login.",
    url: "https://msgreplier.com/flames",
    type: "website",
  },
};

export default function FlamesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": "FLAMES Calculator",
    "description": "A classic relationship compatibility game predicting Friendship, Love, Affection, Marriage, Enemy, or Sibling status.",
    "url": "https://msgreplier.com/flames",
    "genre": "Love Calculator",
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "13"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Title */}
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            FLAMES <span className="text-red-500">Calculator</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The classic childhood love compatibility game. Enter two names to discover if you are destined for Friendship, Love, Affection, Marriage, Enemy, or Sibling status!
          </p>
        </div>

        {/* The Interactive Calculator */}
        <FlamesCalculator />

        {/* The SEO Documentation Text */}
        <section className="prose prose-slate dark:prose-invert max-w-none">
          <article className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              The Ultimate FLAMES Calculator: Love, Friendship, or Enemies?
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Remember scribbling names on the back of your school notebook to see if your crush liked you back?
              The <strong>FLAMES Game</strong> is a classic childhood compatibility test used to predict the
              future relationship between two people. Whether you are checking compatibility with a crush,
              a best friend, or even a celebrity, our tool uses the authentic algorithm to reveal your destiny.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">What Does F.L.A.M.E.S. Stand For?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl font-black text-blue-500 mr-2">F</span>
                <span className="font-bold text-lg">Friendship</span>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">You share a strong bond, but it is strictly platonic. Besties for life!</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl font-black text-red-500 mr-2">L</span>
                <span className="font-bold text-lg">Love</span>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">True romance is in the air. Destined for a deep, passionate connection.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl font-black text-pink-500 mr-2">A</span>
                <span className="font-bold text-lg">Affection</span>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">A fondness exists. Not deep love yet, but the chemistry is undeniable.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl font-black text-purple-500 mr-2">M</span>
                <span className="font-bold text-lg">Marriage</span>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">The ultimate commitment. The stars align for a long-term partnership.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl font-black text-orange-500 mr-2">E</span>
                <span className="font-bold text-lg">Enemy</span>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">Uh oh! Expect sparks, but not the romantic kind. You might butt heads.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl font-black text-teal-500 mr-2">S</span>
                <span className="font-bold text-lg">Sister (Sibling)</span>
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">A caring, protective relationship, but definitely not romantic.</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mt-8 mb-4">How the Algorithm Works</h3>
            <p className="mb-4">
              Unlike random generators, the FLAMES calculator uses a specific mathematical logic:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li><strong>Step 1:</strong> Take two names (e.g., &quot;TOM&quot; and &quot;EMILY&quot;).</li>
              <li><strong>Step 2:</strong> Remove all common letters found in both names.</li>
              <li><strong>Step 3:</strong> Count the remaining characters.</li>
              <li><strong>Step 4:</strong> Count through F-L-A-M-E-S repeatedly using that number until one letter remains.</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-6">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-200">💡 Pro Tip</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                For the most accurate result, always use your <strong>full first names</strong> rather than nicknames!
              </p>
            </div>
          </article>
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-none prose prose-slate dark:prose-invert">
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white mt-0">
            Frequently Asked Questions
          </h2>
          <div className="w-full not-prose space-y-2">
            {[
              {
                q: "What is the FLAMES calculator?",
                a: "The FLAMES calculator is a nostalgic relationship game from childhood that predicts the potential romantic or platonic dynamic between two people based solely on their names. FLAMES is an acronym that stands for Friendship, Love, Affection, Marriage, Enemy, and Sister (Sibling)."
              },
              {
                q: "Is the FLAMES test accurate?",
                a: "The FLAMES test is purely for fun and entertainment! While the mathematical algorithm is consistent every time for the exact same names, its predictions shouldn't be taken as serious relationship or destiny advice."
              },
              {
                q: "How do you calculate FLAMES manually?",
                a: "Write down both names and cross out the letters they share in common. Count the remaining uncrossed letters from both names. Then, count off the letters in the word F-L-A-M-E-S repeatedly using that tally until you land on one final letter!"
              },
              {
                q: "Does the order of the names matter in FLAMES?",
                a: "No, the order of the names does not matter! Because the algorithm simply tallies up the combined total of unmatched letters from both names, \"Tom vs Emily\" will always yield the exact same remaining count as \"Emily vs Tom\"."
              },
              {
                q: "What should I do if my result is \"Enemy\"?",
                a: "Don't worry at all! \"Enemy\" just means there might be some fiery friction, banter, or competitive rivalry between you two. Remember, the game is meant for nostalgia and laughs, not genuine destiny tracking!"
              }
            ].map((faq, idx) => (
              <details key={idx} className="group border-b border-slate-200 dark:border-slate-800 py-4 cursor-pointer">
                <summary className="flex items-center justify-between list-none font-bold text-base md:text-lg text-slate-900 dark:text-white focus:outline-none select-none">
                  <span>{faq.q}</span>
                  <span className="p-1 rounded-full border border-slate-200 dark:border-slate-800 transition-transform group-open:rotate-45">
                    <Plus className="h-4 w-4 text-slate-500" />
                  </span>
                </summary>
                <div className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base pl-1">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pb-8 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy-policy" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Privacy Policy</Link>
            <Link href="/terms-conditions" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Cookie Policy</Link>
            <Link href="/about" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">About Us</Link>
          </div>
          <div>
            <a href="mailto:care.msgreplier@gmail.com" className="inline-flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Mail className="h-4 w-4" />
              Suggestions & Feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
