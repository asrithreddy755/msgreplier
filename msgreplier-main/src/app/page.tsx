import Link from "next/link";
import { ArrowRight, Repeat, Flame, BookOpen, Bot, CheckCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "MsgReplier - Free Text Repeater, Slang Dictionary & AI Reply Generator",
  description:
    "The ultimate messaging toolkit. distinct features include a Text Repeater for WhatsApp/Instagram, a Gen Z Slang Dictionary (Shortcutpedia), and an AI Reply Generator. No login required.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:py-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="container relative z-10 mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              🚀 The Ultimate Messaging Toolkit
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 max-w-4xl">
              Upgrade Your Chat Game Instantly
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From spamming friends with our <strong className="text-foreground">Text Repeater</strong> to decoding Gen Z slang with <strong className="text-foreground">Shortcutpedia</strong>, we have the tools you need.
            </p>
            <div className="flex flex-col sm:flex-row md:flex-row gap-4 w-full justify-center pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto">
                <Link href="/text-repeater">
                  Start Repeating Text <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto">
                <Link href="/flames">
                  Try FLAMES Calculator
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tool 1: Text Repeater */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Repeat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Text Repeater</CardTitle>
                <CardDescription>WhatsApp & Instagram Bomber</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Repeat text 10,000+ times instantly. Perfect for pranks, spamming (friends only!), or testing apps.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Link href="/text-repeater">Use Tool <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 2: FLAMES */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle>FLAMES Calculator</CardTitle>
                <CardDescription>Love Compatibility Test</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Check your relationship destiny with the famous childhood algorithm. Friendship, Love, or Enemy?
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  <Link href="/flames">Check Love <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 3: Shortcutpedia */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Shortcutpedia</CardTitle>
                <CardDescription>Slang Dictionary</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Decode Gen Z slang, chat abbreviations, and acronyms like "GYAT", "Rizz", and "IYKYK".
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-600 dark:group-hover:text-green-400">
                  <Link href="/shortcutpedia">Search Slang <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 4: Cham AI */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 opacity-80 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Cham AI</CardTitle>
                <CardDescription>Reply Generator</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Draft the perfect witty, professional, or flirty reply instantly using AI. (Coming Soon)
                </p>
              </CardContent>
              <CardFooter>
                <Button disabled variant="ghost" className="w-full">
                  Coming Soon
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
            <Link href="/blog" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full">
                <div className="p-6">
                  <div className="text-xs font-semibold text-primary mb-2">TIPS & TRICKS</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">How to Send a Blank Message</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    Learn the trick to send invisible text on WhatsApp and Instagram using our special character generator.
                  </p>
                </div>
              </div>
            </Link>
            
            <Link href="/blog" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full">
                <div className="p-6">
                  <div className="text-xs font-semibold text-primary mb-2">INTERNET CULTURE</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">Top 5 Gen Z Slang Terms (2026)</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    Confused by "Rizz" or "No Cap"? We decode the most popular internet slang you need to know this year.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full">
                <div className="p-6">
                  <div className="text-xs font-semibold text-primary mb-2">DATING & SOCIAL</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">The Art of the 'Dry Text'</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    How to reply to one-word answers like "K" and "Lol" without killing the conversation.
                  </p>
                </div>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Instant Productivity Tools</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Whether you need an Instagram caption helper or a quick way to spam text for fun, our tools load instantly and work on any device.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Safe and Private</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    We do not store your personal messages or data. All calculations for our Relationship tester and text generation happen locally or securely.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Always Free</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Access our entire suite of tools without paywalls. We are supported by ads, keeping the core experience free for everyone.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">AI Powered</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Leveraging the latest in AI to help you draft better replies and understand complex internet culture nuances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
