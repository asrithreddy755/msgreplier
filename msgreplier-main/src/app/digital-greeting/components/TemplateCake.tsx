"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Heart,
  ChevronDown,
  Quote,
  Sparkles,
  Volume2,
  VolumeX,
  Cake as CakeIcon,
  PartyPopper,
  ArrowRight,
  Star,
  Infinity as InfinityIcon,
  Bird
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MUSIC_URLS = {
  romantic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  happy: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
};

// --- Interactive Cake Component ---
const InteractiveCake = ({ onComplete }: { onComplete: () => void }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isBlown, setIsBlown] = useState(false);

  const startCountdown = () => {
    if (countdown !== null || isBlown) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsBlown(true);
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 scale-[0.8] sm:scale-100 md:scale-125 transition-transform origin-center">
      <div className="relative">
        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              key="countdown"
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
              exit={{ scale: 3, opacity: 0, filter: "blur(10px)" }}
              className="absolute -top-32 md:-top-40 left-1/2 -translate-x-1/2 text-7xl md:text-9xl font-black text-pink-500 z-50 pointer-events-none drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]"
              style={{ fontFamily: 'var(--font-script)' }}
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D CSS Cake */}
        <motion.div
          className="relative w-64 md:w-72 h-72 md:h-80 cursor-pointer perspective-1000 mx-auto"
          whileHover={{ scale: 1.05, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={startCountdown}
        >
          {/* Cake Stand */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 md:w-80 h-3 md:h-4 bg-slate-200 rounded-full shadow-lg" />
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 w-14 md:w-20 h-6 md:h-8 bg-slate-100 rounded-t-lg" />

          {/* Bottom Layer */}
          <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 w-52 md:w-64 h-28 md:h-32 bg-rose-300 rounded-3xl shadow-xl border-b-8 border-rose-400">
            <div className="absolute top-4 w-full h-4 bg-white/30" />
            <div className="absolute bottom-4 w-full h-4 bg-white/30" />
          </div>

          {/* Middle Layer */}
          <div className="absolute bottom-32 md:bottom-36 left-1/2 -translate-x-1/2 w-36 md:w-48 h-20 md:h-24 bg-rose-200 rounded-2xl shadow-lg border-b-4 border-rose-300">
            <div className="absolute top-4 w-full h-2 bg-white/40" />
          </div>

          {/* Top Layer */}
          <div className="absolute bottom-48 md:bottom-56 left-1/2 -translate-x-1/2 w-24 md:w-32 h-16 md:h-20 bg-rose-100 rounded-xl shadow-md border-b-2 border-rose-200" />

          {/* Frosting Drips */}
          <div className="absolute bottom-[225px] md:bottom-[260px] left-1/2 -translate-x-1/2 w-24 md:w-32 flex justify-around px-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-5 md:w-8 h-8 md:h-10 bg-white rounded-full -mt-4 border-b-2 border-pink-50 shadow-sm" />
            ))}
          </div>

          {/* Strawberries/Toppings */}
          <div className="absolute bottom-[240px] md:bottom-[275px] left-1/2 -translate-x-1/2 flex gap-1 md:gap-2">
            <div className="w-4 md:w-6 h-4 md:h-6 bg-red-500 rounded-full shadow-inner" />
            <div className="w-4 md:w-6 h-4 md:h-6 bg-red-500 rounded-full shadow-inner -mt-1 md:-mt-2" />
            <div className="w-4 md:w-6 h-4 md:h-6 bg-red-500 rounded-full shadow-inner" />
          </div>

          {/* Candle */}
          {!isBlown && (
            <motion.div
              className="absolute bottom-[290px] md:bottom-[330px] left-1/2 -translate-x-1/2 w-2 md:w-3 h-10 md:h-16 bg-gradient-to-b from-yellow-200 via-blue-200 to-yellow-300 rounded-full shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Wick */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 md:h-3 bg-slate-800" />

              {/* Flame */}
              <motion.div
                className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 w-5 md:w-8 h-8 md:h-12 bg-gradient-to-t from-orange-600 via-yellow-400 to-transparent rounded-full blur-[1px] shadow-[0_0_30px_#f97316]"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [-8, 8, -8],
                  opacity: [0.9, 1, 0.9],
                  y: [0, -2, 0]
                }}
                transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
              >
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 md:w-4 h-4 md:h-6 bg-white/40 rounded-full blur-sm" />
              </motion.div>
            </motion.div>
          )}

          {/* Smoke when blown */}
          {isBlown && (
            <motion.div
              className="absolute bottom-[310px] md:bottom-[350px] left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                y: -100,
                x: [0, 20, -20, 0],
                scale: [1, 2, 3]
              }}
              transition={{ duration: 3 }}
            >
              <div className="w-5 md:w-8 h-5 md:h-8 bg-slate-400/30 rounded-full blur-xl" />
              <div className="w-3 md:w-6 h-3 md:h-6 bg-slate-300/20 rounded-full blur-lg -mt-4" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {!isBlown && countdown === null && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-pink-500 font-black tracking-[0.2em] text-[10px] md:text-sm uppercase flex items-center gap-2 px-4 text-center">
            <CakeIcon className="w-3 h-3 md:w-4 md:h-4 shrink-0" /> Tap to light your wishes <CakeIcon className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
          </p>
          <div className="w-16 md:w-20 h-1 bg-pink-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-pink-500"
              animate={{ x: [-80, 80] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export interface GreetingData {
  occasion?: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  music_id?: string;
}

export default function TemplateCake({ greeting, isPreview = false }: { greeting: GreetingData; isPreview?: boolean }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isCelebrationStarted, setIsCelebrationStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cakeSectionRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for parallax and heart trail
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heartTrail, setHeartTrail] = useState<{ id: number; x: number; y: number; size: number; rotation: number; color: string }[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const spawnHeart = (x: number, y: number) => {
      const threshold = window.innerWidth < 768 ? 0.85 : 0.7; // Spawn less hearts on mobile
      if (Math.random() > threshold) {
        const id = Date.now() + Math.random();
        const colors = ["#fb7185", "#ec4899", "#f43f5e", "#fda4af"];
        const sizeBase = window.innerWidth < 768 ? 20 : 30;
        const sizeRange = window.innerWidth < 768 ? 30 : 40;
        const newHeart = {
          id,
          x,
          y,
          size: Math.random() * sizeRange + sizeBase,
          rotation: Math.random() * 360 - 180,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
        setHeartTrail(prev => [...prev.slice(window.innerWidth < 768 ? -10 : -20), newHeart]);
        setTimeout(() => {
          setHeartTrail(prev => prev.filter(h => h.id !== id));
        }, 1200);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      spawnHeart(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      setMousePos({ x: touch.clientX, y: touch.clientY });
      spawnHeart(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isPreview) return; // Don't autoplay music in creation preview by default
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(() => setIsMuted(true));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isMuted, isPreview]);

  const onCakeBlown = () => {
    setIsCelebrationStarted(true);
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#ec4899", "#f43f5e", "#fb7185", "#ffffff"],
    });
  };

  const scrollToCake = () => {
    cakeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!isPreview) {
      setIsMuted(false);
    }
  };

  const hasMusic = greeting.music_id && greeting.music_id !== 'none';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 overflow-x-hidden selection:bg-pink-100 selection:text-pink-600">

      {/* --- High-End Couple Friendly Animated Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Heart Trail cursor effect - Cinematic and Huge */}
        <AnimatePresence>
          {heartTrail.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{
                opacity: 0,
                scale: 0.2,
                rotate: heart.rotation,
                x: heart.x - (heart.size / 2),
                y: heart.y - (heart.size / 2)
              }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.5, 2.5, 4], // Huge scaling effect
                y: heart.y - 250 - Math.random() * 100, // Float high
                x: heart.x + (Math.random() * 100 - 50), // Random drift
                rotate: heart.rotation + 90
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="fixed pointer-events-none z-50"
              style={{ color: heart.color }}
            >
              <Heart fill="currentColor" size={heart.size} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Animated Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50" />

        {/* Dynamic Glowing Blobs with slight mouse reaction */}
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-pink-300/20 rounded-full blur-[120px]"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, 30, 50, 0],
            scale: [1, 1.1, 0.9, 1],
            translateX: (mousePos.x - 500) / 20,
            translateY: (mousePos.y - 500) / 20
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-rose-200/30 rounded-full blur-[100px]"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 60, -20, 0],
            scale: [1, 0.9, 1.2, 1],
            translateX: (mousePos.x - 500) / -15,
            translateY: (mousePos.y - 500) / -15
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-[10%] left-[20%] w-[70%] h-[60%] bg-purple-100/20 rounded-full blur-[140px]"
          animate={{
            x: [0, 30, -50, 0],
            y: [0, -40, 20, 0],
            translateX: (mousePos.x - 500) / 25,
            translateY: (mousePos.y - 500) / 25
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Elements (Couple Themed) with Parallax */}
        {[...Array(isMobile ? 12 : 24)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400/20"
            initial={{
              x: Math.random() * 100 + "%",
              y: "110%",
              rotate: 0,
              scale: Math.random() * 0.5 + 0.3
            }}
            animate={{
              y: "-10%",
              rotate: 360,
              x: (Math.random() * 100 - 10) + "%",
              translateX: (mousePos.x - 500) / (10 + (i % 5) * 5), // Varying parallax intensity
              translateY: (mousePos.y - 500) / (10 + (i % 5) * 5)
            }}
            transition={{
              y: { duration: Math.random() * 25 + 20, repeat: Infinity, ease: "linear", delay: Math.random() * 15 },
              rotate: { duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" },
              translateX: { type: "spring", damping: 10, stiffness: 50 },
              translateY: { type: "spring", damping: 10, stiffness: 50 }
            }}
          >
            {i % 6 === 0 ? <Heart size={Math.random() * (isMobile ? 30 : 40) + 15} fill="currentColor" /> :
              i % 6 === 1 ? <Star size={Math.random() * (isMobile ? 25 : 30) + 10} fill="currentColor" className="text-yellow-200/40" /> :
                i % 6 === 2 ? <InfinityIcon size={Math.random() * (isMobile ? 30 : 35) + 15} className="text-pink-300/40" /> :
                  i % 6 === 3 ? <div className="flex gap-1 text-2xl filter grayscale opacity-40"><Bird size={isMobile ? 16 : 20} /> <Bird size={isMobile ? 16 : 20} className="scale-x-[-1]" /></div> :
                    i % 6 === 4 ? <div className="text-3xl md:text-4xl filter grayscale opacity-40">🎈</div> :
                      <Sparkles size={Math.random() * (isMobile ? 15 : 20) + 8} className="text-rose-300" />}
          </motion.div>
        ))}

        {/* Soft Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Audio Element */}
      {!isPreview && hasMusic && (
        <audio
          ref={audioRef}
          src={MUSIC_URLS[greeting.music_id as keyof typeof MUSIC_URLS]}
          loop
        />
      )}

      {/* Music Toggle */}
      {!isPreview && hasMusic && (
        <div className="fixed top-6 right-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-md border border-pink-100 rounded-full w-12 h-12 text-pink-500 hover:bg-pink-50 shadow-lg"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-6 text-center z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="space-y-6 md:space-y-10 w-full max-w-4xl"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 md:w-20 md:h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto shadow-inner"
          >
            <Heart className="text-pink-500 fill-pink-500 w-8 h-8 md:w-10 md:h-10" />
          </motion.div>

          <div className="space-y-2 md:space-y-4 px-2">
            <motion.h1
              className="text-[clamp(2.5rem,10vw,4rem)] sm:text-6xl md:text-9xl text-pink-500 leading-[1.2] md:leading-tight"
              style={{ fontFamily: 'var(--font-script)' }}
            >
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-block"
              >
                Happy {greeting.occasion || "Birthday"},
              </motion.span>
              <br />
              <motion.span
                initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  delay: 0.6,
                  duration: 1,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-rose-600 drop-shadow-[0_5px_5px_rgba(225,29,72,0.2)] md:drop-shadow-[0_10px_10px_rgba(225,29,72,0.2)] inline-block relative pb-2 px-2"
              >
                {greeting.recipient_name}!
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 md:h-2 bg-pink-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.5, duration: 1 }}
                />
              </motion.span>
            </motion.h1>
          </div>

          <p className="text-base md:text-3xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium italic px-6">
            "Every moment with you is a gift I cherish."
          </p>

          <div className="pt-4 px-4">
            <Button
              onClick={scrollToCake}
              className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-14 text-lg md:text-xl rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-2xl shadow-pink-300 transition-all active:scale-95 font-black group border-4 border-white"
            >
              OPEN YOUR GIFT <ChevronDown className="ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-2 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* --- Interactive Cake Section (Replaces Gallery) --- */}
      <section ref={cakeSectionRef} className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 z-10">
        <div className="container max-w-4xl mx-auto text-center space-y-20">
          <AnimatePresence mode="wait">
            {!isCelebrationStarted ? (
              <motion.div
                key="cake-reveal"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl text-pink-500" style={{ fontFamily: 'var(--font-script)' }}>
                    {greeting.occasion === "Anniversary" ? "Celebrate Our Love..." : "Make a Wish..."}
                  </h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">Something special is waiting</p>
                </div>

                <InteractiveCake onComplete={onCakeBlown} />
              </motion.div>
            ) : (
              <motion.div
                key="celebration-reveal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-16"
              >
                <motion.div
                  className="space-y-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <h2 className="text-6xl md:text-8xl text-rose-600 font-black tracking-tighter uppercase leading-none">
                    {greeting.occasion === "Anniversary" ? "OUR LOVE IS" : "YOU ARE THE"} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                      {greeting.occasion === "Anniversary" ? "INFINITE & BEYOND" : "BRIGHTEST STAR"}
                    </span>
                  </h2>
                  <div className="flex justify-center gap-6">
                    <PartyPopper className="text-pink-500 w-12 h-12" />
                    <Sparkles className="text-yellow-400 w-12 h-12" />
                    <PartyPopper className="text-pink-500 w-12 h-12" />
                  </div>
                </motion.div>

                {/* Heartfelt Message Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/60 backdrop-blur-2xl p-6 md:p-20 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 md:border-4 border-white text-center space-y-6 md:space-y-10 relative overflow-hidden mx-auto max-w-[95%] md:max-w-none"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
                  <Quote className="w-8 h-8 md:w-16 md:h-16 text-pink-200 mx-auto opacity-40" />

                  <div className="space-y-2 md:space-y-4">
                    <h2 className="text-3xl md:text-7xl text-pink-500" style={{ fontFamily: 'var(--font-script)' }}>
                      A Message for You
                    </h2>
                  </div>

                  <p className="text-lg md:text-4xl text-slate-700 leading-relaxed md:leading-tight italic whitespace-pre-wrap font-medium px-2 md:px-10">
                    {greeting.message}
                  </p>

                  <div className="flex flex-col items-center gap-4 md:gap-8 pt-8 md:pt-12 border-t border-pink-50/50">
                    <div className="space-y-2">
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs">With all my love,</p>
                      <p className="text-2xl md:text-5xl font-black text-rose-600 tracking-tighter uppercase leading-none">{greeting.sender_name}</p>
                    </div>
                    <div className="flex gap-4 md:gap-6">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <Heart className="text-pink-400 fill-pink-400 w-5 h-5 md:w-8 md:h-8" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Footer */}
      {!isPreview && (
        <section className="relative py-32 px-4 text-center space-y-12 z-10">
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Want to reply?</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">Create a private space just for the two of you.</p>
          </div>

          <Button asChild size="lg" className="h-20 px-16 text-2xl rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-200 border-4 border-white active:scale-95 font-black transition-all">
            <Link href="/love-space">
              ENTER LOVE SPACE <ArrowRight className="ml-3 w-8 h-8" />
            </Link>
          </Button>

          <div className="pt-20">
            <Link href="/digital-greeting" className="text-pink-400 hover:text-pink-600 text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4" /> Create Your Own Surprise <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Global Script Font Styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
        :root {
          --font-script: 'Dancing Script', cursive;
        }
      `}</style>
    </div>
  );
}
