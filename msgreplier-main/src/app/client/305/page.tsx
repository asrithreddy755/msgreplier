"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Key, AlertCircle } from "lucide-react";

type StepType = "locked" | "q1" | "q2" | "no1" | "no2" | "no3" | "success" | "wishes";

const gifsToPreload = [
  "/templates/template_wishes8/kitty.gif",
  "/templates/template_wishes9/gifs/first.gif",
  "/templates/template_propose_crush1/manja.gif",
  "/templates/template_propose_crush1/no1.gif",
  "/templates/template_propose_crush1/no2.gif",
  "/templates/template_propose_crush1/no3.gif",
  "/templates/template_propose_crush1/yes.gif"
];

export default function ClientGreetingWebsite() {
  const [src, setSrc] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<StepType>("locked");
  const [error, setError] = useState("");
  const [shouldShake, setShouldShake] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);

  // Position styles for runaway buttons
  const [q1YesPos, setQ1YesPos] = useState<React.CSSProperties>({});
  const [noButtonPos, setNoButtonPos] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
    const search = typeof window !== "undefined" ? window.location.search : "";
    setSrc(`/templates/template_client/index.html${search}`);

    // Preload all gifs
    let loadedCount = 0;
    const timeout = setTimeout(() => {
      setIsPreloading(false);
    }, 3500); // 3.5s max wait fallback

    const handleLoad = () => {
      loadedCount++;
      if (loadedCount === gifsToPreload.length) {
        clearTimeout(timeout);
        setIsPreloading(false);
      }
    };

    gifsToPreload.forEach((gifPath) => {
      const img = new Image();
      img.src = gifPath;
      img.onload = handleLoad;
      img.onerror = handleLoad;
    });

    return () => clearTimeout(timeout);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.trim().toLowerCase() === "shrn 11:11") {
      setIsUnlocking(true);
      setTimeout(() => {
        setIsUnlocking(false);
        setStep("q1");
      }, 850);
    } else {
      setShouldShake(true);
      setError("Oops! That's not the correct key 🥺 Try again!");
      setPassword("");
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const moveQ1Yes = () => {
    const randomX = Math.floor(Math.random() * 80 + 10); // 10% to 90%
    const randomY = Math.floor(Math.random() * 45 + 15); // 15% to 60% (excludes bottom center buttons)
    setQ1YesPos({
      position: "absolute",
      top: `${randomY}%`,
      left: `${randomX}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 50,
      transition: "none",
    });
  };

  const moveNoButton = () => {
    const randomX = Math.floor(Math.random() * 80 + 10); // 10% to 90%
    const randomY = Math.floor(Math.random() * 45 + 15); // 15% to 60% (excludes bottom center buttons)
    setNoButtonPos({
      position: "absolute",
      top: `${randomY}%`,
      left: `${randomX}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 50,
      transition: "none",
    });
  };

  if (step === "wishes") {
    return (
      <iframe
        src={src}
        className="w-full h-screen border-none overflow-hidden"
        style={{ display: "block", width: "100%", height: "100vh" }}
        allow="microphone; autoplay; clipboard-write"
      />
    );
  }

  if (isPreloading && mounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-pink-50 via-rose-100 to-pink-100 relative overflow-hidden font-sans select-none">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <Heart className="w-16 h-16 text-pink-500 fill-pink-300 filter drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
        </motion.div>
        <p className="mt-4 text-pink-600 font-black uppercase tracking-widest text-xs">Delivering Love...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-pink-50 via-rose-100 to-pink-100 relative overflow-hidden font-sans select-none">
      {/* Floating Bubbles / Hearts Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {mounted && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-pink-300"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* LOCK SCREEN */}
        {step === "locked" && !isUnlocking && (
          <motion.div
            key="locked"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: shouldShake ? [0, -10, 10, -10, 10, -5, 5, 0] : 0 
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: shouldShake ? 0.5 : 0.4,
              ease: shouldShake ? "linear" : "easeOut",
            }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_wishes8/kitty.gif"
                  alt="Cute Cat Character"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-6">
                <Lock className="w-5 h-5 text-pink-500 fill-pink-100 animate-pulse" />
                <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
                  Locked with Love
                </h1>
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-beat" />
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter the secret key..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pl-12 rounded-full border-2 border-pink-200 focus:border-pink-500 bg-white/90 text-center font-semibold text-rose-700 placeholder-pink-300 focus:outline-none transition-all duration-300 shadow-sm focus:shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">
                    <Key className="w-5 h-5" />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1 text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 rounded-xl py-2 px-3"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_6px_20px_rgba(244,63,94,0.3)] transition-all duration-300 tracking-wider uppercase text-sm"
                >
                  Unlock Surprise 💝
                </motion.button>
              </form>

              <span className="text-[10px] text-pink-400 mt-6 font-semibold tracking-widest uppercase">
                Hint: It's our special time ✨
              </span>
            </div>
          </motion.div>
        )}

        {/* UNLOCKING LOADER */}
        {isUnlocking && (
          <motion.div
            key="unlocking"
            className="z-20 absolute flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-20 h-20 text-pink-500 fill-pink-400 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]" />
            </motion.div>
            <p className="mt-4 text-pink-600 font-black uppercase tracking-widest text-sm animate-pulse">
              Unlocking Love...
            </p>
          </motion.div>
        )}

        {/* QUESTION 1: Do u have a brain? */}
        {step === "q1" && (
          <motion.div
            key="q1"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_wishes9/gifs/first.gif"
                  alt="Thinking Kitty"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight mb-2">
                Do u have a brain? 🧠
              </h2>
              <p className="text-xs text-rose-400 font-bold mb-6">Let's start with a quick test...</p>

              <div className="w-full h-24 flex items-center justify-center gap-4">
                <motion.button
                  style={q1YesPos}
                  onMouseEnter={moveQ1Yes}
                  onTouchStart={moveQ1Yes}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.2)] text-sm tracking-wider uppercase"
                >
                  Yes
                </motion.button>
                <button
                  onClick={() => setStep("q2")}
                  className="px-8 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black rounded-full text-sm tracking-wider uppercase transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* QUESTION 2: Will u be my Girlfriend? */}
        {step === "q2" && (
          <motion.div
            key="q2"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_propose_crush1/manja.gif"
                  alt="Cute Love Propose GIF"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight mb-2">
                Will u be my Girlfriend? 👀
              </h2>
              <p className="text-xs text-rose-400 font-bold mb-6">Priya Mareddy, Charan Tej is all yours 💖</p>

              <div className="w-full flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setStep("success")}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.2)] text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
                >
                  Yes
                </button>
                <button
                  onClick={() => setStep("no1")}
                  className="px-8 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black rounded-full text-sm tracking-wider uppercase transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* DENIAL STEP 1 */}
        {step === "no1" && (
          <motion.div
            key="no1"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_propose_crush1/no1.gif"
                  alt="Cute Sad GIF"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight mb-2">
                Please think again, Priya! 🙄
              </h2>
              <p className="text-xs text-rose-400 font-bold mb-6">Don't say no so quickly! 😥</p>

              <div className="w-full flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setStep("success")}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.2)] text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
                >
                  Yes
                </button>
                <button
                  onClick={() => setStep("no2")}
                  className="px-8 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black rounded-full text-sm tracking-wider uppercase transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* DENIAL STEP 2 */}
        {step === "no2" && (
          <motion.div
            key="no2"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_propose_crush1/no2.gif"
                  alt="Cute Forgive Me GIF"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight mb-2">
                Think about it one more time! 😣
              </h2>
              <p className="text-xs text-rose-400 font-bold mb-6">Why are you doing this? Please say yes! 😣</p>

              <div className="w-full flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setStep("success")}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.2)] text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setStep("no3");
                    setNoButtonPos({}); // Reset position for next runaway button
                  }}
                  className="px-8 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black rounded-full text-sm tracking-wider uppercase transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* DENIAL STEP 3 */}
        {step === "no3" && (
          <motion.div
            key="no3"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_propose_crush1/no3.gif"
                  alt="Cute Crying GIF"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight mb-2">
                Please say yes, Priya! 😭
              </h2>
              <p className="text-xs text-rose-400 font-bold mb-6">I made this page with a lot of effort! This is really not fair! 😭</p>

              <div className="w-full h-24 flex items-center justify-center gap-4">
                <button
                  onClick={() => setStep("success")}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.2)] text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
                >
                  Yes
                </button>
                <motion.button
                  style={noButtonPos}
                  onMouseEnter={moveNoButton}
                  onTouchStart={moveNoButton}
                  className="px-8 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black rounded-full text-sm tracking-wider uppercase shadow-[0_4px_12px_rgba(244,63,94,0.1)]"
                >
                  No
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUCCESS PAGE */}
        {step === "success" && (
          <motion.div
            key="success"
            className="z-10 w-full max-w-md px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-pink-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-200 shadow-inner flex items-center justify-center mb-6 relative">
                <img
                  src="/templates/template_propose_crush1/yes.gif"
                  alt="Cute Hugging Cats GIF"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight mb-2">
                I knew it! 💗
              </h2>
              <p className="text-xs text-rose-500 font-bold mb-6">I love you so much, Priya Mareddy! 💗</p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep("wishes")}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black rounded-full shadow-[0_6px_20px_rgba(244,63,94,0.3)] transition-all duration-300 tracking-wider uppercase text-sm animate-pulse"
              >
                Open My Birthday Wishes! 🎁
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-beat {
          animation: beat 1s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
