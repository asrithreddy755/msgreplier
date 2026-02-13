import { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - MsgReplier",
  description: "Get in touch with the MsgReplier team for support, feedback, or inquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact Us
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Have a question, suggestion, or just want to say hello? We'd love to hear from you.
        </p>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
          <div className="flex flex-col items-center gap-4">
            <Mail className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Email Us</h2>
            <p className="text-slate-500 dark:text-slate-400">
              For all inquiries, please email us directly at:
            </p>
            <a 
              href="mailto:care.msgreplier@gmail.com" 
              className="text-2xl font-bold text-primary hover:underline transition-all"
            >
              care.msgreplier@gmail.com
            </a>
            <p className="text-sm text-slate-400 mt-4">
              We typically respond within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
