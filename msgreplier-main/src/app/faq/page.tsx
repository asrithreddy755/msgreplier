import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) - MsgReplier",
  description:
    "Find answers to the most common questions about MsgReplier — including Love-Space privacy, Wishes Website creation, data storage, account requirements, and more.",
  alternates: {
    canonical: "/faq",
  },
};

const faqCategories = [
  {
    category: "General",
    questions: [
      {
        id: "gen-1",
        q: "What is MsgReplier?",
        a: "MsgReplier is a free, privacy-first platform for couples and individuals. It offers a suite of digital tools including Love-Space (a private real-time room for couples), Wishes Website (interactive digital greeting cards), FLAMES Calculator (a fun compatibility game), and AI Couple Prompts.",
      },
      {
        id: "gen-2",
        q: "Is MsgReplier free to use?",
        a: "Yes, all core features of MsgReplier are completely free to use. We are supported by non-intrusive advertisements via Google AdSense, which allows us to keep the platform free for everyone without requiring subscriptions or paid accounts.",
      },
      {
        id: "gen-3",
        q: "Do I need to create an account to use MsgReplier?",
        a: "No! MsgReplier is designed to be completely zero-friction. You do not need to register an account, provide an email address, or enter any personal details to use any of our tools. Simply visit the site and start using it immediately.",
      },
      {
        id: "gen-4",
        q: "Is MsgReplier safe for teenagers?",
        a: "MsgReplier is designed for users aged 13 and above. Our tools are focused on fun, lighthearted couple activities. We do not collect personal data beyond what is strictly necessary for tool functionality, and all private room conversations are automatically deleted after periods of inactivity.",
      },
    ],
  },
  {
    category: "Love-Space",
    questions: [
      {
        id: "ls-1",
        q: "What is Love-Space?",
        a: "Love-Space is a private, temporary digital room created exclusively for two people (typically a couple). It includes real-time chat, built-in games like Ludo and Tic Tac Toe, live presence indicators, and a warm, intimate interface designed to help couples stay connected.",
      },
      {
        id: "ls-2",
        q: "Is Love-Space truly private?",
        a: "Yes. Love-Space rooms are private by design. Each room is accessed via a unique link or 5-digit code that only you and your partner have. No one else can join your room without the link. We do not read, monitor, or share your private conversations.",
      },
      {
        id: "ls-3",
        q: "How long does a Love-Space room last?",
        a: "Love-Space rooms automatically expire after 24 hours from creation. Once a room closes, all associated chat data and game states are permanently deleted from our servers.",
      },
      {
        id: "ls-4",
        q: "What happens when my partner closes their tab?",
        a: "When one partner closes their browser tab or navigates away, the other partner will see a status indicator that they are offline. However, the room remains active and available for up to 24 hours after creation, allowing both partners to rejoin at any time.",
      },
      {
        id: "ls-5",
        q: "Can more than two people join a Love-Space room?",
        a: "No. Love-Space is intentionally designed for exactly two people. This ensures the space remains intimate, private, and focused on the connection between two partners. A room will not allow a third person to join once two members are already present.",
      },
    ],
  },
  {
    category: "Wishes Website",
    questions: [
      {
        id: "ww-1",
        q: "What is the Wishes Website builder?",
        a: "The Wishes Website builder lets you create a beautiful, interactive, animated digital greeting page in seconds. You can personalise it with a recipient name, occasion (birthday, anniversary, etc.), a heartfelt message, a theme, music, and more — no design skills needed.",
      },
      {
        id: "ww-2",
        q: "How do I share my Wishes Website?",
        a: "After creating your Wishes Website, you will receive a unique shareable link. Simply copy this link and send it to your recipient via WhatsApp, Instagram DM, email, or any messaging app. When they open it, they will see your personalised interactive greeting.",
      },
      {
        id: "ww-3",
        q: "How long is my Wishes Website stored?",
        a: "Wishes Website pages are stored for up to 12 months from creation or until you request deletion, whichever comes first. After this period, the page and all its content are automatically removed from our servers.",
      },
    ],
  },
  {
    category: "Privacy & Data",
    questions: [
      {
        id: "priv-1",
        q: "What personal data does MsgReplier collect?",
        a: "We collect very minimal data. For most tools (FLAMES Calculator, AI Prompts), no data is collected at all — everything runs in your browser. For Love-Space, we temporarily store room metadata and chat history to enable real-time sync. For Wishes Website, we store the greeting content to generate a shareable link. We never collect your name, email, or phone number unless you contact us directly.",
      },
      {
        id: "priv-2",
        q: "Does MsgReplier use cookies?",
        a: "We use strictly necessary cookies for essential functionality (like remembering your consent choice and theme preference). With your consent, we also use Google Analytics cookies (for anonymous traffic analysis) and Google AdSense cookies (for advertising). You can manage your cookie preferences at any time — see our Cookie Policy for details.",
      },
      {
        id: "priv-3",
        q: "How can I request deletion of my data?",
        a: "You can request deletion of any data we hold about you by emailing us at care.msgreplier@gmail.com. For Love-Space, room data is automatically deleted when the room expires. For Wishes Website, include the unique link to your greeting page in your deletion request and we will remove it promptly.",
      },
      {
        id: "priv-4",
        q: "Does MsgReplier sell my data?",
        a: "Absolutely not. We do not sell, rent, or trade any personal data to third parties. We use Google Analytics to understand site traffic (anonymised data) and Google AdSense to display ads. Both are governed by Google's privacy policy, which you can review at policies.google.com/privacy.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        id: "tech-1",
        q: "Which browsers does MsgReplier support?",
        a: "MsgReplier works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For the best Love-Space experience (especially for the real-time features), we recommend using the latest version of Chrome or Firefox on a stable internet connection.",
      },
      {
        id: "tech-2",
        q: "Does MsgReplier work on mobile phones?",
        a: "Yes! MsgReplier is fully responsive and designed to work smoothly on smartphones and tablets. The Love-Space interface, Wishes Website builder, and all other tools are optimised for mobile devices.",
      },
      {
        id: "tech-3",
        q: "What should I do if Love-Space is not connecting?",
        a: "If you experience connection issues in Love-Space, try refreshing the page, checking your internet connection, or opening the room link in a new tab. Love-Space uses Supabase Realtime for live synchronisation — ensure your browser is not blocking WebSocket connections. If problems persist, please contact us at care.msgreplier@gmail.com.",
      },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((cat) =>
      cat.questions.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/" className="inline-flex mb-8">
        <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-10 text-base leading-relaxed">
        Everything you need to know about MsgReplier, Love-Space, Wishes Website, privacy, and more. Can&apos;t find what you&apos;re looking for?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact us
        </Link>
        .
      </p>

      <div className="space-y-10">
        {faqCategories.map((cat) => (
          <section key={cat.category}>
            <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60">
              {cat.category}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {cat.questions.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <div className="mt-16 p-6 bg-muted/40 rounded-2xl border border-border/50 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">Still have questions?</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Our team is happy to help. Reach out and we&apos;ll get back to you within 24–48 hours.
        </p>
        <Button asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
