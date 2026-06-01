import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy - MsgReplier",
  description: "Learn how MsgReplier uses cookies, what types of cookies we set, and how you can control or disable them on our website.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
      <Link href="/" className="inline-flex mb-8">
        <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2025</p>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          This Cookie Policy explains what cookies are, how MsgReplier (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses them on{" "}
          <strong className="text-foreground">msgreplier.com</strong>, and what choices you have regarding cookies. Please read this
          policy alongside our{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          for full context on how we handle your data.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">What Are Cookies?</h2>
        <p>
          Cookies are small text files that are stored on your browser or device when you visit a website. They allow the
          website to remember your preferences, understand how you use the site, and provide you with a personalised
          experience. Cookies can be &quot;session cookies&quot; (deleted when you close your browser) or &quot;persistent
          cookies&quot; (which remain on your device for a set period or until you delete them).
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Types of Cookies We Use</h2>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">1. Strictly Necessary Cookies</h3>
        <p>
          These cookies are essential for our website to function properly and cannot be switched off. They are usually
          set only in response to actions you take, such as your cookie consent preference.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-foreground">Cookie Consent:</strong> We store your cookie preference (accepted or
            declined) in your browser&apos;s local storage so we do not display the banner on every visit.
          </li>
          <li>
            <strong className="text-foreground">Theme Preference:</strong> We remember your light or dark mode preference
            so your chosen theme persists across visits.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">2. Analytics Cookies (Optional)</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting and reporting information
          anonymously. We only set these cookies after you give your explicit consent.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-foreground">Google Analytics:</strong> We use Google Analytics 4 to measure traffic
            patterns, page popularity, and general user behaviour. Data is aggregated and cannot identify individual
            users. Cookies set include <code className="text-xs bg-muted px-1 py-0.5 rounded">_ga</code>,{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">_ga_*</code> (persistent, 2 years).
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">3. Advertising Cookies (Optional)</h3>
        <p>
          We display advertisements through <strong className="text-foreground">Google AdSense</strong>. Google AdSense
          uses cookies to show you more relevant ads based on your browsing history across websites. We only enable
          advertising cookies after you explicitly consent via our cookie banner.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            Google uses the <code className="text-xs bg-muted px-1 py-0.5 rounded">IDE</code> cookie (set by
            doubleclick.net) and similar cookies for interest-based advertising.
          </li>
          <li>
            You can opt out of personalised advertising by visiting{" "}
            <a
              href="https://myadcenter.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google My Ad Center
            </a>{" "}
            or by turning off ad personalisation in your Google Account settings.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Local Storage</h2>
        <p>
          In addition to cookies, we use browser <strong className="text-foreground">local storage</strong> to save
          certain session data (such as your Love-Space room session and your preferences). Local storage is not a
          cookie — it does not expire automatically and is not sent to our servers — but it serves a similar purpose of
          remembering your state between visits.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">How to Control Cookies</h2>
        <p>You have several options for managing cookies:</p>
        <ul className="list-disc pl-6 space-y-3 mt-3">
          <li>
            <strong className="text-foreground">Our Cookie Banner:</strong> When you first visit our site, you can accept
            or decline optional (analytics and advertising) cookies. Your choice is stored and respected on subsequent
            visits.
          </li>
          <li>
            <strong className="text-foreground">Browser Settings:</strong> Most browsers allow you to refuse or delete
            cookies through their settings. Please note that disabling all cookies may affect the functionality of our
            website.
          </li>
          <li>
            <strong className="text-foreground">Google Analytics Opt-Out:</strong> Install the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>{" "}
            to prevent Google Analytics from collecting your data.
          </li>
          <li>
            <strong className="text-foreground">Ad Settings:</strong> Visit{" "}
            <a
              href="https://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              aboutads.info
            </a>{" "}
            or{" "}
            <a
              href="https://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              networkadvertising.org
            </a>{" "}
            to opt out of interest-based advertising from participating companies.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Third-Party Cookies</h2>
        <p>
          Some cookies on our site are set by third-party services (such as Google Analytics and Google AdSense). We do
          not control these third-party cookies; they are governed by the privacy policies of the respective third
          parties. We encourage you to review{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google&apos;s Privacy Policy
          </a>{" "}
          for more information.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Changes to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in technology or our practices. We will
          update the &quot;Last updated&quot; date at the top of this page when we do so.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at{" "}
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline">
            care.msgreplier@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
