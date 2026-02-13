"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Calculator, Heart, Share2, Download, RefreshCcw, Sparkles } from "lucide-react";
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
  const [result, setResult] = useState<FlameResult>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const calculateFlames = () => {
    if (!name1.trim() || !name2.trim()) {
      toast({ title: "Error", description: "Please enter both names!", variant: "destructive" });
      return;
    }

    setIsCalculating(true);
    setResult(null);

    setTimeout(() => {
      const n1 = name1.toLowerCase().replace(/\s/g, "").split("");
      const n2 = name2.toLowerCase().replace(/\s/g, "").split("");

      let count1 = n1.filter(char => !n2.includes(char)).length;
      let count2 = n2.filter(char => !n1.includes(char)).length;
      let totalRemaining = count1 + count2;

      const flames = ["F", "L", "A", "M", "E", "S"];
      let index = 0;

      while (flames.length > 1) {
        index = (index + totalRemaining - 1) % flames.length;
        flames.splice(index, 1);
      }

      const finalLetter = flames[0];
      setResult(FLAMES_DATA[finalLetter].meaning as FlameResult);
      setIsCalculating(false);
    }, 1500);
  };

  const resetCalculator = () => {
    setName1("");
    setName2("");
    setResult(null);
  };

  const downloadResult = async () => {
    if (resultRef.current) {
      try {
        const canvas = await html2canvas(resultRef.current, { backgroundColor: null, scale: 2 });
        const link = document.createElement("a");
        link.download = `flames-result.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast({ title: "Saved!", description: "Image downloaded successfully." });
      } catch (err) {
        toast({ title: "Error", description: "Failed to download.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600">
            FLAMES Calculator
          </CardTitle>
          <CardDescription>Discover the destiny of your relationship!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Input placeholder="Your Name" value={name1} onChange={(e) => setName1(e.target.value)} className="text-lg py-6" />
            <div className="flex justify-center -my-2 relative z-10">
               <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full border">
                 <Sparkles className="w-5 h-5 text-yellow-500" />
               </div>
            </div>
            <Input placeholder="Partner's Name" value={name2} onChange={(e) => setName2(e.target.value)} className="text-lg py-6" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
             <Button size="lg" className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold" onClick={calculateFlames} disabled={isCalculating}>
               {isCalculating ? "Calculating..." : <><Calculator className="mr-2 h-5 w-5" /> Calculate</>}
             </Button>
             <Button size="lg" variant="outline" className="w-full" onClick={resetCalculator}>
               <RefreshCcw className="mr-2 h-5 w-5" /> Reset
             </Button>
          </div>

          {result && (
            <div className="animate-in fade-in zoom-in duration-500 pt-4">
              <div ref={resultRef} className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 text-center">
                 <div className="mb-4"><span className="text-6xl">{Object.values(FLAMES_DATA).find(d => d.meaning === result)?.emoji}</span></div>
                 <h3 className={`text-4xl font-black mb-2 ${Object.values(FLAMES_DATA).find(d => d.meaning === result)?.color}`}>{result.toUpperCase()}</h3>
                 <p className="text-slate-600 dark:text-slate-300 font-medium">{Object.values(FLAMES_DATA).find(d => d.meaning === result)?.description}</p>
              </div>
              <Button variant="secondary" className="w-full mt-4" onClick={downloadResult}><Download className="mr-2 h-4 w-4" /> Save Image</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
