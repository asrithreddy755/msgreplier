"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Users,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Music,
  Dice5,
  Eye,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import birthdayMessages from "./birthday_messages.json";
import anniversaryMessages from "./anniversary_messages.json";
import TemplateCake from "../components/TemplateCake";
import TemplateAurora from "../components/TemplateAurora";

const OCCASIONS = [
  { label: "Birthday 🎂", value: "Birthday" },
  { label: "Anniversary 💍", value: "Anniversary" },
];

const TEMPLATES = [
  { 
    id: "aurora", 
    label: "Cham 3D Cake ✨", 
    description: "WebGL floating 3D hearts, celebration music, and interactive candles that the receiver can blow out using their microphone!", 
    icon: "✨",
    recommended: true
  },
  { 
    id: "hearts", 
    label: "Cake Surprise 🎂", 
    description: "Interactive cake blowing with standard text greeting page.", 
    icon: "🎂" 
  },
];

export default function DigitalGreetingCreate() {
  const [step, setStep] = useState(1);

  // Force light theme at the root element level for this page only
  // This avoids changing the global 'next-themes' state which persists to other pages
  useEffect(() => {
    // Add light class to body to override dark mode
    const body = document.body;
    const originalBodyClass = body.className;
    
    // We want to force light colors for everything inside this page
    body.classList.add('light-mode-forced');
    
    return () => {
      body.classList.remove('light-mode-forced');
    };
  }, []);

  const [formData, setFormData] = useState({
    recipient_name: "",
    relationship: "Lover",
    occasion: "Birthday",
    message: "",
    theme: "aurora",
    sender_name: "",
    sender_avatar: "💌",
    photo_url: "",
    music_id: "none",
    reveal_type: "envelope",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const generateRandomMessage = () => {
    const messages = formData.occasion === "Anniversary" ? anniversaryMessages : birthdayMessages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    setFormData({ ...formData, message: messages[randomIndex] });
    toast.success(`Random ${formData.occasion} message generated! ✨`);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/digital-greeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const shareUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/greet/${slug}` : "";

  const copyLink = () => {
    if (!shareUrl) return;
    const text = `I've created a special digital surprise just for you! 💝 This link is very important—it contains a personal celebration I built for you. Open it here: ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Message with link copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!shareUrl) return;
    const text = `I've created a special digital surprise just for you! 💝 This link is very important—it contains a personal celebration I built for you. Open it here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 pt-2 pb-6 md:py-8 px-4 font-sans text-slate-900 overflow-x-hidden light theme-light" style={{ colorScheme: 'light' }}>
      <div className="max-w-md mx-auto space-y-4 md:space-y-8">
        <div className="text-center space-y-1 md:space-y-2">
          <h1 className="text-xl md:text-3xl font-bold text-rose-600 flex items-center justify-center gap-2">
            Wishes Website <Heart className="fill-rose-500 text-rose-500 w-5 h-5 md:w-6 md:h-6" />
          </h1>
          <p className="text-sm md:text-base text-rose-400">Create a magical surprise for someone special</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] md:text-xs font-medium text-rose-400">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-1.5 md:h-2 bg-rose-100" />
        </div>

        <Card className="border-none shadow-xl overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl text-slate-900">
          <CardContent className="p-4 md:p-6 bg-white">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 md:space-y-6"
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
                        className="border-rose-100 focus-visible:ring-rose-400 bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Occasion</label>
                      <div className="grid grid-cols-2 gap-2">
                        {OCCASIONS.map((occ) => (
                          <Button
                            key={occ.value}
                            variant={formData.occasion === occ.value ? "default" : "ghost"}
                            className={`justify-start border shadow-sm ${
                              formData.occasion === occ.value 
                                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500' 
                                : 'bg-white hover:bg-rose-50 text-slate-600 border-rose-100 dark:bg-white dark:text-slate-600 dark:border-rose-100 dark:hover:bg-rose-50'
                            }`}
                            onClick={() => setFormData({...formData, occasion: occ.value})}
                          >
                            {occ.label}
                          </Button>
                        ))}
                      </div>
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
                  className="space-y-4 md:space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" /> Share the Love
                    </h2>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-600">Your Message</label>
                        <span className={`text-xs ${formData.message.length > 450 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {formData.message.length}/500
                        </span>
                      </div>
                      <div className="relative group">
                        <Textarea 
                          placeholder="Write something sweet..." 
                          className="min-h-[180px] border-rose-100 focus-visible:ring-rose-400 transition-all pr-12 pb-12 bg-white text-slate-900 placeholder:text-slate-400"
                          maxLength={500}
                          value={formData.message}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <p className="text-[10px] text-rose-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Roll for magic ✨</p>
                          <motion.button
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={generateRandomMessage}
                            className="p-2.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors flex items-center justify-center"
                            title="Generate random message"
                          >
                            <Dice5 size={20} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Your Name (Sender)</label>
                      <Input 
                        placeholder="e.g. Michael" 
                        value={formData.sender_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, sender_name: e.target.value})}
                        className="border-rose-100 focus-visible:ring-rose-400 bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 border border-rose-100 bg-white text-slate-600 hover:bg-rose-50 dark:bg-white dark:text-slate-600 dark:border-rose-100 dark:hover:bg-rose-50" 
                      onClick={prevStep}
                    >
                      <ChevronLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      className="flex-[2] bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                      onClick={nextStep}
                      disabled={!formData.message || !formData.sender_name}
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
                  className="space-y-4 md:space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-rose-500" /> Choose Style Template
                    </h2>

                    <div className="space-y-3">
                      {TEMPLATES.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 bg-white shadow-sm ${
                            formData.theme === tmpl.id
                              ? "border-rose-500 bg-rose-50/20"
                              : "border-rose-100 hover:border-rose-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-800 flex flex-wrap items-center gap-2">
                                <span className="text-lg">{tmpl.icon}</span> {tmpl.label}
                                {tmpl.recommended && (
                                  <Badge className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                    Recommended
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                                {tmpl.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplate(tmpl.id);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                            </Button>
                          </div>
                          
                          <Button
                            variant={formData.theme === tmpl.id ? "default" : "ghost"}
                            className={`w-full h-10 border ${
                              formData.theme === tmpl.id
                                ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
                                : "bg-white hover:bg-rose-50 text-slate-600 border-rose-100 dark:bg-white dark:text-slate-600 dark:border-rose-100 dark:hover:bg-rose-50"
                            }`}
                            onClick={() => setFormData({ ...formData, theme: tmpl.id })}
                          >
                            {formData.theme === tmpl.id ? "Selected" : "Select Style"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 border border-rose-100 bg-white text-slate-600 hover:bg-rose-50 dark:bg-white dark:text-slate-600 dark:border-rose-100 dark:hover:bg-rose-50" 
                      onClick={prevStep}
                    >
                      <ChevronLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      className="flex-[2] bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Link"} <Sparkles className="ml-2 w-4 h-4" />
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
                  className="space-y-4 md:space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-rose-500" /> Share the Love
                    </h2>

                    <div className="bg-rose-50 p-4 rounded-xl border-none space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Preview</span>
                        <Badge variant="secondary" className="bg-rose-100 text-rose-600 text-[10px]">
                          {formData.occasion}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs md:text-sm text-slate-500">To: <span className="text-slate-800 font-semibold">{formData.recipient_name}</span></p>
                        <p className="text-xs md:text-sm text-slate-700 italic line-clamp-2">"{formData.message}"</p>
                        <p className="text-xs md:text-sm text-slate-500">From: <span className="text-slate-800 font-semibold">{formData.sender_name}</span></p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Shareable Link</label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={shareUrl || "Generating link..."}
                          className="bg-white border-rose-100 text-sm h-10 text-slate-900"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0 border-none bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-100 h-10 w-10"
                          onClick={copyLink}
                          disabled={!shareUrl}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
 
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={shareWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 h-12 text-sm"
                        disabled={!shareUrl}
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </Button>
                      <Button 
                        variant="ghost"
                        asChild
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-50 dark:text-rose-600 dark:hover:bg-rose-100 h-12 text-sm"
                        disabled={!shareUrl}
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
                      className="w-full text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-50"
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

        <div className="flex flex-col items-center gap-3">
          <Link 
            href="/love-space" 
            className="text-sm text-rose-400 hover:text-rose-500 flex items-center justify-center gap-1 transition-colors"
          >
            Also check out Love Space <ArrowRight className="w-3 h-3" />
          </Link>
          <Link 
            href="/contact" 
            className="text-sm font-medium text-slate-500 hover:text-rose-500 flex items-center justify-center gap-1 transition-colors"
          >
            For fully custom wishes website contact us <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Interactive Preview Overlay */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-95">
          <div className="fixed top-6 left-6 z-[10000]">
            <Button
              onClick={() => setPreviewTemplate(null)}
              className="bg-black/80 hover:bg-black text-white rounded-full font-bold px-6 h-12 shadow-2xl flex items-center gap-2 border border-white/20"
            >
              <X className="w-5 h-5" /> Close Preview
            </Button>
          </div>
          <div className="min-h-screen w-full relative z-10">
            {previewTemplate === "hearts" ? (
              <TemplateCake
                greeting={{
                  recipient_name: formData.recipient_name || "Sarah",
                  sender_name: formData.sender_name || "Michael",
                  message: formData.message || "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: formData.occasion || "Birthday",
                  music_id: "none",
                }}
                isPreview={true}
              />
            ) : (
              <TemplateAurora
                greeting={{
                  recipient_name: formData.recipient_name || "Sarah",
                  sender_name: formData.sender_name || "Michael",
                  message: formData.message || "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: formData.occasion || "Birthday",
                }}
                isPreview={true}
              />
            )}
          </div>
        </div>
      )}
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
