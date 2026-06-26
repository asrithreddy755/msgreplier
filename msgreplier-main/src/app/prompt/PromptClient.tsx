"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { prompts, type PromptItem } from "@/lib/prompts-data";

export default function PromptClient() {
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(5);

  const handleCopy = useCallback(
    async (text: string) => {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast({
        description: "Prompt copied to clipboard",
        duration: 2000,
      });
    },
    [toast]
  );

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex justify-start mb-4">
          <Link href="/" className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-6 text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Msg Prompt
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Scroll a prompt library, copy, and paste into any AI tool to generate
            better couple pictures and photoshoot ideas.
          </p>
        </div>

        <div className="space-y-6">
          {prompts.slice(0, visibleCount).map((item: PromptItem) => (
            <div
              key={item.id}
              className="group relative w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50"
            >
              <Image
                src={item.image}
                alt={`AI Couple Prompt - ${item.tag} style photoshoot idea`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
                priority={item.id === "1"}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute top-5 left-5">
                <span className="bg-[#8B5E3C]/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {item.tag}
                </span>
              </div>

              <div className="absolute top-5 right-5 flex items-center gap-1.5 text-white/90 font-medium text-sm drop-shadow-md">
                <Download className="w-4 h-4 text-white/80" />
                <span>{item.likes}</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
                <p className="text-white/90 text-[15px] leading-relaxed line-clamp-2 mb-5 drop-shadow-sm font-light">
                  {item.text}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(item.text)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 group/btn"
                  >
                    <Copy className="w-4 h-4 text-white/80 group-hover/btn:text-white" />
                    <span className="text-sm font-medium">Copy</span>
                  </button>

                  <span className="text-white/60 text-xs font-medium tracking-wide">
                    by {item.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < prompts.length && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="w-full sm:w-auto min-w-[200px] rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Load More
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          For any enquiries, contact{" "}
          <a
            href="mailto:care.msgreplier@gmail.com"
            className="font-medium text-slate-700 dark:text-slate-200 underline underline-offset-2"
          >
            care.msgreplier@gmail.com
          </a>
          .
        </div>
      </div>
    </div>
  );
}
