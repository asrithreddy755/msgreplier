"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import TemplateCake from "../../digital-greeting/components/TemplateCake";
import TemplateAurora from "../../digital-greeting/components/TemplateAurora";

export default function GreetingWebsite() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<any>(null);

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

  if (greeting.theme === "aurora") {
    return <TemplateAurora greeting={greeting} />;
  }

  return <TemplateCake greeting={greeting} />;
}
