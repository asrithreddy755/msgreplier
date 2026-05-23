import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions - MsgReplier",
  description: "Terms and conditions for using MsgReplier services, including liability, governing law, dispute resolution, and user conduct.",
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
      <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2025</p>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Welcome to MsgReplier. By accessing or using our website and services — including
          features like <strong className="text-foreground">Love-Space</strong>,{" "}
          <strong className="text-foreground">Digital Greeting</strong>, FLAMES Calculator, Love
          Score, and our blog — you agree to be bound by these Terms and Conditions. If you do not
          agree to these terms, please do not use our service. You must be at least 13 years old
          to use this service.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Use of the Service</h2>
        <p>
          You agree to use MsgReplier only for lawful purposes and in a manner that does not
          infringe the rights of others or restrict their use and enjoyment of the service. You
          are responsible for all content you submit, create, or share through our platform.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Use the service for any illegal, harmful, or abusive purpose.</li>
          <li>Send hateful, threatening, harassing, or discriminatory content.</li>
          <li>Impersonate any person or entity or misrepresent your affiliation.</li>
          <li>Attempt to gain unauthorised access to any part of our systems.</li>
          <li>Use automated bots, scrapers, or crawlers without prior written permission.</li>
          <li>Upload or transmit viruses, malware, or any other malicious code.</li>
          <li>Interfere with or disrupt the integrity or performance of the service.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Love-Space Usage</h2>
        <p>
          When using the chat or game features within Love-Space, you agree not to engage in
          abusive, harassing, or illegal behaviour. While our rooms are private and encrypted, we
          expect all users to respect their partners and maintain a positive environment. We do not
          monitor private rooms, but we reserve the right to block access to the platform for users
          reported for malicious activity.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Digital Greeting Usage</h2>
        <p>
          When creating a Digital Greeting card, you are solely responsible for the content of
          your message. You agree not to send messages that are hateful, threatening, or otherwise
          illegal. You understand that the generated link is accessible to anyone who possesses it,
          so you should only share it with your intended recipient.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Intellectual Property</h2>
        <p>
          All content on this website — including text, graphics, logos, icons, images, audio
          clips, digital downloads, and software — is the property of MsgReplier or its content
          suppliers and is protected by applicable copyright and intellectual property laws. You may
          not reproduce, distribute, or create derivative works without our express written
          permission.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Disclaimer of Warranties</h2>
        <p>
          MsgReplier is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
          any warranties of any kind, either express or implied, including but not limited to
          implied warranties of merchantability, fitness for a particular purpose, or
          non-infringement. We do not warrant that the service will be uninterrupted, error-free,
          or completely secure.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, MsgReplier and its owners, employees,
          and affiliates shall not be liable for any indirect, incidental, special, consequential,
          or punitive damages arising out of or in connection with your use of — or inability to
          use — the service. This includes, without limitation, loss of data, loss of profits, or
          any other intangible losses, even if we have been advised of the possibility of such
          damages.
        </p>
        <p className="mt-2">
          Our total liability to you for any claims arising from your use of the service shall not
          exceed the amount you paid us in the twelve months preceding the claim, or INR 100,
          whichever is greater.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. Third-Party Links and Services</h2>
        <p>
          Our website may contain links to third-party websites or services. These links are
          provided for your convenience only. We have no control over the content of those sites
          and accept no responsibility for them or for any loss or damage that may arise from your
          use of them.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. Modifications to the Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue the service (or any part of it)
          at any time, with or without notice. We shall not be liable to you or any third party for
          any modification, suspension, or discontinuation of the service.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">10. Governing Law</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the laws of
          India, without regard to its conflict of law principles. You agree that any legal action
          or proceeding arising from your use of the service shall be brought exclusively in the
          courts located in Andhra Pradesh, India.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">11. Dispute Resolution</h2>
        <p>
          In the event of any dispute, claim, or controversy arising out of or relating to these
          Terms or your use of the service, we encourage you to first contact us at{" "}
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline">
            care.msgreplier@gmail.com
          </a>{" "}
          to seek an informal resolution. If a dispute cannot be resolved informally within 30
          days, it shall be finally settled by binding arbitration in accordance with the
          Arbitration and Conciliation Act, 1996 of India, with proceedings conducted in English.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">12. Changes to These Terms</h2>
        <p>
          We reserve the right to update or revise these Terms and Conditions at any time. We will
          notify users of material changes by updating the &quot;Last updated&quot; date at the
          top of this page. Your continued use of the service following the posting of any changes
          constitutes your acceptance of those changes.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">13. Contact Us</h2>
        <p>
          If you have any questions about these Terms and Conditions, please contact us at{" "}
          <a href="mailto:care.msgreplier@gmail.com" className="text-primary hover:underline">
            care.msgreplier@gmail.com
          </a>.
        </p>
      </div>
    </div>
  );
}
