"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MessageSquare, ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Hide Navbar on specific immersive pages
  const isGreetingPage = pathname?.includes("/greet/");
  const isWishesDashboard = pathname?.includes("/wishes/dashboard");
  const hideNavbar = isGreetingPage;

  if (hideNavbar) return null;

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b border-[#d4c3ab] bg-[#f5eedf]/95 backdrop-blur dark:bg-slate-950/95 dark:border-slate-800 text-[#110f0f] dark:text-white ${isWishesDashboard ? 'hidden md:block' : ''}`}
      style={{ fontFamily: '"Work Sans", sans-serif' }}
    >
      {/* Style block for local font overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-heading {
          font-family: 'Unbounded', sans-serif !important;
        }
      `}} />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between md:grid md:grid-cols-3">
        
        {/* Desktop Left-aligned Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium justify-start">
          <Link href="/" className="transition-colors hover:text-[#948678] text-[#110f0f] dark:text-slate-300 dark:hover:text-white">
            Home
          </Link>
          <Link 
            href="/love-space" 
            target="_blank"
            className="flex items-center gap-1 bg-[#eedfc6] dark:bg-slate-800 px-3 py-1.5 rounded-full border border-[#d4c3ab] dark:border-slate-700 text-[#110f0f] dark:text-white hover:bg-[#110f0f] hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-semibold"
          >
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> Love Space
          </Link>
          <Link href="/digital-greeting" className="transition-colors hover:text-[#948678] text-[#110f0f] dark:text-slate-300 dark:hover:text-white">
            Wishes Website
          </Link>
        </nav>

        {/* Desktop/Mobile Center-aligned Logo */}
        <div className="flex md:justify-center items-center">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg md:text-xl tracking-tight text-[#110f0f] dark:text-white select-none">
            <div className="bg-[#110f0f] text-white dark:bg-white dark:text-black p-1.5 rounded-lg">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <span>MsgReplier</span>
          </Link>
        </div>

        {/* Desktop Right-aligned Links & CTAs */}
        <div className="hidden md:flex items-center gap-4 justify-end text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-[#948678] text-[#110f0f] dark:text-slate-300 dark:hover:text-white focus:outline-none select-none">
              Tools <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#f5eedf] border-[#d4c3ab] dark:bg-slate-900 dark:border-slate-800 text-[#110f0f] dark:text-white">
              <DropdownMenuItem asChild className="hover:bg-[#eedfc6] dark:hover:bg-slate-800 cursor-pointer">
                <Link href="/digital-greeting" className="w-full">Wishes Website</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-[#eedfc6] dark:hover:bg-slate-800 cursor-pointer">
                <Link href="/flames" className="w-full">FLAMES Calculator</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-[#eedfc6] dark:hover:bg-slate-800 cursor-pointer">
                <Link href="/prompt" className="w-full">Msg Prompt</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/digital-greeting/pricing" className="transition-colors hover:text-[#948678] text-[#110f0f] dark:text-slate-300 dark:hover:text-white font-semibold">
            Pricing
          </Link>
          <Link href="/about" className="transition-colors hover:text-[#948678] text-[#110f0f] dark:text-slate-300 dark:hover:text-white">
            About
          </Link>
          <Link href="/contact" className="transition-colors hover:text-[#948678] text-[#110f0f] dark:text-slate-300 dark:hover:text-white">
            Contact
          </Link>
          
          <div className="flex items-center gap-2 ml-2">
            <Link 
              href="/love-space"
              target="_blank"
              className="font-heading font-medium text-xs bg-[#110f0f] text-white hover:bg-[#eedfc6] hover:text-[#110f0f] border border-transparent hover:border-[#d4c3ab] dark:bg-white dark:text-black dark:hover:bg-[#110f0f] dark:hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 uppercase tracking-wider"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle on Right */}
        <div className="flex items-center gap-2 md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            aria-label="Toggle Menu"
            className="text-[#110f0f] dark:text-white hover:bg-[#eedfc6]/50"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-[#d4c3ab] bg-[#f5eedf] dark:bg-slate-900 dark:border-slate-800">
          <div className="container flex flex-col gap-4 p-4 text-[#110f0f] dark:text-white">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[#948678]"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/love-space"
              target="_blank"
              className="text-sm font-medium text-rose-600 dark:text-rose-400 transition-colors hover:underline flex items-center gap-1.5"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="h-4 w-4 fill-current" /> Love Space
            </Link>
            <Link
              href="/digital-greeting"
              className="text-sm font-medium transition-colors hover:text-[#948678]"
              onClick={() => setIsOpen(false)}
            >
              Wishes Website
            </Link>
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-[#d4c3ab]">
              <span className="text-xs font-bold text-[#948678] uppercase tracking-wider">Tools</span>
              <Link
                href="/digital-greeting"
                className="text-sm font-medium transition-colors hover:text-[#948678]"
                onClick={() => setIsOpen(false)}
              >
                Wishes Website
              </Link>
              <Link
                href="/flames"
                className="text-sm font-medium transition-colors hover:text-[#948678]"
                onClick={() => setIsOpen(false)}
              >
                FLAMES Calculator
              </Link>
              <Link
                href="/prompt"
                className="text-sm font-medium transition-colors hover:text-[#948678]"
                onClick={() => setIsOpen(false)}
              >
                Msg Prompt
              </Link>
            </div>
            <Link
              href="/digital-greeting/pricing"
              className="text-sm font-semibold transition-colors hover:text-[#948678]"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-[#948678]"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-[#948678]"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/love-space"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="font-heading font-medium text-xs bg-[#110f0f] text-white text-center py-3 rounded-full uppercase tracking-wider block"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
