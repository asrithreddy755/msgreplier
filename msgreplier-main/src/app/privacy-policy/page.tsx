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
  const fromLoveScore = resolvedSearchParams?.from === "love-score";
  const backHref = fromLoveScore ? "/love-score" : "/";
  const backText = fromLoveScore ? "Back to Love Score" : "Back to Home";

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
            Most of our website (including Msg Prompt, Text Repeater, and Shortcutpedia) does not require any login, and we do not save, store, or collect any of your data from these tools.
            All processing is done entirely in your browser.
          </p>
          <p className="font-medium text-foreground">
            <strong>Exception for the Love Score Feature:</strong> To allow the Love Score quiz feature to function, we temporarily and securely store the quiz originator's name, the intended receiver's name, the custom questions created, and the final percentage score. This information is only accessible via the secret link generated and is never sold or shared with any third parties.
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
