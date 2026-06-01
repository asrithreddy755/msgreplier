import Link from "next/link";
import { ArrowRight, Flame, CheckCircle, Shield, Zap, Heart, MessageSquareHeart, Gift, Camera, Users, Star, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "MsgReplier - Private Love Space, Wishes Website & AI Couple Tools",
  description:
    "The ultimate digital toolkit for couples. Create a private Love-Space chat room, build an interactive Wishes Website for birthdays and anniversaries, and use our free AI couple tools. No login required.",
  alternates: {
    canonical: "https://msgreplier.com",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MsgReplier",
    url: "https://msgreplier.com",
    description: "The ultimate digital toolkit for couples. Private Love-Space rooms, interactive Wishes Websites, FLAMES Calculator, and AI couple prompts. No login required.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://msgreplier.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "MsgReplier",
      url: "https://msgreplier.com",
      logo: "https://msgreplier.com/icon.png",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "care.msgreplier@gmail.com",
      },
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:py-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="container relative z-10 mx-auto">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              🚀 The Ultimate Place for Couples
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 max-w-[320px] sm:max-w-4xl mx-auto">
              Your private space to connect and play
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From connecting with your partner in <strong className="text-foreground">Love-Space</strong> to creating a magical <strong className="text-foreground">Wishes Website</strong>, we have the tools you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 border-0">
                <Link href="/love-space">
                  Start Your Private Love Space <Heart className="ml-2 h-4 w-4 fill-white" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                <Link href="/digital-greeting">
                  Build Wishes Website <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">Our Free Tools</h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">Everything you need to master messaging apps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Tool 0: Love Space (Promoted) */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-pink-200 dark:border-pink-900/50 w-full bg-gradient-to-br from-white to-pink-50/50 dark:from-slate-900 dark:to-pink-950/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/20">
                  <MessageSquareHeart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-pink-600 dark:text-pink-400">Love Space</CardTitle>
                <CardDescription>Private Rooms for Couples</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Create a 100% private, no-login space to chat and play games like Ludo and XOX with your partner.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="default" className="w-full bg-pink-500 hover:bg-pink-600 text-white border-0 shadow-md">
                  <Link href="/love-space">Enter Love Space <Heart className="ml-2 h-4 w-4 fill-white" /></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 2: Wishes Website */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gift className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Wishes Website</CardTitle>
                <CardDescription>Create Interactive Surprise</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Create a beautiful, interactive website for wishes for birthdays, anniversaries, or just because.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                >
                  <Link href="/digital-greeting">
                    Build Website <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 3: Msg Prompt */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Msg Prompt</CardTitle>
                <CardDescription>AI Prompts for Couples</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Generate beautiful couple pictures or photoshoot ideas using our curated AI image prompts.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-600 dark:group-hover:text-green-400">
                  <Link href="/prompt">Get Prompts <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 4: FLAMES */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle>FLAMES Calculator</CardTitle>
                <CardDescription>Love Compatibility Test</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Check your relationship destiny with the famous childhood algorithm. Friendship, Love, or Enemy?
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  <Link href="/flames">Check Love <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest from the Blog</h2>
            <Link href="/blog" className="text-primary font-medium hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/blog/love-space-guide" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full bg-rose-500/5 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
                <div className="p-5 sm:p-6">
                  <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">LOVE & CONNECTION</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Love-Space: The Ultimate Private Room for Couples</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    Discover how to create a 100% private, secure space for you and your partner. Chat, play games like Ludo and XOX, and stay connected with no login required.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog/create-website-for-wishes" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full bg-orange-50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30">
                <div className="p-5 sm:p-6">
                  <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2">FEATURE GUIDE</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">How to Create a Website for Wishes in Seconds</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    Learn how to build a custom, interactive digital greeting website for birthdays and anniversaries with 3D animations and music.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog/long-distance-relationship-guide" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full">
                <div className="p-5 sm:p-6">
                  <div className="text-xs font-semibold text-primary mb-2">RELATIONSHIPS</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">The Ultimate Guide to Long-Distance Relationships in 2026</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    Surviving a Long Distance Relationship is notoriously tough. But with the right mindset and the right digital tools, you can close the gap.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Trending Articles Badges / Links */}
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Trending on the Blog</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              <Link href="/blog/100-cute-nicknames" className="text-xs px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-950/30 text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-semibold">❤️ 100+ Cute Nicknames</Link>
              <Link href="/blog/psychology-of-crushes" className="text-xs px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/30 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-semibold">🧠 Crush Psychology</Link>
              <Link href="/blog/how-flames-works" className="text-xs px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-semibold">🔥 How FLAMES Works</Link>
              <Link href="/blog/perfect-couple-prompts" className="text-xs px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-950/30 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-semibold">📷 AI Couple Prompts</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get started in seconds. No accounts, no downloads, no complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-pink-600">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Choose Your Tool</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Pick from Love-Space, Wishes Website, FLAMES Calculator, or AI Prompts — all free, all instant.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-purple-600">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Enter Your Details</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Just your nickname for Love-Space, or a recipient name and message for a Wishes Website. No account needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-rose-600">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Share & Connect</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Send the unique link to your partner or loved one and experience the magic together, in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Why Couples Trust MsgReplier</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              We are built on transparency, simplicity, and a genuine care for your privacy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">Zero Login Required</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Use any feature without creating an account or sharing an email address.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-bold mb-2">Private By Design</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Love-Space rooms auto-delete after 24 hours. We never read your messages.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Instant & Fast</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">No downloads or setup. Every tool is browser-based and loads in seconds.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="text-3xl mb-3">💸</div>
              <h3 className="font-bold mb-2">Always Free</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Every tool is 100% free. Supported by non-intrusive ads, never by selling your data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Quick answers to the questions we hear most often.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-left">Is MsgReplier completely free?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes! Every tool on MsgReplier — including Love-Space, Wishes Website, FLAMES Calculator, and AI Prompts — is completely free. We are supported by non-intrusive advertisements that keep the platform free for everyone, with no subscriptions or paywalls.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-left">Do I need to create an account?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                No account needed at all. You can use every feature on MsgReplier without registering, providing an email, or entering any personal information. Just open the tool and start using it immediately.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-left">How private is Love-Space?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Love-Space is designed with privacy as the top priority. Each room is accessed via a unique link that only you and your partner have. Rooms and all their data are automatically deleted after 24 hours. We do not read, monitor, or store your private conversations permanently.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger className="text-left">What is a Wishes Website?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                A Wishes Website is a personalised, interactive digital greeting page you create for someone special. Add a recipient name, occasion (birthday, anniversary, etc.), a heartfelt message, music, and a theme — then share the unique link with your loved one. It is much more immersive than a regular greeting card or text message.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-5">
              <AccordionTrigger className="text-left">Does MsgReplier sell my data?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Absolutely not. We do not sell, rent, or trade any personal data to third parties. We use Google Analytics for anonymous traffic insights and Google AdSense for advertising. Both are governed by Google&apos;s privacy policy. For full details, see our{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="mt-8 text-center">
            <Link href="/faq" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              View all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content / Why Use MsgReplier */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Use MsgReplier?</h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                We build simple, privacy-focused productivity tools for your daily digital life.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-2">Instant Digital Surprises</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Whether you need a custom digital greeting card or a private space to connect, our tools load instantly and work smoothly on any device.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-2">Safe and Private</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    We do not store your personal messages or data. All calculations for our compatibility tester and text generation happen locally or securely.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-2">Always Free</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Access our entire suite of tools without paywalls. We are supported by ads, keeping the core experience free for everyone.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-2">Private Love-Space</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Create a secure, temporary room to chat and play games with your partner. Our Love-Space offers 100% privacy with no login required and automatic data deletion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
