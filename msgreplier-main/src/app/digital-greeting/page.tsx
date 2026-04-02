"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Cake,
  Star,
  Send,
  PartyPopper,
  MousePointer2,
  Mail,
  Zap,
  Music,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

function GreetingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-rose-500/20 border border-rose-500/30 text-rose-400 p-1.5 rounded-lg">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">MsgReplier</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
          <Link href="/love-space" className="text-pink-400 font-bold hover:scale-105 transition-all flex items-center gap-1.5 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/20">
            <Heart className="h-4 w-4 fill-pink-400" /> Love Space
          </Link>
          <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link>

          <div className="relative">
            <button
              onClick={() => setShowTools(p => !p)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors focus:outline-none"
            >
              Tools <ChevronDown className="h-4 w-4" />
            </button>
            {showTools && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                {[
                  { label: "Digital Greeting", href: "/digital-greeting" },
                  { label: "FLAMES Calculator", href: "/flames" },
                  { label: "Shortcutpedia", href: "/shortcutpedia" },
                  { label: "Msg Prompt", href: "/prompt" },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowTools(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${pathname === item.href
                      ? "text-rose-400 bg-rose-500/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild size="sm" className="rounded-full bg-rose-500 hover:bg-rose-600 text-white border-0">
            <Link href="/digital-greeting/create">Create Card</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsOpen(p => !p)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950">
          <div className="container flex flex-col gap-3 p-4">
            {[
              { label: "Home", href: "/" },
              { label: "Love Space", href: "/love-space" },
              { label: "Blog", href: "/blog" },
              { label: "Digital Greeting", href: "/digital-greeting" },
              { label: "FLAMES Calculator", href: "/flames" },
              { label: "Shortcutpedia", href: "/shortcutpedia" },
              { label: "Msg Prompt", href: "/prompt" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium transition-colors ${pathname === item.href ? "text-rose-400" : "text-slate-400 hover:text-white"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="w-full mt-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white border-0">
              <Link href="/digital-greeting/create" onClick={() => setIsOpen(false)}>Create Card</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

const THEMES = [
  { id: "hearts", icon: "💗", color: "text-rose-500", label: "Romance" },
  { id: "stars", icon: "⭐", color: "text-yellow-500", label: "Birthday" },
  { id: "sakura", icon: "🌸", color: "text-pink-400", label: "Friendship" },
];

const NEW_FEATURES = [
  {
    title: "Your Own Wish Page",
    description: "Build a beautiful, personalized mini-website for your partner, friend, or family — no coding needed.",
    icon: <Music className="w-8 h-8 text-rose-500" />,
    preview: "🌐 Live Wish Website in Seconds"
  },
  {
    title: "Interactive Surprise",
    description: "Let them tap, scratch, or pop to reveal your heartfelt message — far more magical than a plain text.",
    icon: <Layers className="w-8 h-8 text-orange-500" />,
    preview: "✨ They'll Be Totally Surprised"
  },
  {
    title: "Share Instantly",
    description: "Get a unique link for your wish website. Share it on WhatsApp, Instagram, or anywhere — zero installs.",
    icon: <ImageIcon className="w-8 h-8 text-blue-500" />,
    preview: "🔗 One Link. Infinite Love."
  },
];

const TESTIMONIALS = [
  { name: "Riya", role: "Built for Her Boyfriend's Birthday", content: "He literally cried when he opened the website I made for him. This is the most special gift I've ever given." },
  { name: "Arjun", role: "Built for His Girlfriend's Anniversary", content: "I made a wish website instead of sending a boring text. She sent it to all her friends. So worth it!" },
  { name: "Sarah", role: "Built for Her Best Friend", content: "Takes 2 minutes to build and feels like a million dollars. My bestie was absolutely speechless." },
];

export default function ImmersiveWishesLanding() {
  const [activeTheme, setActiveTheme] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setActiveTheme((prev) => (prev + 1) % THEMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerMagic = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ec4899", "#f43f5e", "#fb7185"],
    });
  };

  return (
    <div className="relative min-h-[300vh] bg-slate-950 text-white overflow-x-hidden selection:bg-rose-500/30">
      <GreetingNavbar />

      {/* Dynamic Background */}
      <motion.div
        style={{ y: bgY }}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-rose-500/20 rounded-full blur-[80px] md:blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/10 rounded-full blur-[100px] md:blur-[120px]"
        />
      </motion.div>

      {/* Hero Section - Full Screen Immersive */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-6 z-10 overflow-hidden pt-16">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-4xl w-full text-center space-y-4 md:space-y-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Badge className="px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 text-rose-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] backdrop-blur-md">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-pulse" /> Build A Website For Your Loved One
            </Badge>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter leading-none px-2">
            <span className="block text-white">WISH THEM</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-orange-500 animate-gradient-x">ONLINE.</span>
          </h1>

          <p className="text-base md:text-3xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            Build a <span className="text-white italic">personal wish website</span> for your loved one in minutes — no code, no download, pure love.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4"
          >
            <Button
              asChild
              onClick={triggerMagic}
              className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
            >
              <Link href="/digital-greeting/create">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  BUILD THEIR WEBSITE <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </Button>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="hidden sm:flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm"
            >
              <div className="w-8 md:w-12 h-px bg-slate-800" />
              SEE HOW IT WORKS
              <div className="w-8 md:w-12 h-px bg-slate-800" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
        </motion.div>
      </section>

      {/* Interactive Showcase - Second Screen */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-6 z-10 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-8 md:space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-6"
            >
              <h2 className="text-4xl md:text-7xl font-black leading-none uppercase">
                A WEBSITE <span className="text-rose-500">JUST FOR THEM</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                Forget boring messages. Build a real wish website your loved one can open, tap, and feel your love through.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {NEW_FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-4 md:gap-6 group cursor-pointer hover:bg-white/10 transition-all`}
                >
                  <div className={`text-3xl md:text-5xl group-hover:scale-125 transition-transform shrink-0`}>
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold">{feature.title}</h3>
                    <p className="text-sm md:text-slate-500 font-medium line-clamp-2 md:line-clamp-none">{feature.description}</p>
                    <Badge variant="outline" className="text-[9px] md:text-[10px] text-rose-400 border-rose-500/30 uppercase tracking-[0.1em] md:tracking-[0.2em]">{feature.preview}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            {/* Interactive Mockup */}
            <motion.div
              whileHover={{ rotateY: 15, rotateX: -5 }}
              style={{ perspective: 1000 }}
              className="relative w-full aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] md:rounded-[3rem] p-0.5 md:p-1 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500/10 opacity-50" />
              <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12 space-y-6 md:space-y-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-16 md:w-24 h-16 md:h-24 bg-rose-500 rounded-full flex items-center justify-center text-3xl md:text-5xl shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                >
                  💝
                </motion.div>
                <div className="space-y-2">
                  <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">THEIR WEBSITE</h4>
                  <p className="text-rose-500 font-bold tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">LIVE WISH PAGE PREVIEW</p>
                </div>
                <div className="w-1/2 h-px bg-white/10" />
                <p className="text-sm md:text-slate-400 italic font-medium leading-relaxed">
                  "They open a real website — just for them — built by you with love."
                </p>
                <Button className="rounded-full px-8 md:px-10 h-12 md:h-14 bg-white text-slate-900 font-black hover:bg-rose-500 hover:text-white transition-colors text-sm md:text-base">
                  SEE EXAMPLE
                </Button>
              </div>
            </motion.div>

            {/* Floating UI */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -right-4 md:-right-10 top-1/4 p-4 md:p-6 bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] border border-white/20 shadow-2xl z-20"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <PartyPopper className="text-rose-500 w-6 h-6 md:w-8 md:h-8" />
                <div>
                  <p className="font-black text-xs md:text-sm">SHAREABLE LINK READY</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest">Send Anywhere</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 md:py-24 px-4 z-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12 md:text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-black mb-4">REAL PEOPLE <span className="text-rose-500">REAL LOVE</span></h2>
            <p className="text-slate-400 text-base md:text-lg">See what others built for their loved ones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md space-y-4"
              >
                <div className="flex gap-1 text-rose-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />)}
                </div>
                <p className="text-sm md:text-slate-300 italic">"{t.content}"</p>
                <div>
                  <p className="font-bold text-white text-sm md:text-base">{t.name}</p>
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Third Screen */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-6 z-10 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
          >
            <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none px-2">
              READY TO BUILD <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500">THEIR WEBSITE?</span>
            </h2>
            <p className="text-lg md:text-3xl text-slate-400 font-medium px-4">
              Build their wish website in 60 seconds. <br className="hidden md:block" />
              100% Free. Shared with a single link.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="px-4"
          >
            <Button
              asChild
              className="w-full sm:w-auto h-20 md:h-24 px-10 md:px-16 text-2xl md:text-3xl rounded-full bg-white text-slate-950 hover:bg-rose-500 hover:text-white shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:scale-110 active:scale-95 transition-all font-black group relative overflow-hidden"
            >
              <Link href="/digital-greeting/create">
                BUILD THEIR WEBSITE <ArrowRight className="ml-3 w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
          </motion.div>

          <div className="pt-10 md:pt-20">
            <Link href="/love-space" className="text-slate-600 hover:text-white transition-colors font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs flex items-center justify-center gap-2 md:gap-4">
              <div className="w-6 md:w-10 h-px bg-slate-800" />
              Or Try Love Space Rooms Together
              <div className="w-6 md:w-10 h-px bg-slate-800" />
            </Link>
          </div>
        </div>

        {/* Cinematic Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {isMounted && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 md:w-1 h-0.5 md:h-1 bg-white rounded-full opacity-20"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%"
              }}
              animate={{
                y: ["0%", "100%"],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </section>

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}
