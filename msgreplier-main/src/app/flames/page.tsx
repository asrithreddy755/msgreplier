import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Shield, CircleDollarSign, Smile, Mail } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 font-body p-4 flex flex-col items-center justify-start pt-16 md:pt-20 gap-8 text-slate-900 light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. Back Navigation Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full shadow-md bg-white hover:bg-rose-50 text-rose-600 font-medium px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* The Interactive Calculator */}
      <FlamesCalculator />

      {/* 2. Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        
        {/* Card 1: How to Use */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-rose-100 shadow-sm flex items-start gap-4">
          <div className="p-2 rounded-full bg-rose-100 text-rose-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-700 mb-1">How to Use</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enter two names and let the algorithm reveal your relationship destiny!
            </p>
          </div>
        </div>

        {/* Card 2: Privacy First */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-rose-100 shadow-sm flex items-start gap-4">
          <div className="p-2 rounded-full bg-rose-100 text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-700 mb-1">Privacy First</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              100% Private. We do not store your names or personal data.
            </p>
          </div>
        </div>

        {/* Card 3: Completely Free */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-rose-100 shadow-sm flex items-start gap-4">
          <div className="p-2 rounded-full bg-rose-100 text-rose-600">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-700 mb-1">Completely Free</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              No hidden charges. Enjoy unlimited checks for free.
            </p>
          </div>
        </div>

        {/* Card 4: Just for Fun */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-rose-100 shadow-sm flex items-start gap-4">
          <div className="p-2 rounded-full bg-rose-100 text-rose-600">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-700 mb-1">Just for Fun</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              This is a game algorithm. Don't take the results too seriously!
            </p>
          </div>
        </div>

      </div>

      {/* SEO Content Section */}
      <section className="w-full max-w-3xl text-left bg-white/60 backdrop-blur-md border border-rose-100 p-8 rounded-xl shadow-sm mb-12">
        <h2 className="text-2xl font-bold mb-4 text-rose-700">How Does the FLAMES Calculator Work?</h2>
        <div className="text-slate-600 leading-relaxed space-y-4">
          <p>
            FLAMES is a childhood classic game used to predict the relationship between two people. The acronym stands for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>F</strong> - Friendship</li>
            <li><strong>L</strong> - Love</li>
            <li><strong>A</strong> - Affection</li>
            <li><strong>M</strong> - Marriage</li>
            <li><strong>E</strong> - Enemy</li>
            <li><strong>S</strong> - Sister (Sibling)</li>
          </ul>
          <p>
            <strong>Algorithm:</strong> Our tool uses the authentic algorithm: it removes common letters between two names and counts the remaining characters to predict your future.
          </p>
        </div>
      </section>

      {/* --- DOCUMENTATION SECTION START --- */}
      <section className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        
        <article className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
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
      <div className="w-full max-w-2xl text-center pb-8">
        <a href="mailto:care.msgreplier@gmail.com" className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:underline underline-offset-4">
          <Mail className="h-4 w-4" /> Suggestions & Feedback
        </a>
      </div>
    </div>
  );
}
