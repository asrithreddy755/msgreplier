"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Dice5,
  Eye,
  X,
  ChevronDown,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import birthdayMessages from "../birthday_messages.json";
import anniversaryMessages from "../anniversary_messages.json";
import loveGreetingMessages from "../love_greeting_messages.json";
import apoloyMessages from "../apoloy_messages.json";
import specialMomentsMessages from "../special_moments_messages.json";
import flowersMessages from "../flowers_messages.json";
import TemplateCake from "../../components/without-image/TemplateCake";
import TemplateAurora from "../../components/without-image/TemplateAurora";
import TemplateClassic2D from "../../components/without-image/TemplateClassic2D";
import SaveToAccount from "../../components/SaveToAccount";
import GalleryPickerModal from "../../components/GalleryPickerModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/* ════════════════════════════════════════════════════════════════
   Constants
   ════════════════════════════════════════════════════════════════ */

const OCCASIONS = [
  { label: "Birthday", value: "Birthday", icon: "🎂" },
  { label: "Anniversary", value: "Anniversary", icon: "💍" },
  { label: "Love Greeting", value: "Love Greeting", icon: "💖" },
  { label: "Apology", value: "Apoloy", icon: "🥺" },
  { label: "Special Moments", value: "Special Moments", icon: "✨" },
  { label: "Flowers", value: "Flowers", icon: "💐" },
];

const TEMPLATES = [
  {
    id: "classic-2d",
    label: "Classic 2D",
    icon: "🎈",
    description: "A gorgeous 2D experience with lights, balloons, cake",
    recommended: true,
  },
  {
    id: "aurora",
    label: "Cham 3D",
    icon: "✨",
    description: "Candles need to blow with the microphone",
  },
  {
    id: "hearts",
    label: "Cake Surprise",
    icon: "🎂",
    description: "Interactive cake blowing with standard text greeting",
  },
  {
    id: "wishes3",
    label: "Slider Surprise",
    icon: "🎁",
    description: "Interactive swipe-based card with cute stickers and confetti",
  },
  {
    id: "wishes4",
    label: "Love Letter Box",
    icon: "✉️",
    description: "Envelope opening with 3D candle blowing and scratch card",
  },
  {
    id: "wishes5",
    label: "Zodiac Celebration",
    icon: "🌟",
    description: "Immersive cosmic birthday with stats, stars map, crystal ball",
  },
  {
    id: "propose_crush1",
    label: "Crush Proposal",
    icon: "💖",
    description: "Playful proposal flow with tricky choices and custom letter popup",
  },
  {
    id: "wishes6",
    label: "Sweet Scratch",
    icon: "🧸",
    description: "Scratch card reasons, memory photos, and unsealable love letter",
  },
  {
    id: "wishes7",
    label: "Birthday Surprise",
    icon: "🎁",
    description: "Surprise dark romantic layout with dynamic name, live seconds counter, gallery & letter",
  },
  {
    id: "wishes8",
    label: "Curtain Surprise",
    icon: "🚪",
    description: "Cinematic opening curtain, custom countdown, memories swiper and sealable letter",
  },
  {
    id: "wishes9",
    label: "Sweet Apology",
    icon: "🥺",
    description: "Apology letter experience with clean popups, soft style and a Beat Me game",
  },
  {
    id: "apology_1",
    label: "Interactive Apology",
    icon: "🥺",
    description: "Cute apology slides, a playful 'Still angry' choice, and calculator equation resolver",
  },
  {
    id: "wishes10",
    label: "Retro Windows",
    icon: "🌸",
    description: "Retro OS style birthday surprise with cake slicing, memories swiper & wax seal",
  },
  {
    id: "wishes11",
    label: "Matrix Neon",
    icon: "🌌",
    description: "Cyberpunk glowing code rain wish with 2x2 grid memory photos",
  },
];

const getInitialOccasion = (param: string | null) => {
  if (!param) return "Birthday";
  const n = param.toLowerCase().trim();
  if (n === "birthday") return "Birthday";
  if (n === "anniversary") return "Anniversary";
  if (n === "love greeting" || n === "lovegreeting" || n === "love") return "Love Greeting";
  if (n === "apoloy" || n === "apology") return "Apoloy";
  if (n === "special moments" || n === "specialmoments" || n === "special") return "Special Moments";
  if (n === "flowers" || n === "flower") return "Flowers";
  return "Birthday";
};

