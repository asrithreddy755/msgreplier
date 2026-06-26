import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart, Shield, Zap, Users, Star, Mail, Instagram, Youtube } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About Us - MsgReplier | Our Mission, Story & Tools",
  description:
    "Learn about MsgReplier — the free, privacy-first digital platform for couples. Discover our mission, the tools we build, and our commitment to keeping your data safe.",
  alternates: {
    canonical: "https://msgreplier.com/about",
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
    <div 
      className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased py-12 px-4"
      style={{ fontFamily: '"Work Sans", sans-serif' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: 'Unbounded', sans-serif !important;
        }
      `}} />

      <div className="container max-w-4xl mx-auto md:px-6">
        <div className="flex justify-start mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#110f0f] hover:text-[#948678] font-heading font-medium text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1.5 rounded-full text-sm font-semibold mb-6 text-[#110f0f]">
            <Heart className="h-4 w-4 fill-[#110f0f] text-[#110f0f]" /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#110f0f]">
            About MsgReplier
          </h1>
          <p className="text-lg md:text-xl text-[#5d6c7b] leading-relaxed max-w-2xl mx-auto">
            We are a small, passionate team building simple, privacy-respecting digital tools that help
            couples connect, celebrate, and stay close — no matter the distance.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 bg-white border border-[#d4c3ab] rounded-[32px] p-8 md:p-10 text-left">
          <h2 className="text-2xl font-bold mb-6 text-[#110f0f]">Our Mission</h2>
          <div className="space-y-4 text-[#5d6c7b] leading-relaxed">
            <p>
              In a world of social media noise, constant notifications, and data-hungry apps, we wanted to
              create something different — a collection of tools that put <strong className="text-[#110f0f]">people first</strong>.
            </p>
            <p>
              MsgReplier was founded on a simple idea: technology should bring couples{" "}
              <em>closer</em>, not exploit their attention or compromise their privacy. Every tool we build
              starts with that principle. We ask ourselves: &quot;Is this genuinely useful? Does it respect the
              user&apos;s privacy? Can we make it beautiful and delightful to use?&quot;
            </p>
            <p>
              We are based in <strong className="text-[#110f0f]">India 🇮🇳</strong> and serve users globally.
              Our platform handles thousands of Wishes Websites and Love-Space sessions every month, and we
              are proud that our users trust us with their most personal moments.
            </p>
          </div>
        </section>

        {/* Our Tools */}
        <section className="mb-16 text-left">
          <h2 className="text-2xl font-bold mb-8 text-[#110f0f]">What We Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="bg-white rounded-[24px] border border-[#d4c3ab] p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-4">{tool.icon}</div>
                <h3 className="font-heading font-bold text-lg mb-2 text-[#110f0f]">
                  <Link href={tool.href} className="hover:underline hover:text-[#948678] transition-colors">
                    {tool.name}
                  </Link>
                </h3>
                <p className="text-sm text-[#5d6c7b] leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16 text-left">
          <h2 className="text-2xl font-bold mb-8 text-[#110f0f]">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.title} className="flex gap-4">
                <div className="bg-[#eedfc6] border border-[#d4c3ab] p-3 rounded-2xl h-fit flex-shrink-0 text-[#110f0f]">
                  <value.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2 text-[#110f0f]">{value.title}</h3>
                  <p className="text-sm text-[#5d6c7b] leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Commitment */}
        <section className="mb-16 bg-[#eedfc6]/30 rounded-[32px] border border-[#d4c3ab] p-8 md:p-10 text-left">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Shield className="h-10 w-10 text-[#110f0f] shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-[#110f0f] mb-4">
                Our Privacy Commitment
              </h2>
              <p className="text-[#5d6c7b] leading-relaxed mb-4 text-base">
                Privacy is not just a feature for us — it is a core design principle. Here is what we promise:
              </p>
              <ul className="space-y-3 text-sm text-[#5d6c7b]">
                <li className="flex items-start gap-2.5">
                  <Star className="h-4.5 w-4.5 shrink-0 mt-0.5 fill-[#110f0f] text-[#110f0f]" />
                  <span>
                    <strong>No account required</strong> — use all our tools anonymously without signing up.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Star className="h-4.5 w-4.5 shrink-0 mt-0.5 fill-[#110f0f] text-[#110f0f]" />
                  <span>
                    <strong>No message logging</strong> — Love-Space chats are not read or stored permanently by us.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Star className="h-4.5 w-4.5 shrink-0 mt-0.5 fill-[#110f0f] text-[#110f0f]" />
                  <span>
                    <strong>Auto-deletion</strong> — Love-Space rooms and their data are automatically purged after 24 hours.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Star className="h-4.5 w-4.5 shrink-0 mt-0.5 fill-[#110f0f] text-[#110f0f]" />
                  <span>
                    <strong>No data selling</strong> — we never sell your data to third parties.
                  </span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-[#5d6c7b]">
                Read our full{" "}
                <Link href="/privacy-policy" className="underline hover:no-underline font-medium text-[#110f0f]">
                  Privacy Policy
                </Link>{" "}
                for complete details.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8 text-left">
          <h2 className="text-2xl font-bold mb-6 text-[#110f0f]">Get in Touch</h2>
          <p className="text-[#5d6c7b] mb-8 leading-relaxed">
            We love hearing from our users! Whether you have a question, suggestion, bug report, or just want
            to say hi, please reach out.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a
              href="mailto:care.msgreplier@gmail.com"
              className="flex items-center gap-3.5 p-5 bg-white rounded-[20px] border border-[#d4c3ab] hover:bg-[#eedfc6]/30 transition-colors"
            >
              <Mail className="h-5 w-5 text-[#110f0f] shrink-0" />
              <div>
                <div className="font-semibold text-sm text-[#110f0f]">Email</div>
                <div className="text-xs text-[#5d6c7b] break-all">care.msgreplier@gmail.com</div>
              </div>
            </a>
            <a
              href="https://www.instagram.com/msgreplier"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3.5 p-5 bg-white rounded-[20px] border border-[#d4c3ab] hover:bg-[#eedfc6]/30 transition-colors"
            >
              <Instagram className="h-5 w-5 text-[#110f0f] shrink-0" />
              <div>
                <div className="font-semibold text-sm text-[#110f0f]">Instagram</div>
                <div className="text-xs text-[#5d6c7b]">@msgreplier</div>
              </div>
            </a>
            <a
              href="https://youtube.com/@msgreplier"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3.5 p-5 bg-white rounded-[20px] border border-[#d4c3ab] hover:bg-[#eedfc6]/30 transition-colors"
            >
              <Youtube className="h-5 w-5 text-[#110f0f] shrink-0" />
              <div>
                <div className="font-semibold text-sm text-[#110f0f]">YouTube</div>
                <div className="text-xs text-[#5d6c7b]">@msgreplier</div>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
