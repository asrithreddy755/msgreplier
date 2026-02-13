"use client";

import { useState, useRef, useEffect } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCcw, Sparkles, Heart, FastForward, Share2, Download, ArrowLeft, Info, Shield, CircleDollarSign, Smile, Mail } from "lucide-react";
import html2canvas from "html2canvas";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FLAMES Calculator - Real Love Compatibility Test (2026)",
  description: "Calculate your relationship destiny with the classic FLAMES game. Check Friendship, Love, Affection, Marriage, Enemy, or Sister status instantly.",
};

// --- Logic Types & Function ---

interface Match {
  n1Idx: number;
  n2Idx: number;
  char: string;
}

interface EliminationStep {
  currentFlames: string[];
  removeIndex: number;
  removeChar: string;
}

interface FlamesData {
  name1Chars: string[];
  name2Chars: string[];
  matches: Match[];
  totalCount: number;
  eliminationHistory: EliminationStep[];
  result: string;
}

function getFlamesResult(name1: string, name2: string): FlamesData | "Invalid" {
  // 1. Safety Checks
  if (!name1 || !name2) return "Invalid";

  // 2. Strict Sanitization (Lowercase + remove non-a-z)
  const a = name1.toLowerCase().replace(/[^a-z]/g, "").split("");
  const b = name2.toLowerCase().replace(/[^a-z]/g, "").split("");

  if (a.length === 0 || b.length === 0) return "Invalid";

  // UI State Tracking (Mirror of logic arrays)
  const originalN1 = [...a];
  const originalN2 = [...b];
  const aObjs = a.map((c, i) => ({ char: c, originalIndex: i }));
  const bObjs = b.map((c, i) => ({ char: c, originalIndex: i }));
  const matches: Match[] = [];

  // 3. 1-for-1 Cancellation Logic
  // We iterate through 'a' and try to find a match in 'b'.
  // If found, we remove ONE instance from both.
  for (let i = 0; i < a.length; i++) {
    const index = b.indexOf(a[i]);
    if (index !== -1) {
      // UI Capture
      matches.push({ 
        n1Idx: aObjs[i].originalIndex, 
        n2Idx: bObjs[index].originalIndex, 
        char: a[i] 
      });
      aObjs.splice(i, 1);
      bObjs.splice(index, 1);

      // EXACT Logic
      a.splice(i, 1);      // Remove from a
      b.splice(index, 1);  // Remove from b
      i--;                 // Adjust index since array shrank
    }
  }

  // 4. Calculate Remaining Count
  const count = a.length + b.length;

  const eliminationHistory: EliminationStep[] = [];

  // 5. The "Zero Trap" Guard Clause
  // If names are identical (e.g. Amit & Amit), count is 0.
  // Standard math breaks here, so we return a positive result.
  if (count === 0) {
    return {
      name1Chars: originalN1,
      name2Chars: originalN2,
      matches,
      totalCount: 0,
      eliminationHistory: [],
      result: "Lovers",
    };
  }

  // 6. Circular Elimination (The FLAMES Loop)
  let flames = ["Friends", "Lovers", "Affection", "Marriage", "Enemy", "Siblings"];
  let index = 0;

  while (flames.length > 1) {
    // The Formula: (Current Index + Steps - 1) % Remaining Length
    index = (index + count - 1) % flames.length;
    
    // UI Capture
    eliminationHistory.push({
      currentFlames: [...flames],
      removeIndex: index,
      removeChar: flames[index],
    });

    flames.splice(index, 1); // Remove the item
  }

  // 7. Return Final Result (Formatted for UI)
  return {
    name1Chars: originalN1,
    name2Chars: originalN2,
    matches,
    totalCount: count,
    eliminationHistory,
    result: flames[0],
  };
}

// --- Sub-Components ---

