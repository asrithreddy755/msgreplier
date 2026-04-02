import Link from "next/link";
import { ArrowRight, HeartPulse, Flame, BookOpen, Camera, CheckCircle, Shield, Zap, Heart, MessageSquareHeart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "MsgReplier - Private Love Space, Slang Dictionary & AI Messaging Tools",
  description:
    "The ultimate messaging toolkit. Create a private Love-Space for couples, decode Gen Z slang with Shortcutpedia, and use our AI messaging tools. No login required.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:py-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="container relative z-10 mx-auto">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              🚀 The Ultimate Messaging Toolkit
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 max-w-[320px] sm:max-w-4xl mx-auto">
              Upgrade Your Chat Game Instantly
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From connecting with your partner in <strong className="text-foreground">Love-Space</strong> to decoding Gen Z slang with <strong className="text-foreground">Shortcutpedia</strong>, we have the tools you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 border-0">
                <Link href="/love-space">
                  Start Your Private Love Space <Heart className="ml-2 h-4 w-4 fill-white" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto">
                <Link href="/flames">
                  Try FLAMES Calculator <ArrowRight className="ml-2 h-4 w-4" />
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

            {/* Tool 2: Shortcutpedia */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Shortcutpedia</CardTitle>
                <CardDescription>Slang Dictionary</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Decode Gen Z slang, chat abbreviations, and acronyms like &quot;GYAT&quot;, &quot;Rizz&quot;, and &quot;IYKYK&quot;.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-600 dark:group-hover:text-green-400">
                  <Link href="/shortcutpedia">Search Slang <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Tool 3: FLAMES */}
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

            {/* Tool 5: Digital Greeting */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 w-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gift className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Digital Greeting</CardTitle>
                <CardDescription>Surprise Greeting Cards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Create a beautiful, animated digital greeting card for birthdays, anniversaries, or just because.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                >
                  <Link href="/digital-greeting">
                    Create Card <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                <div className="p-5 sm:p-6">
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
                <div className="p-5 sm:p-6">
                  <div className="text-xs font-semibold text-primary mb-2">INTERNET CULTURE</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">Top 5 Gen Z Slang Terms (2026)</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    Confused by &quot;Rizz&quot; or &quot;No Cap&quot;? We decode the most popular internet slang you need to know this year.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog" className="group block w-full">
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all h-full">
                <div className="p-5 sm:p-6">
                  <div className="text-xs font-semibold text-primary mb-2">DATING & SOCIAL</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">The Art of the &apos;Dry Text&apos;</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                    How to reply to one-word answers like &quot;K&quot; and &quot;Lol&quot; without killing the conversation.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-lg h-fit flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-2">Instant Productivity Tools</h3>
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
                  <h3 className="font-bold text-lg md:text-xl mb-2">Safe and Private</h3>
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
      <Footer />
    </div>
  );
}
