import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Mail } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Community Guidelines & Acceptable Use Policy - MsgReplier",
  description:
    "MsgReplier Community Guidelines. Learn what is and isn't allowed on our platform to keep Love-Space and Wishes Website safe, respectful, and enjoyable for everyone.",
  alternates: {
    canonical: "/community-guidelines",
  },
};

const allowedUses = [
  "Creating private rooms to chat and play games with your partner.",
  "Sending heartfelt, kind, and celebratory messages in Love-Space.",
  "Building Wishes Websites to celebrate birthdays, anniversaries, and special occasions.",
  "Using our FLAMES Calculator and other tools for fun and entertainment.",
  "Sharing your Wishes Website link with the intended recipient.",
  "Using our tools for personal, non-commercial purposes.",
  "Exploring our blog for relationship tips, messaging guides, and digital tools tutorials.",
];

const prohibitedUses = [
  "Sending hateful, threatening, harassing, discriminatory, or abusive messages to other users.",
  "Using Love-Space or Wishes Website to send unsolicited messages to people who have not consented to receive them.",
  "Creating Wishes Website pages that contain illegal, harmful, or defamatory content.",
  "Attempting to gain unauthorised access to other users' rooms or to our backend systems.",
  "Using automated tools, bots, or scripts to access or interact with our platform without prior written permission.",
  "Uploading or transmitting viruses, malware, or any other malicious code.",
  "Impersonating any person or entity or misrepresenting your affiliation with any organisation.",
  "Using the platform for any purpose that violates applicable laws or regulations.",
  "Attempting to commercially exploit our tools without a written licensing agreement.",
  "Sharing another person's Love-Space room link publicly without their explicit consent.",
];

export default function CommunityGuidelinesPage() {
  return (
    <div 
      className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased py-12 px-4"
      style={{ fontFamily: '"Work Sans", sans-serif' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: 'Unbounded', sans-serif !important;
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

        <h1 className="text-3xl font-bold mb-2 text-[#110f0f]">Community Guidelines</h1>
        <p className="text-sm text-[#948678] font-medium mb-1">
          Also known as our Acceptable Use Policy
        </p>
        <p className="text-xs text-[#948678] mb-8">Last updated: June 2025</p>

        <div className="space-y-8 text-[#5d6c7b] leading-relaxed text-left">
          <p>
            MsgReplier is built on a foundation of trust, privacy, and respect. Our platform is designed to foster
            genuine connection between people — especially couples. These Community Guidelines define the standards
            of behaviour we expect from everyone who uses our services.
          </p>
          <p>
            By using MsgReplier (including Love-Space, Wishes Website, FLAMES Calculator, and all other features),
            you agree to follow these guidelines. Violations may result in suspension of access to our platform. These
            guidelines should be read alongside our full{" "}
            <Link href="/terms-conditions" className="text-[#110f0f] underline hover:no-underline font-medium">
              Terms and Conditions
            </Link>
            .
          </p>

          {/* Core Values Section */}
          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-4">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#d4c3ab] text-center shadow-sm">
              <div className="text-3xl mb-2">💜</div>
              <h3 className="font-heading font-bold text-[#110f0f] mb-1 text-sm">Respect</h3>
              <p className="text-xs text-[#5d6c7b]">Treat every user with kindness and dignity.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-[#d4c3ab] text-center shadow-sm">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-heading font-bold text-[#110f0f] mb-1 text-sm">Privacy</h3>
              <p className="text-xs text-[#5d6c7b]">Protect your own and others' personal info.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-[#d4c3ab] text-center shadow-sm">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-heading font-bold text-[#110f0f] mb-1 text-sm">Positivity</h3>
              <p className="text-xs text-[#5d6c7b]">Keep interactions uplifting and warm.</p>
            </div>
          </div>

          {/* Allowed Section */}
          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-4">What Is Allowed ✅</h2>
          <ul className="space-y-3">
            {allowedUses.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm md:text-base">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Prohibited Section */}
          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-4">What Is Not Allowed ❌</h2>
          <ul className="space-y-3">
            {prohibitedUses.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm md:text-base">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>

          {/* Privacy Section */}
          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-3">Privacy in Love-Space</h2>
          <p className="text-sm md:text-base leading-relaxed">
            Love-Space rooms are private spaces designed for two consenting individuals. While we do not monitor the
            content of private conversations, we expect all users to treat their partner with respect and care. The private
            nature of Love-Space does not excuse harmful, abusive, or illegal behaviour. If you receive unwanted contact
            or feel unsafe, please{" "}
            <Link href="/contact" className="text-[#110f0f] underline hover:no-underline font-medium">
              contact us immediately
            </Link>
            .
          </p>

          {/* Content Standards */}
          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-3">Wishes Website Content Standards</h2>
          <p className="text-sm md:text-base leading-relaxed">
            Wishes Websites you create are accessible to anyone with the link. You are solely responsible for ensuring
            the content of your greeting is appropriate, truthful, and intended for the recipient. Do not create Wishes
            Websites that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
            <li>Contain hateful, threatening, or harassing language.</li>
            <li>Include false or misleading information about a person.</li>
            <li>Are designed to deceive or manipulate the recipient.</li>
            <li>Violate any applicable laws including copyright or privacy laws.</li>
          </ul>

          {/* Warning Banner */}
          <div className="mt-8 p-6 bg-[#eedfc6]/40 rounded-3xl border border-[#d4c3ab]">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-[#110f0f] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-bold text-sm text-[#110f0f] mb-1">Enforcement</h3>
                <p className="text-sm text-[#5d6c7b] leading-relaxed">
                  Violations of these guidelines may result in the immediate closure of your Love-Space room, removal of
                  your Wishes Website, or a permanent ban from our platform. We reserve the right to take action without
                  prior notice in cases of severe violations.
                </p>
              </div>
            </div>
          </div>

          {/* Contact / Reporting */}
          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-3">Reporting Abuse</h2>
          <p className="text-sm md:text-base leading-relaxed">
            If you encounter behaviour that violates these guidelines or feel that your safety or privacy has been
            compromised, please report it to us immediately at:
          </p>
          
          <div className="mt-4 flex items-center gap-3.5 p-5 bg-white rounded-2xl border border-[#d4c3ab] w-fit">
            <Mail className="h-5 w-5 text-[#110f0f] shrink-0" />
            <a href="mailto:care.msgreplier@gmail.com" className="text-[#110f0f] hover:text-[#948678] font-heading font-semibold text-sm transition-colors">
              care.msgreplier@gmail.com
            </a>
          </div>
          
          <p className="mt-4 text-sm md:text-base leading-relaxed">
            We take all reports seriously and aim to respond within 48 hours. For urgent safety concerns, please also
            contact your local law enforcement.
          </p>

          <h2 className="text-xl font-bold text-[#110f0f] mt-8 mb-3">Changes to These Guidelines</h2>
          <p className="text-sm md:text-base leading-relaxed">
            We may update these Community Guidelines from time to time. The &quot;Last updated&quot; date at the top of
            this page will reflect any changes. Your continued use of MsgReplier after updates are posted constitutes your
            acceptance of the revised guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
