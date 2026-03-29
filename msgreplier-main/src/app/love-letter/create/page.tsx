"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Gem, 
  Users,
  User,
  Share2,
  Copy,
  Check,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

const RELATIONSHIPS = [
  { label: "Lover 💕", value: "Lover" },
  { label: "Best Friend 🌟", value: "Best Friend" },
  { label: "Family 👨‍👩‍👧", value: "Family" },
  { label: "Other 🎉", value: "Other" },
];

const OCCASIONS = [
  { label: "Birthday 🎂", value: "Birthday" },
  { label: "Anniversary 💍", value: "Anniversary" },
  { label: "Just Because 🌸", value: "Just Because" },
  { label: "Custom ✨", value: "Custom" },
];

const THEMES = [
  { id: "hearts", name: "Hearts 💗", icon: "💗", bg: "from-pink-100 to-rose-200" },
  { id: "roses", name: "Roses 🌹", icon: "🌹", bg: "from-red-100 to-rose-200" },
  { id: "stars", name: "Stars ⭐", icon: "⭐", bg: "from-blue-100 to-indigo-200" },
  { id: "sakura", name: "Sakura 🌸", icon: "🌸", bg: "from-pink-50 to-pink-100" },
];

const AVATARS = ["💌", "💝", "💖", "✨", "🌸", "🦋", "🌈"];

export default function LoveLetterCreate() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipient_name: "",
    relationship: "Lover",
    occasion: "Birthday",
    custom_occasion: "",
    message: "",
    theme: "hearts",
    sender_name: "",
    sender_avatar: "💌",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/digital-greeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          occasion: formData.occasion === "Custom" ? formData.custom_occasion : formData.occasion,
        }),
      });

      const data = await response.json();
      if (data.slug) {
        setSlug(data.slug);
        setStep(4);
        toast.success("Greeting generated successfully! ✨");
      } else {
        toast.error("Failed to generate link. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/greet/${slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `I have a surprise for you! 💝 Open it here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-8 px-4 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-rose-600 flex items-center justify-center gap-2">
            Love Letter <Heart className="fill-rose-500 text-rose-500" />
          </h1>
          <p className="text-rose-400">Create a surprise for someone special</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-rose-400">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-rose-100" />
        </div>

        <Card className="border-rose-100 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-rose-500" /> Who is this for?
                    </h2>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Recipient's Name</label>
                      <Input 
                        placeholder="e.g. Sarah" 
                        value={formData.recipient_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, recipient_name: e.target.value})}
                        className="border-rose-100 focus-visible:ring-rose-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Relationship</label>
                      <div className="grid grid-cols-2 gap-2">
                        {RELATIONSHIPS.map((rel) => (
                          <Button
                            key={rel.value}
                            variant={formData.relationship === rel.value ? "default" : "outline"}
                            className={`justify-start ${formData.relationship === rel.value ? 'bg-rose-500 hover:bg-rose-600' : 'border-rose-100 text-slate-600'}`}
                            onClick={() => setFormData({...formData, relationship: rel.value})}
                          >
                            {rel.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Occasion</label>
                      <div className="grid grid-cols-2 gap-2">
                        {OCCASIONS.map((occ) => (
                          <Button
                            key={occ.value}
                            variant={formData.occasion === occ.value ? "default" : "outline"}
                            className={`justify-start ${formData.occasion === occ.value ? 'bg-rose-500 hover:bg-rose-600' : 'border-rose-100 text-slate-600'}`}
                            onClick={() => setFormData({...formData, occasion: occ.value})}
                          >
                            {occ.label}
                          </Button>
                        ))}
                      </div>
                      {formData.occasion === "Custom" && (
                        <Input 
                          placeholder="What's the occasion?" 
                          value={formData.custom_occasion}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, custom_occasion: e.target.value})}
                          className="mt-2 border-rose-100 focus-visible:ring-rose-400"
                        />
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                    onClick={nextStep}
                    disabled={!formData.recipient_name}
                  >
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" /> Write your heart out
                    </h2>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-600">Personal Note</label>
                        <span className={`text-xs ${formData.message.length > 450 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {formData.message.length}/500
                        </span>
                      </div>
                      <Textarea 
                        placeholder="Write something sweet..." 
                        className="min-h-[150px] border-rose-100 focus-visible:ring-rose-400"
                        maxLength={500}
                        value={formData.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Background Theme</label>
                      <div className="grid grid-cols-2 gap-2">
                        {THEMES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setFormData({...formData, theme: t.id})}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                              formData.theme === t.id 
                                ? 'border-rose-500 bg-rose-50 shadow-sm' 
                                : 'border-slate-100 hover:border-rose-200'
                            }`}
                          >
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-sm font-medium text-slate-700">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-rose-100" onClick={prevStep}>
                      <ChevronLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      className="flex-[2] bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                      onClick={nextStep}
                      disabled={!formData.message}
                    >
                      Next Step <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-rose-500" /> Your details
                    </h2>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Your Name (Sender)</label>
                      <Input 
                        placeholder="e.g. Michael" 
                        value={formData.sender_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, sender_name: e.target.value})}
                        className="border-rose-100 focus-visible:ring-rose-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Pick an Avatar</label>
                      <div className="flex flex-wrap gap-3">
                        {AVATARS.map((avatar) => (
                          <button
                            key={avatar}
                            onClick={() => setFormData({...formData, sender_avatar: avatar})}
                            className={`w-12 h-12 flex items-center justify-center text-2xl rounded-full transition-all ${
                              formData.sender_avatar === avatar 
                                ? 'bg-rose-100 ring-2 ring-rose-400 scale-110' 
                                : 'bg-slate-50 hover:bg-rose-50'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-rose-100" onClick={prevStep}>
                      <ChevronLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      className="flex-[2] bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                      onClick={handleGenerate}
                      disabled={!formData.sender_name || isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Preview"} <Sparkles className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-rose-500" /> Share the Love
                    </h2>

                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Preview</span>
                        <Badge variant="secondary" className="bg-rose-100 text-rose-600">
                          {formData.occasion === "Custom" ? formData.custom_occasion : formData.occasion}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-500">To: <span className="text-slate-800 font-semibold">{formData.recipient_name}</span></p>
                        <p className="text-sm text-slate-700 italic line-clamp-2">"{formData.message}"</p>
                        <p className="text-sm text-slate-500">From: <span className="text-slate-800 font-semibold">{formData.sender_avatar} {formData.sender_name}</span></p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Shareable Link</label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={shareUrl}
                          className="bg-slate-50 border-rose-100"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="shrink-0 border-rose-100 text-rose-500"
                          onClick={copyLink}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={shareWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </Button>
                      <Button 
                        variant="outline"
                        asChild
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <Link href={shareUrl} target="_blank">
                          Open Preview
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-rose-100">
                    <Button 
                      variant="ghost" 
                      className="w-full text-rose-400 hover:text-rose-500 hover:bg-rose-50"
                      onClick={() => {
                        setStep(1);
                        setSlug("");
                      }}
                    >
                      Create Another One
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            href="/love-space" 
            className="text-sm text-rose-400 hover:text-rose-500 flex items-center justify-center gap-1 transition-colors"
          >
            Also check out Love Space <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
