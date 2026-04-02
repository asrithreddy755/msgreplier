import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export const metadata: Metadata = {
  title: "Terms and Conditions - MsgReplier",
  description: "Terms and conditions for using MsgReplier services.",
};

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
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
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>Welcome to MsgReplier. By using our service, including features like <strong>Love-Space</strong>, <strong>Digital Greeting</strong>, the Text Repeater, and Shortcutpedia, you agree to these terms. You must be at least 13 years old to use this service.</p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-2">Usage</h2>
        <p>You agree not to use the service for any illegal or unauthorized purpose. You are responsible for your conduct and any data, text, information, and links that you submit.</p>
        
        <p className="mt-2 text-foreground/90"><strong>Love-Space Usage:</strong> When using the chat or game features within Love-Space, you agree not to engage in abusive, harassing, or illegal behavior. While our rooms are private and encrypted, we expect all users to respect their partners and maintain a positive environment. We do not monitor private rooms, but reserve the right to block access to the platform for users reported for malicious activity.</p>

        <p className="mt-2 text-foreground/90"><strong>Digital Greeting Usage:</strong> When creating a Digital Greeting card, you are solely responsible for the content of your message. You agree not to send messages that are hateful, threatening, or otherwise violate any laws. You understand that the generated link is public to anyone who possesses it.</p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-2">Modifications</h2>
        <p>We reserve the right to modify or terminate the service for any reason, without notice, at any time. We also reserve the right to refuse service to anyone for any reason at any time.</p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-2">Intellectual Property</h2>
        <p>All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of MsgReplier or its content suppliers and protected by international copyright laws.</p>
      </div>
    </div>
  );
}
