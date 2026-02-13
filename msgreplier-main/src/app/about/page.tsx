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
          MsgReplier is a free, privacy-first messaging toolkit designed to help you navigate the complexities of modern digital communication. 
          Whether you're trying to decode Gen Z slang, create emphasis in your messages, or draft the perfect reply, our tools are here to assist.
        </p>
        <p>
          Our mission is to provide simple, fast, and effective tools that enhance your messaging experience without compromising your privacy.
        </p>
        
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Our Tools</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong><Link href="/shortcutpedia" className="text-primary hover:underline">Shortcutpedia</Link>:</strong> An extensive dictionary of internet slang and chat abbreviations.
          </li>
          <li>
            <strong><Link href="/text-repeater" className="text-primary hover:underline">Text Repeater</Link>:</strong> A tool to repeat text instantly for emphasis or to meet character limits.
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><Link href="/instagram-text-repeater" className="hover:underline">Instagram Text Repeater</Link></li>
              <li><Link href="/whatsapp-text-repeater" className="hover:underline">WhatsApp Text Repeater</Link></li>
              <li><Link href="/telegram-text-repeater" className="hover:underline">Telegram Text Repeater</Link></li>
              <li><Link href="/facebook-text-repeater" className="hover:underline">Facebook Text Repeater</Link></li>
              <li><Link href="/x-text-repeater" className="hover:underline">X (Twitter) Text Repeater</Link></li>
              <li><Link href="/youtube-text-repeater" className="hover:underline">YouTube Text Repeater</Link></li>
            </ul>
          </li>
          <li>
            <strong><Link href="/cham-ai" className="text-primary hover:underline">Cham AI</Link>:</strong> (Coming Soon) An AI-powered reply generator that runs locally in your browser.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Privacy Commitment</h2>
        <p>
          We believe your conversations should remain private. That's why MsgReplier is built with a privacy-first architecture. 
          We do not require any login, and we do not save, store or collect your message data. All processing happens directly in your browser.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
        <p>
          Have questions, suggestions, or feedback? We'd love to hear from you. Reach out to us at:
          <br />
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline font-medium">
            care.msgreplier@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
