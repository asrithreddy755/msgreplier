"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Compass, MoreVertical, X, ArrowLeft, Chrome, ExternalLink } from "lucide-react";
export function InstagramBrowserPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running inside Instagram in-app browser
    const ua = navigator.userAgent || "";
    const isInstagram = /Instagram/i.test(ua);
    const dismissed = sessionStorage.getItem("instagram_popup_dismissed");
    
    // Detect iOS to customize instructions
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    if (isInstagram && !dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleContinue = () => {
    sessionStorage.setItem("instagram_popup_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Glassmorphic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleContinue}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-card border border-border/80 text-card-foreground w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 relative flex flex-col"
        >
          {/* Close button in top-right */}
          <button
            onClick={handleContinue}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors z-20"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Content */}
          <div className="p-6 md:p-8 flex-1 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Decorative Glowing GIF container */}
                  <div className="relative mb-6 rounded-full p-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-xl">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-background flex items-center justify-center relative">
                      <img
                        src="/instagram-notice.gif"
                        alt="Notice GIF"
                        className="w-full h-full object-cover scale-110"
                      />
                    </div>
                    {/* Glowing pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] opacity-40 animate-ping -z-10" />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3 text-foreground">
                    Better experience in browser
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm mb-8">
                    For smooth chat, games, and full features, open this site in Chrome/browser.
                  </p>

                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] hover:from-[#f43f5e] hover:to-[#4f46e5] text-white font-semibold py-6 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      <Chrome className="h-5 w-5" />
                      Open in Browser
                    </Button>
                    <Button
                      onClick={handleContinue}
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground py-5 rounded-xl transition-all duration-300 hover:bg-accent/40"
                    >
                      Continue Here
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center w-full"
                >
                  <h3 className="text-lg md:text-xl font-bold tracking-tight mb-6 text-foreground flex items-center gap-2">
                    <Compass className="h-5 w-5 text-[#ee2a7b]" />
                    How to open in browser:
                  </h3>

                  {/* Steps List */}
                  <div className="w-full space-y-5 text-left mb-8">
                    {/* Step 1 */}
                    <div className="flex gap-4 items-start p-3.5 bg-accent/30 rounded-xl border border-border/30">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center font-bold text-sm">
                        1
                      </span>
                      <div className="flex-1 text-sm text-foreground">
                        <span className="font-semibold block mb-0.5">Step 1</span>
                        {isIOS ? (
                          <>
                            Tap the <span className="font-semibold underline">three dots (···)</span> or the <span className="font-semibold underline">Share icon</span> in the top right or bottom menu.
                          </>
                        ) : (
                          <>
                            Tap the <span className="font-semibold underline">three dots (⋮)</span> in the top right corner.
                          </>
                        )}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start p-3.5 bg-accent/30 rounded-xl border border-border/30">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center font-bold text-sm">
                        2
                      </span>
                      <div className="flex-1 text-sm text-foreground">
                        <span className="font-semibold block mb-0.5">Step 2</span>
                        Tap <span className="font-semibold underline">Open in Browser</span> or <span className="font-semibold underline">Open in Chrome / Safari</span>.
                      </div>
                    </div>
                  </div>

                  {/* Menu helper diagram */}
                  <div className="w-full bg-accent/20 border border-dashed border-border/60 rounded-xl p-4 flex flex-col gap-2.5 items-center mb-8 relative overflow-hidden">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 select-none">
                      Visual Helper
                    </div>
                    <div className="flex items-center justify-between w-full max-w-[240px] px-3 py-1.5 bg-card border border-border/40 rounded-lg shadow-sm">
                      <span className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5 text-[#ee2a7b]" />
                        Open in Chrome / Safari
                      </span>
                      <span className="text-xs text-[#ee2a7b] font-semibold animate-pulse">
                        Tap here
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 py-5 rounded-xl border-border hover:bg-accent/40"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleContinue}
                      className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-5 rounded-xl transition-all duration-300"
                    >
                      Continue Here
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
