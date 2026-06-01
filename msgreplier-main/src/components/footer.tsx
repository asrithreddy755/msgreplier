import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MsgReplier</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Crafting the ultimate digital tools for couples — including the private{" "}
              <strong>Love-Space</strong> and interactive <strong>Wishes Website</strong> builder.
            </p>
            <p className="text-xs text-muted-foreground">
              🇮🇳 Made with ❤️ in India
            </p>
          </div>

          {/* Features Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Our Tools</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/love-space" className="hover:text-primary transition-colors">
                  Love Space
                </Link>
              </li>
              <li>
                <Link href="/digital-greeting" className="hover:text-primary transition-colors">
                  Wishes Website
                </Link>
              </li>
              <li>
                <Link href="/flames" className="hover:text-primary transition-colors">
                  FLAMES Calculator
                </Link>
              </li>
              <li>
                <Link href="/prompt" className="hover:text-primary transition-colors">
                  AI Couple Prompts
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="hover:text-primary transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-primary transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Connect</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:care.msgreplier@gmail.com" className="hover:text-primary transition-colors">
                  📧 Email Support
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/msgreplier?igsh=YWM1YnptbzNncXg4"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  📷 Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@msgreplier?si=J8Wg9x6tOFuQGP9-"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  ▶️ YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MsgReplier. Handcrafted with love. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <Link href="/community-guidelines" className="hover:text-primary transition-colors">
              Community Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
