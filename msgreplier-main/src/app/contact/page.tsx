import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Mail, MessageSquare, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


export const metadata: Metadata = {
  title: "Contact Us - MsgReplier",
  description: "Get in touch with the MsgReplier team for support, feedback, or inquiries.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const fromLoveScore = resolvedSearchParams?.from === "love-score";
  const backHref = fromLoveScore ? "/love-score" : "/";
  const backText = fromLoveScore ? "Back to Love Score" : "Back to Home";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="flex justify-start mb-4">
          <Link href={backHref} className="inline-flex">
            <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {backText}
            </Button>
          </Link>
        </div>

        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact Us
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400">
          Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Mail className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold">Email Us</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                For support and feedback:
              </p>
              <a
                href="mailto:care.msgreplier@gmail.com"
                className="text-xl font-bold text-primary hover:underline transition-all"
              >
                care.msgreplier@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <MessageCircle className="h-8 w-8 text-green-500" />
              <h2 className="text-xl font-semibold">WhatsApp Us</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                For fully custom wishes websites:
              </p>
              <a
                href="https://wa.me/918499989032"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-green-600 hover:underline transition-all"
              >
                +91 8499989032
              </a>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 mt-8">
          We typically respond within 24-48 hours.
        </p>
      </div>
    </div>
  );
}
