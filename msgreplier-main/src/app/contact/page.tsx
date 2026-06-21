import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Mail, MessageSquare, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - MsgReplier",
  description: "Get in touch with the MsgReplier team for support, feedback, or inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const fromLoveScore = resolvedSearchParams?.from === "love-score";
  const backHref = fromLoveScore ? "/love-score" : "/";
  const backText = fromLoveScore ? "Back to Love Score" : "Back to Home";

  return (
    <div 
      className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased py-16 px-4"
      style={{ fontFamily: '"Work Sans", sans-serif' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: 'Unbounded', sans-serif !important;
        }
      `}} />

      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="flex justify-start mb-4">
          <Link 
            href={backHref} 
            className="inline-flex items-center gap-2 text-[#110f0f] hover:text-[#948678] font-heading font-medium text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Link>
        </div>

        <div className="bg-[#eedfc6] border border-[#d4c3ab] p-4 rounded-3xl w-fit mx-auto text-[#110f0f]">
          <MessageSquare className="h-10 w-10" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-[#110f0f]">
          Contact Us
        </h1>

        <p className="text-base md:text-lg text-[#5d6c7b] leading-relaxed max-w-md mx-auto">
          Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Email Card */}
          <div className="bg-white p-8 rounded-[28px] border border-[#d4c3ab] shadow-sm flex flex-col items-center justify-between gap-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-[#eedfc6]/40 p-3.5 rounded-2xl border border-[#d4c3ab]">
                <Mail className="h-6 w-6 text-[#110f0f]" />
              </div>
              <h2 className="text-xl font-bold text-[#110f0f]">Email Us</h2>
              <p className="text-[#5d6c7b] text-sm leading-relaxed max-w-[200px]">
                For support, feature requests, and feedback:
              </p>
            </div>
            <a
              href="mailto:care.msgreplier@gmail.com"
              className="text-base font-bold text-[#110f0f] hover:text-[#948678] transition-colors break-all"
            >
              care.msgreplier@gmail.com
            </a>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-white p-8 rounded-[28px] border border-[#d4c3ab] shadow-sm flex flex-col items-center justify-between gap-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-[#eedfc6]/40 p-3.5 rounded-2xl border border-[#d4c3ab]">
                <MessageCircle className="h-6 w-6 text-[#110f0f]" />
              </div>
              <h2 className="text-xl font-bold text-[#110f0f]">WhatsApp Us</h2>
              <p className="text-[#5d6c7b] text-sm leading-relaxed max-w-[200px]">
                For fully custom wishes websites:
              </p>
            </div>
            <a
              href="https://wa.me/918499989032"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-[#110f0f] hover:text-[#948678] transition-colors"
            >
              +91 8499989032
            </a>
          </div>
        </div>

        <p className="text-xs text-[#948678] mt-8">
          We typically respond within 24-48 hours.
        </p>
      </div>
    </div>
  );
}
