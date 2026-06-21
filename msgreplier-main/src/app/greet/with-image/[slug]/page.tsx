"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import TemplateCake from "../../../digital-greeting/components/with-image/TemplateCake";
import TemplateAurora from "../../../digital-greeting/components/with-image/TemplateAurora";
import TemplateClassic2D from "../../../digital-greeting/components/with-image/TemplateClassic2D";

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


export default function GreetingWebsite() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<any>(null);
  const [dobParam, setDobParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDobParam(params.get("dob"));
    }
  }, []);

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const response = await fetch(`/api/digital-greeting/${slug}`);
        if (!response.ok) {
          throw new Error("Greeting not found");
        }
        const data = await response.json();
        setGreeting(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchGreeting();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <Heart className="w-16 h-16 text-pink-400 fill-pink-200" />
        </motion.div>
        <p className="mt-4 text-pink-500 font-black uppercase tracking-widest">Delivering Love...</p>
      </div>
    );
  }

  if (error || !greeting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-6 text-center">
        <div className="text-8xl mb-6 text-pink-300">🕊️</div>
        <h1 className="text-3xl font-black text-pink-600 uppercase tracking-tighter">Letter Missing</h1>
        <Button asChild className="mt-8 bg-pink-500 hover:bg-pink-600 text-white rounded-full px-10 h-14 font-black">
          <Link href="/digital-greeting">CREATE A NEW ONE</Link>
        </Button>
      </div>
    );
  }

  if (greeting.theme === "wishes3" || greeting.theme === "wishes4" || greeting.theme === "wishes5" || greeting.theme === "propose_crush1" || greeting.theme === "wishes6" || greeting.theme === "wishes7") {
    return (
      <IframeTemplate
        greeting={{
          ...greeting,
          dob: dobParam,
        }}
        templateFolder={`template_${greeting.theme}`}
      />
    );
  }

  if (greeting.theme === "aurora") {
    return <TemplateAurora greeting={greeting} />;
  }

  if (greeting.theme === "classic-2d") {
    return <TemplateClassic2D greeting={greeting} />;
  }

  return <TemplateCake greeting={greeting} />;
}
