import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Shield, Zap, Users, Star, Mail, Instagram, Youtube } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - MsgReplier | Our Mission, Story & Tools",
  description:
    "Learn about MsgReplier — the free, privacy-first digital platform for couples. Discover our mission, the tools we build, and our commitment to keeping your data safe.",
  alternates: {
    canonical: "/about",
  },
};

const tools = [
  {
    icon: "💑",
    name: "Love-Space",
    href: "/love-space",
    description:
      "A private, temporary digital room for couples to chat in real time, play games (Ludo, Tic Tac Toe, Snake & Ladder), and stay connected. No login required — your room auto-deletes after 24 hours.",
  },
  {
    icon: "🎁",
    name: "Wishes Website Builder",
    href: "/digital-greeting",
    description:
      "Create a beautiful, animated, interactive digital greeting page for birthdays, anniversaries, Valentine's Day, and more. Personalise it with music, themes, and a heartfelt message — then share a unique link.",
  },
  {
    icon: "🔥",
    name: "FLAMES Calculator",
    href: "/flames",
    description:
      "The classic childhood love compatibility game, reimagined for the web. Enter two names and instantly find out if you are destined for Friendship, Love, Affection, Marriage, Enemy, or Sibling status!",
  },
  {
    icon: "📸",
    name: "AI Couple Prompts",
    href: "/prompt",
    description:
      "A curated library of creative AI image prompts designed for couples. Copy any prompt and paste it into your favourite AI image generator to create beautiful, matching couple pictures or photoshoot ideas.",
  },
];

const values = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "We believe your conversations and personal moments should remain private. Most of our tools require zero login, store no personal data, and process everything locally in your browser.",
  },
  {
    icon: Zap,
    title: "Always Free",
    description:
      "Every tool we build is free to use, forever. We are supported by non-intrusive advertisements via Google AdSense — keeping the platform accessible to everyone without subscriptions or paywalls.",
  },
  {
    icon: Heart,
    title: "Built for Connection",
    description:
      "Every feature we design has one goal: helping people feel closer. From private couple chat rooms to personalised digital surprises, we obsess over the details that make moments feel special.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description:
      "Our roadmap is shaped by our users. We read every email, listen to feedback on social media, and continuously improve based on what our community tells us they need.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MsgReplier",
    url: "https://msgreplier.com",
    logo: "https://msgreplier.com/icon.png",
    description:
      "MsgReplier is a free, privacy-first digital platform for couples, offering tools like Love-Space (private couple chat rooms), Wishes Website builder, FLAMES Calculator, and AI Couple Prompts.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "care.msgreplier@gmail.com",
    },
    sameAs: [
      "https://www.instagram.com/msgreplier",
      "https://youtube.com/@msgreplier",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-4xl py-12 px-4 md:px-6 mx-auto">
        <Link href="/" className="inline-flex mb-8">
          <Button variant="ghost" className="gap-2 -ml-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Heart className="h-4 w-4 fill-current" /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            About MsgReplier
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We are a small, passionate team building simple, privacy-respecting digital tools that help
            couples connect, celebrate, and stay close — no matter the distance.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 bg-muted/30 rounded-2xl border border-border/50 p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            In a world of social media noise, constant notifications, and data-hungry apps, we wanted to
            create something different — a collection of tools that put <strong className="text-foreground">people first</strong>.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            MsgReplier was founded on a simple idea: technology should bring couples{" "}
            <em>closer</em>, not exploit their attention or compromise their privacy. Every tool we build
            starts with that principle. We ask ourselves: &quot;Is this genuinely useful? Does it respect the
            user&apos;s privacy? Can we make it beautiful and delightful to use?&quot;
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We are based in <strong className="text-foreground">India 🇮🇳</strong> and serve users globally.
            Our platform handles thousands of Wishes Websites and Love-Space sessions every month, and we
            are proud that our users trust us with their most personal moments.
          </p>
        </section>

        {/* Our Tools */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">What We Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="bg-muted/20 rounded-xl border border-border/50 p-6 hover:bg-muted/40 transition-colors"
              >
                <div className="text-3xl mb-3">{tool.icon}</div>
                <h3 className="font-bold text-lg mb-2">
                  <Link href={tool.href} className="text-foreground hover:text-primary transition-colors">
                    {tool.name}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => (
              <div key={value.title} className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Commitment */}
        <section className="mb-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-700/30 p-8">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-3">
                Our Privacy Commitment
              </h2>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed mb-3">
                Privacy is not just a feature for us — it is a core design principle. Here is what we promise:
              </p>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-300">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 shrink-0 mt-0.5 fill-current" />
                  <span>
                    <strong>No account required</strong> — use all our tools anonymously without signing up.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 shrink-0 mt-0.5 fill-current" />
                  <span>
                    <strong>No message logging</strong> — Love-Space chats are not read or stored permanently by
                    us.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 shrink-0 mt-0.5 fill-current" />
                  <span>
                    <strong>Auto-deletion</strong> — Love-Space rooms and their data are automatically purged
                    after 24 hours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 shrink-0 mt-0.5 fill-current" />
                  <span>
                    <strong>No data selling</strong> — we never sell your data to third parties.
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-emerald-800 dark:text-emerald-300">
                Read our full{" "}
                <Link href="/privacy-policy" className="underline hover:no-underline">
                  Privacy Policy
                </Link>{" "}
                for complete details.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            We love hearing from our users! Whether you have a question, suggestion, bug report, or just want
            to say hi, please reach out.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="mailto:care.msgreplier@gmail.com"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold text-sm">Email</div>
                <div className="text-xs text-muted-foreground">care.msgreplier@gmail.com</div>
              </div>
            </a>
            <a
              href="https://www.instagram.com/msgreplier"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors"
            >
              <Instagram className="h-5 w-5 text-pink-500" />
              <div>
                <div className="font-semibold text-sm">Instagram</div>
                <div className="text-xs text-muted-foreground">@msgreplier</div>
              </div>
            </a>
            <a
              href="https://youtube.com/@msgreplier"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors"
            >
              <Youtube className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-semibold text-sm">YouTube</div>
                <div className="text-xs text-muted-foreground">@msgreplier</div>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