function LetterBox({ char, status }: { char: string; status: "normal" | "highlight" | "removed" }) {
  let styles = "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all duration-500 uppercase ";
  
  if (status === "normal") {
    styles += "bg-white border-gray-200 text-slate-900";
  } else if (status === "highlight") {
    styles += "bg-rose-100 border-rose-500 text-rose-600 scale-110 shadow-[0_0_15px_rgba(225,29,72,0.4)] z-10";
  } else if (status === "removed") {
    styles += "bg-gray-100 border-gray-200 text-gray-300 grayscale opacity-40 scale-90";
  }

  return (
    <div className={styles}>
      {char}
      {status === "removed" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-0.5 bg-rose-500/50 rotate-45" />
          <div className="w-full h-0.5 bg-rose-500/50 -rotate-45" />
        </div>
      )}
    </div>
  );
}

interface ResultCardProps {
  result: string;
  name1: string;
  name2: string;
  onReset: () => void;
  onShare: () => void;
  captureRef: React.RefObject<HTMLDivElement | null>;
}

function ResultCard({ result, name1, name2, onReset, onShare, captureRef }: ResultCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const getMessage = (r: string) => {
    switch (r) {
      case "Friends": return "Besties for life! 🤝";
      case "Lovers": return "It's true love! ❤️";
      case "Affection": return "Something sweet is brewing... 🌸";
      case "Marriage": return "Wedding bells are ringing! 💍";
      case "Enemy": return "Uh oh... keep your distance! ⚔️";
      case "Siblings": return "Like brother and sister! 👯";
      default: return "Destiny awaits!";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 text-center transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      {/* Capture Area */}
      <div ref={captureRef} className="flex flex-col items-center gap-6 p-6 rounded-xl bg-white border border-rose-100 shadow-sm">
        <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">
          {name1} <span className="text-rose-500 mx-2">+</span> {name2}
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-20 duration-1000" />
          <div className="relative rounded-full bg-gradient-to-br from-rose-100 to-orange-100 p-8 shadow-xl border border-rose-200">
            <Heart className="h-16 w-16 text-rose-600 animate-pulse fill-rose-600/20" />
          </div>
        </div>
        
        <div className="space-y-2">
          {/* NUCLEAR VISIBILITY FIX */}
          <h2 className="relative z-50 text-5xl md:text-6xl font-black uppercase tracking-widest mt-4 mb-2 text-red-600 drop-shadow-md">
            {result}
          </h2>
          <p className="text-xl text-slate-500 font-medium">
            {getMessage(result)}
          </p>
        </div>
        
        {/* Footer for Screenshot */}
        <div className="text-[10px] text-slate-400 font-medium">
          Check yours at msgreplier.com/flames
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button onClick={onShare} variant="outline" size="lg" className="rounded-full px-6">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button onClick={onReset} size="lg" className="rounded-full px-8 bg-rose-600 hover:bg-rose-700">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function FlamesPage() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  
  // Game State
  const [view, setView] = useState<"input" | "process" | "result">("input");
  const [data, setData] = useState<FlamesData | null>(null);
  
  // Animation State
  const [animStage, setAnimStage] = useState<"striking" | "counting" | "eliminating">("striking");
  
  // Striking Visuals
  const [struck1, setStruck1] = useState<Set<number>>(new Set());
  const [struck2, setStruck2] = useState<Set<number>>(new Set());
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  
  // Elimination Visuals
  const [elimFlames, setElimFlames] = useState<string[]>([]);
  const [elimRemoved, setElimRemoved] = useState<string | null>(null);
  const [elimHighlight, setElimHighlight] = useState<number | null>(null); // For counting animation

  const isSkippingRef = useRef(false);
  const captureRef = useRef<HTMLDivElement>(null);

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

  const start = () => {
    const res = getFlamesResult(name1, name2);
    if (res === "Invalid") return;
    
    setData(res);
    setView("process");
    setAnimStage("striking");
    setStruck1(new Set());
    setStruck2(new Set());
    setActiveMatch(null);
    setElimFlames(["Friends", "Lovers", "Affection", "Marriage", "Enemy", "Siblings"]);
    setElimRemoved(null);
    setElimHighlight(null);
    isSkippingRef.current = false;
    
    // Start sequence
    runSequence(res);
  };

  const skipAnimation = () => {
    isSkippingRef.current = true;
    setView("result");
  };

  const handleShare = async () => {
    if (!captureRef.current) return;
    
    try {
      const canvas = await html2canvas(captureRef.current, {
        background: undefined, // Transparent if possible, or matches card bg
        scale: 2, // Better quality
      } as any);
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Try Native Share
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], "flames-result.png", { type: "image/png" })] })) {
          try {
            const file = new File([blob], "flames-result.png", { type: "image/png" });
            await navigator.share({
              title: "My FLAMES Result",
              text: `Check out our FLAMES result! 🔥\n${name1} + ${name2} = ${data?.result}\n\nCheck yours here: https://msgreplier.com/flames`,
              files: [file],
            });
          } catch (err) {
            console.error("Share failed", err);
            downloadImage(blob); // Fallback
          }
        } else {
          // Desktop Fallback
          downloadImage(blob);
        }
      }, "image/png");
    } catch (err) {
      console.error("Capture failed", err);
    }
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flames-${name1}-${name2}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const runSequence = async (d: FlamesData) => {
    const checkSkip = () => isSkippingRef.current;

    // 1. STRIKING PHASE
    // Initial pause
    await wait(800);
    if (checkSkip()) return;
    
    for (const m of d.matches) {
      if (checkSkip()) return;
      setActiveMatch(m);
      await wait(600); // Highlight
      if (checkSkip()) return;
      setStruck1(prev => new Set(prev).add(m.n1Idx));
      setStruck2(prev => new Set(prev).add(m.n2Idx));
      setActiveMatch(null);
      await wait(300); // Pause between strikes
    }
    
    if (checkSkip()) return;
    await wait(800);
    setAnimStage("counting");
    await wait(2000); // Show count

    if (d.totalCount === 0) {
      setView("result");
      return;
    }

    if (checkSkip()) return;
    setAnimStage("eliminating");
    await wait(1000);

    // 2. ELIMINATION PHASE
    for (const step of d.eliminationHistory) {
      if (checkSkip()) return;
      setElimFlames(step.currentFlames);
      setElimRemoved(null);
      
      // Simulate "counting" visual
      const idxToRemove = step.removeIndex;
      setElimHighlight(idxToRemove);
      await wait(600);
      
      if (checkSkip()) return;
      setElimRemoved(step.removeChar);
      setElimHighlight(null);
      await wait(800);
    }
    
    if (checkSkip()) return;
    await wait(500);
    setView("result");
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const reset = () => {
    setName1("");
    setName2("");
    setView("input");
    setData(null);
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

      <Card className="w-full max-w-2xl shadow-xl border-rose-200 bg-white/80 backdrop-blur-md transition-all duration-500 overflow-hidden">
        
        {/* HEADER */}
        {view === "input" && (
          <CardHeader className="text-center space-y-2 pb-8">
            <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent">
              FLAMES
            </CardTitle>
            <CardDescription className="text-lg">
              The classic love calculator, reimagined.
            </CardDescription>
          </CardHeader>
        )}

        <CardContent className="p-6 md:p-10 min-h-[400px] flex flex-col justify-center relative">
          
          {/* VIEW: INPUT */}
          {view === "input" && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name1" className="text-base font-medium text-slate-700">Your Name</Label>
                  <Input
                    id="name1"
                    value={name1}
                    onChange={e => setName1(e.target.value)}
                    placeholder="Enter name..."
                    className="h-12 text-lg bg-white border-rose-200 text-slate-900 placeholder:text-slate-400"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name2" className="text-base font-medium text-slate-700">Partner's Name</Label>
                  <Input
                    id="name2"
                    value={name2}
                    onChange={e => setName2(e.target.value)}
                    placeholder="Enter name..."
                    className="h-12 text-lg bg-white border-rose-200 text-slate-900 placeholder:text-slate-400"
                    autoComplete="off"
                  />
                </div>
              </div>

              <Button 
                onClick={start} 
                disabled={!name1 || !name2}
                className="w-full h-12 text-lg rounded-full bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-700 hover:to-violet-700 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Calculate Relationship
              </Button>
            </div>
          )}

          {/* VIEW: PROCESS */}
          {view === "process" && data && (
            <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700 w-full relative">
              
              {/* Skip Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={skipAnimation}
                className="absolute -top-4 right-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <FastForward className="mr-2 h-4 w-4" /> Skip
              </Button>

              {/* STAGE 1: NAMES & CANCELLATION */}
              {animStage === "striking" && (
                <div className="space-y-8 w-full text-center">
                   <h3 className="text-xl font-semibold text-slate-500 animate-pulse">Canceling common letters...</h3>
                   
                   <div className="flex flex-col gap-6 items-center">
                      {/* Name 1 */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {data.name1Chars.map((char, idx) => (
                          <LetterBox 
                            key={`n1-${idx}`} 
                            char={char} 
                            status={
                              activeMatch?.n1Idx === idx ? "highlight" :
                              struck1.has(idx) ? "removed" : "normal"
                            } 
                          />
                        ))}
                      </div>

                      <div className="text-2xl text-slate-300 rotate-90 md:rotate-0">×</div>

                      {/* Name 2 */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {data.name2Chars.map((char, idx) => (
                          <LetterBox 
                            key={`n2-${idx}`} 
                            char={char} 
                            status={
                              activeMatch?.n2Idx === idx ? "highlight" :
                              struck2.has(idx) ? "removed" : "normal"
                            } 
                          />
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {/* STAGE 2: COUNTING */}
              {animStage === "counting" && (
                <div className="text-center space-y-6 animate-in zoom-in duration-500">
                  <h3 className="text-xl font-semibold text-slate-500">Remaining Letters</h3>
                  <div className="relative flex items-center justify-center">
                    <div className="text-8xl font-black bg-gradient-to-br from-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-2xl">
                      {data.totalCount}
                    </div>
                    <div className="absolute inset-0 animate-ping opacity-20 bg-rose-500 rounded-full scale-150" />
                  </div>
                  <p className="text-sm text-slate-400">Matches removed. Counting what's left.</p>
                </div>
              )}

              {/* STAGE 3: ELIMINATION */}
              {animStage === "eliminating" && (
                <div className="space-y-8 w-full text-center">
                  <h3 className="text-xl font-semibold text-slate-500">Eliminating...</h3>
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {elimFlames.map((word, idx) => (
                      <div 
                        key={word}
                        className={`
                          px-4 py-2 rounded-full border-2 text-lg font-bold transition-all duration-500
                          ${elimRemoved === word ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
                          ${elimHighlight === idx ? 'border-rose-500 bg-rose-50 text-rose-600 scale-110' : 'border-gray-200 bg-white text-slate-700'}
                        `}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-400 pt-4">
                    Count: {data.totalCount}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: RESULT */}
          {view === "result" && data && (
            <ResultCard 
              result={data.result} 
              name1={name1} 
              name2={name2} 
              onReset={reset} 
              onShare={handleShare}
              captureRef={captureRef}
            />
          )}

        </CardContent>
        
        {view !== "input" && (
          <CardFooter className="justify-center py-4 bg-rose-50/50">
            <p className="text-xs text-slate-400 uppercase tracking-widest opacity-50">
              {view === "process" ? "Calculating Destiny..." : "Calculation Complete"}
            </p>
          </CardFooter>
        )}
      </Card>

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
