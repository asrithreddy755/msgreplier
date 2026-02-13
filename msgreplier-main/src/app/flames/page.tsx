import { Metadata } from "next";
import { Mail } from "lucide-react";
import FlamesCalculator from "@/components/flames-calculator";

export const metadata: Metadata = {
  title: "FLAMES Calculator - Real Love Compatibility Test (2026)",
  description: "Calculate your relationship destiny with the classic FLAMES game. Check Friendship, Love, Affection, Marriage, Enemy, or Sister status instantly.",
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
              <li><strong>Step 1:</strong> Take two names (e.g., "TOM" and "EMILY").</li>
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

        {/* Footer */}
        <div className="text-center pb-8 border-t border-slate-200 dark:border-slate-800 pt-8">
          <a href="mailto:care.msgreplier@gmail.com" className="inline-flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <Mail className="h-4 w-4" /> 
            Suggestions & Feedback
          </a>
        </div>
      </div>
    </div>
  );
}
