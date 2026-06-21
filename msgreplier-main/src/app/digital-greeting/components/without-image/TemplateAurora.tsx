"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import * as THREE from "three";
import { gsap } from "gsap";
import Link from "next/link";

interface GreetingData {
  occasion?: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  photo_url?: string;
  birthday_date?: string;
}

const LiveAgeCounter = ({ birthdayStr }: { birthdayStr: string }) => {
  const [timeDiff, setTimeDiff] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const birthDate = new Date(birthdayStr);
    if (isNaN(birthDate.getTime())) return;

    const updateCounter = () => {
      const now = new Date();
      const diffMs = now.getTime() - birthDate.getTime();
      
      const absDiff = Math.abs(diffMs);
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
      setTimeDiff({ days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [birthdayStr]);

  if (!timeDiff) return null;

  const birthDate = new Date(birthdayStr);
  const now = new Date();
  const isFuture = birthDate > now;

  return (
    <div className="w-full max-w-md mx-auto my-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <h3 className="text-xl md:text-2xl font-bold text-pink-300 mb-2" style={{ fontFamily: "Playfair Display" }}>
        {isFuture ? "Countdown to the Celebration" : "Time Spreading Love & Light"}
      </h3>
      <p className="text-xs uppercase tracking-widest text-pink-200/40 mb-6" style={{ fontFamily: "Satoshi" }}>
        {isFuture ? "Days until the magic day" : "Every second since you arrived"}
      </p>
      <div className="flex justify-center items-center gap-3">
        <div className="flex flex-col items-center bg-white/5 border border-white/5 px-4 py-3 rounded-2xl min-w-[70px]">
          <span className="text-2xl md:text-3xl font-extrabold text-white">{timeDiff.days}</span>
          <span className="text-[10px] uppercase tracking-wider text-pink-200/40 mt-1">Days</span>
        </div>
        <span className="text-xl font-bold text-pink-400">:</span>
        <div className="flex flex-col items-center bg-white/5 border border-white/5 px-4 py-3 rounded-2xl min-w-[70px]">
          <span className="text-2xl md:text-3xl font-extrabold text-white">{timeDiff.hours}</span>
          <span className="text-[10px] uppercase tracking-wider text-pink-200/40 mt-1">Hours</span>
        </div>
        <span className="text-xl font-bold text-pink-400">:</span>
        <div className="flex flex-col items-center bg-white/5 border border-white/5 px-4 py-3 rounded-2xl min-w-[70px]">
          <span className="text-2xl md:text-3xl font-extrabold text-white">{timeDiff.minutes}</span>
          <span className="text-[10px] uppercase tracking-wider text-pink-200/40 mt-1">Mins</span>
        </div>
        <span className="text-xl font-bold text-pink-400">:</span>
        <div className="flex flex-col items-center bg-white/5 border border-white/5 px-4 py-3 rounded-2xl min-w-[70px]">
          <span className="text-2xl md:text-3xl font-extrabold text-pink-300 drop-shadow-[0_0_8px_rgba(255,100,150,0.6)]">{timeDiff.seconds}</span>
          <span className="text-[10px] uppercase tracking-wider text-pink-200/40 mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
};

export default function TemplateAurora({ greeting, isPreview = false }: { greeting: GreetingData; isPreview?: boolean }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCelebrationStarted, setIsCelebrationStarted] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const finalWishTextRef = useRef<HTMLParagraphElement>(null);
  const celebrateBtnRef = useRef<HTMLButtonElement>(null);

  // Save references for Three.js cleanup & reset
  const threeResources = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    hearts: THREE.Mesh[];
    animationFrameId: number;
  } | null>(null);

  // Parse custom photo and caption
  const getPhotoAndCaption = () => {
    let imageUrl = "https://static.vecteezy.com/system/resources/previews/036/619/697/non_2x/ai-generated-couple-of-lovers-in-cartoon-style-on-transparent-background-png.png";
    let caption = '"Us" – my favorite chapter.';

    if (greeting.photo_url) {
      try {
        if (greeting.photo_url.startsWith("[")) {
          const parsed = JSON.parse(greeting.photo_url);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].url) {
            imageUrl = parsed[0].url;
            if (parsed[0].caption) {
              caption = parsed[0].caption;
            }
          }
        } else {
          imageUrl = greeting.photo_url;
        }
      } catch (e) {
        console.error("Error parsing photo_url in TemplateAurora", e);
        imageUrl = greeting.photo_url;
      }
    }
    return { imageUrl, caption };
  };

  const { imageUrl, caption } = getPhotoAndCaption();

  // Determine if user uploaded a photo
  const hasUploadedPhoto = !!(
    greeting.photo_url &&
    (!greeting.photo_url.startsWith("[") ||
      (() => {
        try {
          const parsed = JSON.parse(greeting.photo_url);
          return Array.isArray(parsed) && parsed.length > 0 && !!parsed[0].url;
        } catch (e) {
          return false;
        }
      })())
  );

  const birthdayStr = greeting.birthday_date || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("dob") : null) || (() => {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    return defaultDate.toISOString().split("T")[0];
  })();

  const totalStepCount = hasUploadedPhoto ? 6 : 5;

  const getProgressIndex = () => {
    if (currentStep === 6) return hasUploadedPhoto ? 5 : 4;
    if (currentStep === 5) return hasUploadedPhoto ? 4 : 3;
    return currentStep - 1;
  };

  // Set up font load
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=playfair-display@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Set up Three.js background
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create 3D Heart Geometry
    const heartShape = new THREE.Shape();
    heartShape.moveTo(25, 25);
    heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
    heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
    heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
    heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
    heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
    heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

    const extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1,
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    const colors = [0xff6e8e, 0xff3879, 0xfc94af, 0xffc0cb, 0xe82979, 0xd06eff, 0xffa0c7];
    const hearts: THREE.Mesh[] = [];

    for (let i = 0; i < 30; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: 0x181818,
        shininess: 120,
        specular: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      const heart = new THREE.Mesh(geometry, material);
      const scale = Math.random() * 0.06 + 0.03;
      heart.scale.set(scale, scale, scale);

      heart.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 30
      );

      heart.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      heart.userData = {
        originalX: heart.position.x,
        originalY: heart.position.y,
        originalZ: heart.position.z,
        originalRotX: heart.rotation.x,
        originalRotY: heart.rotation.y,
        originalRotZ: heart.rotation.z,
        scaleVal: scale,
        rotationSpeedX: (Math.random() - 0.5) * 0.02,
        rotationSpeedY: (Math.random() - 0.5) * 0.02,
        floatDistance: Math.random() * 3 + 1.5,
      };

      hearts.push(heart);
      scene.add(heart);

      // Initial animations
      gsap.from(heart.position, {
        y: heart.position.y - 40,
        duration: 2.5,
        ease: "power3.out",
        delay: Math.random() * 1,
      });

      gsap.from(heart.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2,
        ease: "back.out(2)",
        delay: Math.random() * 1.2,
      });
    }

    let animationFrameId = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.0007;
      hearts.forEach((heart) => {
        heart.rotation.x += heart.userData.rotationSpeedX;
        heart.rotation.y += heart.userData.rotationSpeedY;
        heart.position.y =
          heart.userData.originalY +
          Math.sin(time + heart.position.x * 0.15) * heart.userData.floatDistance;
      });
      renderer.render(scene, camera);
    };

    animate();

    threeResources.current = {
      scene,
      camera,
      renderer,
      hearts,
      animationFrameId,
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      hearts.forEach((heart) => {
        scene.remove(heart);
        if (Array.isArray(heart.material)) {
          heart.material.forEach((mat) => mat.dispose());
        } else {
          heart.material.dispose();
        }
      });
      geometry.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update progress bar width
  useEffect(() => {
    if (progressBarRef.current) {
      const progressWidth = (getProgressIndex() / (totalStepCount - 1)) * 100;
      gsap.to(progressBarRef.current, { width: `${progressWidth}%`, duration: 0.7, ease: "power3.out" });
    }
  }, [currentStep, totalStepCount]);

  // Animate elements inside active step
  useEffect(() => {
    const stepIdx = getProgressIndex();
    const activeStepEl = stepRefs.current[stepIdx];
    if (activeStepEl) {
      const children = activeStepEl.querySelectorAll(".anim-child");
      gsap.fromTo(
        children,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.2,
          delay: 0.3,
        }
      );
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 3 && !hasUploadedPhoto) {
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleCelebrate = () => {
    setIsCelebrationStarted(true);

    if (celebrateBtnRef.current) {
      gsap.to(celebrateBtnRef.current, { opacity: 0, duration: 0.6, pointerEvents: "none" });
    }

    if (finalWishTextRef.current) {
      gsap.to(finalWishTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.6)",
        delay: 0.4,
      });
    }

    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 100 };
    const confettiColors = ["#ff3879", "#ff74a4", "#ffc0cb", "#f0e1f7", "#ffffff"];

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 60 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: confettiColors,
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: confettiColors,
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 25,
        origin: { y: 0.7 },
        emojis: ["❤️", "💖", "✨", "💕", "💜"],
        scalar: 4,
      } as any);
    }, 600);

    if (threeResources.current) {
      const { hearts } = threeResources.current;
      hearts.forEach((heart) => {
        gsap.to(heart.position, {
          x: (Math.random() - 0.5) * 100,
          y: heart.position.y + 80 + Math.random() * 30,
          z: (Math.random() - 0.5) * 50,
          duration: 6,
          ease: "power4.out",
        });
        gsap.to(heart.rotation, {
          x: Math.random() * Math.PI * 8,
          y: Math.random() * Math.PI * 8,
          z: Math.random() * Math.PI * 8,
          duration: 7,
          ease: "power4.out",
        });
        if (!Array.isArray(heart.material)) {
          gsap.to(heart.material, { opacity: 0, duration: 5, delay: 1, ease: "power3.in" });
        }
      });
    }
  };

  const resetHearts = () => {
    if (threeResources.current) {
      const { hearts } = threeResources.current;
      hearts.forEach((heart) => {
        gsap.killTweensOf(heart.position);
        gsap.killTweensOf(heart.rotation);
        gsap.killTweensOf(heart.scale);
        if (heart.material && !Array.isArray(heart.material)) {
          gsap.killTweensOf(heart.material);
        }

        heart.position.set(
          heart.userData.originalX,
          heart.userData.originalY,
          heart.userData.originalZ
        );
        heart.rotation.set(
          heart.userData.originalRotX,
          heart.userData.originalRotY,
          heart.userData.originalRotZ
        );
        heart.scale.set(heart.userData.scaleVal, heart.userData.scaleVal, heart.userData.scaleVal);
        if (heart.material && !Array.isArray(heart.material)) {
          heart.material.opacity = 0.85;
        }
      });
    }
  };

  const handleRepeat = () => {
    setCurrentStep(1);
    setIsCelebrationStarted(false);
    resetHearts();
  };

  const occasionName = greeting.occasion || "Birthday";

  const getOccasionWish = () => {
    const occ = occasionName;
    if (occ === "Birthday") return "Happy Birthday!";
    if (occ === "Anniversary") return "Happy Anniversary!";
    if (occ === "Apoloy" || occ === "Apology") return "My Sincere Apology 🥺";
    if (occ === "Love Greeting") return "My Deepest Love 💖";
    if (occ === "Special Moments") return "Celebrating Our Moments ✨";
    if (occ === "Flowers") return "A Special Bouquet for You 💐";
    return `Happy ${occ}!`;
  };

  const getOccasionWishWithName = () => {
    const name = greeting.recipient_name;
    const occ = occasionName;
    if (occ === "Birthday") return `Happy Birthday, ${name}! ❤️`;
    if (occ === "Anniversary") return `Happy Anniversary, ${name}! ❤️`;
    if (occ === "Apoloy" || occ === "Apology") return `I'm So Sorry, ${name}! 🥺`;
    if (occ === "Love Greeting") return `I Love You, ${name}! 💖`;
    if (occ === "Special Moments") return `Cheers to Us, ${name}! ✨`;
    if (occ === "Flowers") return `Flowers for You, ${name}! 💐`;
    return `Happy ${occ}, ${name}! ❤️`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-pink-100 flex items-center justify-center p-4 select-none bg-[#2a0a2a]">
      {/* Global CSS Styles */}
      <style jsx global>{`
        :root {
          --bg-color: #2a0a2a;
          --primary-color: #ff3879;
          --secondary-color: #ff74a4;
          --accent-glow: rgba(255, 100, 150, 0.6);
          --card-bg: rgba(255, 150, 200, 0.1);
          --card-border: rgba(255, 200, 220, 0.25);
          --text-light: #fce7f3;
          --text-medium: #fbcfe8;
          --text-gradient-start: #ffc2e2;
          --text-gradient-mid: #ff8ab6;
          --text-gradient-end: #ffffff;
        }

        #aurora-background {
          background: radial-gradient(at 15% 15%, hsla(330, 80%, 75%, .5) 0px, transparent 60%),
            radial-gradient(at 85% 20%, hsla(300, 70%, 70%, .4) 0px, transparent 60%),
            radial-gradient(at 20% 85%, hsla(350, 90%, 80%, .4) 0px, transparent 60%),
            radial-gradient(at 80% 80%, hsla(280, 75%, 65%, .5) 0px, transparent 60%);
          background-size: 200% 200%;
          animation: aurora-flow 30s infinite linear alternate;
        }

        @keyframes aurora-flow {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        .btn {
          font-weight: 700;
          background-image: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
          position: relative;
          overflow: hidden;
          border-radius: 9999px;
          padding: 0.9rem 2.8rem;
          box-shadow: 0 0 30px var(--accent-glow);
          transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
          will-change: transform, box-shadow;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn:hover {
          transform: translateY(-8px) scale(1.07);
          box-shadow: 0 0 60px var(--accent-glow), 0 0 100px rgba(255, 100, 150, 0.3);
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn:active {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 0 40px var(--accent-glow);
        }

        .text-gradient-aurora {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(90deg, var(--text-gradient-start), var(--text-gradient-mid), var(--text-gradient-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 20px var(--accent-glow));
          }
          50% {
            transform: scale(1.22);
            filter: drop-shadow(0 0 50px var(--accent-glow));
          }
        }

        .heart-beat-aurora {
          animation: heartbeat 2s ease-in-out infinite;
          filter: drop-shadow(0 0 20px var(--accent-glow));
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 1.8rem;
        }

        .bento-item {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 200, 220, 0.15);
          border-radius: 1.25rem;
          transition: all 0.5s ease-out;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .bento-item:hover {
          transform: translateY(-12px);
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 200, 220, 0.35);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px var(--accent-glow);
        }

        .bento-item-1 {
          grid-column: span 2;
        }

        .bento-item-3 {
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .bento-item-1,
          .bento-item-3 {
            grid-column: span 1;
          }
        }

        .aurora-glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--card-border);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(255, 100, 150, 0.2);
          border-radius: 2rem;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
        }

        #polaroid {
          perspective: 1200px;
        }

        #polaroid-inner {
          background: linear-gradient(to bottom right, #fef2f9, #ffe4f0);
          padding: 1.5rem;
          padding-bottom: 1.2rem;
          border-radius: 1rem;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 100, 150, 0.15);
          transform: rotateY(-10deg) rotateX(7deg) scale(0.97);
          transition: transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.7s ease-out;
        }

        #polaroid:hover #polaroid-inner {
          transform: rotateY(0) rotateX(0) scale(1.03);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 50px var(--accent-glow);
        }

        #polaroid-inner img {
          border-radius: 0.75rem;
        }

        #polaroid-inner p {
          color: #5a0c3b;
        }

        .final-wish-text {
          color: var(--secondary-color);
          font-size: 2.5rem;
          letter-spacing: 0.08em;
          text-shadow: 0 0 20px rgba(255, 100, 150, 0.7), 0 0 30px rgba(255, 50, 100, 0.5);
        }
        @media (max-width: 640px) {
          .final-wish-text {
            font-size: 1.8rem;
          }
        }
      `}</style>

      {/* Aurora Background */}
      <div id="aurora-background" className="fixed inset-0 pointer-events-none z-0 opacity-70" />

      {/* Three.js Canvas Container */}
      <div ref={canvasContainerRef} className="fixed inset-0 pointer-events-none z-[1]" />

      {/* Progress Bar at the top */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 w-4/5 max-w-sm h-1.5 bg-white/10 rounded-full z-20 backdrop-blur-sm overflow-hidden">
        <div ref={progressBarRef} className="h-full w-0 rounded-full bg-gradient-to-r from-[#ff74a4] to-[#ff3879]" />
      </div>

      {/* Step Container */}
      <div className="relative z-10 w-full max-w-3xl flex justify-center items-center min-h-[500px]">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div
            ref={(el) => { stepRefs.current[0] = el; }}
            className="aurora-glass-card p-6 md:p-10 w-full max-w-lg text-center flex flex-col items-center space-y-6"
          >
            <div className="anim-child text-7xl mb-2 heart-beat-aurora">❤️</div>
            <h1 className="anim-child text-4xl md:text-5xl font-bold text-gradient-aurora mb-2">
              Hello, My Love.
            </h1>
            <p className="anim-child text-pink-200/80 mb-6 text-base md:text-lg leading-relaxed font-light" style={{ fontFamily: "Satoshi" }}>
              Every beat of my heart whispers your name. On this special day, I wanted to create a small piece of magic just for you.
            </p>
            <button
              onClick={handleNext}
              className="anim-child btn text-white font-bold"
              style={{ fontFamily: "Satoshi" }}
            >
              Unwrap My Feelings
            </button>
          </div>
        )}

        {/* Step 2: Wonderful Partner */}
        {currentStep === 2 && (
          <div
            ref={(el) => { stepRefs.current[1] = el; }}
            className="aurora-glass-card p-6 md:p-10 w-full max-w-xl text-center flex flex-col items-center space-y-6"
          >
            <div className="anim-child text-7xl mb-2">✨</div>
            <h2 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora mb-2">
              To My Wonderful Partner, {getOccasionWish()}
            </h2>
            <p className="anim-child text-pink-200/80 mb-6 text-base md:text-lg leading-relaxed font-light" style={{ fontFamily: "Satoshi" }}>
              Your presence illuminates my world. Another year more beautiful, inside and out. I cherish you deeply.
            </p>
            <button
              onClick={handleNext}
              className="anim-child btn text-white font-bold"
              style={{ fontFamily: "Satoshi" }}
            >
              Discover More...
            </button>
          </div>
        )}

        {/* Step 3: Countless Reasons */}
        {currentStep === 3 && (
          <div
            ref={(el) => { stepRefs.current[2] = el; }}
            className="aurora-glass-card p-6 md:p-10 w-full max-w-3xl text-center flex flex-col items-center"
          >
            <h2 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora mb-8">
              Countless Reasons Why I Adore You
            </h2>
            <div className="bento-grid mb-8 w-full">
              <div className="anim-child bento-item bento-item-1 p-6 rounded-xl text-left">
                <h3 className="text-xl md:text-2xl font-bold text-pink-300 mb-2">💖 Your Infectious Laughter</h3>
                <p className="text-pink-100/70 text-sm md:text-base leading-relaxed">It's the most beautiful sound, a melody that brightens even the darkest days.</p>
              </div>
              <div className="anim-child bento-item p-6 rounded-xl text-left">
                <h3 className="text-xl md:text-2xl font-bold text-pink-300 mb-2">🧠 Your Brilliant Mind</h3>
                <p className="text-pink-100/70 text-sm md:text-base leading-relaxed">Intelligent, curious, and always surprising me with your insights.</p>
              </div>
              <div className="anim-child bento-item bento-item-3 p-6 rounded-xl text-left">
                <h3 className="text-xl md:text-2xl font-bold text-pink-300 mb-2">🌸 Your Gentle Soul</h3>
                <p className="text-pink-100/70 text-sm md:text-base leading-relaxed">The kindness and empathy you extend to everyone around you is truly inspiring.</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="anim-child btn text-white font-bold"
              style={{ fontFamily: "Satoshi" }}
            >
              {hasUploadedPhoto ? "Remember Our Journey?" : "One Final Thought..."}
            </button>
          </div>
        )}

        {/* Step 4: Polaroid Memory */}
        {hasUploadedPhoto && currentStep === 4 && (
          <div
            ref={(el) => { stepRefs.current[3] = el; }}
            className="aurora-glass-card p-6 md:p-10 w-full max-w-lg text-center flex flex-col items-center"
          >
            <h2 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora mb-6">
              A Snapshot of Our Story...
            </h2>
            <div id="polaroid" className="anim-child mb-6 w-full max-w-xs">
              <div id="polaroid-inner" className="rounded-lg shadow-2xl">
                <img
                  src={imageUrl}
                  alt="A special memory"
                  className="w-full h-auto max-h-64 md:max-h-72 object-contain rounded-md mx-auto"
                />
                <p className="text-center font-semibold mt-4 text-lg md:text-xl italic" style={{ fontFamily: "Playfair Display" }}>
                  {caption}
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="anim-child btn text-white font-bold"
              style={{ fontFamily: "Satoshi" }}
            >
              One Final Thought...
            </button>
          </div>
        )}

        {/* Step 5: Final Wish */}
        {currentStep === 5 && (
          <div
            ref={(el) => { stepRefs.current[hasUploadedPhoto ? 4 : 3] = el; }}
            className="aurora-glass-card p-6 md:p-10 w-full max-w-lg text-center flex flex-col items-center"
          >
            <div className="anim-child text-7xl mb-4">💖</div>
            <h2 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora mb-4">
              My Deepest Wish For You
            </h2>
            <p className="anim-child text-pink-200/80 mb-8 text-base md:text-lg leading-relaxed font-medium italic whitespace-pre-wrap max-w-md mx-auto" style={{ fontFamily: "Satoshi" }}>
              "{greeting.message}"
            </p>
            <div className="h-28 flex items-center justify-center w-full">
              <p
                ref={finalWishTextRef}
                id="final-wish"
                className="final-wish-text font-bold mt-6"
                style={{
                  opacity: isCelebrationStarted ? 1 : 0,
                  transform: isCelebrationStarted ? "translateY(0)" : "translateY(30px)",
                  transition: "opacity 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  fontFamily: "Playfair Display"
                }}
              >
                {getOccasionWishWithName()}
              </p>
            </div>

            {!isCelebrationStarted ? (
              <button
                ref={celebrateBtnRef}
                onClick={handleCelebrate}
                className="anim-child btn text-white mt-4 font-bold"
                style={{ fontFamily: "Satoshi" }}
              >
                Let's Celebrate!
              </button>
            ) : (
              <div className="anim-child pt-4 flex flex-col items-center gap-3 w-full">
                <button
                  onClick={handleNext}
                  className="btn text-white font-bold"
                  style={{ fontFamily: "Satoshi" }}
                >
                  See Live Counter
                </button>
              </div>
            )}

            <footer className="anim-child mt-6 text-pink-300/40 text-xs font-medium tracking-wider" style={{ fontFamily: "Satoshi" }}>
              Crafted with endless love by {greeting.sender_name}
            </footer>
          </div>
        )}

        {/* Step 6: Live Age Counter Step */}
        {currentStep === 6 && (
          <div
            ref={(el) => { stepRefs.current[hasUploadedPhoto ? 5 : 4] = el; }}
            className="aurora-glass-card p-6 md:p-10 w-full max-w-lg text-center flex flex-col items-center space-y-6"
          >
            <div className="anim-child text-7xl mb-2">⏳</div>
            
            <div className="anim-child w-full">
              <LiveAgeCounter birthdayStr={birthdayStr} />
            </div>

            <div className="anim-child pt-4 flex flex-col items-center gap-3 w-full">
              <button
                onClick={handleRepeat}
                className="btn text-white font-bold"
                style={{ fontFamily: "Satoshi" }}
              >
                Repeat
              </button>

            </div>

            <footer className="anim-child mt-6 text-pink-300/40 text-xs font-medium tracking-wider" style={{ fontFamily: "Satoshi" }}>
              Crafted with endless love by {greeting.sender_name}
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
