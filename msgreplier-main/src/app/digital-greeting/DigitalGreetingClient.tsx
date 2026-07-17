"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Cake,
  Star,
  Send,
  PartyPopper,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Menu,
  X,
  Music,
  Shield,
  HelpCircle,
  CheckCircle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import TemplateCake from "./components/TemplateCake";
import TemplateAurora from "./components/TemplateAurora";
import TemplateClassic2D from "./components/TemplateClassic2D";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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

function TypingBanner() {
  const phrases = [
    "WISHES WEBSITE AND LOVE SPACE ARE TWO DIFFERENT SERVICES GIVEN BY MSGREPLIER.",
    "THE LOGIN TO THE WISHES WEBSITE IS ONLY APPLY TO THE WISHES WEBSITE NOT APPLY TO THE LOVE SPACE."
  ];
  const [currentText, setCurrentText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = phrases[phraseIndex];

    const tick = () => {
      if (!isDeleting) {
        setCurrentText(fullText.slice(0, currentText.length + 1));
        if (currentText.length === fullText.length) {
          timer = setTimeout(() => setIsDeleting(true), 3200);
        } else {
          timer = setTimeout(tick, 60);
        }
      } else {
        setCurrentText(fullText.slice(0, currentText.length - 1));
        if (currentText.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          timer = setTimeout(tick, 300);
        } else {
          timer = setTimeout(tick, 30);
        }
      }
    };

    timer = setTimeout(tick, 60);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <span className="l4u-notebook-banner-typed" aria-live="polite">
      {currentText}
    </span>
  );
}