const getInitialTheme = (param: string | null) => {
  if (!param) return "classic-2d";
  const n = param.toLowerCase().trim();
  if (n === "classic-2d" || n === "classic") return "classic-2d";
  if (n === "aurora" || n === "cham 3d" || n === "cham") return "aurora";
  if (n === "hearts" || n === "cake surprise" || n === "cake") return "hearts";
  if (n === "wishes3" || n === "slider surprise" || n === "slider") return "wishes3";
  if (n === "wishes4" || n === "love letter box" || n === "letter") return "wishes4";
  if (n === "wishes5" || n === "zodiac celebration" || n === "zodiac") return "wishes5";
  if (n === "wishes6" || n === "sweet scratch" || n === "scratch") return "wishes6";
  if (n === "wishes7" || n === "birthday locked" || n === "locked") return "wishes7";
  if (n === "wishes8" || n === "curtain surprise" || n === "curtain") return "wishes8";
  if (n === "wishes9" || n === "apology" || n === "sweet apology") return "wishes9";
  if (n === "apology_1" || n === "apology1") return "apology_1";
  if (n === "wishes10" || n === "retro" || n === "retro windows") return "wishes10";
  if (n === "wishes11" || n === "matrix" || n === "matrix neon") return "wishes11";
  if (n === "propose_crush1" || n === "propose" || n === "crush") return "propose_crush1";
  return "classic-2d";
};

/* ════════════════════════════════════════════════════════════════
   Iframe Template Preview (for wishes3/4/5)
   ════════════════════════════════════════════════════════════════ */

