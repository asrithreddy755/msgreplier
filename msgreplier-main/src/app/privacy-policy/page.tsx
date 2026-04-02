import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export const metadata: Metadata = {
  title: "Privacy Policy - MsgReplier",
  description: "MsgReplier's privacy policy. Learn how we protect your data.",
};

export default async function PrivacyPolicyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const fromLoveSpace = resolvedSearchParams?.from === "love-space";
  const backHref = fromLoveSpace ? "/love-space" : "/";
  const backText = fromLoveSpace ? "Back to Love Space" : "Back to Home";

  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
      <Link href={backHref} className="inline-flex mb-8">
        <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {backText}
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>Your privacy is important to us. It is MsgReplier&apos;s policy to respect your privacy regarding any information we may collect from you across our website.</p>

        <div className="p-4 bg-muted/50 rounded-lg border border-border/50 my-6">
          <p className="font-medium text-foreground mb-4">
            Most of our website (including Text Repeater and Shortcutpedia) does not require any login, and we do not save, store, or collect any of your data from these tools.
            All processing is done entirely in your browser.
          </p>
          <p className="font-medium text-foreground mb-4">
            <strong>Exception for the Love-Space Feature:</strong> To provide real-time chat and game synchronization in Love-Space, we use secure WebRTC connections. Message history is temporarily stored in your browser's local storage and optionally persisted to our secure database to allow for session recovery. This data is private to your specific room, encrypted, and automatically deleted after periods of inactivity.
          </p>
          <p className="font-medium text-foreground">
            <strong>Exception for the Digital Greeting Feature:</strong> When you create a Digital Greeting card, we store the recipient's name, your name, your chosen occasion, and your message in our secure database. This is necessary to generate a unique shareable link for your recipient. This data is not used for any other purpose and is stored until you request its deletion or the system performs a scheduled cleanup.
          </p>
        </div>

        <p>We don&apos;t share any personally identifying information publicly or with third-parties, simply because we don&apos;t collect it in the first place.</p>

        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>

        <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>

        <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</p>

        <p>Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.</p>
      </div>
    </div>
  );
}
