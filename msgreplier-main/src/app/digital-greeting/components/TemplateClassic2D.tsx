"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export interface GreetingData {
  occasion?: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  music_id?: string;
  photo_url?: string;
}

export default function TemplateClassic2D({ greeting, isPreview = false }: { greeting: GreetingData; isPreview?: boolean }) {
  const [currentPage, setCurrentPage] = useState<"hero" | "slider" | "celebration" | "curtain">("hero");
  const [sliderStep, setSliderStep] = useState(1);
  const [celebStep, setCelebStep] = useState(1);
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCandleBlown, setIsCandleBlown] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Refs for particle containers
  const heroParticleRef = useRef<HTMLDivElement>(null);
  const sliderParticleRef = useRef<HTMLDivElement>(null);
  const celebrationBgRef = useRef<HTMLDivElement>(null);
  const curtainCardRef = useRef<HTMLDivElement>(null);

  // Dynamic values
  const occasionText = greeting.occasion || "Birthday";
  const recipientName = greeting.recipient_name || "Someone Special";
  const senderName = greeting.sender_name || "";
  const displayMessage = greeting.message || `Today isn't just a date on the calendar; it's a celebration of the light you bring into my life. Every moment with you is like a frame from a beautiful movie, and I'm so lucky to be your co-star. May this year be filled with as much magic as you give to everyone around you.`;

  // Heart particle helper
  const createHeart = (container: HTMLDivElement) => {
    if (!container) return;
    const heart = document.createElement("div");
    heart.style.position = "absolute";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.bottom = "-10vh";
    heart.style.color = "var(--accent)";
    heart.innerHTML = "❤️";
    heart.style.fontSize = (Math.random() * 20 + 10) + "px";
    heart.style.pointerEvents = "none";
    heart.style.animation = `floatHeart ${Math.random() * 3 + 3}s linear forwards`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
  };

  // Sparkles helper
  const createSparkle = (card: HTMLDivElement) => {
    if (!card) return;
    const s = document.createElement("div");
    s.classList.add("sparkle-particle");
    s.style.width = s.style.height = (Math.random() * 4 + 2) + "px";
    s.style.top = Math.random() * 100 + "%";
    s.style.left = Math.random() * 100 + "%";
    card.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  };

  // Balloon helper
  const spawnBalloons = (container: HTMLElement) => {
    if (!container) return;
    const colorGradients = [
      ["#ff2d55", "#800020"],
      ["#74b9ff", "#0984e3"],
      ["#55efc4", "#00b894"],
      ["#ffeaa7", "#fdcb6e"],
      ["#a29bfe", "#6c5ce7"],
      ["#ff9ff3", "#f368e0"]
    ];

    const count = 15;
    let index = 0;
    const interval = setInterval(() => {
      if (!container || index >= count) {
        clearInterval(interval);
        return;
      }
      const b = document.createElement("div");
      const shine = document.createElement("div");
      b.classList.add("balloon");
      shine.classList.add("balloon-shine");
      const gradient = colorGradients[Math.floor(Math.random() * colorGradients.length)];
      b.style.left = Math.random() * 95 + "vw";
      b.style.background = `radial-gradient(circle at 70% 30%, ${gradient[0]}, ${gradient[1]})`;
      b.style.boxShadow = `inset -10px -10px 20px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)`;
      b.appendChild(shine);
      container.appendChild(b);
      setTimeout(() => b.remove(), 8000);
      index++;
    }, 400);
  };

  // Heart particle intervals on Hero & Slider Pages
  useEffect(() => {
    let heroInterval: NodeJS.Timeout;
    let sliderInterval: NodeJS.Timeout;

    if (currentPage === "hero" && heroParticleRef.current) {
      const container = heroParticleRef.current;
      heroInterval = setInterval(() => createHeart(container), 300);
    }
    if (currentPage === "slider" && sliderParticleRef.current) {
      const container = sliderParticleRef.current;
      sliderInterval = setInterval(() => createHeart(container), 400);
    }

    return () => {
      if (heroInterval) clearInterval(heroInterval);
      if (sliderInterval) clearInterval(sliderInterval);
    };
  }, [currentPage]);

  // Fairy lights initialization on celebration page mount
  useEffect(() => {
    if (currentPage === "celebration") {
      const container = document.getElementById("fairy-lights-container");
      const path = document.getElementById("wire-path") as SVGPathElement | null;
      if (container && path) {
        // Clear any existing bulbs first
        const bulbs = container.querySelectorAll(".bulb-teardrop");
        bulbs.forEach(b => b.remove());

        const pathLength = path.getTotalLength();
        const bulbCount = 25;

        const widthScale = 1000;
        const heightScale = isMobile ? 1000 : 150;

        for (let i = 0; i <= bulbCount; i++) {
          const distance = (i / bulbCount) * pathLength;
          const point = path.getPointAtLength(distance);
          const bulb = document.createElement("div");
          bulb.classList.add("bulb-teardrop");
          bulb.style.left = `${(point.x / widthScale) * 100}%`;
          bulb.style.top = `${(point.y / heightScale) * 100}%`;
          bulb.style.setProperty("--d", `${0.5 + Math.random() * 2}s`);
          container.appendChild(bulb);
        }
      }
    }
  }, [currentPage, isMobile]);

  // Curtain page auto reveal and sparkles
  useEffect(() => {
    let curtainTimer: NodeJS.Timeout;
    let sparkleInterval: NodeJS.Timeout;

    if (currentPage === "curtain") {
      curtainTimer = setTimeout(() => {
        setIsCurtainOpen(true);
        if (curtainCardRef.current) {
          const card = curtainCardRef.current;
          sparkleInterval = setInterval(() => createSparkle(card), 50);
        }
      }, 1000);
    }

    return () => {
      if (curtainTimer) clearTimeout(curtainTimer);
      if (sparkleInterval) clearInterval(sparkleInterval);
    };
  }, [currentPage]);

  const transitionTo = (page: "hero" | "slider" | "celebration" | "curtain") => {
    setCurrentPage(page);
  };

  const handleSliderNext = (next: number) => {
    setSliderStep(next);
  };

  const handleSliderFinish = () => {
    transitionTo("celebration");
  };

  const handleCelebFlow = () => {
    if (celebStep === 1) {
      setCelebStep(2);
    } else if (celebStep === 2) {
      if (celebrationBgRef.current) {
        spawnBalloons(celebrationBgRef.current);
      }
      setCelebStep(3);
    }
  };

  const handleCakeTap = () => {
    if (isCandleBlown) return;
    setIsCandleBlown(true);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#ff2d55", "#d4af37", "#ffde6b", "#ffffff"]
    });

    setTimeout(() => {
      setCelebStep(4);
    }, 1500);
  };

  // Removed memories list

  return (
    <div className="w-full min-h-screen bg-[#0a0a0b] text-white overflow-hidden relative selection:bg-[#ff2d55]/30">
      {/* CSS Styles extracted from Template */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
            --accent: #ff2d55;
            --accent-glow: rgba(255, 45, 85, 0.5);
            --gold: #d4af37;
            --glass: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
            --bg-dark: #0a0a0b;
            --royal-red: #6e0000;
            --bulb-warm: #ffde6b;
            --bulb-glow: rgba(255, 222, 107, 0.8);
        }

        .page {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
            visibility: hidden;
            opacity: 0;
            transform: scale(1.1) translateZ(0);
            transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
            overflow: hidden;
        }

        .page.active {
            visibility: visible;
            opacity: 1;
            transform: scale(1) translateZ(0);
            z-index: 10;
        }

        @keyframes floatHeart {
            0% {
                transform: translateY(0) scale(0) rotate(0deg);
                opacity: 0;
            }
            20% {
                opacity: 0.8;
            }
            100% {
                transform: translateY(-110vh) scale(1.5) rotate(360deg);
                opacity: 0;
            }
        }

        @keyframes neonPulse {
            0% {
                box-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent);
            }
            50% {
                box-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent);
            }
            100% {
                box-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent);
            }
        }

        @keyframes sparkle {
            0%, 100% {
                opacity: 0;
                transform: scale(0);
            }
            50% {
                opacity: 1;
                transform: scale(1.2);
            }
        }

        #hero-page {
            background: radial-gradient(circle at center, #1a0a0c 0%, #050505 100%);
        }

        .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2.5rem, 8vw, 5.5rem);
            font-weight: 900;
            font-style: italic;
            background: linear-gradient(to right, #fff, #ff2d55, #fff);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 4s linear infinite;
            margin-bottom: 0.5rem;
        }

        @keyframes shine {
            to {
                background-position: 200% center;
            }
        }

        .hero-sub {
            font-size: 1.1rem;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 3rem;
        }

        .btn-neon {
            position: relative;
            padding: 18px 45px;
            font-size: 1.1rem;
            font-weight: 600;
            color: white;
            background: transparent;
            border: 1px solid var(--accent);
            border-radius: 50px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            overflow: hidden;
            transition: 0.5s;
            animation: neonPulse 2s infinite;
        }

        .btn-neon:hover {
            background: var(--accent);
            color: #fff;
            box-shadow: 0 0 50px var(--accent);
        }

        .slider-card {
            background: var(--glass);
            backdrop-filter: blur(20px);
            padding: 60px 40px;
            border-radius: 40px;
            border: 1px solid var(--glass-border);
            max-width: 500px;
            width: 90%;
            position: relative;
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
        }

        .step-content {
            display: none;
            min-height: 120px;
            align-items: center;
            justify-content: center;
            animation: fadeInScale 0.8s forwards;
        }

        .step-content.active {
            display: flex;
            flex-direction: column;
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .step-text {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.5rem, 4vw, 2.2rem);
            margin-bottom: 30px;
            color: #fff;
            font-weight: 400;
        }

        .slider-dots {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-top: 30px;
        }

        .dot {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transition: 0.4s;
        }

        .dot.active {
            background: var(--accent);
            transform: scale(1.5);
            box-shadow: 0 0 10px var(--accent-glow);
        }

        #celebration-page {
            background: #000;
            transition: background 2s ease;
        }

        #celebration-page.bright {
            background: radial-gradient(circle at center, #2a0a0e 0%, #0a0a0b 100%);
        }

        .fairy-lights-container {
            position: absolute;
            top: 0;
            width: 100%;
            height: 150px;
            pointer-events: none;
            transition: opacity 2s ease;
            z-index: 5;
        }

        .wire-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            fill: none;
            stroke: #222;
            stroke-width: 2;
        }

        .bulb-teardrop {
            position: absolute;
            width: 16px;
            height: 24px;
            border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
            background: #444;
            transform-origin: top center;
            transform: translate(-50%, 0);
            box-shadow: none;
            transition: background 1s, box-shadow 1s;
        }

        #celebration-page.bright .bulb-teardrop {
            background: radial-gradient(circle at 30% 30%, #fff, var(--bulb-warm) 60%, #b8860b);
            box-shadow: 0 0 15px var(--bulb-glow), 0 0 30px var(--bulb-glow);
            animation: flicker var(--d) infinite alternate;
        }

        @keyframes flicker {
            0% {
                opacity: 0.4;
            }
            100% {
                opacity: 1;
            }
        }

        .balloon {
            position: absolute;
            bottom: -200px;
            width: 60px;
            height: 80px;
            border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
            z-index: 100;
            animation: balloonFloat 8s ease-in forwards;
            display: flex;
            justify-content: center;
            pointer-events: none;
        }

        .balloon::before {
            content: '';
            position: absolute;
            bottom: -5px;
            width: 10px;
            height: 6px;
            background: inherit;
            border-radius: 50%;
        }

        .balloon::after {
            content: '';
            position: absolute;
            bottom: -100px;
            width: 1px;
            height: 100px;
            background: rgba(255, 255, 255, 0.3);
            transform-origin: top;
            animation: stringWobble 2s infinite ease-in-out;
        }

        .balloon-shine {
            position: absolute;
            top: 15%;
            left: 15%;
            width: 15px;
            height: 25px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            filter: blur(2px);
            transform: rotate(30deg);
        }

        @keyframes balloonFloat {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
            100% {
                transform: translateY(-130vh) translateX(0) rotate(0deg);
                opacity: 0;
            }
        }

        @keyframes stringWobble {
            0%, 100% {
                transform: rotate(-2deg);
            }
            50% {
                transform: rotate(2deg);
            }
        }

        .stage {
            position: relative;
            width: 100vw;
            height: 100vh;
            background: #000;
            overflow: hidden;
        }

        .curtain-panel {
            position: absolute;
            top: 0;
            width: 51%;
            height: 100%;
            background: repeating-linear-gradient(to right, var(--royal-red), #4a0000 10%);
            z-index: 20;
            transition: transform 2.5s cubic-bezier(0.645, 0.045, 0.355, 1);
            box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8);
        }

        .curtain-left {
            left: 0;
            border-right: 4px solid var(--gold);
        }

        .curtain-right {
            right: 0;
            border-left: 4px solid var(--gold);
        }

        .stage.open .curtain-left {
            transform: translateX(-100%) skewY(-5deg);
        }

        .stage.open .curtain-right {
            transform: translateX(100%) skewY(5deg);
        }

        .secret-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: radial-gradient(circle, #1a1a1a, #000);
            padding: 20px;
        }

        .message-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: clamp(20px, 5vw, 50px);
            border-radius: 30px;
            max-width: 700px;
            width: 90%;
            backdrop-filter: blur(10px);
            position: relative;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .sparkle-particle {
            position: absolute;
            pointer-events: none;
            background: white;
            border-radius: 50%;
            animation: sparkle 1s infinite;
        }

        /* Removed memories styles */

        /* --- Interactive Cake Styling --- */
        .cake-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            scale: 0.85;
            transition: transform 0.5s;
        }

        .cake {
            position: relative;
            width: 200px;
            height: 220px;
            cursor: pointer;
            perspective: 1000px;
        }

        .cake-stand {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 240px;
            height: 12px;
            background: var(--glass);
            border: 1px solid var(--glass-border);
            border-radius: 50%;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        }

        .cake-layer {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        }

        .cake-layer-bottom {
            bottom: 12px;
            width: 170px;
            height: 80px;
            background: linear-gradient(135deg, var(--accent), var(--royal-red));
            border-bottom: 6px solid rgba(0, 0, 0, 0.3);
        }

        .cake-layer-middle {
            bottom: 92px;
            width: 130px;
            height: 60px;
            background: linear-gradient(135deg, #ff5e7e, var(--accent));
            border-bottom: 4px solid rgba(0, 0, 0, 0.3);
        }

        .cake-layer-top {
            bottom: 152px;
            width: 90px;
            height: 45px;
            background: linear-gradient(135deg, var(--bulb-warm), var(--gold));
            border-bottom: 2px solid rgba(0, 0, 0, 0.3);
        }

        .candle {
            position: absolute;
            bottom: 197px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 35px;
            background: linear-gradient(to right, #ff74a4, var(--accent));
            border-radius: 4px;
            box-shadow: 0 0 10px var(--accent-glow);
        }

        .candle-wick {
            position: absolute;
            top: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 6px;
            background: #222;
        }

        .candle-flame {
            position: absolute;
            top: -22px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 24px;
            background: radial-gradient(circle at center, #fff 20%, var(--bulb-warm) 60%, var(--accent) 100%);
            border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
            box-shadow: 0 0 20px var(--bulb-glow), 0 0 40px var(--accent-glow);
            animation: flameFlicker 0.6s infinite alternate;
            transform-origin: bottom center;
        }

        @keyframes flameFlicker {
            0% {
                transform: translateX(-50%) scale(0.9) rotate(-2deg);
            }
            100% {
                transform: translateX(-50%) scale(1.1) rotate(2deg);
            }
        }

        .candle-smoke {
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 30px;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
            filter: blur(2px);
            animation: smokeRise 2s forwards;
        }

        @keyframes smokeRise {
            0% {
                transform: translateX(-50%) translateY(0) scale(1);
                opacity: 0.8;
            }
            100% {
                transform: translateX(-30%) translateY(-50px) scale(2);
                opacity: 0;
            }
        }
      ` }} />

      {/* Global font style */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@300;400;600&family=Playfair+Display:ital,wght@0,700;1,900&display=swap');
      `}</style>

      {/* HERO SECTION */}
      <section id="hero-page" className={`page ${currentPage === "hero" ? "active" : ""}`}>
        <div ref={heroParticleRef} style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, pointerEvents: "none" }} />
        <h1 className="hero-title">Happy {occasionText}, {recipientName}</h1>
        <p className="hero-sub">A Cinematic Journey Created Just For You</p>
        <button className="btn-neon" onClick={() => transitionTo("slider")}>Open Your Gift</button>
      </section>

      {/* MESSAGE SLIDER SECTION */}
      <section id="message-slider-page" className={`page ${currentPage === "slider" ? "active" : ""}`}>
        <div ref={sliderParticleRef} style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, pointerEvents: "none" }} />
        <div className="slider-card">
          <div className={`step-content ${sliderStep === 1 ? "active" : ""}`}>
            <h2 className="step-text">It's Your Special Day</h2>
            <button className="btn-neon" onClick={() => handleSliderNext(2)}>Next</button>
          </div>
          <div className={`step-content ${sliderStep === 2 ? "active" : ""}`}>
            <h2 className="step-text">Have a look at it {recipientName} jii</h2>
            <button className="btn-neon" onClick={() => handleSliderNext(3)}>Next</button>
          </div>
          <div className={`step-content ${sliderStep === 3 ? "active" : ""}`}>
            <h2 className="step-text">Ready for your surprise?</h2>
            <button className="btn-neon" onClick={handleSliderFinish}>Let's Go</button>
          </div>
          <div className="slider-dots">
            <div className={`dot ${sliderStep === 1 ? "active" : ""}`} />
            <div className={`dot ${sliderStep === 2 ? "active" : ""}`} />
            <div className={`dot ${sliderStep === 3 ? "active" : ""}`} />
          </div>
        </div>
      </section>

      {/* CELEBRATION SECTION */}
      <section id="celebration-page" className={`page ${currentPage === "celebration" ? "active" : ""}${celebStep > 1 ? " bright" : ""}`}>
        <div ref={celebrationBgRef} className="absolute inset-0 pointer-events-none" />
        <div 
          className="fairy-lights-container" 
          id="fairy-lights-container" 
          style={{ 
            opacity: celebStep > 1 ? 1 : 0,
            height: isMobile ? "100vh" : "150px",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none"
          }}
        >
          <svg 
            className="wire-svg" 
            preserveAspectRatio="none" 
            viewBox={isMobile ? "0 0 1000 1000" : "0 0 1000 150"}
            style={{ width: "100%", height: "100%" }}
          >
            <path 
              id="wire-path" 
              d={isMobile 
                ? "M20,1000 Q40,900 20,800 T20,600 T20,400 T20,200 T20,20 Q100,40 200,20 T400,20 T600,20 T800,20 T980,20 Q960,100 980,200 T980,400 T980,600 T980,800 T980,1000" 
                : "M0,20 Q100,60 200,20 T400,20 T600,20 T800,20 T1000,20"
              } 
            />
          </svg>
        </div>

        {celebStep < 3 ? (
          <div className="glass-container" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
            <h2 id="celeb-hint" style={{ fontSize: "1.5rem", marginBottom: "30px", letterSpacing: "2px" }}>
              {celebStep === 1 ? "The Stage is Set..." : "Let the colors fly!"}
            </h2>
            <button id="celeb-master-btn" className="btn-neon" onClick={handleCelebFlow}>
              {celebStep === 1 ? "💡 Turn On Lights" : "🎈 Fly Balloons"}
            </button>
          </div>
        ) : (
          <div className="glass-container" style={{ background: "transparent", border: "none", boxShadow: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 id="celeb-hint" style={{ fontSize: "1.5rem", marginBottom: "20px", letterSpacing: "2px" }}>
              {celebStep === 3 ? "🎂 Make a wish..." : "✨ Your stage is ready!"}
            </h2>
            
            <div className="cake-container" onClick={handleCakeTap}>
              <div className="cake">
                {/* Stand */}
                <div className="cake-stand" />
                {/* Bottom Layer */}
                <div className="cake-layer cake-layer-bottom" />
                {/* Middle Layer */}
                <div className="cake-layer cake-layer-middle" />
                {/* Top Layer */}
                <div className="cake-layer cake-layer-top" />
                {/* Candle */}
                <div className="candle">
                  <div className="candle-wick" />
                  {!isCandleBlown && <div className="candle-flame" />}
                  {isCandleBlown && <div className="candle-smoke" />}
                </div>
              </div>
              {celebStep === 3 && (
                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", marginTop: "20px", letterSpacing: "1px", animation: "neonPulse 1.5s infinite", padding: "10px 20px", borderRadius: "20px" }}>
                  Tap the cake to blow out the candle
                </p>
              )}
            </div>

            {celebStep === 4 && (
              <button 
                className="btn-neon animate-fade-in" 
                style={{ marginTop: "20px" }} 
                onClick={() => transitionTo("curtain")}
              >
                ✨ Show The Message
              </button>
            )}
          </div>
        )}
      </section>

      {/* CURTAIN SECTION */}
      <section id="curtain-page" className={`page ${currentPage === "curtain" ? "active" : ""}`} style={{ padding: 0 }}>
        <div className={`stage ${isCurtainOpen ? "open" : ""}`} id="stage">
          <div className="curtain-panel curtain-left" />
          <div className="curtain-panel curtain-right" />
          <div className="secret-content">
            <div className="message-card" id="message-card" ref={curtainCardRef}>
              <h2 style={{ fontFamily: "'Dancing Script'", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--accent)", marginBottom: "20px" }}>
                My Dearest {recipientName},
              </h2>
              <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: "1.8", color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>
                {displayMessage}
              </p>
              {senderName && (
                <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.8rem", color: "var(--gold)", marginTop: "20px" }}>
                  — With love, {senderName}
                </p>
              )}
              <div className="flex flex-col gap-4 justify-center items-center mt-8">
                <button 
                  className="btn-neon" 
                  style={{ animation: "none", padding: "12px 30px", fontSize: "0.95rem" }} 
                  onClick={() => {
                    setSliderStep(1);
                    setCelebStep(1);
                    setIsCurtainOpen(false);
                    setIsCandleBlown(false);
                    transitionTo("hero");
                  }}
                >
                  Replay The Magic
                </button>
              </div>

              {!isPreview && (
                <div className="pt-6">
                  <Link href="/digital-greeting" className="text-pink-400 hover:text-pink-600 text-xs font-bold uppercase tracking-[0.2em]">
                    ✨ Create Your Own Surprise ✨
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
