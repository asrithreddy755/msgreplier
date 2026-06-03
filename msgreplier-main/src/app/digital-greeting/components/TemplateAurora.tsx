"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import * as THREE from "three";
import { gsap } from "gsap";
import { Heart, Star, Infinity as InfinityIcon, Bird } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GreetingData {
  occasion?: string;
  recipient_name: string;
  sender_name: string;
  message: string;
}

export default function TemplateAurora({ greeting, isPreview = false }: { greeting: GreetingData; isPreview?: boolean }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCelebrationStarted, setIsCelebrationStarted] = useState(false);
  const totalSteps = 3;

  const [isBlown, setIsBlown] = useState(false);
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [avgAudioVolume, setAvgAudioVolume] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isCutting, setIsCutting] = useState(false);
  const [isCakeCut, setIsCakeCut] = useState(false);

  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const finalWishTextRef = useRef<HTMLParagraphElement>(null);
  const celebrateBtnRef = useRef<HTMLButtonElement>(null);
  
  // Save references for Three.js cleanup
  const threeResources = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    hearts: THREE.Mesh[];
    animationFrameId: number;
  } | null>(null);

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
    // Center geometry
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
        originalY: heart.position.y,
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
      
      // Clean up ThreeJS meshes, geometries, materials
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
      const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
      gsap.to(progressBarRef.current, { width: `${progress}%`, duration: 0.7, ease: "power3.out" });
    }
  }, [currentStep]);

  // Animate elements inside active step
  useEffect(() => {
    const activeStepEl = stepRefs.current[currentStep - 1];
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

  // Clean up microphone stream and audio contexts
  const cleanupMic = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch (e) {}
      audioContextRef.current = null;
    }
    setListening(false);
  };

  // Clean up microphone stream and audio contexts on unmount
  useEffect(() => {
    return () => {
      cleanupMic();
    };
  }, []);

  const triggerBlowOut = () => {
    if (isBlown) return;
    setIsBlown(true);
    cleanupMic();
    setAvgAudioVolume(0);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#ff3879", "#ff74a4", "#ffffff"],
    });
  };

  const handleTapCake = () => {
    if (isBlown) return;
    
    // Simulate blow air effect on flame before putting it out
    let currentVol = 0;
    const interval = setInterval(() => {
      currentVol += 8;
      setAvgAudioVolume(currentVol);
      if (currentVol >= 48) {
        clearInterval(interval);
        triggerBlowOut();
      }
    }, 25);
  };

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicAllowed(true);
      setListening(true);
      setShowExplanation(false);
      startMicListening(stream);
    } catch (err) {
      console.error(err);
      setMicAllowed(false);
      setShowExplanation(false);
    }
  };

  const startMicListening = (stream: MediaStream) => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      setMicAllowed(false);
      return;
    }
    const audioContext = new AudioCtx();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkSound = () => {
      if (!audioContextRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setAvgAudioVolume(avg);

      if (avg > 45) {
        triggerBlowOut();
      } else {
        requestAnimationFrame(checkSound);
      }
    };
    requestAnimationFrame(checkSound);
  };


  const handleCutCake = () => {
    if (!isBlown || isCakeCut || isCutting) return;
    setIsCutting(true);
    
    setTimeout(() => {
      setIsCakeCut(true);
      setIsCutting(false);
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#ff3879", "#ff74a4", "#ffffff", "#ffd700"],
      });
    }, 600);
  };


  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
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

    // Animating background hearts to float away
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

  const occasionName = greeting.occasion || "Birthday";

  return (
    <div className="min-h-screen relative overflow-hidden text-pink-100 flex items-center justify-center p-4 select-none bg-[#2a0a2a]">
      {/* Dynamic Aurora Styling & Animations */}
      <style jsx global>{`
        :root {
          --bg-color: #2a0a2a;
          --primary-color: #ff3879;
          --secondary-color: #ff74a4;
          --accent-glow: rgba(255, 100, 150, 0.6);
          --card-bg: rgba(255, 150, 200, 0.08);
          --card-border: rgba(255, 200, 220, 0.2);
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

        .btn-aurora {
          background-image: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
          box-shadow: 0 0 25px var(--accent-glow);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .btn-aurora:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 0 45px var(--accent-glow), 0 0 80px rgba(255, 100, 150, 0.25);
        }

        .btn-aurora:active {
          transform: translateY(-1px) scale(1.01);
        }

        .text-gradient-aurora {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(90deg, var(--text-gradient-start), var(--text-gradient-mid), var(--text-gradient-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px var(--accent-glow)); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 40px var(--accent-glow)); }
        }

        .heart-beat-aurora {
          animation: heartbeat 2s ease-in-out infinite;
        }

        .aurora-glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid var(--card-border);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 50px rgba(255, 100, 150, 0.15);
        }

        .polaroid-inner-aurora {
          background: linear-gradient(to bottom right, #fef2f9, #ffe4f0);
          transform: rotateY(-10deg) rotateX(7deg) scale(0.97);
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.6s ease-out;
        }

        .polaroid-container-aurora:hover .polaroid-inner-aurora {
          transform: rotateY(0) rotateX(0) scale(1.03);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px var(--accent-glow);
        }
      `}</style>

      {/* Aurora Lights */}
      <div id="aurora-background" className="fixed inset-0 pointer-events-none z-0 opacity-70" />
      
      {/* Three.js Canvas Container */}
      <div ref={canvasContainerRef} className="fixed inset-0 pointer-events-none z-1" />

      {/* Fixed Progress Bar at top */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 w-4/5 max-w-sm h-1.5 bg-white/10 rounded-full z-20 backdrop-blur-sm overflow-hidden">
        <div ref={progressBarRef} className="h-full w-0 rounded-full bg-gradient-to-r from-[#ff74a4] to-[#ff3879]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex justify-center items-center min-h-[500px]">
        {/* Step 1: Welcome & Cake Blow */}
        {currentStep === 1 && (
          <div
            ref={(el) => { stepRefs.current[0] = el; }}
            className="aurora-glass-card p-6 md:p-8 rounded-3xl w-full max-w-lg text-center flex flex-col items-center space-y-6 md:space-y-8"
          >
            <h1 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora leading-tight" style={{ fontFamily: "Playfair Display" }}>
              Make a Wish, My Love! 🎂
            </h1>
            
            {/* The 3D CSS Cake */}
            <motion.div
              className="anim-child relative w-64 md:w-72 h-72 md:h-80 cursor-pointer perspective-1000 mx-auto scale-90 md:scale-100 transition-all origin-bottom"
              whileHover={{ scale: 1.03, rotateY: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTapCake}
            >

              {/* Cake Stand */}
              <motion.div
                className="absolute bottom-0 left-1/2 w-64 md:w-80 h-3 md:h-4 bg-white/10 rounded-full shadow-lg border border-white/5 z-10 origin-center"
                style={{
                  x: "-50%",
                  scaleX: 1 + (avgAudioVolume / 45) * 0.25,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              />
              <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 w-14 md:w-20 h-6 md:h-8 bg-white/5 rounded-t-lg border border-white/5" />

              {/* Glowing Sound Reacting Bar directly below the cake stand */}
              {!isBlown && listening && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-48 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)] z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 via-[#ff3879] to-pink-500 shadow-[0_0_10px_rgba(255,56,121,0.5)]"
                    style={{ width: `${Math.min(100, (avgAudioVolume / 45) * 100)}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  />
                </div>
              )}


              {/* Bottom Layer */}
              <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 w-52 md:w-64 h-28 md:h-32 bg-rose-400/80 rounded-3xl shadow-xl border-b-8 border-rose-500/80">
                <div className="absolute top-4 w-full h-4 bg-white/20" />
                <div className="absolute bottom-4 w-full h-4 bg-white/20" />
              </div>

              {/* Middle Layer */}
              <div className="absolute bottom-32 md:bottom-36 left-1/2 -translate-x-1/2 w-36 md:w-48 h-20 md:h-24 bg-rose-300/80 rounded-2xl shadow-lg border-b-4 border-rose-400/80">
                <div className="absolute top-4 w-full h-2 bg-white/20" />
              </div>

              {/* Top Layer */}
              <div className="absolute bottom-48 md:bottom-56 left-1/2 -translate-x-1/2 w-24 md:w-32 h-16 md:h-20 bg-rose-200/80 rounded-xl shadow-md border-b-2 border-rose-300/80" />

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
              {/* Left Candle */}
              <motion.div
                className="absolute bottom-[242px] md:bottom-[288px] left-[42%] w-2 md:w-3 h-10 md:h-16 bg-gradient-to-b from-yellow-200 via-blue-200 to-yellow-300 rounded-full shadow-md z-40 origin-bottom"
                initial={{ opacity: 0, y: 20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                {/* Wick */}
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 md:h-3 rounded-full transition-colors duration-500 ${isBlown ? "bg-neutral-950" : "bg-slate-800"}`} />

                {/* Burnt tip wax overlay */}
                {isBlown && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-black/45 rounded-t-full" />
                )}

                {/* Flame */}
                {!isBlown && (
                  <motion.div
                    key="flame-left"
                    className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 w-5 md:w-8 h-8 md:h-12 bg-gradient-to-t from-orange-600 via-yellow-400 to-transparent rounded-full blur-[1px] shadow-[0_0_30px_#f97316]"
                    style={{
                      transform: `translateX(-50%) scaleY(${1 - Math.min(0.85, avgAudioVolume / 50)}) scaleX(${1 - Math.min(0.5, avgAudioVolume / 100)}) rotate(${avgAudioVolume * 0.8}deg) translateX(${-avgAudioVolume * 0.25}px)`,
                      transformOrigin: "bottom center",
                      transition: "transform 0.05s ease-out",
                    }}
                    animate={{
                      scaleY: [1, 1.25, 1],
                      rotate: [-6, 6, -6],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{ repeat: Infinity, duration: 0.45, ease: "easeInOut" }}
                  >
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 md:w-4 h-4 md:h-6 bg-white/40 rounded-full blur-sm" />
                  </motion.div>
                )}
              </motion.div>

              {/* Right Candle */}
              <motion.div
                className="absolute bottom-[242px] md:bottom-[288px] left-[58%] w-2 md:w-3 h-10 md:h-16 bg-gradient-to-b from-yellow-200 via-blue-200 to-yellow-300 rounded-full shadow-md z-40 origin-bottom"
                initial={{ opacity: 0, y: 20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
              >
                {/* Wick */}
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 md:h-3 rounded-full transition-colors duration-500 ${isBlown ? "bg-neutral-950" : "bg-slate-800"}`} />

                {/* Burnt tip wax overlay */}
                {isBlown && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-black/45 rounded-t-full" />
                )}

                {/* Flame */}
                {!isBlown && (
                  <motion.div
                    key="flame-right"
                    className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 w-5 md:w-8 h-8 md:h-12 bg-gradient-to-t from-orange-600 via-yellow-400 to-transparent rounded-full blur-[1px] shadow-[0_0_30px_#f97316]"
                    style={{
                      transform: `translateX(-50%) scaleY(${1 - Math.min(0.85, avgAudioVolume / 50)}) scaleX(${1 - Math.min(0.5, avgAudioVolume / 100)}) rotate(${avgAudioVolume * 0.8}deg) translateX(${-avgAudioVolume * 0.25}px)`,
                      transformOrigin: "bottom center",
                      transition: "transform 0.05s ease-out",
                    }}
                    animate={{
                      scaleY: [1, 1.25, 1],
                      rotate: [6, -6, 6],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{ repeat: Infinity, duration: 0.45, ease: "easeInOut" }}
                  >
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 md:w-4 h-4 md:h-6 bg-white/40 rounded-full blur-sm" />
                  </motion.div>
                )}
              </motion.div>

              {/* Smoke for Left Candle when blown */}
              {isBlown && (
                <motion.div
                  className="absolute bottom-[282px] md:bottom-[352px] left-[42%] -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: -80,
                    x: [-10, 10, -5, 0],
                    scale: [1, 1.8, 2.5]
                  }}
                  transition={{ duration: 2.5 }}
                >
                  <div className="w-4 md:w-6 h-4 md:h-6 bg-slate-400/30 rounded-full blur-xl" />
                  <div className="w-2.5 md:w-5 h-2.5 md:h-5 bg-slate-300/20 rounded-full blur-lg -mt-3" />
                </motion.div>
              )}

              {/* Smoke for Right Candle when blown */}
              {isBlown && (
                <motion.div
                  className="absolute bottom-[282px] md:bottom-[352px] left-[58%] -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: -80,
                    x: [10, -10, 5, 0],
                    scale: [1, 1.8, 2.5]
                  }}
                  transition={{ duration: 2.5, delay: 0.15 }}
                >
                  <div className="w-4 md:w-6 h-4 md:h-6 bg-slate-400/30 rounded-full blur-xl" />
                  <div className="w-2.5 md:w-5 h-2.5 md:h-5 bg-slate-300/20 rounded-full blur-lg -mt-3" />
                </motion.div>
              )}


              {/* Vertical Cut Line visual indicator */}
              {(isCutting || isCakeCut) && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute right-[82px] md:right-[98px] bottom-10 md:bottom-12 w-[3px] h-[190px] md:h-[220px] bg-gradient-to-b from-rose-900/70 via-pink-800/70 to-rose-950/70 border-l border-pink-200/40 z-20 origin-top shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                />
              )}

              {/* Cake Slice sliding out */}
              <motion.div
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.9 }}
                animate={
                  isCakeCut
                    ? { x: 45, y: 15, opacity: 1, scale: 1, rotate: 12 }
                    : { x: 0, y: 0, opacity: 0, scale: 0.9 }
                }
                transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.15 }}
                className="absolute right-6 bottom-12 w-20 h-28 flex flex-col justify-end pointer-events-none z-30 filter drop-shadow-2xl"
              >
                {/* Cherry on top of slice */}
                <div className="w-4 h-4 bg-red-500 rounded-full ml-auto mr-5 -mb-1 shadow-inner" />
                {/* Top layer slice */}
                <div className="w-12 h-8 bg-rose-200/90 rounded-l-2xl ml-auto border-r-4 border-white/30" />
                {/* Middle layer slice */}
                <div className="w-16 h-10 bg-rose-300/90 rounded-l-2xl ml-auto border-r-4 border-white/30" />
                {/* Bottom layer slice */}
                <div className="w-20 h-12 bg-rose-400/90 rounded-l-2xl ml-auto border-r-4 border-white/30" />
              </motion.div>
            </motion.div>

            {/* Floating Knife Overlay for Cutting */}
            <AnimatePresence>
              {isBlown && !isCakeCut && (
                <motion.div
                  initial={{ opacity: 0, y: -60, rotate: -45, scale: 0.8 }}
                  animate={
                    isCutting
                      ? {
                          y: [0, 160, 190],
                          rotate: [-45, -5, -5],
                          opacity: [1, 1, 0],
                          scale: [1.1, 1.1, 0.9],
                        }
                      : {
                          opacity: 1,
                          y: [-10, 5, -10],
                          scale: 1,
                          rotate: -45,
                        }
                  }
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={
                    isCutting
                      ? { duration: 0.6, ease: "easeInOut" }
                      : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                  }
                  className="absolute top-24 left-[73%] -translate-x-1/2 z-50 cursor-pointer pointer-events-auto filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  onClick={handleCutCake}
                >
                  <svg viewBox="0 0 40 140" className="w-12 h-36">
                    <defs>
                      <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="40%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#78350f" />
                        <stop offset="100%" stopColor="#292524" />
                      </linearGradient>
                    </defs>
                    {/* Handle (Top) */}
                    <path d="M16,5 L24,5 L23,45 L17,45 Z" fill="url(#woodGrad)" stroke="#1c1917" strokeWidth="0.5" />
                    {/* Rivets / Pins */}
                    <circle cx="20" cy="15" r="1.2" fill="#cbd5e1" />
                    <circle cx="20" cy="30" r="1.2" fill="#cbd5e1" />
                    
                    {/* Bolster (Gold) */}
                    <rect x="15" y="45" width="10" height="4" rx="0.5" fill="url(#goldGrad)" />
                    
                    {/* Blade (Bottom) */}
                    <path d="M17,49 L23,49 L23,115 C23,124 21,128 20,132 C19,128 17,124 17,115 Z" fill="url(#bladeGrad)" stroke="#64748b" strokeWidth="0.5" />
                    
                    {/* Blade Shine Line */}
                    <path d="M17.5,50 L19,50 L19,112 C19,118 18.2,122 17.5,125 Z" fill="#ffffff" opacity="0.6" />
                  </svg>
                  <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider bg-black/60 px-2.5 py-0.5 rounded-full absolute top-1/2 left-full ml-2 -translate-y-1/2 whitespace-nowrap shadow-md border border-white/10">
                    Tap to Cut! 🔪
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Explanation box / prompts */}
            <div className="anim-child w-full">
              {showExplanation && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 space-y-4 shadow-inner max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                    🎤 Blow the Candle
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    We use microphone volume analysis to detect when you blow on the candles. Tap allow on the browser request to activate it!
                  </p>
                  <Button
                    onClick={enableMic}
                    className="w-full btn-aurora rounded-full font-bold uppercase tracking-wider text-xs h-11"
                  >
                    Enable Microphone & Blow 🎂
                  </Button>
                </div>
              )}

              {!showExplanation && listening && !isBlown && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 text-center space-y-3 max-w-sm mx-auto">
                  <p className="text-xs md:text-sm text-pink-300 font-bold uppercase animate-pulse">
                    🎤 Microphone Active - Blow into it!
                  </p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, (avgAudioVolume / 45) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    If blowing doesn't work, you can also tap/click the cake directly to blow out the candle.
                  </p>
                </div>
              )}

              {micAllowed === false && !isBlown && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 text-center space-y-3 max-w-sm mx-auto">
                  <p className="text-xs md:text-sm text-amber-300 font-bold uppercase">
                    ⚠️ Microphone Access Denied
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    No problem! You can still make your wish. Simply tap the cake directly with your finger or mouse to blow out the candle!
                  </p>
                </div>
              )}

              {isBlown && !isCakeCut && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 text-center space-y-3 max-w-sm mx-auto animate-pulse">
                  <p className="text-xs md:text-sm text-pink-300 font-bold uppercase">
                    🎂 Candles Blown! Now Cut the Cake! 🔪
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap the knife above or click the cake directly to slice it and enjoy your celebration!
                  </p>
                </div>
              )}

              {isCakeCut && (
                <div className="space-y-4 md:space-y-5 animate-fade-in">
                  <p className="text-lg md:text-xl font-bold text-pink-300 tracking-wide uppercase leading-tight animate-bounce">
                    🎉 Wish Made & Cake Cut! 🎉
                  </p>
                  <button
                    onClick={nextStep}
                    className="btn-aurora rounded-full px-8 py-3.5 text-white font-bold uppercase tracking-wider text-sm w-full md:w-auto"
                    style={{ fontFamily: "Satoshi" }}
                  >
                    Read My Message 💌
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: The Core Message */}
        {currentStep === 2 && (
          <div
            ref={(el) => { stepRefs.current[1] = el; }}
            className="aurora-glass-card p-8 md:p-12 rounded-3xl w-full max-w-xl text-center flex flex-col items-center space-y-6"
          >
            <div className="anim-child text-7xl">✨</div>
            <h2 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora leading-tight" style={{ fontFamily: "Playfair Display" }}>
              To My Wonderful Partner, Happy {occasionName}!
            </h2>
            <p className="anim-child text-slate-300 text-base md:text-lg leading-relaxed font-light" style={{ fontFamily: "Satoshi" }}>
              Your presence illuminates my world. Another year of you making the world brighter, another year more beautiful, inside and out. I cherish you deeply.
            </p>
            <button
              onClick={nextStep}
              className="anim-child btn-aurora rounded-full px-8 py-3.5 text-white font-bold uppercase tracking-wider text-sm"
              style={{ fontFamily: "Satoshi" }}
            >
              Discover More...
            </button>
          </div>
        )}

        {/* Step 3: Final Wish & Celebration */}
        {currentStep === 3 && (
          <div
            ref={(el) => { stepRefs.current[2] = el; }}
            className="aurora-glass-card p-8 md:p-12 rounded-3xl w-full max-w-lg text-center flex flex-col items-center space-y-6"
          >
            <div className="anim-child text-6xl">💝</div>
            <h2 className="anim-child text-3xl md:text-4xl font-bold text-gradient-aurora" style={{ fontFamily: "Playfair Display" }}>
              My Deepest Wish For You
            </h2>
            
            {/* Custom Message content */}
            <p className="anim-child text-slate-300 text-base md:text-lg leading-relaxed font-medium italic whitespace-pre-wrap max-w-md mx-auto" style={{ fontFamily: "Satoshi" }}>
              "{greeting.message}"
            </p>
            
            {/* Dynamic Final Wish text reveals here on click */}
            <div className="min-h-16 flex items-center justify-center">
              <p
                ref={finalWishTextRef}
                className="opacity-0 translate-y-8 font-black text-2xl md:text-3xl text-gradient-aurora tracking-wide drop-shadow-[0_0_15px_rgba(255,100,150,0.6)]"
                style={{ fontFamily: "Playfair Display" }}
              >
                Happy {occasionName}, My Sweetest Love! ❤️
              </p>
            </div>

            {!isCelebrationStarted && (
              <button
                ref={celebrateBtnRef}
                onClick={handleCelebrate}
                className="anim-child btn-aurora rounded-full px-10 py-4 text-white font-bold uppercase tracking-wider text-sm text-shadow-sm"
                style={{ fontFamily: "Satoshi" }}
              >
                Let's Celebrate!
              </button>
            )}

            <footer className="anim-child text-slate-400 text-xs font-medium tracking-wide mt-4" style={{ fontFamily: "Satoshi" }}>
              Crafted with endless love by {greeting.sender_name}
            </footer>

            {/* CTA back to Home (Only if not preview mode) */}
            {!isPreview && isCelebrationStarted && (
              <div className="anim-child pt-6 flex flex-col items-center gap-3">
                <Link
                  href="/love-space"
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase px-8 py-3.5 tracking-widest transition-colors flex items-center gap-2 shadow-lg border border-white/20"
                >
                  Enter Love Space
                </Link>
                <Link
                  href="/digital-greeting"
                  className="text-pink-400 hover:text-pink-300 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
                >
                  Create your own surprise
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
