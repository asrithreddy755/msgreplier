"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Heart, Image as ImageIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TemplateCake from "../components/TemplateCake";
import TemplateAurora from "../components/TemplateAurora";
import TemplateClassic2D from "../components/TemplateClassic2D";

function IframeTemplate({ greeting, templateFolder }: { greeting: any; templateFolder: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
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

export default function TemplatesGallery() {
  const router = useRouter();
  const [activeOccasion, setActiveOccasion] = useState("Birthday");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const landingOccasions = [
    { name: "Birthday", icon: "🎂" },
    { name: "Anniversary", icon: "💍" },
    { name: "Love Greeting", icon: "💖" },
    { name: "Apoloy", icon: "🥺" },
    { name: "Special Moments", icon: "✨" },
    { name: "Flowers", icon: "💐" }
  ];

  const currentIndex = landingOccasions.findIndex(occ => occ.name === activeOccasion);
  const nextOccasion = landingOccasions[currentIndex !== -1 ? (currentIndex + 1) % landingOccasions.length : 0];

  const occDisplay = activeOccasion === "Apoloy" ? "Apology" : activeOccasion;

  useEffect(() => {
    const activeTab = document.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeOccasion]);

  const templatesList = [
    {
      id: "classic-2d",
      title: `Classic 2D ${occDisplay} Surprise`,
      description: `A gorgeous 2D experience for your ${occDisplay.toLowerCase()} with lights, floating balloons, and interactive candle blow.`,
      image: "/classic_2d.png",
      tag: "Classic 2D",
      tagClass: "bg-[#78555e]/85 text-white",
      imageCount: "0-6"
    },
    {
      id: "aurora",
      title: `Cham 3D ${occDisplay} Scene`,
      description: `An immersive 3D scene for your ${occDisplay.toLowerCase()} where candles need to be blown using the microphone.`,
      image: "/aurora.png",
      tag: "Interactive 3D",
      tagClass: "bg-[#c64b7a]/85 text-white",
      imageCount: "0-1"
    },
    {
      id: "hearts",
      title: `${occDisplay} Cake Surprise`,
      description: `Interactive cake blowing combined with standard text messages for a sweet ${occDisplay.toLowerCase()} message.`,
      image: "/hearts.png",
      tag: "Classic Cake",
      tagClass: "bg-[#bf8ea2]/90 text-white",
      imageCount: "0-4"
    },
    {
      id: "wishes3",
      title: `Slider Surprise ${occDisplay} 🎁`,
      description: `Interactive swipe-based card with cute stickers, options, and celebration confetti for your ${occDisplay.toLowerCase()}.`,
      image: "/slider_surprise.png",
      tag: "Interactive Swipe",
      tagClass: "bg-[#913b60]/85 text-white",
      imageCount: "0-4"
    },
    {
      id: "wishes4",
      title: `Love Letter Box ${occDisplay} ✉️`,
      description: `Envelope opening with a custom message scratch card, letter popup, and 3D blowing experience for your ${occDisplay.toLowerCase()}.`,
      image: "/love_letter.png",
      tag: "Recommended",
      tagClass: "bg-[#78555e]/90 text-white",
      imageCount: "0-1"
    },
    {
      id: "wishes5",
      title: `Zodiac Celebration ${occDisplay} 🌟`,
      description: `Immersive cosmic ${occDisplay.toLowerCase()} space with zodiac details, custom message cards, stars map, and fortune crystal ball.`,
      image: "/zodiac_space.png",
      tag: "Cosmic Zodiac",
      tagClass: "bg-indigo-900/85 text-white",
      imageCount: "0-4"
    },
    {
      id: "propose_crush1",
      title: `Crush Proposal Surprise 💖`,
      description: `A playful interactive flow to propose to your crush, asking them "Do you love me?" with tricky options and custom message.`,
      image: "/propose_crush_preview.png",
      tag: "Love Proposal",
      tagClass: "bg-rose-500 text-white",
      imageCount: "0"
    },
    {
      id: "wishes6",
      title: `Sweet Scratch Surprise ${occDisplay} 🧸`,
      description: `Interactive scratch card reasons, memory photo gallery swiper, and envelope unsealing for a custom love letter.`,
      image: "/sweet_scratch_preview.png",
      tag: "Scratch & Letter",
      tagClass: "bg-rose-400 text-white",
      imageCount: "0"
    },
    {
      id: "wishes7",
      title: `Birthday Surprise 🎁`,
      description: `A dark romantic birthday experience with animated GIF, live seconds counter, memory gallery, and a heartfelt letter opener.`,
      image: "/birthday_locked_preview.png",
      tag: "Surprise",
      tagClass: "bg-[#8b1a1a]/85 text-white",
      imageCount: "0-4"
    },
    {
      id: "wishes8",
      title: `Curtain & Envelope Surprise 🚪`,
      description: `A cinematic curtain entrance opening to a custom live countdown, swipeable memories carousel, and interactive sealable envelope letter.`,
      image: "/curtain_envelope_preview.png",
      tag: "Cinematic Curtain",
      tagClass: "bg-[#78555e]/90 text-white",
      imageCount: "0-4"
    }
  ];

  const getTemplatesForOccasion = (occName: string) => {
    if (occName === "Birthday") return templatesList.filter((t) => !["wishes6", "propose_crush1"].includes(t.id));
    if (occName === "Anniversary") return templatesList.filter((t) => ["classic-2d", "hearts", "wishes4", "wishes5"].includes(t.id));
    if (occName === "Apoloy") return templatesList.filter((t) => ["wishes6", "propose_crush1"].includes(t.id));
    if (occName === "Love Greeting") return templatesList.filter((t) => ["propose_crush1", "wishes6"].includes(t.id));
    return [];
  };

  const filteredTemplates = getTemplatesForOccasion(activeOccasion);

  return (
    <div className="l4u-body relative min-h-screen bg-[#faf9fa] text-[#1a1c1d] font-body selection:bg-[#ffd1dc] overflow-x-hidden">

      {/* Background drifting gradients */}
      <div className="l4u-background" aria-hidden="true">
        <span className="l4u-blob l4u-blob-a"></span>
        <span className="l4u-blob l4u-blob-b"></span>
        <span className="l4u-blob l4u-blob-c"></span>
      </div>

      <main className="relative z-10 pb-24 pt-6">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">

          {/* Header section with Back Button */}
          <div className="mb-10 mt-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[#78555e] hover:text-[#9c6f79] transition-all hover:-translate-x-0.5 duration-200 mb-6 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-[#78555e]/10 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h1 className="mt-2 font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1d]">
              Browse All Templates
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#817476] md:text-base">
              Explore and customize a template below. Select the occasion you want to surprise your loved one with, choose a canvas, and start editing instantly.
            </p>
          </div>

          {/* Occasion tabs selector */}
          <div className="relative mb-8 border-b border-[#78555e]/10 pb-4">
            <div className="hide-scrollbar flex overflow-x-auto md:flex-wrap gap-2 justify-start" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {landingOccasions.map((occ) => {
                const isActive = activeOccasion === occ.name;
                return (
                  <button
                    key={`${occ.name}-${isActive ? "active" : "inactive"}`}
                    data-active={isActive}
                    onClick={() => setActiveOccasion(occ.name)}
                    className={`flex-shrink-0 flex items-center gap-0.5 md:gap-1.5 px-2 py-0.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-[0.11em] transition-all duration-300 ${isActive
                      ? "bg-[#78555e] text-white shadow-md animate-select"
                      : "bg-[#78555e]/5 hover:bg-[#78555e]/10 text-[#6c606e] hover:text-[#78555e]"
                      }`}
                  >
                    <span className="text-[9px] md:text-sm">{occ.icon}</span>
                    <span>{occ.name} ({getTemplatesForOccasion(occ.name).length})</span>
                  </button>
                );
              })}
            </div>
            {/* Mobile Scroll Indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#faf9fa] via-[#faf9fa]/80 to-transparent pointer-events-none md:hidden flex items-center justify-end pr-1">
              <ChevronRight className="w-6 h-10 text-[#78555e] opacity-70 animate-pulse" />
            </div>
          </div>

          {/* Templates Display Area */}
          <div className="relative">
            {filteredTemplates.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTemplates.map((tmpl, idx) => (
                    <article
                      key={idx}
                      className="l4u-template-card group min-h-[540px] h-[540px] flex flex-col overflow-hidden rounded-[1.6rem] p-3.5 bg-white/70 backdrop-blur-md border border-[#78555e]/10 shadow-sm hover:shadow-md hover:border-[#78555e]/15 transition-all duration-300"
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="relative h-[240px] overflow-hidden rounded-[1.25rem] bg-rose-50 border border-slate-100 shadow-inner">
                          <img src={tmpl.image} alt={tmpl.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const p = e.currentTarget.parentElement;
                              if (p) {
                                p.className = "relative h-[240px] overflow-hidden rounded-[1.25rem] bg-gradient-to-tr from-[#ffd1dc] to-[#e6d6ff] border border-slate-100 shadow-inner flex items-center justify-center";
                                const span = document.createElement("span");
                                span.innerText = "🎈 Sparkle Card";
                                span.className = "text-xl font-headline font-black text-[#78555e] tracking-tight";
                                p.appendChild(span);
                              }
                            }}
                          />
                          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${tmpl.tagClass}`}>
                            {tmpl.tag}
                          </span>
                        </div>
                        <div className="px-2 pb-2 pt-4 flex-1 flex flex-col">
                          <h3 className="font-headline text-2xl font-bold text-[#78555e] tracking-tight min-h-[72px] h-[72px] max-h-[72px] line-clamp-2 overflow-hidden text-ellipsis" title={tmpl.title}>{tmpl.title}</h3>
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#c64b7a] text-white text-[0.65rem] font-extrabold uppercase tracking-wider shadow-sm">
                              <ImageIcon className="w-3 h-3" /> {tmpl.imageCount} photos
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[#817476] leading-relaxed min-h-[80px] h-[80px] max-h-[80px] line-clamp-3 overflow-hidden text-ellipsis" title={tmpl.description}>{tmpl.description}</p>
                        </div>
                      </div>

                      {/* Create and Preview Buttons */}
                      <div className="l4u-template-card-actions px-2 pb-2 mt-auto flex flex-nowrap gap-3">
                        <Link
                          href={`/digital-greeting/create?template=${tmpl.id}&occasion=${encodeURIComponent(activeOccasion)}`}
                          className="l4u-template-card-button l4u-template-card-button-primary text-center truncate"
                        >
                          Create
                        </Link>
                        <button
                          onClick={() => setPreviewTemplate(tmpl.id)}
                          className="l4u-template-card-button l4u-template-card-button-sample truncate"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current flex-shrink-0" strokeWidth="2">
                            <path d="M14 5h5v5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M10 14L19 5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <span className="truncate">PREVIEW</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Mobile-only Explore Button at the bottom of results */}
                <div className="mt-12 flex justify-center md:hidden">
                  <button
                    onClick={() => {
                      setActiveOccasion(nextOccasion.name);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full max-w-xs flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-extrabold uppercase tracking-[0.11em] bg-gradient-to-r from-[#c64b7a] to-[#78555e] text-white shadow-lg active:scale-95 transition-all duration-200"
                  >
                    <span>Explore {nextOccasion.name}</span>
                    <ChevronRight className="w-4 h-4 text-white ml-0.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/40 border border-white/50 backdrop-blur-md rounded-2xl max-w-lg mx-auto shadow-sm my-8">
                <span className="text-4xl mb-3">✨</span>
                <h3 className="font-headline text-lg font-bold text-[#78555e] mb-1">No templates for {activeOccasion}</h3>
                <p className="text-xs text-[#817476] max-w-xs leading-relaxed">
                  We currently only have templates for Birthdays and Anniversaries. Select the <strong>Birthday</strong> or <strong>Anniversary</strong> occasion to customize your wishes page.
                </p>
                <button
                  onClick={() => setActiveOccasion("Birthday")}
                  className="mt-4 px-4 py-2 rounded-full text-[0.7rem] font-bold uppercase tracking-[0.11em] bg-[#78555e] text-white hover:opacity-90 shadow-md transition-all active:scale-95"
                >
                  Switch to Birthday
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="border-t border-[#78555e]/15 bg-transparent relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
          <div className="flex flex-col gap-3 text-xs text-[#817476] md:flex-row md:items-center md:justify-between">
            <p>Copyright 2026 MsgReplier Wishes. Crafted with intentionality.</p>
            <p>18,430+ community users • 49,210+ pages created</p>
          </div>
        </div>
      </footer>

      {/* Interactive Preview Modal Overlay */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/95">
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
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                  birthday_date: (() => {
                    const randomAgeYears = 18 + Math.floor(Math.random() * 15);
                    const birthDate = new Date();
                    birthDate.setFullYear(birthDate.getFullYear() - randomAgeYears);
                    birthDate.setMonth(Math.floor(Math.random() * 12));
                    birthDate.setDate(Math.floor(Math.random() * 28) + 1);
                    return birthDate.toISOString().split('T')[0];
                  })(),
                  photo_url: JSON.stringify([
                    { url: "", caption: "Example Picture 1" },
                    { url: "", caption: "Example Picture 2" },
                    { url: "", caption: "Example Picture 3" },
                    { url: "", caption: "Example Picture 4" },
                  ]),
                }}
                isPreview={true}
              />
            ) : previewTemplate === "classic-2d" ? (
              <TemplateClassic2D
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  birthday_date: (() => {
                    const randomAgeYears = 18 + Math.floor(Math.random() * 15);
                    const birthDate = new Date();
                    birthDate.setFullYear(birthDate.getFullYear() - randomAgeYears);
                    birthDate.setMonth(Math.floor(Math.random() * 12));
                    birthDate.setDate(Math.floor(Math.random() * 28) + 1);
                    return birthDate.toISOString().split('T')[0];
                  })(),
                  photo_url: JSON.stringify([
                    { url: "", caption: "You make my world beautiful ❤️" },
                    { url: "", caption: "Our memories are forever ✨" },
                    { url: "", caption: "My favorite smile in the world 💖" },
                    { url: "", caption: "Every second with you is a gift 🎁" },
                    { url: "", caption: "To many more adventures together 🥂" },
                    { url: "", caption: "Always & Forever 🌹" },
                  ]),
                }}
                isPreview={true}
              />
            ) : previewTemplate === "aurora" ? (
              <TemplateAurora
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  birthday_date: (() => {
                    const randomAgeYears = 18 + Math.floor(Math.random() * 15);
                    const birthDate = new Date();
                    birthDate.setFullYear(birthDate.getFullYear() - randomAgeYears);
                    birthDate.setMonth(Math.floor(Math.random() * 12));
                    birthDate.setDate(Math.floor(Math.random() * 28) + 1);
                    return birthDate.toISOString().split('T')[0];
                  })(),
                  photo_url: JSON.stringify([
                    { url: "https://static.vecteezy.com/system/resources/previews/036/619/697/non_2x/ai-generated-couple-of-lovers-in-cartoon-style-on-transparent-background-png.png", caption: '"Us" – my favorite chapter.' }
                  ]),
                }}
                isPreview={true}
              />
            ) : previewTemplate === "wishes5" ? (
              <IframeTemplate
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                  dob: `${new Date().getFullYear() - 22}-01-01`,
                  photo_url: JSON.stringify([
                    { url: "", caption: "Celebrate! 🎉" },
                    { url: "", caption: "You're Amazing 🌟" },
                    { url: "", caption: "Keep Shining ✨" },
                    { url: "", caption: "Stay Awesome 🎂" },
                  ]),
                }}
                templateFolder="template_wishes5"
              />
            ) : previewTemplate === "wishes3" ? (
              <IframeTemplate
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                  dob: `${new Date().getFullYear() - 22}-01-01`,
                  photo_url: JSON.stringify([
                    { url: "", caption: "Example Picture 1" },
                    { url: "", caption: "Example Picture 2" },
                    { url: "", caption: "Example Picture 3" },
                    { url: "", caption: "Example Picture 4" },
                  ]),
                }}
                templateFolder="template_wishes3"
              />
            ) : previewTemplate === "wishes6" ? (
              <IframeTemplate
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                  photo_url: JSON.stringify([
                    { url: "", caption: "Example Picture 1" },
                    { url: "", caption: "Example Picture 2" },
                    { url: "", caption: "Example Picture 3" },
                    { url: "", caption: "Example Picture 4" },
                  ]),
                }}
                templateFolder="template_wishes6"
              />
            ) : previewTemplate === "wishes7" ? (
              <IframeTemplate
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                  photo_url: JSON.stringify([
                    { url: "", caption: "Example Picture 1" },
                    { url: "", caption: "Example Picture 2" },
                    { url: "", caption: "Example Picture 3" },
                    { url: "", caption: "Example Picture 4" },
                  ]),
                }}
                templateFolder="template_wishes7"
              />
            ) : previewTemplate === "wishes8" ? (
              <IframeTemplate
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                  photo_url: JSON.stringify([
                    { url: "", caption: "Example Picture 1" },
                    { url: "", caption: "Example Picture 2" },
                    { url: "", caption: "Example Picture 3" },
                    { url: "", caption: "Example Picture 4" },
                  ]),
                }}
                templateFolder="template_wishes8"
              />
            ) : (
              <IframeTemplate
                greeting={{
                  recipient_name: "Sarah",
                  sender_name: "Michael",
                  message: "This is a preview of your beautiful wish! It contains all the love and happiness in the world. Customize it to make it yours.",
                  occasion: activeOccasion,
                  music_id: "none",
                }}
                templateFolder={`template_${previewTemplate}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Style overrides to match the digital greeting page styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Manrope:wght@400;500;700&display=swap');

        @keyframes selectPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); box-shadow: 0 4px 12px rgba(120, 85, 94, 0.25); }
          100% { transform: scale(1.05); }
        }

        .animate-select {
          animation: selectPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .font-headline {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .font-body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Drift backgrounds and layout */
        .l4u-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }

        .l4u-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          mix-blend-mode: multiply;
        }

        .l4u-blob-a {
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background-color: #ffd1dc;
        }

        .l4u-blob-b {
          top: 30%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          background-color: #e6d6ff;
        }

        .l4u-blob-c {
          bottom: -10%;
          left: 20%;
          width: 55vw;
          height: 55vw;
          background-color: #ffd1dc;
        }

        .l4u-kicker {
          display: inline-block;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c64b7a;
          background-color: rgba(198, 75, 122, 0.08);
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
        }

        /* Buttons matching digital-greeting template card styles exactly */
        .l4u-template-card-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 2.75rem;
          min-width: 0;
          padding: 0.78rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(120, 85, 94, 0.18);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease, color 220ms ease;
        }

        .l4u-template-card-button-primary {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(244, 226, 232, 0.9));
          color: #6f4452;
          box-shadow: 0 12px 22px rgba(120, 85, 94, 0.12);
        }

        .l4u-template-card-button-sample {
          background: rgba(255, 255, 255, 0.52);
          color: #7b5360;
          border-color: rgba(120, 85, 94, 0.22);
        }

        .l4u-template-card-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px rgba(120, 85, 94, 0.14);
        }

        .l4u-template-card-button-primary:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(245, 214, 223, 0.98));
          color: #613b47;
        }

        .l4u-template-card-button-sample:hover {
          background: rgba(255, 255, 255, 0.76);
          color: #65424f;
          border-color: rgba(120, 85, 94, 0.3);
        }
      `}</style>
    </div>
  );
}
