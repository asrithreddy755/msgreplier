import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export const dynamic = "force-static";

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
        summary::-webkit-details-marker {
          display: none;
        }
        summary {
          list-style: none;
        }
      `}} />

      <div className="container max-w-3xl mx-auto md:px-6">
        <div className="flex justify-start mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#110f0f] hover:text-[#948678] font-heading font-medium text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-[#110f0f] text-left">Frequently Asked Questions</h1>
        <p className="text-left text-[#5d6c7b] mb-12 text-sm md:text-base leading-relaxed">
          Everything you need to know about MsgReplier, Love-Space, Wishes Website, privacy, and more. Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/contact" className="text-[#110f0f] underline hover:no-underline font-semibold">
            Contact us
          </Link>
          .
        </p>

        <div className="space-y-12 text-left">
          {faqCategories.map((cat) => (
            <section key={cat.category} className="space-y-4">
              <h2 className="text-xl font-bold text-[#110f0f] pb-2 border-b border-[#d4c3ab] font-heading">
                {cat.category}
              </h2>
              <div className="space-y-1">
                {cat.questions.map((item) => (
                  <details key={item.id} className="group border-b border-[#d4c3ab]/30 py-4 cursor-pointer">
                    <summary className="flex items-center justify-between list-none font-bold text-sm md:text-base text-[#110f0f] focus:outline-none select-none py-1">
                      <span>{item.q}</span>
                      <span className="p-1 rounded-full border border-[#d4c3ab] transition-transform group-open:rotate-45 shrink-0 ml-4">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </summary>
                    <div className="mt-3 text-[#5d6c7b] text-sm md:text-base leading-relaxed pl-1">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 bg-white border border-[#d4c3ab] rounded-[32px] text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <h2 className="text-lg md:text-xl font-bold text-[#110f0f] font-heading">Still have questions?</h2>
          <p className="text-[#5d6c7b] text-sm leading-relaxed max-w-md mx-auto">
            Our team is happy to help. Reach out and we&apos;ll get back to you within 24–48 hours.
          </p>
          <div className="pt-2">
            <Link 
              href="/contact" 
              className="font-heading font-medium text-xs bg-[#110f0f] text-white hover:bg-[#eedfc6] hover:text-[#110f0f] border border-transparent hover:border-[#d4c3ab] px-6 py-3.5 rounded-full transition-all duration-300 uppercase tracking-wider inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
