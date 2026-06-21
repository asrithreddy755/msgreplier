import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer 
      className="bg-[#110f0f] border-t border-[#d4c3ab]/10 text-white py-16 px-4"
      style={{ fontFamily: '"Work Sans", sans-serif' }}
    >
      {/* Style block for local font overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-heading {
          font-family: 'Unbounded', sans-serif !important;
        }
      `}} />

      <div className="container mx-auto max-w-6xl">
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 items-start">
          
          {/* Brand Column (Left Block in Webflow) */}
          <div className="space-y-6 flex flex-col items-start text-left">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg md:text-xl tracking-tight text-white select-none">
              <div className="bg-white text-black p-1.5 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span>MsgReplier</span>
            </Link>
            
            <p className="text-sm text-[#d4c3ab]/80 leading-relaxed max-w-xs">
              Crafting the ultimate digital tools for couples — including the private <strong>Love-Space</strong> and interactive <strong>Wishes Website</strong> builder.
            </p>
            
            <p className="text-xs text-[#d4c3ab]/60">
              Made with ❤️ in India
            </p>

            <Link 
              href="/love-space"
              className="font-heading font-medium text-xs bg-white text-black hover:bg-[#eedfc6] px-5 py-3 rounded-full transition-all duration-300 uppercase tracking-wider block"
            >
              Get Started
            </Link>
          </div>

          {/* Column 2: Our Tools */}
          <div className="space-y-4 text-left">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#eedfc6] mb-6">
              Our Tools
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/love-space" className="text-slate-300 hover:text-white transition-colors">
                  Love Space
                </Link>
              </li>
              <li>
                <Link href="/digital-greeting" className="text-slate-300 hover:text-white transition-colors">
                  Wishes Website
                </Link>
              </li>
              <li>
                <Link href="/flames" className="text-slate-300 hover:text-white transition-colors">
                  FLAMES Calculator
                </Link>
              </li>
              <li>
                <Link href="/prompt" className="text-slate-300 hover:text-white transition-colors">
                  AI Couple Prompts
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
                  Blog & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4 text-left">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#eedfc6] mb-6">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-slate-300 hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-slate-300 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Socials / Connect */}
          <div className="space-y-4 text-left">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#eedfc6] mb-6">
              Connect
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:care.msgreplier@gmail.com" className="text-slate-300 hover:text-white transition-colors">
                  📧 Email Support
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/msgreplier?igsh=YWM1YnptbzNncXg4"
                  className="text-slate-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  📷 Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@msgreplier?si=J8Wg9x6tOFuQGP9-"
                  className="text-slate-300 hover:text-white transition-colors"
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
        <div className="pt-8 border-t border-[#d4c3ab]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MsgReplier. Handcrafted with love. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="/community-guidelines" className="hover:text-white transition-colors">
              Community Guidelines
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