function Counter({ endValue, duration = 1200, suffix = "" }: { endValue: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(endValue);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration, hasStarted]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function ImmersiveWishesLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLSpanElement>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (err) {
        console.error("Failed to check auth state:", err);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const heroCanvas = canvasRef.current;
    const heroWordMount = mountRef.current;
    const heroFallback = fallbackRef.current;
    if (!heroCanvas || !heroWordMount) return;
    const ctx = heroCanvas.getContext("2d");
    if (!ctx) return;

    heroWordMount.classList.add("is-letter-canvas");

    const notes = [
      { word: "Digitally", label: "Send it digitally", lines: ["Dear  Hubby,", "FOR YOU <3", "I MISS YOUU NAA."], text: "" },
      { word: "Creatively", label: "Send it creatively", lines: ["Dear  My Love,", "I LOVE YOU <3", "FOREVER!"], text: "" },
      { word: "Privately", label: "Send it privately", lines: ["Dear  My Lady,", "Send  it", "Privately."], text: "" },
      { word: "Intentionally", label: "Send it intentionally", lines: ["Dear  Baby,", "I made this for you", "Cuz I miss you na :)."], text: "" },
      { word: "Beautifully", label: "Send it beautifully", lines: ["Dear  Hubby,", "I MISS YOU", "SO BAD :<"], text: "" }
    ];

    notes.forEach(note => {
      note.text = note.lines.join("\n");
    });

    let noteIndex = 0;
    let typedCharacterCount = 0;
    let animationHandle = 0;
    let phase = "intro";
    let phaseStartedAt = 0;
    let lastTypingStepAt = 0;
    let dpr = 1;
    let cssWidth = 0;
    let cssHeight = 0;
    let typeDelayMs = 68;
    let deleteDelayMs = 32;
    let holdDelayMs = 1280;
    let switchDelayMs = 240;
    let introDelayMs = 180;

    if (heroFallback) heroFallback.textContent = notes[0].word;
    heroWordMount.setAttribute("aria-label", notes[0].label);

    function getRenderDpr() {
      return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    }

    function configureAnimationSpeeds(viewportWidth: number) {
      const width = Math.max(320, viewportWidth);
      typeDelayMs = width < 420 ? 82 : (width < 768 ? 74 : 66);
      deleteDelayMs = width < 420 ? 36 : 30;
      holdDelayMs = width < 420 ? 1380 : 1280;
      switchDelayMs = width < 420 ? 280 : 230;
    }

    function buildRoundedRectPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
      const safeRadius = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + safeRadius, y);
      context.lineTo(x + width - safeRadius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
      context.lineTo(x + width, y + height - safeRadius);
      context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
      context.lineTo(x + safeRadius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
      context.lineTo(x, y + safeRadius);
      context.quadraticCurveTo(x, y, x + safeRadius, y);
      context.closePath();
    }

    function drawHeartSeal(context: CanvasRenderingContext2D, centerX: number, centerY: number, size: number) {
      const scale = Math.max(8, size);
      context.save();
      context.translate(centerX, centerY);
      context.beginPath();
      context.moveTo(0, scale * 0.42);
      context.bezierCurveTo(-scale * 0.82, -scale * 0.18, -scale * 0.82, -scale * 0.92, 0, -scale * 0.38);
      context.bezierCurveTo(scale * 0.82, -scale * 0.92, scale * 0.82, -scale * 0.18, 0, scale * 0.42);
      context.closePath();
      context.fillStyle = "#d95a86";
      context.fill();
      context.restore();
    }

    function getVisibleLines(note: typeof notes[0], visibleCharacterCount: number) {
      const text = String(note.text || "");
      const visibleText = text.slice(0, Math.max(0, visibleCharacterCount));
      const splitLines = visibleText.split("\n");
      while (splitLines.length < note.lines.length) {
        splitLines.push("");
      }
      return splitLines;
    }

    function fitFontSize(weight: string, preferredSize: number, sampleText: string, maxWidth: number) {
      let fontSize = Math.max(10, Math.round(preferredSize));
      const safeText = String(sampleText || "");
      do {
        ctx!.font = `${weight} ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
        if (ctx!.measureText(safeText).width <= maxWidth || fontSize <= 10) {
          break;
        }
        fontSize -= 1;
      } while (fontSize > 10);
      return fontSize;
    }

    function resizeCanvas() {
      if (!heroWordMount || !heroCanvas) return;
      const bounds = heroWordMount.getBoundingClientRect();
      const measuredWidth = Math.round(bounds.width);
      const measuredHeight = Math.round(bounds.height);
      if (!measuredWidth || measuredWidth < 120) return;
      cssWidth = Math.max(260, measuredWidth);
      if (cssWidth <= 525) {
        cssHeight = Math.max(220, measuredHeight || Math.round(cssWidth * 0.48));
      } else {
        cssHeight = Math.max(184, measuredHeight || Math.round(cssWidth * 0.37));
      }
      dpr = getRenderDpr();
      configureAnimationSpeeds(Math.max(320, window.innerWidth || cssWidth));
      heroCanvas.width = Math.round(cssWidth * dpr);
      heroCanvas.height = Math.round(cssHeight * dpr);
      heroCanvas.style.width = `${cssWidth}px`;
      heroCanvas.style.height = `${cssHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let resizeTimer = 0;
    function scheduleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 80);
    }

    function updateAnimationState(now: number) {
      const activeNote = notes[noteIndex];
      if (!phaseStartedAt) {
        phaseStartedAt = now;
        lastTypingStepAt = now;
      }
      if (phase === "intro") {
        if (now - phaseStartedAt >= introDelayMs) {
          phase = "typing";
          phaseStartedAt = now;
          lastTypingStepAt = now;
        }
        return;
      }
      if (phase === "typing") {
        if (typedCharacterCount >= activeNote.text.length) {
          phase = "hold";
          phaseStartedAt = now;
          return;
        }
        if (now - lastTypingStepAt >= typeDelayMs) {
          typedCharacterCount = Math.min(activeNote.text.length, typedCharacterCount + 1);
          lastTypingStepAt = now;
          if (typedCharacterCount >= activeNote.text.length) {
            phase = "hold";
            phaseStartedAt = now;
          }
        }
        return;
      }
      if (phase === "hold") {
        if (now - phaseStartedAt >= holdDelayMs) {
          phase = "erasing";
          phaseStartedAt = now;
          lastTypingStepAt = now;
        }
        return;
      }
      if (phase === "erasing") {
        if (typedCharacterCount <= 0) {
          phase = "switch";
          phaseStartedAt = now;
          return;
        }
        if (now - lastTypingStepAt >= deleteDelayMs) {
          typedCharacterCount = Math.max(0, typedCharacterCount - 1);
          lastTypingStepAt = now;
          if (typedCharacterCount <= 0) {
            phase = "switch";
            phaseStartedAt = now;
          }
        }
        return;
      }
      if (phase === "switch" && now - phaseStartedAt >= switchDelayMs) {
        noteIndex = (noteIndex + 1) % notes.length;
        typedCharacterCount = 0;
        phase = "typing";
        phaseStartedAt = now;
        lastTypingStepAt = now;
        if (heroFallback) heroFallback.textContent = notes[noteIndex].word;
        heroWordMount?.setAttribute("aria-label", notes[noteIndex].label);
      }
    }

    function drawScene(now: number) {
      if (!cssWidth || !cssHeight) return;
      const activeNote = notes[noteIndex];
      const rawVisibleText = activeNote.text.slice(0, Math.max(0, typedCharacterCount));
      const rawVisibleLines = rawVisibleText ? rawVisibleText.split("\n") : [""];
      let visibleLines = getVisibleLines(activeNote, typedCharacterCount);
      const isSmallViewport = cssWidth < 430;
      const isNarrowMobile = cssWidth <= 525;
      const baseInsetX = cssWidth * (isSmallViewport ? 0.045 : 0.08);
      const baseInsetY = cssHeight * (isSmallViewport ? 0.085 : 0.1);
      const shadowBlur = isSmallViewport ? 14 : 18;
      const shadowOffsetY = isSmallViewport ? 7 : 10;
      const shadowSafePad = 2;
      const shadowInsetX = Math.max(baseInsetX, shadowBlur + shadowSafePad);
      const shadowInsetTop = Math.max(baseInsetY, shadowBlur + shadowSafePad);
      const shadowInsetBottom = Math.max(baseInsetY, shadowOffsetY + shadowBlur + shadowSafePad);
      const paperX = shadowInsetX;
      const paperY = shadowInsetTop;
      const paperWidth = cssWidth - (shadowInsetX * 2);
      const paperHeight = cssHeight - shadowInsetTop - shadowInsetBottom;
      const paperRadius = Math.min(26, paperHeight * 0.16);
      const floatOffsetY = Math.sin(now / 1500) * (isSmallViewport ? 1.3 : 2.1);
      const tilt = Math.sin(now / 1800) * 0.018;
      let lineGap = Math.max(18, paperHeight * (isNarrowMobile ? 0.17 : (isSmallViewport ? 0.46 : 0.26)));
      const textX = paperX + paperWidth * 0.11;
      const maxTextWidth = paperWidth * (isNarrowMobile ? 0.66 : (isSmallViewport ? 0.58 : 0.72));
      let line1Size = fitFontSize("700", paperHeight * (isNarrowMobile ? 0.095 : (isSmallViewport ? 0.105 : 0.145)), activeNote.lines[0], maxTextWidth);
      let line2Size = fitFontSize("700", paperHeight * (isNarrowMobile ? 0.09 : (isSmallViewport ? 0.1 : 0.135)), activeNote.lines[1], maxTextWidth);
      let line3Size = fitFontSize("800", paperHeight * (isNarrowMobile ? 0.125 : (isSmallViewport ? 0.15 : 0.2)), activeNote.lines[2], maxTextWidth);

      const paddingVert = Math.max(12, paperHeight * 0.06);
      const approxTextHeight = (line1Size * 1.05) + (line2Size * 1.02) + (line3Size * 1.02) + (lineGap * 2);
      let globalScale = 1;
      if (approxTextHeight + paddingVert > paperHeight) {
        const scale = (paperHeight - paddingVert) / approxTextHeight;
        globalScale = Math.max(0.65, Math.min(1, scale));
        line1Size = Math.max(8, Math.round(line1Size * globalScale));
        line2Size = Math.max(8, Math.round(line2Size * globalScale));
        line3Size = Math.max(8, Math.round(line3Size * globalScale));
        lineGap = Math.max(18, Math.round(lineGap * Math.min(1, globalScale + 0.1)));
      }

      let baseLineStart = paperY + paperHeight * (isNarrowMobile ? 0.2 : (isSmallViewport ? 0.26 : 0.33));
      let lineBaselines = [
        baseLineStart,
        baseLineStart + lineGap,
        baseLineStart + (lineGap * 2)
      ];
      let lineStyles = [
        { weight: "700", size: line1Size, color: "#8c6674" },
        { weight: "700", size: line2Size, color: "#b37f93" },
        { weight: "800", size: line3Size, color: "#913b60" }
      ];
      const showCursor = phase !== "intro" && Math.floor(now / 520) % 2 === 0;
      const cursorLineIndex = Math.max(0, Math.min(activeNote.lines.length - 1, rawVisibleLines.length - 1));
      const visibleCursorLine = String(visibleLines[cursorLineIndex] || "");
      const currentLineStyle = lineStyles[cursorLineIndex];
      let cursorX = textX;
      const cursorY = lineBaselines[cursorLineIndex] - currentLineStyle.size * 0.88;
      const cursorWidth = Math.max(2, currentLineStyle.size * 0.08);
      const cursorHeight = currentLineStyle.size * 1.02;
      const paperLineEndX = paperX + paperWidth * 0.84;

      ctx!.clearRect(0, 0, cssWidth, cssHeight);
      ctx!.save();
      ctx!.translate(cssWidth / 2, (cssHeight / 2) + floatOffsetY);
      ctx!.rotate(tilt);
      ctx!.scale(globalScale, globalScale);
      ctx!.translate(-cssWidth / 2, -(cssHeight / 2) - floatOffsetY);

      ctx!.shadowColor = "rgba(120, 85, 94, 0.18)";
      ctx!.shadowBlur = shadowBlur;
      ctx!.shadowOffsetY = shadowOffsetY;

      buildRoundedRectPath(ctx!, paperX, paperY, paperWidth, paperHeight, paperRadius);
      ctx!.fillStyle = "#fffdfc";
      ctx!.fill();

      ctx!.shadowColor = "transparent";
      buildRoundedRectPath(ctx!, paperX, paperY, paperWidth, paperHeight, paperRadius);
      ctx!.strokeStyle = "rgba(225, 194, 206, 0.96)";
      ctx!.lineWidth = 1.25;
      ctx!.stroke();

      ctx!.fillStyle = "rgba(249, 222, 231, 0.95)";
      ctx!.fillRect(paperX + paperWidth * 0.08, paperY + paperHeight * 0.14, paperWidth * 0.16, Math.max(2, paperHeight * 0.018));

      drawHeartSeal(ctx!, paperX + paperWidth * 0.86, paperY + paperHeight * 0.18, paperHeight * 0.08);

      ctx!.strokeStyle = "rgba(223, 198, 208, 0.72)";
      ctx!.lineWidth = 1;
      lineBaselines.forEach(baselineY => {
        ctx!.beginPath();
        ctx!.moveTo(textX, baselineY + 8);
        ctx!.lineTo(paperLineEndX, baselineY + 8);
        ctx!.stroke();
      });

      visibleLines.forEach((lineText, index) => {
        const style = lineStyles[index];
        ctx!.font = `${style.weight} ${style.size}px 'Plus Jakarta Sans', sans-serif`;
        ctx!.textAlign = "left";
        ctx!.textBaseline = "alphabetic";
        ctx!.fillStyle = style.color;
        ctx!.fillText(String(lineText || ""), textX, lineBaselines[index]);
      });

      if (showCursor) {
        ctx!.font = `${currentLineStyle.weight} ${currentLineStyle.size}px 'Plus Jakarta Sans', sans-serif`;
        cursorX = textX + ctx!.measureText(visibleCursorLine).width + 4;
        cursorX = Math.min(paperLineEndX - cursorWidth, Math.max(textX, cursorX));
        ctx!.fillStyle = "#c64b7a";
        ctx!.fillRect(cursorX, cursorY, cursorWidth, cursorHeight);
      }
      ctx!.restore();
    }

    function runAnimation(now: number) {
      if (!cssWidth || !cssHeight) {
        animationHandle = window.requestAnimationFrame(runAnimation);
        return;
      }
      updateAnimationState(now);
      drawScene(now);
      animationHandle = window.requestAnimationFrame(runAnimation);
    }

    resizeCanvas();
    heroWordMount.classList.add("is-ready");
    animationHandle = window.requestAnimationFrame(runAnimation);

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        scheduleResize();
      });
      resizeObserver.observe(heroWordMount);
    }

    return () => {
      if (animationHandle) window.cancelAnimationFrame(animationHandle);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      if (resizeObserver) resizeObserver.disconnect();
      window.clearTimeout(resizeTimer);
    };
  }, []);

  const triggerMagic = () => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#78555e", "#ffd1dc", "#e6d6ff", "#e8dea4"]
    });
  };

  const [activeOccasion, setActiveOccasion] = useState("Birthday");

  const landingOccasions = [
    { name: "Birthday", icon: "🎂" },
    { name: "Anniversary", icon: "💍" },
    { name: "Love Greeting", icon: "💖" },
    { name: "Apoloy", icon: "🥺" },
    { name: "Special Moments", icon: "✨" },
    { name: "Flowers", icon: "💐" }
  ];

  const occDisplay = activeOccasion === "Apoloy" ? "Apology" : activeOccasion;

  const templatesList = [
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
      id: "wishes7",
      title: `Birthday Surprise 🎁`,
      description: `A dark romantic birthday experience with animated GIF, live seconds counter, memory gallery, and a heartfelt letter opener.`,
      image: "/birthday_locked_preview.png",
      tag: "Surprise",
      tagClass: "bg-[#8b1a1a]/85 text-white",
      imageCount: "0-4"
    },
    {
      id: "wishes10",
      title: `Retro Windows Memory 🌸`,
      description: `A beautiful retro OS style surprise with cake slicing, customizable memory slides swiper, and custom letter wax seal.`,
      image: "/wishes10_preview.png",
      tag: "Retro 95 Style",
      tagClass: "bg-[#ff5ea6]/85 text-white",
      imageCount: "0-4"
    },
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
      id: "wishes8",
      title: `Curtain & Envelope Surprise 🚪`,
      description: `A cinematic curtain entrance opening to a custom live countdown, swipeable memories carousel, and interactive sealable envelope letter.`,
      image: "/curtain_envelope_preview.png",
      tag: "Cinematic Curtain",
      tagClass: "bg-[#78555e]/90 text-white",
      imageCount: "0-4"
    },
    {
      id: "wishes11",
      title: `Matrix Neon Surprise 🌌`,
      description: `An immersive glowing cyberpunk code rain scene revealing your personalized wish, custom memories grid, and neon controls.`,
      image: "/wishes11_preview.png",
      tag: "Matrix Glowing",
      tagClass: "bg-emerald-600/85 text-white",
      imageCount: "0"
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
      id: "wishes5",
      title: `Zodiac Celebration ${occDisplay} 🌟`,
      description: `Immersive cosmic ${occDisplay.toLowerCase()} space with zodiac details, custom message cards, stars map, and fortune crystal ball.`,
      image: "/zodiac_space.png",
      tag: "Cosmic Zodiac",
      tagClass: "bg-indigo-900/85 text-white",
      imageCount: "0-4"
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
      id: "aurora",
      title: `Cham 3D ${occDisplay} Scene`,
      description: `An immersive 3D scene for your ${occDisplay.toLowerCase()} where candles need to be blown using the microphone.`,
      image: "/aurora.png",
      tag: "Interactive 3D",
      tagClass: "bg-[#c64b7a]/85 text-white",
      imageCount: "0-1"
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
      id: "wishes9",
      title: `Sweet Apology Surprise 🥺`,
      description: `A touching interactive apology letter experience with clean popups, soft music, and a "Beat Me" game if they are still sad.`,
      image: "/wishes9_preview.png",
      tag: "Apology & Game",
      tagClass: "bg-amber-500/85 text-white",
      imageCount: "0"
    },
    {
      id: "apology_1",
      title: `Interactive Apology Letter 🧸`,
      description: `A cute interactive apology experience with swiper slide messages, moving buttons, dynamic math equations, and falling hearts.`,
      image: "/wishes9_preview.png",
      tag: "Apology & Hearts",
      tagClass: "bg-pink-500/85 text-white",
      imageCount: "0"
    },
    {
      id: "wishes12",
      title: `Birthday Heart Animation 🎈`,
      description: `A retro canvas heart tree animation that grows on click with a live custom seconds counter and dynamic text.`,
      image: "/wishes12_preview.png",
      tag: "Heart Animation",
      tagClass: "bg-red-500 text-white",
      imageCount: "0"
    },
    {
      id: "wishes13",
      title: `Do You Love Me Question 💖`,
      description: `A playful yes/no question screen where the 'No' button runs away, resolving to an adorable silent celebratory success video.`,
      image: "/wishes13_preview.png",
      tag: "Love Game",
      tagClass: "bg-pink-500 text-white",
      imageCount: "0"
    },
    {
      id: "wishes15",
      title: `Valentine Letter Envelope ✉️`,
      description: `An envelope opening experience asking 'Will you be my Valentine?' with growing options, cute cat animations, and date plan final card.`,
      image: "/wishes15_preview.png",
      tag: "Valentine Card",
      tagClass: "bg-[#78555e]/90 text-white",
      imageCount: "0"
    }
  ];

  const filteredTemplates =
    activeOccasion === "Birthday"
      ? templatesList.filter((t) => !["wishes6", "propose_crush1", "wishes9", "apology_1", "wishes13", "wishes15", "wishes12"].includes(t.id))
      : activeOccasion === "Anniversary"
        ? templatesList.filter((t) => ["classic-2d", "hearts", "wishes4", "wishes5"].includes(t.id))
        : activeOccasion === "Apoloy"
          ? templatesList.filter((t) => ["wishes6", "propose_crush1", "wishes9", "apology_1"].includes(t.id))
          : activeOccasion === "Love Greeting"
            ? templatesList.filter((t) => ["propose_crush1", "wishes6", "wishes13", "wishes15"].includes(t.id))
            : activeOccasion === "Flowers"
              ? templatesList.filter((t) => ["wishes12"].includes(t.id))
              : [];

  return (
    <div className="l4u-body relative min-h-screen bg-[#faf9fa] text-[#1a1c1d] font-body selection:bg-[#ffd1dc] overflow-x-hidden">

      {/* Dynamic Background drifting gradients */}
      <div className="l4u-background" aria-hidden="true">
        <span className="l4u-blob l4u-blob-a"></span>
        <span className="l4u-blob l4u-blob-b"></span>
        <span className="l4u-blob l4u-blob-c"></span>
      </div>

      <main className="relative z-10 pb-16">
        {/* Announcement banner typing marquee */}
        <section className="w-full">
          <div className="l4u-home-announcement l4u-notebook-banner">
            <span className="l4u-notebook-banner-prefix" aria-hidden="true">
              <span className="material-symbols-outlined l4u-notebook-banner-icon">campaign</span>
              <span className="l4u-notebook-banner-prefix-text">Announcement</span>
            </span>
            <TypingBanner />
          </div>
        </section>

        {/* Hero Section */}
        <section className="mx-auto w-full max-w-7xl px-4 pt-10 md:px-8">
          <div className="l4u-landing-hero p-8 text-center md:p-14">
            <h1 className="font-headline text-4xl font-extrabold leading-[1.08] tracking-tight text-[#1a1c1d] md:text-7xl">
              <span ref={mountRef} id="heroMorphWord" className="block l4u-gradient-word-morph" aria-label="Digitally">
                <canvas ref={canvasRef} id="heroMorphCanvas" className="l4u-gradient-word-canvas" width="760" height="170"></canvas>
                <span ref={fallbackRef} id="heroMorphFallback" className="l4u-gradient-word-fallback">Digitally</span>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#817476] md:text-base">
              Create beautiful digital letters, mini websites, and photo greeting collages for free with MsgReplier Wishes. The most intentional way to express yourself online.
            </p>

            {/* Marquee notes track */}
            <div className="l4u-marquee-shell mt-7" aria-label="Animated feature categories">
              <div className="l4u-marquee-loop">
                <div className="l4u-marquee-track">
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-yellow">
                      <div className="note-clip pin top-left" aria-hidden="true"></div>
                      <div className="note-clip tape top-right" aria-hidden="true"></div>
                      <div className="note-content">Wishes Letters in Motion</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-blue">
                      <div className="note-clip paperclip left" aria-hidden="true"></div>
                      <div className="note-content">Interactive 3D Candle Blowing</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-pink">
                      <div className="note-clip pin top-center" aria-hidden="true"></div>
                      <div className="note-content">PIN-Protected Private Pages</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-green">
                      <div className="note-clip tape bottom-left" aria-hidden="true"></div>
                      <div className="note-content">Custom templates Available</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-lavender">
                      <div className="note-clip pushpin right" aria-hidden="true"></div>
                      <div className="note-content">Cloud-Synced Drafts</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-peach">
                      <div className="note-clip paperclip top-left-small" aria-hidden="true"></div>
                      <div className="note-content">Instant WhatsApp Links</div>
                    </div>
                  </div>
                </div>
                {/* Duplicate track for loop */}
                <div className="l4u-marquee-track" aria-hidden="true">
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-yellow">
                      <div className="note-clip pin top-left" aria-hidden="true"></div>
                      <div className="note-content">Wishes Letters in Motion</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-blue">
                      <div className="note-clip paperclip left" aria-hidden="true"></div>
                      <div className="note-content">Interactive 3D Candle Blowing</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-pink">
                      <div className="note-clip pin top-center" aria-hidden="true"></div>
                      <div className="note-content">PIN-Protected Private Pages</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-green">
                      <div className="note-clip tape bottom-left" aria-hidden="true"></div>
                      <div className="note-content">Custom templates Available</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-lavender">
                      <div className="note-clip pushpin right" aria-hidden="true"></div>
                      <div className="note-content">Cloud-Synced Drafts</div>
                    </div>
                  </div>
                  <div className="l4u-marquee-item">
                    <div className="l4u-sticky-note note-pastel-peach">
                      <div className="note-clip paperclip top-left-small" aria-hidden="true"></div>
                      <div className="note-content">Instant WhatsApp Links</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/digital-greeting/templates" onClick={triggerMagic}
                className="l4u-gradient-button rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.11em] text-white shadow-lg shadow-[#78555e]/20 transition-all hover:scale-105">
                Create Now
              </Link>
              <Link href={isLoggedIn ? "/wishes/dashboard" : "/wishes/login"}
                className="l4u-outline-button rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.11em] border border-[#78555e]/22 bg-white text-[#78555e] transition-all hover:bg-[#78555e]/5">
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Counter Stats section */}
        <section className="mx-auto mt-8 w-full max-w-7xl px-4 md:px-8">
          <div className="grid gap-3 p-2 md:grid-cols-3 md:p-3 bg-white/40 border border-white/50 backdrop-blur-md rounded-2xl">
            <article className="text-center p-4">
              <p className="font-headline text-4xl font-extrabold text-[#78555e]">
                <Counter endValue={18430} suffix="+" />
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#817476]">Community Users</p>
            </article>
            <article className="text-center p-4">
              <p className="font-headline text-4xl font-extrabold text-[#78555e]">
                <Counter endValue={49210} suffix="+" />
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#817476]">Pages Created</p>
            </article>
            <article className="text-center p-4">
              <p className="font-headline text-4xl font-extrabold text-[#78555e]">
                <Counter endValue={20} />
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#817476]">Featured Templates</p>
            </article>
          </div>
        </section>

        {/* Choose a Template loop track */}
        <section id="choose-template" className="mx-auto mt-14 w-full max-w-7xl px-4 md:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="l4u-kicker">Start your canvas</p>
              <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[#1a1c1d]">Choose a template</h2>
            </div>
            <Link href="/digital-greeting/templates" className="text-xs font-bold uppercase tracking-[0.1em] text-[#78555e] hover:text-[#9c6f79] transition-colors">
              Browse all templates
            </Link>
          </div>



          <div className="l4u-template-loop-shell">
            {filteredTemplates.length > 0 ? (
              <div className="l4u-template-loop">
                <div className="l4u-template-loop-track">
                  {filteredTemplates.map((tmpl, idx) => (
                    <article key={idx} className="l4u-template-card l4u-template-loop-card group min-h-[510px] h-[510px] flex flex-col overflow-hidden rounded-[1.6rem] p-3 bg-white/70 backdrop-blur-md">
                      <div className="flex-1 flex flex-col">
                        <div className="relative h-[240px] overflow-hidden rounded-[1.25rem] bg-rose-50 border border-slate-100 shadow-inner">
                          <img src={tmpl.image} alt={tmpl.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(e) => {
                              // If generated image fails to load, fallback to styled CSS visual
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
                          <p className="mt-2 text-sm text-[#817476] leading-relaxed min-h-[80px] h-[80px] max-h-[80px] line-clamp-3 overflow-hidden text-ellipsis" title={tmpl.description}>{tmpl.description}</p>
                        </div>
                      </div>
                      <div className="l4u-template-card-actions px-2 pb-2 mt-auto">
                        <Link href="/digital-greeting/templates" className="l4u-template-card-button l4u-template-card-button-primary text-center truncate w-full">
                          Explore Templates
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Duplicate track for seamless loop */}
                <div className="l4u-template-loop-track" aria-hidden="true">
                  {filteredTemplates.map((tmpl, idx) => (
                    <article key={`dup-${idx}`} className="l4u-template-card l4u-template-loop-card group min-h-[510px] h-[510px] flex flex-col overflow-hidden rounded-[1.6rem] p-3 bg-white/70 backdrop-blur-md">
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
                          <p className="mt-2 text-sm text-[#817476] leading-relaxed min-h-[80px] h-[80px] max-h-[80px] line-clamp-3 overflow-hidden text-ellipsis" title={tmpl.description}>{tmpl.description}</p>
                        </div>
                      </div>
                      <div className="l4u-template-card-actions px-2 pb-2 mt-auto">
                        <Link href="/digital-greeting/templates" className="l4u-template-card-button l4u-template-card-button-primary text-center truncate w-full">
                          Explore Templates
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/40 border border-white/50 backdrop-blur-md rounded-2xl max-w-lg mx-auto shadow-sm my-4">
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
        </section>

        {/* Guides Section */}
        <section className="mx-auto mt-14 w-full max-w-7xl px-4 md:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="l4u-kicker">Public Guides</p>
              <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[#1a1c1d]">Learn before you create</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#817476]">
                Explore quick guides to understand how the Wishes builder works, what templates are best for, and how to create the ultimate interactive surprise.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="l4u-template-card rounded-[1.6rem] p-6 bg-white/65 backdrop-blur-md">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#817476]">Guide</p>
              <h3 className="mt-2 font-headline text-2xl font-bold text-[#78555e]">Mastering MsgReplier Features</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#817476]">
                Get a complete walkthrough of our customization tools, from adding YouTube music and custom photos to setting up PIN-protection and sharing via WhatsApp.
              </p>
              <Link href="/blog/create-website-for-wishes" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.1em] text-[#78555e] hover:text-[#9c6f79] items-center gap-1">
                Read Features Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </article>

            <article className="l4u-template-card rounded-[1.6rem] p-6 bg-white/65 backdrop-blur-md">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#817476]">Guide</p>
              <h3 className="mt-2 font-headline text-2xl font-bold text-[#78555e]">Choosing the Right Template</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#817476]">
                Not sure where to start? Compare our Classic 2D designs, interactive 3D candle blowing experiences, and slider surprises to find the perfect fit for your loved one.
              </p>
              <Link href="/blog/birthday-wishes-website-guide" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.1em] text-[#78555e] hover:text-[#9c6f79] items-center gap-1">
                Read Templates Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </article>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section className="l4u-faq mx-auto mt-16 w-full max-w-6xl px-4 md:px-8">
          <div className="rounded-[1.7rem] p-6 md:p-10 bg-white/70 border border-white/50 backdrop-blur-md">
            <p className="l4u-kicker text-center">Simple Pricing</p>
            <h2 className="mt-2 text-center font-headline text-4xl font-extrabold tracking-tight text-[#1a1c1d]">Choose Your Plan</h2>
            <p className="mt-3 text-center text-sm text-[#817476] max-w-lg mx-auto leading-relaxed">
              Start for free. Upgrade anytime to unlock more websites, credits, and features.
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mt-8 mb-10">
              <div id="pricing-toggle" className="inline-flex bg-[#faf9fa] border border-[#78555e]/15 rounded-full p-1 gap-1">
                {[
                  { key: "monthly", label: "Monthly" },
                  { key: "3month", label: "3 Months", badge: "10% OFF" },
                  { key: "annual", label: "Annual", badge: "20% OFF" },
                ].map(({ key, label, badge }) => (
                  <button
                    key={key}
                    onClick={() => {
                      document.querySelectorAll('[data-billing]').forEach(el => {
                        const elKey = el.getAttribute('data-billing');
                        const btn = document.getElementById(`pbtn-${elKey}`);
                        if (btn) {
                          if (elKey === key) {
                            btn.classList.add('bg-[#78555e]', 'text-white', 'shadow-sm');
                            btn.classList.remove('text-[#817476]');
                          } else {
                            btn.classList.remove('bg-[#78555e]', 'text-white', 'shadow-sm');
                            btn.classList.add('text-[#817476]');
                          }
                        }
                        // update price displays
                        const priceEls = document.querySelectorAll(`[data-price-plan]`);
                        priceEls.forEach(pe => {
                          const plan = pe.getAttribute('data-price-plan');
                          const prices: Record<string, Record<string, string>> = {
                            starter: { monthly: '49', '3month': '132', annual: '470' },
                            creator: { monthly: '99', '3month': '267', annual: '950' },
                          };
                          if (plan && prices[plan]) pe.textContent = prices[plan][key];
                        });
                        const periodEls = document.querySelectorAll('[data-period]');
                        const periodMap: Record<string, string> = { monthly: '/month', '3month': '/3 months', annual: '/year' };
                        periodEls.forEach(pe => { pe.textContent = periodMap[key]; });
                        // savings badges
                        const savingEls = document.querySelectorAll('[data-savings-plan]');
                        const savingsData: Record<string, Record<string, number>> = {
                          starter: { monthly: 0, '3month': 15, annual: 118 },
                          creator: { monthly: 0, '3month': 30, annual: 238 }
                        };
                        savingEls.forEach(se => {
                          const sp = se.getAttribute('data-savings-plan');
                          if (sp) {
                            const saved = savingsData[sp]?.[key] ?? 0;
                            if (saved > 0) {
                              se.textContent = `Save ₹${saved} vs monthly`;
                              (se as HTMLElement).style.visibility = 'visible';
                            } else {
                              (se as HTMLElement).style.visibility = 'hidden';
                            }
                          }
                        });
                      });
                    }}
                    id={`pbtn-${key}`}
                    data-billing={key}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${key === 'monthly' ? 'bg-[#78555e] text-white shadow-sm' : 'text-[#817476]'
                      }`}
                  >
                    {label}
                    {badge && <span className="bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch max-w-4xl mx-auto">

              {/* Free */}
              <div className="rounded-[1.4rem] p-6 bg-white/65 border border-[#78555e]/10 backdrop-blur-md flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#faf9fa] border border-[#78555e]/15 flex items-center justify-center text-lg mb-4">🎁</div>
                <h3 className="font-headline text-lg font-bold text-[#1a1c1d] mb-5">Free</h3>
                <div className="mb-5 min-h-[80px]">
                  <div className="flex items-end gap-1 leading-none"><span className="text-xl font-semibold text-[#817476]">₹</span><span className="text-4xl font-extrabold text-[#1a1c1d]">0</span></div>
                  <span className="text-sm text-[#817476]">forever</span>
                  <div className="mt-2 min-h-[22px]"><span className="invisible text-xs">–</span></div>
                </div>
                <div className="h-px bg-[#78555e]/10 mb-5" />
                <ul className="flex flex-col gap-2.5 flex-1 mb-6 text-sm">
                  {[['✓', '6 credits'], ['✓', '12 websites'], ['✓', '2MB image upload'], ['✗', 'Email support'], ['✗', 'Live chat']].map(([ic, txt], i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${ic === '✓' ? 'bg-[#faf9fa] border border-[#78555e]/20 text-[#78555e]' : 'bg-[#fafafa] border border-[#e8e0e4] text-[#c4b0b5]'}`}>{ic}</span>
                      <span className={ic === '✓' ? 'text-[#3d2c2e]' : 'text-[#b5a5a8]'}>{txt}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/digital-greeting#choose-template" className="w-full py-3 px-4 rounded-xl text-sm font-semibold border border-[#78555e]/25 text-[#817476] hover:bg-[#faf9fa] transition-all text-center block">
                  Get Started Free
                </Link>
              </div>

              {/* Starter */}
              <div className="rounded-[1.4rem] p-6 bg-white/65 border border-[#78555e]/10 backdrop-blur-md flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#faf9fa] border border-[#78555e]/15 flex items-center justify-center text-lg mb-4">⚡</div>
                <h3 className="font-headline text-lg font-bold text-[#1a1c1d] mb-5">Starter</h3>
                <div className="mb-5 min-h-[80px]">
                  <div className="flex items-end gap-1 leading-none"><span className="text-xl font-semibold text-[#817476] mt-1">₹</span><span className="text-4xl font-extrabold text-[#1a1c1d]" data-price-plan="starter">49</span></div>
                  <span className="text-sm text-[#817476]" data-period="/month">/month</span>
                  <div className="mt-2 min-h-[22px]"><span className="text-xs font-semibold bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full" data-savings-plan="starter" style={{ visibility: 'hidden' }}>–</span></div>
                </div>
                <div className="h-px bg-[#78555e]/10 mb-5" />
                <ul className="flex flex-col gap-2.5 flex-1 mb-6 text-sm">
                  {[['✓', '20 credits'], ['✓', '25 websites'], ['✓', '5MB image upload'], ['✓', 'Email support'], ['✗', 'Live chat']].map(([ic, txt], i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${ic === '✓' ? 'bg-[#faf9fa] border border-[#78555e]/20 text-[#78555e]' : 'bg-[#fafafa] border border-[#e8e0e4] text-[#c4b0b5]'}`}>{ic}</span>
                      <span className={ic === '✓' ? 'text-[#3d2c2e]' : 'text-[#b5a5a8]'}>{txt}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/digital-greeting/pricing" className="w-full py-3 px-4 rounded-xl text-sm font-semibold border border-[#78555e] text-[#78555e] hover:bg-[#78555e] hover:text-white transition-all text-center block">
                  Choose Starter
                </Link>
              </div>

              {/* Creator — featured */}
              <div className="relative rounded-[1.4rem] p-6 bg-gradient-to-br from-[#78555e] to-[#c64b7a] border border-[#78555e] flex flex-col shadow-lg shadow-[#78555e]/25">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-black text-[10px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap">👑 Most Popular</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-4">👑</div>
                <h3 className="font-headline text-lg font-bold text-white mb-5">Creator</h3>
                <div className="mb-5 min-h-[80px]">
                  <div className="flex items-end gap-1 leading-none"><span className="text-xl font-semibold text-white/70 mt-1">₹</span><span className="text-4xl font-extrabold text-white" data-price-plan="creator">99</span></div>
                  <span className="text-sm text-white/70" data-period="/month">/month</span>
                  <div className="mt-2 min-h-[22px]"><span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full" data-savings-plan="creator" style={{ visibility: 'hidden' }}>–</span></div>
                </div>
                <div className="h-px bg-white/20 mb-5" />
                <ul className="flex flex-col gap-2.5 flex-1 mb-6 text-sm text-white">
                  {[['✓', '50 credits'], ['✓', '100 websites'], ['✓', '15MB image upload'], ['✓', 'Priority email support'], ['★', 'Live chat included']].map(([ic, txt], i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${ic === '★' ? 'bg-amber-100 text-amber-600' : 'bg-white/20 text-white'}`}>{ic}</span>
                      <span className="text-white">{txt}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/digital-greeting/pricing" className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-white text-[#78555e] hover:bg-[#faf6f8] transition-all text-center block font-bold">
                  Choose Creator
                </Link>
              </div>

            </div>

            {/* Full pricing page link */}
            <div className="mt-8 text-center">
              <Link href="/digital-greeting/pricing" className="inline-flex items-center gap-2 text-sm font-bold text-[#78555e] hover:text-[#c64b7a] transition-colors">
                View full pricing details & billing options <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FAQ Section */}
      <section className="mx-auto mt-16 w-full max-w-4xl px-4 md:px-8 mb-16">
        <div className="text-center mb-10">
          <p className="l4u-kicker">Got Questions?</p>
          <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[#1a1c1d]">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-6 bg-white/65 border border-[#78555e]/10 backdrop-blur-md">
            <h3 className="font-headline text-lg font-bold text-[#78555e]">Is MsgReplier Wishes free to use?</h3>
            <p className="mt-2 text-sm text-[#817476] leading-relaxed">
              Yes! You can start for free and create up to 12 digital wishes websites with our Free plan. We also offer premium plans with more credits and exclusive features if you need them.
            </p>
          </div>
          <div className="rounded-[1.4rem] p-6 bg-white/65 border border-[#78555e]/10 backdrop-blur-md">
            <h3 className="font-headline text-lg font-bold text-[#78555e]">How do I share the wishes website with my loved one?</h3>
            <p className="mt-2 text-sm text-[#817476] leading-relaxed">
              Once you customize and publish your digital greeting, you'll receive a unique link. You can easily copy and share this link via WhatsApp, Instagram, SMS, or any other messaging app.
            </p>
          </div>
          <div className="rounded-[1.4rem] p-6 bg-white/65 border border-[#78555e]/10 backdrop-blur-md">
            <h3 className="font-headline text-lg font-bold text-[#78555e]">Can I add my own music and photos?</h3>
            <p className="mt-2 text-sm text-[#817476] leading-relaxed">
              Absolutely! Our builder allows you to upload your own photos for the galleries and add YouTube links to play custom background music, making your wish truly personal and magical.
            </p>
          </div>
          <div className="rounded-[1.4rem] p-6 bg-white/65 border border-[#78555e]/10 backdrop-blur-md">
            <h3 className="font-headline text-lg font-bold text-[#78555e]">Are the digital wishes websites private?</h3>
            <p className="mt-2 text-sm text-[#817476] leading-relaxed">
              Yes, you have full control over privacy. You can choose to PIN-protect your digital wishes websites so that only the intended recipient with the code can view your surprise.
            </p>
          </div>
        </div>
      </section>


      {/* Replicated Footer */}
      <footer className="mt-24 border-t border-[#78555e]/15 bg-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-8 md:px-8">
          <div className="flex flex-col gap-4 text-xs text-[#817476] md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p>Copyright 2026 MsgReplier Wishes. Crafted with intentionality.</p>
              <p>18,430+ community users • 49,210+ pages created</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/privacy-policy" className="hover:text-[#78555e] transition-colors">Privacy Policy</Link>
              <Link href="/terms-conditions" className="hover:text-[#78555e] transition-colors">Terms of Service</Link>
              <Link href="/cookie-policy" className="hover:text-[#78555e] transition-colors">Cookie Policy</Link>
              <Link href="/about" className="hover:text-[#78555e] transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-[#78555e] transition-colors">Contact Us</Link>
            </div>
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

      {/* Styles Injection block for custom keyframes and structures */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Manrope:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-headline {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .font-body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Variables matching letter4u palette */
        :root {
          --lfu-primary: #78555e;
          --lfu-primary-soft: #ffd1dc;
          --lfu-secondary-soft: #e6d6ff;
          --lfu-tertiary-soft: #e8dea4;
          --lfu-surface: #faf9fa;
          --lfu-surface-low: #f4f3f4;
          --lfu-ink: #1a1c1d;
          --lfu-muted: #675b7e;
          --lfu-outline: #817476;
        }

        /* Dynamic background blobs */
        .l4u-background {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .l4u-background::before,
        .l4u-background::after {
          content: "";
          position: absolute;
          inset: -28%;
          filter: blur(78px);
          opacity: 0.48;
          transform-origin: center;
          animation: l4uGradientDrift 28s linear infinite;
        }

        .l4u-background::before {
          background:
            radial-gradient(circle at 22% 26%, rgba(255, 202, 219, 0.78) 0%, transparent 42%),
            radial-gradient(circle at 78% 28%, rgba(211, 198, 255, 0.66) 0%, transparent 39%),
            radial-gradient(circle at 50% 86%, rgba(241, 228, 170, 0.62) 0%, transparent 44%);
        }

        .l4u-background::after {
          animation-direction: reverse;
          animation-duration: 36s;
          background:
            radial-gradient(circle at 72% 12%, rgba(255, 217, 232, 0.44) 0%, transparent 38%),
            radial-gradient(circle at 24% 76%, rgba(196, 222, 255, 0.42) 0%, transparent 40%),
            radial-gradient(circle at 88% 78%, rgba(229, 200, 255, 0.38) 0%, transparent 42%);
        }

        .l4u-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.2;
          animation: l4uBlobFloat 18s ease-in-out infinite;
        }

        .l4u-blob-a {
          width: 460px;
          height: 460px;
          left: -140px;
          top: -120px;
          background: var(--lfu-primary-soft);
        }

        .l4u-blob-b {
          width: 520px;
          height: 520px;
          right: -170px;
          top: 12%;
          animation-delay: -6s;
          background: var(--lfu-secondary-soft);
        }

        .l4u-blob-c {
          width: 420px;
          height: 420px;
          left: 38%;
          bottom: -160px;
          animation-delay: -10s;
          background: var(--lfu-tertiary-soft);
        }

        @keyframes l4uBlobFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.06);
          }
        }

        @keyframes l4uGradientDrift {
          0% {
            transform: translate3d(-3%, -2%, 0) scale(1.02) rotate(0deg);
          }
          50% {
            transform: translate3d(4%, 3%, 0) scale(1.09) rotate(8deg);
          }
          100% {
            transform: translate3d(-3%, -2%, 0) scale(1.02) rotate(16deg);
          }
        }

        /* Announcement banner styles */
        .l4u-home-announcement {
          width: 100%;
          border-radius: 0;
          border-bottom: 1px solid rgba(213, 164, 142, 0.4);
          background:
            repeating-linear-gradient(
              180deg,
              rgba(255, 252, 242, 0.98) 0,
              rgba(255, 252, 242, 0.98) 25px,
              rgba(233, 206, 183, 0.5) 25px,
              rgba(233, 206, 183, 0.5) 26px
            );
          box-shadow: 0 10px 20px rgba(159, 108, 90, 0.08);
          color: #9a3f47;
          text-decoration: none;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          position: relative;
          min-height: 2.55rem;
          padding: 0.52rem 1.15rem 0.48rem 4rem;
        }

        .l4u-home-announcement::before {
          content: "";
          position: absolute;
          left: 2.95rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, rgba(212, 95, 103, 0.48) 0%, rgba(212, 95, 103, 0.34) 100%);
        }

        .l4u-home-announcement::after {
          content: "";
          position: absolute;
          left: 1.06rem;
          top: 0.3rem;
          bottom: 0.3rem;
          width: 1.15rem;
          background: radial-gradient(circle at 50% 12px, rgba(181, 147, 125, 0.42) 0 4px, transparent 4.5px);
          background-size: 100% 24px;
          opacity: 0.95;
          pointer-events: none;
        }

        .l4u-notebook-banner-prefix {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          flex: 0 0 auto;
          color: rgba(150, 89, 82, 0.85);
        }

        .l4u-notebook-banner-icon {
          font-size: 0.92rem;
          line-height: 1;
        }

        .l4u-notebook-banner-prefix-text {
          font-size: 0.54rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          display: none;
        }

        .l4u-notebook-banner-typed {
          display: inline-flex;
          align-items: center;
          flex: 1 1 auto;
          min-width: 0;
          min-height: 1.1em;
          max-width: 100%;
          white-space: nowrap;
          overflow-x: auto;
          overflow-y: hidden;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.085em;
          text-transform: uppercase;
          color: #9a3f47;
          font-family: 'Manrope', sans-serif;
        }

        .l4u-notebook-banner-typed::after {
          content: "";
          width: 2px;
          height: 0.95em;
          margin-left: 0.26rem;
          background: currentColor;
          animation: l4uNotebookCursorBlink 1s steps(1, end) infinite;
        }

        @keyframes l4uNotebookCursorBlink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Gradient Button */
        .l4u-gradient-button {
          background: linear-gradient(135deg, #78555e 0%, #9c6f79 100%);
          color: #fff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .l4u-gradient-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(120, 85, 94, 0.25);
        }

        /* Hero Text Morph canvas */
        .l4u-gradient-word-morph {
          position: relative;
          display: inline-block;
          width: 100%;
          max-width: 760px;
          min-height: 170px;
          margin: 0 auto;
        }

        .l4u-gradient-word-canvas {
          display: none;
          max-width: 100%;
          height: auto;
        }

        .is-letter-canvas .l4u-gradient-word-canvas {
          display: block;
          margin: 0 auto;
        }

        .is-letter-canvas .l4u-gradient-word-fallback {
          display: none;
        }

        .l4u-gradient-word-fallback {
          display: block;
          font-size: clamp(3.2rem, 9.5vw, 6.2rem);
          font-weight: 800;
          background: linear-gradient(135deg, #78555e 0%, #b37f93 50%, #913b60 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .l4u-kicker {
          margin: 0;
          font-size: 0.67rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--lfu-primary);
        }

        /* Scrolling sticky label marquee loop */
        .l4u-marquee-shell {
          width: 100%;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
        }

        .l4u-marquee-loop {
          display: flex;
          width: max-content;
          animation: l4uMarqueeScroll 32s linear infinite;
        }

        .l4u-marquee-track {
          display: flex;
          gap: 1.5rem;
          padding: 0.8rem 0;
        }

        .l4u-marquee-item {
          flex-shrink: 0;
        }

        @keyframes l4uMarqueeScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        /* Sticky note scrapbook cards */
        .l4u-sticky-note {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 12.6rem;
          min-height: 4.2rem;
          padding: 0.6rem 0.9rem;
          border-radius: 0.6rem;
          box-shadow: 0 8px 18px rgba(26,28,29,0.04);
          border: 1px solid rgba(0,0,0,0.05);
          font-weight: 700;
          color: #3b2b2f;
          text-align: center;
          font-size: 0.88rem;
          line-height: 1.1;
          transform: rotate(-1.2deg);
        }

        .l4u-sticky-note .note-content {
          z-index: 2;
        }

        .note-pastel-yellow { background: linear-gradient(180deg,#fff9e6,#fff6d8); }
        .note-pastel-blue { background: linear-gradient(180deg,#e9f3ff,#e6f7ff); }
        .note-pastel-pink { background: linear-gradient(180deg,#fff0f6,#ffeef3); }
        .note-pastel-green { background: linear-gradient(180deg,#f0fff6,#e9fff1); }
        .note-pastel-lavender { background: linear-gradient(180deg,#f7f2ff,#f2ecff); }
        .note-pastel-peach { background: linear-gradient(180deg,#fff4ee,#fff0e6); }

        .note-clip { position: absolute; z-index: 4; }
        .note-clip.pin { width: 12px; height: 12px; border-radius: 50%; background: #ffd1dc; box-shadow: 0 2px 0 rgba(0,0,0,0.08); }
        .note-clip.pin.top-left { top: -6px; left: 10px; }
        .note-clip.pin.top-center { top: -6px; left: 50%; transform: translateX(-50%); }
        .note-clip.pushpin { width: 10px; height: 14px; border-radius: 6px 6px 2px 2px; background: #ffb6c1; box-shadow: 0 2px 0 rgba(0,0,0,0.08); }
        .note-clip.pushpin.right { right: 8px; top: 6px; transform: rotate(12deg); }
        .note-clip.paperclip { width: 28px; height: 18px; right: -8px; top: 10px; border-radius: 12px; border: 2px solid rgba(0,0,0,0.12); transform: rotate(-18deg); box-shadow: 0 2px 0 rgba(0,0,0,0.03); }
        .note-clip.paperclip.left { left: -10px; transform: rotate(12deg); }
        .note-clip.tape { width: 36px; height: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2)); border-radius: 2px; box-shadow: 0 6px 10px rgba(0,0,0,0.04) inset; }
        .note-clip.tape.top-right { top: -6px; right: 8px; transform: rotate(-6deg); }
        .note-clip.tape.bottom-left { bottom: -6px; left: 8px; transform: rotate(6deg); }
        .note-clip.top-left-small { width: 18px; height: 8px; top: -4px; left: 8px; transform: rotate(-4deg); background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.45)); border-radius:2px; }

        .l4u-marquee-track .l4u-marquee-item:nth-child(6n+1) .l4u-sticky-note { transform: rotate(-2deg); }
        .l4u-marquee-track .l4u-marquee-item:nth-child(6n+2) .l4u-sticky-note { transform: rotate(1.5deg); }
        .l4u-marquee-track .l4u-marquee-item:nth-child(6n+3) .l4u-sticky-note { transform: rotate(-1deg); }
        .l4u-marquee-track .l4u-marquee-item:nth-child(6n+4) .l4u-sticky-note { transform: rotate(2deg); }
        .l4u-marquee-track .l4u-marquee-item:nth-child(6n+5) .l4u-sticky-note { transform: rotate(-0.6deg); }
        .l4u-marquee-track .l4u-marquee-item:nth-child(6n+6) .l4u-sticky-note { transform: rotate(0.8deg); }

        /* Template Cards */
        .l4u-template-card {
          position: relative;
          overflow: hidden;
          background: transparent;
          border: 1px solid rgba(120, 85, 94, 0.16);
          isolation: isolate;
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1), border-color 220ms ease;
        }

        .l4u-template-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 38px rgba(120, 85, 94, 0.08);
          border-color: rgba(120, 85, 94, 0.28);
        }

        .l4u-template-card-actions {
          display: flex;
          flex-wrap: nowrap;
          gap: 0.75rem;
          align-items: center;
        }

        .l4u-template-card-button {
          display: inline-flex;
          flex: 1 1 7rem;
          align-items: center;
          justify-content: center;
          gap: 0.48rem;
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

        /* Scrolling Template Loop Track */
        .l4u-template-loop-shell {
          position: relative;
          overflow: hidden;
          margin-inline: -0.25rem;
          padding-inline: 0.25rem;
          mask-image: linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%);
        }

        .l4u-template-loop {
          display: flex;
          width: max-content;
          animation: l4uLeftToRight 34s linear infinite;
          will-change: transform;
        }

        .l4u-template-loop-shell:hover .l4u-template-loop {
          animation-play-state: paused;
        }

        .l4u-template-loop-track {
          flex: 0 0 auto;
          display: flex;
          gap: 1.25rem;
          padding: 0.2rem 0.35rem 0.65rem;
        }

        .l4u-template-loop-card {
          flex: 0 0 clamp(17.8rem, 31vw, 22.5rem);
          width: clamp(17.8rem, 31vw, 22.5rem);
        }

        @keyframes l4uLeftToRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .l4u-template-loop {
            animation-duration: 26s;
          }
          .l4u-template-loop-track {
            gap: 0.85rem;
          }
          .l4u-template-loop-card {
            flex-basis: min(84vw, 20rem);
            width: min(84vw, 20rem);
          }
        }
      `}</style>
    </div>
  );
}
