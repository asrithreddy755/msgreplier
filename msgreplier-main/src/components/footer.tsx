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
              Crafting the ultimate messaging tools, including the private <strong>Love-Space</strong>, to enhance your digital communication with privacy, speed, and ease.
            </p>
          </div>

          {/* Collection/Features Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Features</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/love-space" className="hover:text-primary transition-colors">Love Space</Link>
              </li>
              <li>
                <Link href="/digital-greeting" className="hover:text-primary transition-colors">Wishes Website</Link>
              </li>
              <li>
                <Link href="/digital-greeting/create" className="hover:text-primary transition-colors">Create Wishes Website</Link>
              </li>
              <li>
                <Link href="/text-repeater" className="hover:text-primary transition-colors">Text Repeater</Link>
              </li>
              <li>
                <Link href="/flames" className="hover:text-primary transition-colors">FLAMES Calculator</Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Connect</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:care.msgreplier@gmail.com" className="hover:text-primary transition-colors">Email Support</a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/msgreplier?igsh=YWM1YnptbzNncXg4"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@msgreplier?si=J8Wg9x6tOFuQGP9-"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MsgReplier. Handcrafted with love.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