function IframeTemplate({ greeting, templateFolder }: { greeting: any; templateFolder: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dummyDOB = `${today.getFullYear() - 22}-${month}-${day}`;

    const params = new URLSearchParams({
      recipient_name: greeting.recipient_name || "",
      sender_name: greeting.sender_name || "",
      message: greeting.message || "",
      occasion: greeting.occasion || "Birthday",
      music_id: greeting.music_id || "none",
      slug: greeting.slug || "",
      name: greeting.recipient_name || "",
      dob: greeting.dob || dummyDOB,
      photo_url: greeting.photo_url || "",
      preview: "true",
    });

    setSrc(`/templates/${templateFolder}/index.html?${params.toString()}`);
  }, [greeting, templateFolder]);

  if (!src) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
        <Heart className="w-10 h-10 animate-pulse text-pink-500" />
      </div>
    );
  }

  return (
    <iframe
      src={src}
      className="w-full h-screen border-none overflow-hidden"
      style={{ display: "block", width: "100%", height: "100vh" }}
      allow="microphone; autoplay; clipboard-write"
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   Main Create Form
   ════════════════════════════════════════════════════════════════ */

function DigitalGreetingCreateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ── State ───────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    recipient_name: "",
    relationship: "Lover",
    occasion: "Birthday",
    message: "",
    theme: "classic-2d",
    sender_name: "",
    sender_avatar: "💌",
    photo_url: "",
    music_id: "none",
    reveal_type: "envelope",
    birthday_date: "",
  });

  const [user, setUser] = useState<any>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [showTemplateChooser, setShowTemplateChooser] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null);

  // Dynamic limits states
  const [plan, setPlan] = useState<string>('free');
  const [websiteCount, setWebsiteCount] = useState<number>(0);
  const [limitError, setLimitError] = useState<{ title: string; message: string } | null>(null);

  /* ── Initialize from URL params ──────────────────────────── */
  useEffect(() => {
    const paramOccasion = searchParams.get("occasion");
    const paramTheme = searchParams.get("theme") || searchParams.get("template");

    if (paramOccasion || paramTheme) {
      setFormData((prev) => ({
        ...prev,
        occasion: paramOccasion ? getInitialOccasion(paramOccasion) : prev.occasion,
        theme: paramTheme ? getInitialTheme(paramTheme) : prev.theme,
      }));
    }
  }, [searchParams]);

  /* ── Check auth ──────────────────────────────────────────── */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace(`/wishes/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        setUser(user);

        // Fetch plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile?.plan) {
          setPlan(profile.plan);
        }

        // Fetch website count
        const { count } = await supabase
          .from('love_greetings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (count !== null) {
          setWebsiteCount(count);
        }

      } catch (err) {
        console.error("Failed to check user auth:", err);
      }
    };
    checkUser();
  }, [router]);

  /* ── Force light mode ────────────────────────────────────── */
  useEffect(() => {
    document.body.classList.add("light-mode-forced");
    return () => {
      document.body.classList.remove("light-mode-forced");
    };
  }, []);

  /* ── Helpers ─────────────────────────────────────────────── */
  const selectedTemplate = TEMPLATES.find((t) => t.id === formData.theme) || TEMPLATES[0];

  const getPhotosArray = (photoUrlValue: string): { url: string; caption: string }[] => {
    const maxSlots = formData.theme === "classic-2d" ? 6 : (formData.theme === "aurora" ? 1 : 4);
    try {
      if (photoUrlValue && photoUrlValue.startsWith('[')) {
        const parsed = JSON.parse(photoUrlValue);
        if (Array.isArray(parsed)) {
          const result = [...parsed];
          while (result.length < maxSlots) {
            result.push({ url: '', caption: '' });
          }
          return result.slice(0, maxSlots);
        }
      }
    } catch (e) {
      console.error("Error parsing photo_url JSON", e);
    }
    const arr = Array.from({ length: maxSlots }, () => ({ url: '', caption: '' }));
    if (photoUrlValue && !photoUrlValue.startsWith('[')) {
      arr[0].url = photoUrlValue;
    }
    return arr;
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo_url: "" }));
    toast.success("Photo removed");
  };

  const handleRemovePhotoAtIndex = (index: number) => {
    const photos = getPhotosArray(formData.photo_url);
    photos[index] = { url: '', caption: '' };
    const allEmpty = photos.every(p => !p.url);
    setFormData(prev => ({
      ...prev,
      photo_url: allEmpty ? "" : JSON.stringify(photos)
    }));
    toast.success(`Photo ${index + 1} removed`);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const photos = getPhotosArray(formData.photo_url);
    photos[index].caption = caption;
    setFormData(prev => ({
      ...prev,
      photo_url: JSON.stringify(photos)
    }));
  };

  const generateRandomMessage = () => {
    let messages = birthdayMessages;
    if (formData.occasion === "Anniversary") messages = anniversaryMessages;
    else if (formData.occasion === "Love Greeting") messages = loveGreetingMessages;
    else if (formData.occasion === "Apoloy") messages = apoloyMessages;
    else if (formData.occasion === "Special Moments") messages = specialMomentsMessages;
    else if (formData.occasion === "Flowers") messages = flowersMessages;

    const randomIndex = Math.floor(Math.random() * messages.length);
    setFormData({ ...formData, message: messages[randomIndex] });
    toast.success(`Random ${formData.occasion} message generated! ✨`);
  };

  const isDobRequired = formData.occasion !== "Anniversary" &&
                        formData.theme !== "propose_crush1" &&
                        formData.theme !== "wishes6" &&
                        formData.theme !== "wishes9" &&
                        formData.theme !== "apology_1";

  const handlePreviewClick = (theme: string) => {
    if (!formData.recipient_name.trim() || !formData.sender_name.trim() || !formData.message.trim() || (isDobRequired && !formData.birthday_date.trim())) {
      toast.error(isDobRequired
        ? "Please fill all the remaining boxes: Recipient Name, Date of Birth, Message, and Your Name."
        : "Please fill all the remaining boxes: Recipient Name, Message, and Your Name."
      );
      return;
    }
    setPreviewTemplate(theme);
  };

  const handleGenerate = async () => {
    if (!formData.recipient_name.trim() || !formData.sender_name.trim() || !formData.message.trim() || (isDobRequired && !formData.birthday_date.trim())) {
      toast.error(isDobRequired
        ? "Please fill all the remaining boxes: Recipient Name, Date of Birth, Message, and Your Name."
        : "Please fill all the remaining boxes: Recipient Name, Message, and Your Name."
      );
      return;
    }

    const limit = plan === 'creator' ? 100 : plan === 'starter' ? 25 : 12;
    if (websiteCount >= limit) {
      setLimitError({
        title: `Website Limit Reached (${websiteCount}/${limit} websites created)`,
        message: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan allows up to ${limit} websites. Please upgrade your plan to create more websites.`
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/digital-greeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.slug) {
        setSlug(data.slug);
        setPreviewTemplate(null);
        toast.success("Greeting generated successfully! ✨");
      } else {
        toast.error(data.error || "Failed to generate link. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl =
    typeof window !== "undefined" && slug
      ? `${window.location.origin}/greet/${slug}`
      : "";

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

  const canGenerate = formData.recipient_name.trim() && formData.sender_name.trim() && formData.message.trim() && (!isDobRequired || formData.birthday_date.trim());

  /* ════════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════════ */
  return (
    <div className="create-page">
      {/* ── Top bar ────────────────────────────────────────── */}
      <div className="create-topbar">
        <div className="create-topbar-left">
          <Link href="/digital-greeting/templates" className="create-back-link">
            ← Back to Templates
          </Link>
          <h1 className="create-topbar-template-name" style={{ marginTop: 0 }}>
            Create Greeting ✨
          </h1>
        </div>

        <div className="create-topbar-right">
          <span className="create-topbar-stats">
            {formData.message.length}/500 chars
          </span>
          {formData.photo_url && (
            <span className="create-topbar-stats">📷 1 Photo</span>
          )}
        </div>
      </div>

      {/* ── Main Form Card ─────────────────────────────────── */}
      <div className="create-card">
        {!slug ? (
          <>
            {/* Visual Template Selector (Static chosen template only) */}
            <div className="create-field">
              <label className="create-label">Selected Template Style</label>
              <div className="create-template-single-card">
                <div className="create-template-card-icon-container">
                  <span className="create-template-card-icon">{selectedTemplate.icon}</span>
                  {selectedTemplate.recommended && (
                    <span className="create-template-card-badge">Popular</span>
                  )}
                </div>
                <div className="create-template-card-info-main">
                  <div className="create-template-card-title">{selectedTemplate.label}</div>
                  <p className="create-template-card-desc" style={{ height: "auto", margin: 0 }}>
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className="create-field">
              <label className="create-label">Recipient&apos;s Name</label>
              <input
                id="create-recipient"
                type="text"
                className="create-input"
                placeholder="e.g. Sarah"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
              />
            </div>

            {/* Date of Birth */}
            {isDobRequired && (
              <div className="create-field">
                <label className="create-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="create-input"
                  value={formData.birthday_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birthday_date: e.target.value })
                  }
                />
                <p className="create-help">
                  This date is saved with your draft and shown on the final page.
                </p>
              </div>
            )}

            {/* The Message */}
            <div className="create-field">
              <label className="create-label">
                The Message
                <span
                  style={{
                    float: "right",
                    fontWeight: 400,
                    color: formData.message.length > 450 ? "#c64b7a" : "#9e8a8e",
                  }}
                >
                  {formData.message.length}/500
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <textarea
                  id="create-message"
                  className="create-textarea"
                  placeholder="Write something sweet..."
                  maxLength={500}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                  }}
                >
                  <button
                    type="button"
                    className="create-dice-btn"
                    onClick={generateRandomMessage}
                    title="Generate random message"
                  >
                    <Dice5 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Your Name */}
            <div className="create-field">
              <label className="create-label">Your Name</label>
              <input
                id="create-sender"
                type="text"
                className="create-input"
                placeholder="e.g. Michael"
                value={formData.sender_name}
                onChange={(e) =>
                  setFormData({ ...formData, sender_name: e.target.value })
                }
              />
            </div>

             {/* Photo Upload */}
            {formData.theme !== "propose_crush1" && formData.theme !== "wishes6" && formData.theme !== "wishes9" && formData.theme !== "apology_1" && (
              <div className="create-field">
                <label className="create-label">
                  Photo
                  <span style={{ fontWeight: 400, color: "#9e8a8e" }}>
                    {["wishes3", "wishes5", "wishes6", "wishes7", "wishes8", "wishes10", "wishes11"].includes(formData.theme) ? " (recommended)" : " (optional)"}
                  </span>
                  {!user && (
                    <span
                      style={{
                        float: "right",
                        fontWeight: 600,
                        color: "#c64b7a",
                        fontSize: "10px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      🔒 Account required
                    </span>
                  )}
                </label>

                {user ? (
                  formData.theme === "hearts" || formData.theme === "classic-2d" || formData.theme === "aurora" || formData.theme === "wishes5" || formData.theme === "wishes3" || formData.theme === "wishes7" || formData.theme === "wishes8" || formData.theme === "wishes10" || formData.theme === "wishes11" ? (
                    /* Render multiple slots for Cake Surprise, Classic 2D, Cham 3D, Zodiac, Retro or Matrix templates */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {getPhotosArray(formData.photo_url).map((photo, index) => (
                        <div
                          key={index}
                          style={{
                            border: '1px solid #ffe4e6',
                            borderRadius: '16px',
                            padding: '1rem',
                            backgroundColor: '#fffdfd',
                            boxShadow: '0 4px 12px rgba(251,113,133,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#be123c' }}>
                              📸 Memory Slot {index + 1}
                            </span>
                            {photo.url && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhotoAtIndex(index)}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  color: '#e11d48',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {photo.url ? (
                              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #fecdd3', flexShrink: 0 }}>
                                <img src={photo.url} alt={`Slot ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePhotoSlot(index);
                                  setIsGalleryOpen(true);
                                }}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '12px',
                                  border: '1px dashed #fda4af',
                                  backgroundColor: '#fff5f5',
                                  color: '#be123c',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '2px',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                <span style={{ fontSize: '18px' }}>+</span>
                                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Upload</span>
                              </button>
                            )}

                            <div style={{ flex: 1 }}>
                              <textarea
                                placeholder="Write a message to display below this memory (optional)..."
                                value={photo.caption}
                                onChange={(e) => handleCaptionChange(index, e.target.value)}
                                rows={2}
                                style={{
                                  width: '100%',
                                  fontSize: '12px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecdd3',
                                  outline: 'none',
                                  resize: 'none',
                                  backgroundColor: '#fff'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Legacy single photo upload */
                    <div className="create-photo-box">
                      {formData.photo_url ? (
                        <div className="create-photo-preview">
                          <img src={formData.photo_url} alt="Preview" />
                          <button
                            type="button"
                            className="create-photo-preview-remove"
                            onClick={handleRemovePhoto}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="create-photo-box-inner">
                          <Camera size={28} style={{ color: "#9e8a8e" }} />
                          <button
                            type="button"
                            className="create-photo-choose-btn"
                            onClick={() => {
                              setActivePhotoSlot(null);
                              setIsGalleryOpen(true);
                            }}
                          >
                            📸 Choose or upload a photo
                          </button>
                          <span className="create-help" style={{ marginTop: 0 }}>
                            Select from gallery or upload new
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="create-photo-box">
                    <div className="create-photo-box-inner">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#9e8a8e",
                          margin: 0,
                        }}
                      >
                        Want to personalize with a custom photo?
                      </p>
                      <Link
                        href="/wishes/login?next=/digital-greeting/create"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#78555e",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        Log in or Sign up free 🔐
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate / Preview Buttons */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handlePreviewClick(formData.theme)}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  fontSize: '12px',
                  fontWeight: '800',
                  borderRadius: '14px',
                  border: '2px solid #78555e',
                  color: '#78555e',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                👁️ Preview
              </button>
              <button
                type="button"
                className="create-btn-generate"
                style={{ flex: 2, margin: 0 }}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Wish
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* ── Share View (after generation) ─────────────────── */
          <div className="create-share-section">
            <div>
              <span className="create-topbar-kicker">Success! 🎉</span>
              <h2
                className="create-topbar-template-name"
                style={{ fontSize: "1.25rem", marginTop: "0.35rem" }}
              >
                Your wish is ready to share
              </h2>
            </div>

            {/* Preview summary */}
            <div
              style={{
                background: "#faf6f8",
                borderRadius: "14px",
                padding: "1rem 1.25rem",
              }}
            >
              <p style={{ fontSize: "13px", color: "#9e8a8e", margin: 0 }}>
                To:{" "}
                <strong style={{ color: "#3d2c2e" }}>
                  {formData.recipient_name}
                </strong>
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6c5660",
                  fontStyle: "italic",
                  margin: "0.35rem 0",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                &ldquo;{formData.message}&rdquo;
              </p>
              <p style={{ fontSize: "13px", color: "#9e8a8e", margin: 0 }}>
                From:{" "}
                <strong style={{ color: "#3d2c2e" }}>
                  {formData.sender_name}
                </strong>
              </p>
            </div>

            {/* Shareable link */}
            <div>
              <label className="create-label">Shareable Link</label>
              <div className="create-share-link-row">
                <input
                  readOnly
                  value={shareUrl || "Generating..."}
                  className="create-share-link-input"
                />
                <button
                  type="button"
                  className="create-share-copy-btn"
                  onClick={copyLink}
                  disabled={!shareUrl}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="create-share-buttons">
              <button
                type="button"
                className="create-share-btn-whatsapp"
                onClick={shareWhatsApp}
                disabled={!shareUrl}
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="create-share-btn-preview"
              >
                <Eye size={16} /> Open Preview
              </a>
            </div>

            {/* Save to account */}
            {slug && <SaveToAccount slug={slug} />}

            <div className="create-share-divider" />

            <button
              type="button"
              className="create-share-new-btn"
              onClick={() => {
                setSlug("");
                setFormData({
                  recipient_name: "",
                  relationship: "Lover",
                  occasion: formData.occasion,
                  message: "",
                  theme: formData.theme,
                  sender_name: "",
                  sender_avatar: "💌",
                  photo_url: "",
                  music_id: "none",
                  reveal_type: "envelope",
                  birthday_date: "",
                });
              }}
            >
              Create Another One ✨
            </button>
          </div>
        )}
      </div>

      {/* ── Template Preview Overlay ──────────────────────── */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-95"
        >
          <div className="fixed top-6 left-6 right-6 z-[10000] flex justify-between items-center pointer-events-none">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="pointer-events-auto"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <X size={18} /> Close Preview
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="pointer-events-auto"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                background: "#ec4899", // pink-500
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(236,72,153,0.4)",
              }}
            >
              {isGenerating ? "Generating..." : "✨ Confirm & Generate Wish"}
            </button>
          </div>
          <div className="min-h-screen w-full relative z-10">
            {previewTemplate === "hearts" ? (
              <TemplateCake
                greeting={{
                  recipient_name: formData.recipient_name || "Sarah",
                  sender_name: formData.sender_name || "Michael",
                  message:
                    formData.message ||
                    "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                  occasion: formData.occasion || "Birthday",
                  music_id: "none",
                  photo_url: formData.photo_url,
                  birthday_date: formData.birthday_date,
                }}
                isPreview={true}
              />
            ) : previewTemplate === "classic-2d" ? (
              <TemplateClassic2D
                greeting={{
                  recipient_name: formData.recipient_name || "Sarah",
                  sender_name: formData.sender_name || "Michael",
                  message:
                    formData.message ||
                    "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                  occasion: formData.occasion || "Birthday",
                  photo_url: formData.photo_url,
                  birthday_date: formData.birthday_date,
                }}
                isPreview={true}
              />
            ) : previewTemplate === "aurora" ? (
              <TemplateAurora
                greeting={{
                  recipient_name: formData.recipient_name || "Sarah",
                  sender_name: formData.sender_name || "Michael",
                  message:
                    formData.message ||
                    "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                  occasion: formData.occasion || "Birthday",
                  photo_url: formData.photo_url,
                  birthday_date: formData.birthday_date,
                }}
                isPreview={true}
              />
            ) : (
              <IframeTemplate
                greeting={{
                  recipient_name: formData.recipient_name || "Sarah",
                  sender_name: formData.sender_name || "Michael",
                  message:
                    formData.message ||
                    "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                  occasion: formData.occasion || "Birthday",
                  music_id: formData.music_id || "none",
                  dob: formData.birthday_date,
                  photo_url: formData.photo_url,
                }}
                templateFolder={`template_${previewTemplate}`}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Gallery Picker Modal ─────────────────────────── */}
      <GalleryPickerModal
        isOpen={isGalleryOpen}
        onClose={() => {
          setIsGalleryOpen(false);
          setActivePhotoSlot(null);
        }}
        onSelect={(url) => {
          if ((formData.theme === "hearts" || formData.theme === "classic-2d" || formData.theme === "aurora" || formData.theme === "wishes5" || formData.theme === "wishes3" || formData.theme === "wishes6" || formData.theme === "wishes7" || formData.theme === "wishes8" || formData.theme === "wishes10" || formData.theme === "wishes11") && activePhotoSlot !== null) {
            const photos = getPhotosArray(formData.photo_url);
            photos[activePhotoSlot].url = url;
            setFormData((prev) => ({ ...prev, photo_url: JSON.stringify(photos) }));
          } else {
            setFormData((prev) => ({ ...prev, photo_url: url }));
          }
          setActivePhotoSlot(null);
        }}
      />

      {/* ── Footer links ─────────────────────────────────── */}
      <div
        style={{
          maxWidth: "640px",
          margin: "1.5rem auto 0",
          padding: "0 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Link
          href="/love-space"
          style={{
            fontSize: "12px",
            color: "#9e8a8e",
            textDecoration: "none",
            fontWeight: 600,
            transition: "color 0.15s",
          }}
        >
          Also check out Love Space →
        </Link>
        <Link
          href="/contact"
          style={{
            fontSize: "12px",
            color: "#9e8a8e",
            textDecoration: "none",
            fontWeight: 600,
            transition: "color 0.15s",
          }}
        >
          For fully custom wishes website contact us →
        </Link>
      </div>

      {/* Dynamic Limit Upgrade Modal */}
      <Dialog open={!!limitError} onOpenChange={(open) => !open && setLimitError(null)}>
        <DialogContent
          aria-describedby={undefined}
          className="max-w-md p-6 rounded-[24px] bg-white border border-[#d4c3ab] shadow-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading text-[#110f0f] flex items-center gap-2">
              🔒 Paid Plan Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm font-semibold text-[#110f0f]">
              {limitError?.title}
            </p>
            <p className="text-xs text-[#5d6c7b] leading-relaxed">
              {limitError?.message}
            </p>
            <div className="bg-[#eedfc6]/20 border border-[#d4c3ab] rounded-[16px] p-4 space-y-2">
              <p className="text-[11px] font-bold text-[#110f0f] uppercase font-heading tracking-wider">Plan Limits & Features:</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-[#110f0f] pt-1">
                <div className="p-2 bg-white rounded-xl border border-[#d4c3ab]">
                  <p className="font-bold font-heading">Free</p>
                  <p className="text-[#5d6c7b] mt-1">12 Websites</p>
                  <p className="text-[#5d6c7b]">2MB size</p>
                  <p className="text-[#5d6c7b]">6 Images</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#d4c3ab] relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[7px] px-1.5 rounded-full font-bold">POPULAR</span>
                  <p className="font-bold font-heading">Starter</p>
                  <p className="text-[#110f0f] mt-1 font-bold">25 Websites</p>
                  <p className="text-[#110f0f] font-bold">3MB size</p>
                  <p className="text-[#110f0f] font-bold">15 Images</p>
                </div>
                <div className="p-2 bg-[#110f0f] text-white rounded-xl">
                  <p className="font-bold font-heading text-[#eedfc6]">Creator</p>
                  <p className="text-white/80 mt-1">100 Websites</p>
                  <p className="text-white/80">5MB size</p>
                  <p className="text-white/80">40 Images</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#d4c3ab] flex justify-end gap-2">
            <button
              onClick={() => setLimitError(null)}
              className="px-4 py-2.5 text-xs font-bold text-[#110f0f] hover:bg-slate-50 rounded-xl transition-colors border border-[#d4c3ab]"
            >
              Close
            </button>
            <Link
              href="/digital-greeting/pricing"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#110f0f] hover:bg-[#2b95ff] rounded-xl transition-all shadow-md font-heading"
            >
              Upgrade Plan
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Page Wrapper with Suspense
   ════════════════════════════════════════════════════════════════ */

export default function DigitalGreetingCreate() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
          <Heart className="w-10 h-10 animate-pulse text-pink-500" />
        </div>
      }
    >
      <DigitalGreetingCreateForm />
    </Suspense>
  );
}
