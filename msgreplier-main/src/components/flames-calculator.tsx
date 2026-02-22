"use client";

import React, { useState, useRef } from "react";
import { toBlob } from "html-to-image";
import { Calculator, Heart, Download, Share2, RefreshCcw, Sparkles, X, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type FlameResult = "Friendship" | "Love" | "Affection" | "Marriage" | "Enemy" | "Sister" | null;

interface FlameData {
  meaning: string;
  color: string;
  emoji: string;
  description: string;
}

const FLAMES_DATA: Record<string, FlameData> = {
  F: { meaning: "Friendship", color: "text-blue-500", emoji: "🤝", description: "Best friends forever! A bond that stands the test of time." },
  L: { meaning: "Love", color: "text-red-500", emoji: "❤️", description: "True romance is in the air. You are destined for each other." },
  A: { meaning: "Affection", color: "text-pink-500", emoji: "🥰", description: "Sweet and fond feelings. A cute relationship is blossoming." },
  M: { meaning: "Marriage", color: "text-purple-500", emoji: "💍", description: "The ultimate commitment. Wedding bells might be ringing soon!" },
  E: { meaning: "Enemy", color: "text-orange-500", emoji: "⚔️", description: "Uh oh! Sparks will fly, but maybe not the good kind." },
  S: { meaning: "Sister", color: "text-teal-500", emoji: "👯", description: "A protective, sibling-like bond. You care deeply like family." },
};

export default function FlamesCalculator() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [calcStep, setCalcStep] = useState<"idle" | "canceling" | "counting" | "eliminating" | "result">("idle");
  // Sub-step for animating CSS classes smoothly before taking things out of the DOM.
  const [animStatus, setAnimStatus] = useState<"idle" | "striking" | "collapsing" | "popping" | "eliminating">("idle");

  const [animationData, setAnimationData] = useState<{
    n1: { char: string; crossed: boolean }[];
    n2: { char: string; crossed: boolean }[];
    totalRemaining: number;
    eliminations: string[];
    finalLetter: string;
  } | null>(null);
  const [eliminationIndex, setEliminationIndex] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const calculateFlames = () => {
    if (!name1.trim() || !name2.trim()) {
      toast({ title: "Error", description: "Please enter both names!", variant: "destructive" });
      return;
    }

    const n1 = name1.toLowerCase().replace(/\s/g, "").split("");
    const n2 = name2.toLowerCase().replace(/\s/g, "").split("");

    const count1 = n1.filter((char) => !n2.includes(char)).length;
    const count2 = n2.filter((char) => !n1.includes(char)).length;
    const totalRemaining = count1 + count2;

    const flames = ["F", "L", "A", "M", "E", "S"];
    let index = 0;
    const eliminations: string[] = [];
    const currentFlames = [...flames];

    while (currentFlames.length > 1) {
      index = (index + totalRemaining - 1) % currentFlames.length;
      eliminations.push(currentFlames.splice(index, 1)[0]);
    }
    const finalLetter = currentFlames[0];

    const n1Status = n1.map(char => ({ char, crossed: n2.includes(char) }));
    const n2Status = n2.map(char => ({ char, crossed: n1.includes(char) }));

    setAnimationData({
      n1: n1Status,
      n2: n2Status,
      totalRemaining,
      eliminations,
      finalLetter
    });

    setEliminationIndex(0);
    setCalcStep("canceling");
    setAnimStatus("striking");
  };

  React.useEffect(() => {
    if (calcStep === 'canceling') {
      if (animStatus === 'striking') {
        // Wait 4000ms (4s) for strike-through to finish, then start collapsing
        const t = setTimeout(() => setAnimStatus('collapsing'), 4000);
        return () => clearTimeout(t);
      } else if (animStatus === 'collapsing') {
        // Wait 3000ms (3s) for collapse to finish, then move to counting step
        const t = setTimeout(() => {
          setCalcStep('counting');
          setAnimStatus('popping');
        }, 3000);
        return () => clearTimeout(t);
      }
    } else if (calcStep === 'counting') {
      const t = setTimeout(() => {
        setCalcStep('eliminating');
        setAnimStatus('eliminating');
      }, 1500);
      return () => clearTimeout(t);
    } else if (calcStep === 'eliminating' && animationData) {
      if (eliminationIndex < animationData.eliminations.length) {
        // Wait 1000ms for the eliminate-pill CSS transition + DOM space collapse
        const t = setTimeout(() => setEliminationIndex(prev => prev + 1), 1000);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setCalcStep('result');
          setAnimStatus('idle');
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [calcStep, animStatus, eliminationIndex, animationData]);

  const resetCalculator = () => {
    setName1("");
    setName2("");
    setCalcStep("idle");
    setAnimStatus("idle");
    setAnimationData(null);
    setShowShareOptions(false);
  };

  const skipAnimation = () => {
    if (animationData) {
      setCalcStep("result");
    }
  };

  const generateExportBlob = async () => {
    if (!resultRef.current) return null;
    const target = resultRef.current;
    target.classList.add('export-mode');

    // Brief pause to allow the DOM to apply the CSS class removing animations
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const blob = await toBlob(target, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true, // Webfonts often trigger cross-origin SecurityErrors during canvas clone
        style: {
          transform: 'none', // Prevents layout engine crashes 
        },
        filter: (node) => {
          // Aggressively strip out externally-injected DOM nodes (extensions, adblockers, trackers)
          if (node.tagName === 'LINK' || node.tagName === 'STYLE' || node.tagName === 'IFRAME') {
            return false;
          }
          return true;
        }
      });
      target.classList.remove('export-mode');
      return blob;
    } catch {
      target.classList.remove('export-mode');
      return null;
    }
  };

  const downloadImage = async () => {
    const blob = await generateExportBlob();
    if (!blob) {
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `flames-result.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Saved!", description: "Image downloaded to your device." });
    setShowShareOptions(false);
  };

  const shareImage = async () => {
    const blob = await generateExportBlob();
    if (!blob) {
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
      return;
    }
    const file = new File([blob], 'flames-result.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'FLAMES Result',
          text: 'Check out my FLAMES result generated by msgreplier.com!',
          files: [file],
        });
        toast({ title: "Shared!", description: "Result shared successfully." });
      } catch (error) {
        // Ignored
      }
    } else {
      toast({ title: "Not Supported", description: "Your browser does not support native sharing. Please use the Save button instead.", variant: "destructive" });
    }
    setShowShareOptions(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden min-h-[450px] flex flex-col transition-all duration-500">
        {calcStep === 'idle' && (
          <CardHeader className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-2">
              <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600">
              FLAMES Calculator
            </CardTitle>
            <CardDescription>Discover the destiny of your relationship!</CardDescription>
          </CardHeader>
        )}

        <CardContent className={`px-6 pb-6 w-full flex-1 flex flex-col ${calcStep === 'idle' ? 'space-y-6 pt-0' : 'pt-6'}`}>
          {calcStep === 'idle' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-4">
                <Input placeholder="Your Name" value={name1} onChange={(e) => setName1(e.target.value)} className="text-lg py-6" />
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </div>
                </div>
                <Input placeholder="Partner's Name" value={name2} onChange={(e) => setName2(e.target.value)} className="text-lg py-6" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button size="lg" className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold transition-all" onClick={calculateFlames}>
                  <Calculator className="mr-2 h-5 w-5" /> Calculate
                </Button>
                <Button size="lg" variant="outline" className="w-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={resetCalculator}>
                  <RefreshCcw className="mr-2 h-5 w-5" /> Reset
                </Button>
              </div>
            </div>
          )}

          {calcStep !== 'idle' && calcStep !== 'result' && animationData && (
            <div className="flex flex-col flex-1 relative animate-in fade-in duration-500 h-full min-h-[350px]">
              <div className="absolute -top-4 -right-2 z-10">
                <Button variant="ghost" size="sm" onClick={skipAnimation} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  <ChevronsRight className="mr-1 w-4 h-4" /> Skip
                </Button>
              </div>

              {calcStep === 'canceling' && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-2">Canceling common letters...</h3>

                  <div className="flex gap-2 justify-center flex-wrap px-4">
                    {animationData.n1.map((item, i) => {
                      // Find all unique crossed characters to establish a shared delay order
                      const uniqueCrossedChars = Array.from(new Set(animationData.n1.filter(x => x.crossed).map(x => x.char).concat(animationData.n2.filter(x => x.crossed).map(x => x.char))));
                      const charIndex = uniqueCrossedChars.indexOf(item.char);

                      const delay = item.crossed ? (charIndex * 0.4) + 's' : '0s';
                      return (
                        <div key={`n1-${i}`} style={{ ['--strike-delay' as any]: delay }} className={`relative w-10 h-10 flex items-center justify-center rounded-xl border font-bold text-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 ${item.crossed
                          ? (animStatus === 'collapsing' || calcStep !== 'canceling' ? 'fade-collapse opacity-40 border-slate-200 dark:border-slate-700' : 'strike-through opacity-40 border-slate-200 dark:border-slate-700')
                          : 'border-slate-300 dark:border-slate-600 shadow-sm'
                          }`}>
                          {item.char.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>

                  <X className={`w-5 h-5 text-slate-200 dark:text-slate-700 ${(animStatus === 'collapsing' || calcStep !== 'canceling') ? 'animate-pulse' : ''}`} />

                  <div className="flex gap-2 justify-center flex-wrap px-4">
                    {animationData.n2.map((item, i) => {
                      // Find all unique crossed characters to establish a shared delay order
                      const uniqueCrossedChars = Array.from(new Set(animationData.n1.filter(x => x.crossed).map(x => x.char).concat(animationData.n2.filter(x => x.crossed).map(x => x.char))));
                      const charIndex = uniqueCrossedChars.indexOf(item.char);

                      const delay = item.crossed ? (charIndex * 0.4) + 's' : '0s';
                      return (
                        <div key={`n2-${i}`} style={{ ['--strike-delay' as any]: delay }} className={`relative w-10 h-10 flex items-center justify-center rounded-xl border font-bold text-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 ${item.crossed
                          ? (animStatus === 'collapsing' || calcStep !== 'canceling' ? 'fade-collapse opacity-40 border-slate-200 dark:border-slate-700' : 'strike-through opacity-40 border-slate-200 dark:border-slate-700')
                          : 'border-slate-300 dark:border-slate-600 shadow-sm'
                          }`}>
                          {item.char.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calcStep === 'counting' && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Remaining Letters</h3>
                  <div className={`text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600 py-4 ${animStatus === 'popping' ? 'pop-bounce' : ''}`}>
                    {animationData.totalRemaining}
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Matches removed. Counting what's left.</p>
                </div>
              )}

              {calcStep === 'eliminating' && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in duration-300 mt-4">
                  <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Eliminating...</h3>

                  <div className="flex flex-col items-center gap-3 w-full px-4 max-w-sm mx-auto">
                    {["F", "L", "A", "M", "E", "S"].map((letter) => {
                      const meaning = FLAMES_DATA[letter].meaning;
                      const eliminatedOrderIndex = animationData.eliminations.indexOf(letter);
                      const isEliminated = eliminatedOrderIndex !== -1 && eliminatedOrderIndex < eliminationIndex;
                      const isCurrentlyEliminating = eliminatedOrderIndex === eliminationIndex;

                      // Immediately hide everything past our actual elimination timeline from view completely
                      if (eliminatedOrderIndex !== -1 && eliminatedOrderIndex <= eliminationIndex - 1) {
                        return null;
                      }

                      return (
                        <div key={letter} className={`
                                    w-full py-3 px-6 rounded-2xl border-2 font-bold text-center flex items-center gap-4 transition-all duration-300
                                    ${isCurrentlyEliminating ? 'eliminate-pill border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-900/30 shadow-md' :
                            'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm'}
                                `}>
                          <div className={`w-10 h-10 min-w-10 rounded-full flex items-center justify-center text-xl font-black ${isCurrentlyEliminating ? 'bg-pink-100 text-pink-600 dark:bg-pink-800/50' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'}`}>
                            {letter}
                          </div>
                          <span className="text-lg tracking-wide uppercase">{meaning}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-4">Count: {animationData.totalRemaining}</p>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 w-full text-center uppercase tracking-[0.2em] text-[10px] text-slate-300 dark:text-slate-600 font-bold animate-pulse">
                Calculating Destiny...
              </div>
            </div>
          )}

          {calcStep === 'result' && animationData && (
            <div className="flex flex-col h-full animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
              <div ref={resultRef} className="flex flex-col items-center bg-white dark:bg-slate-950 p-6 rounded-3xl pb-2">
                <div className="text-center mb-6 pt-2">
                  <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                    {name1.toUpperCase()} <span className="text-pink-500 mx-2">+</span> {name2.toUpperCase()}
                  </h2>
                </div>

                <div className="relative overflow-hidden w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
                  <div className="mb-6 relative h-28 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/10 rounded-full scale-[1.5] opacity-50 blur-xl"></div>
                    <span className="text-7xl block relative z-10 filter drop-shadow-md animate-bounce transform-gpu" style={{ lineHeight: 1 }}>
                      {FLAMES_DATA[animationData.finalLetter].emoji}
                    </span>
                  </div>
                  <h3 className={`text-4xl font-black mb-3 ${FLAMES_DATA[animationData.finalLetter].color}`}>
                    {FLAMES_DATA[animationData.finalLetter].meaning.toUpperCase()}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                    {FLAMES_DATA[animationData.finalLetter].description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 opacity-60">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">generated by www.msgreplier.com</p>
                  </div>
                </div>
              </div>

              {!showShareOptions ? (
                <div className="grid grid-cols-2 gap-3 mt-4 pb-2 px-2">
                  <Button variant="outline" className="w-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setShowShareOptions(true)}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-all" onClick={resetCalculator}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-4 pb-2 px-2 animate-in fade-in slide-in-from-bottom-2">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm" onClick={downloadImage}>
                    <Download className="mr-1 h-4 w-4" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm" onClick={shareImage}>
                    <Share2 className="mr-1 h-4 w-4" /> Send
                  </Button>
                  <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-all" onClick={resetCalculator}>
                    <RefreshCcw className="mr-1 h-4 w-4" /> Reset
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
