import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - MsgReplier",
  description: "MsgReplier's privacy policy. Learn how we collect, use, and protect your data, your GDPR rights, and how we use Google Analytics and AdSense.",
  alternates: {
    canonical: "/privacy-policy",
  },
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
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2025</p>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Your privacy is important to us. This policy explains what information MsgReplier collects,
          how we use it, and the rights you have regarding your personal data.
        </p>

        <div className="p-4 bg-muted/50 rounded-lg border border-border/50 my-6">
          <p className="font-medium text-foreground mb-4">
            Most of our website tools (including our Love Score calculator and Msg Prompts) do not
            require any login, and we do not save, store, or collect any of your data from these
            tools. All processing is done entirely in your browser.
          </p>
          <p className="font-medium text-foreground mb-4">
            <strong>Exception — Love-Space Feature:</strong> To provide real-time chat and game
            synchronization in Love-Space, we use secure WebRTC connections. Message history is
            temporarily stored in your browser&apos;s local storage and optionally persisted to our
            secure database to allow for session recovery. This data is private to your specific
            room, encrypted, and automatically deleted after periods of inactivity.
          </p>
          <p className="font-medium text-foreground">
            <strong>Exception — Digital Greeting Feature:</strong> When you create a Digital
            Greeting card, we store the recipient&apos;s name, your name, your chosen occasion, and
            your message in our secure database. This is necessary to generate a unique shareable
            link for your recipient. This data is not used for any other purpose and is stored until
            you request its deletion or the system performs a scheduled cleanup.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Google Analytics</h2>
        <p>
          We use Google Analytics to understand how visitors interact with our website. Google
          Analytics collects data such as pages visited, time spent on site, browser type, and
          approximate geographic location (country/region level). This data is aggregated and
          anonymous — we cannot identify individual users from it.
        </p>
        <p className="mt-2">
          Google may transfer and process this data on servers outside your country. Google&apos;s
          data practices are governed by the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Google Privacy Policy
          </a>. You can opt out of Google Analytics tracking at any time using the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Google AdSense and Advertising Cookies</h2>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            We display advertisements on our site through Google AdSense. Google AdSense uses
            cookies to serve ads based on a user&apos;s prior visits to our website or other websites.
          </li>
          <li>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads to
            you based on your visits to our site and other sites on the internet.
          </li>
          <li>
            AdSense cookies are only set after you give explicit consent via our cookie banner.
            If you decline cookies, no advertising cookies will be set.
          </li>
          <li>
            You may opt out of personalised advertising by visiting{" "}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google My Ad Center
            </a>. You can also opt out via{" "}
            <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              aboutads.info
            </a>.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Cookies and Your Consent</h2>
        <p>
          When you first visit MsgReplier, we display a cookie consent banner. If you click
          &quot;Accept,&quot; we store your preference in your browser&apos;s local storage and
          activate analytics and advertising cookies. If you click &quot;Decline&quot; or close the
          banner, no non-essential cookies are set and no advertising data is collected.
        </p>
        <p className="mt-2">
          You can change your preference at any time by clearing your browser&apos;s local storage
          or using your browser&apos;s built-in cookie controls.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Data Retention</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-foreground">Server logs</strong> — access logs are retained for up to 90 days for security and debugging purposes, then automatically deleted.</li>
          <li><strong className="text-foreground">Love-Space chat data</strong> — encrypted message history stored in our database is automatically purged after 30 days of inactivity.</li>
          <li><strong className="text-foreground">Digital Greeting data</strong> — greeting card content is retained for 12 months or until you request deletion, whichever comes first.</li>
          <li><strong className="text-foreground">Analytics data</strong> — Google Analytics data is retained for 14 months per our Google Analytics property settings.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">International Data Transfers</h2>
        <p>
          MsgReplier is operated from India. Some of our service providers (including Google) may
          process your data in countries outside the European Economic Area (EEA). Where this
          occurs, we rely on Google&apos;s Standard Contractual Clauses and other appropriate
          safeguards to ensure your data is protected to a standard equivalent to EEA requirements.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Your Rights Under GDPR</h2>
        <p>If you are located in the European Economic Area (EEA), you have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong className="text-foreground">Right to Access</strong> — You have the right to request a copy of the personal data we hold about you.</li>
          <li><strong className="text-foreground">Right to Rectification</strong> — You can ask us to correct any inaccurate or incomplete data we hold.</li>
          <li><strong className="text-foreground">Right to Erasure</strong> — You can request that we delete your personal data, subject to certain legal exceptions.</li>
          <li><strong className="text-foreground">Right to Restrict Processing</strong> — You can ask us to limit how we use your data in certain circumstances.</li>
          <li><strong className="text-foreground">Right to Data Portability</strong> — You can request a machine-readable copy of your data to transfer to another service.</li>
          <li><strong className="text-foreground">Right to Object</strong> — You can object to our processing of your data for direct marketing or other legitimate interests.</li>
          <li><strong className="text-foreground">Right to Withdraw Consent</strong> — Where processing is based on your consent, you can withdraw it at any time without affecting the lawfulness of prior processing.</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline">care.msgreplier@gmail.com</a>.
          We will respond within 30 days.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Third-Party Links</h2>
        <p>
          Our website may link to external sites that are not operated by us. We have no control
          over the content and practices of these sites and cannot accept responsibility for their
          respective privacy policies.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Children&apos;s Privacy</h2>
        <p>
          Our service is not directed at children under the age of 13. We do not knowingly collect
          personal information from children. If you believe a child has provided us with personal
          data, please contact us and we will delete it promptly.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify users of significant
          changes by updating the &quot;Last updated&quot; date at the top of this page. Your
          continued use of the site after changes constitutes acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or how we handle your data, contact us at{" "}
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline">care.msgreplier@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
