"use client";

import { motion } from "framer-motion";
import { Heart, Gift, Sparkles, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DigitalGreetingBlog() {
  return (
    <div className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `\n        h1, h2, h3, h4, h5, h6, .font-heading {\n          font-family: \'Unbounded\', sans-serif !important;\n        }\n      `}} />
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        {/* Header */}
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-500 text-sm font-bold uppercase tracking-widest"
          >
            <Sparkles size={16} /> New Feature
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-tight"
          >
            How to Create a <span className="text-rose-600">Website for Wishes</span> in Seconds
          </motion.h1>
          <div className="flex items-center justify-center gap-6 text-slate-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Clock size={16} /> 4 min read
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-400" /> By MsgReplier Team
            </div>
          </div>
        </div>

        {/* Hero Image / Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="aspect-video bg-gradient-to-br from-rose-100 to-pink-200 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="text-9xl z-10"
          >
            🎁
          </motion.div>
          <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 text-white font-bold text-center">
            Create an Interactive Experience They'll Never Forget
          </div>
        </motion.div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none space-y-8 text-slate-600 leading-relaxed">
          <p className="text-xl text-slate-900 font-medium">
            Gone are the days of simple text messages and static images. In 2024, the best way to celebrate your special someone is by giving them a dedicated digital space.
          </p>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">What is a Digital Greeting?</h2>
          <p>
            A Digital Greeting is more than just a card—it's a mini-website designed specifically for your recipient. Whether it's a <strong>Birthday</strong> or an <strong>Anniversary</strong>, MsgReplier allows you to build an immersive experience featuring 3D animations, background music, and a "magical" reveal that feels like opening a real gift.
          </p>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Why Create a Website for Wishes?</h2>
          <ul className="space-y-4 list-none pl-0">
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <strong>Interactive 3D Cake:</strong> Your recipient can literally "blow" the candles on a 3D CSS cake to reveal your hidden message.
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <strong>Cinematic Reveal:</strong> Staggered typography and confetti celebrations make the "Happy Birthday" or "Happy Anniversary" moment feel like a movie.
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <strong>Background Music:</strong> Set the mood with Romantic Piano, Chill Lofi, or Happy Vibes that play as they explore your gift.
              </div>
            </li>
          </ul>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">How to Get Started</h2>
          <p>
            Creating your own is incredibly easy and takes less than 60 seconds:
          </p>
          <ol className="space-y-4 list-decimal pl-6">
            <li>Head over to the <Link href="/digital-greeting/create" className="text-rose-500 font-bold hover:underline">Digital Greeting Creator</Link>.</li>
            <li>Enter the recipient's name and choose the occasion (Birthday or Anniversary).</li>
            <li>Write a heartfelt message (or use our <strong>Magic Dice</strong> to generate one instantly!).</li>
            <li>Select your favorite background track and generate your unique link.</li>
          </ol>

          <div className="p-8 bg-rose-50 rounded-[2rem] border-2 border-rose-100 text-center space-y-6">
            <h3 className="text-2xl font-black text-rose-600 uppercase tracking-tighter">Ready to Surprise Them?</h3>
            <p className="text-slate-600 font-medium">Create a custom wishes website today for free. No login required.</p>
            <Button asChild size="lg" className="h-16 px-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black text-lg shadow-xl shadow-rose-200 group">
              <Link href="/digital-greeting/create">
                CREATE MAGIC NOW <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">✍️</div>
            <div>
              <p className="font-bold text-slate-900">MsgReplier Team</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Digital Experience Creators</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full px-6 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold">
              Share Article
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
