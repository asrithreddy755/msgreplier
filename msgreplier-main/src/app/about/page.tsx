import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About MsgReplier - Our Mission & Tools",
  description: "Learn more about MsgReplier, the free messaging toolkit designed to simplify digital communication with privacy-first tools.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
      <Link href="/" className="inline-flex mb-8">
        <Button variant="ghost" className="gap-2 -ml-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">About MsgReplier</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          MsgReplier is a free, privacy-first platform designed to help you celebrate your relationships and create magical digital surprises for your loved ones.
          Whether you&apos;re trying to build a custom wishes website for a birthday or anniversary, or looking for a private space to connect with your partner, our tools are here to assist.
        </p>
        <p>
          Our mission is to provide simple, fast, and memorable experiences that bring couples closer together without compromising your privacy.
        </p>
        
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Our Features</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong><Link href="/digital-greeting" className="text-primary hover:underline">Wishes Website Builder</Link>:</strong> Create custom, interactive websites with beautiful animations to wish your loved ones a happy birthday, anniversary, or special occasion.
          </li>
          <li>
            <strong><Link href="/love-space" className="text-primary hover:underline">Love-Space</Link>:</strong> A private, encrypted digital room for couples to chat securely and play real-time synchronized games like Snake and Ludo together.
          </li>
          <li>
            <strong><Link href="/love-score" className="text-primary hover:underline">Love Score Calculator</Link>:</strong> A fun, interactive tool to calculate your love compatibility based on the classic flames game concept.
          </li>
          <li>
            <strong><Link href="/prompt" className="text-primary hover:underline">Msg Prompt</Link>:</strong> A curated library of copyable prompts for couples. Copy a prompt, paste it into any AI image tool, and generate matching couple pictures or creative photoshoot ideas in seconds.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Privacy Commitment</h2>
        <p>
          We believe your conversations should remain private. That&apos;s why MsgReplier is built with a privacy-first architecture. 
          We do not require any login, and we do not save, store or collect your message data. All processing happens directly in your browser.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
        <p>
          Have questions, suggestions, or feedback? We&apos;d love to hear from you. Reach out to us at:
          <br />
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline font-medium">
            care.msgreplier@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
