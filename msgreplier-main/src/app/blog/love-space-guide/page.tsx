import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, Clock, Heart, Check, Shield, Zap, MessageSquare, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Love-Space: The Ultimate Guide to Private Connection | MsgReplier",
    description: "Discover how to create a 100% private, secure space for you and your partner. Learn about real-time chat, interactive games, and privacy-first features in Love-Space.",
};

export default function LoveSpaceGuidePost() {
    return (
        <div className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `\n        h1, h2, h3, h4, h5, h6, .font-heading {\n          font-family: \'Unbounded\', sans-serif !important;\n        }\n      `}} />
            <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="mb-8 flex items-center justify-between gap-3">
                    <Link href="/blog" className="inline-flex">
                        <Button variant="ghost" className="gap-2 -ml-4 text-[#110f0f] hover:text-[#948678] hover:bg-transparent font-heading font-medium text-xs uppercase tracking-wider">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                    <Link href="/love-space" className="hidden sm:inline-flex">
                        <Button variant="default" className="gap-2 bg-pink-600 hover:bg-pink-700 text-white">
                            Enter Love-Space
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <header className="mb-10 md:mb-12">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 rounded-full font-medium text-xs">
                            <Tag className="h-3 w-3" /> Love & Connection
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> March 19, 2026
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 6 min read
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        Love-Space: The Ultimate <span className="text-pink-600">Private Room</span> for Couples
                    </h1>

                    <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                        In a world of constant notifications and public social feeds, finding a quiet, private corner for just you and your partner can be a challenge. Enter <strong>Love-Space</strong>.
                    </p>
                </header>

                <article className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm">
                    <div className="bg-white border border-[#d4c3ab] rounded-[32px] p-8 md:p-10 shadow-sm prose prose-neutral max-w-none">

                        <div className="flex items-center justify-center py-6 mb-8 mt-4 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-100 dark:border-pink-900/50">
                            <Heart className="w-16 h-16 text-pink-500 animate-pulse fill-pink-500" />
                        </div>

                        <p className="text-lg">
                            <strong>Love-Space</strong> isn't just another chat app. It's a dedicated, 100% private digital sanctuary where couples can connect, play, and share moments without any outside noise. Whether you're in a long-distance relationship or just want a special place for your daily chats, Love-Space is designed for you.
                        </p>

                        <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                            <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Zero-Login Privacy
                        </h2>
                        <p>
                            We believe privacy should be simple. That's why Love-Space requires <strong>no accounts, no emails, and no phone numbers</strong>.
                        </p>
                        <ul className="space-y-4 list-none pl-0 mt-4">
                            <li className="flex items-start gap-3">
                                <Shield className="w-6 h-6 text-pink-500 shrink-0 mt-1" />
                                <div>
                                    <strong>Instant Rooms:</strong> Just enter your nickname and create a room. You'll get a unique link to share with your partner.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Zap className="w-6 h-6 text-pink-500 shrink-0 mt-1" />
                                <div>
                                    <strong>Real-Time Sync:</strong> Our Supabase Realtime-powered technology ensures that every message and game move is synchronized instantly between you and your partner.
                                </div>
                            </li>
                        </ul>

                        <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                            <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            More Than Just Chat
                        </h2>
                        <p>
                            Communication is about more than just words. That's why we've integrated fun, interactive games directly into your private room.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                            <Card className="border-pink-100 dark:border-pink-900/30">
                                <CardContent className="p-4 text-center">
                                    <MessageSquare className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                                    <h4 className="font-bold text-sm">Private Chat</h4>
                                    <p className="text-xs text-muted-foreground">Encrypted real-time messaging.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-pink-100 dark:border-pink-900/30">
                                <CardContent className="p-4 text-center">
                                    <Gamepad2 className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                                    <h4 className="font-bold text-sm">Ludo & XOX</h4>
                                    <p className="text-xs text-muted-foreground">Classic games to play together.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-pink-100 dark:border-pink-900/30">
                                <CardContent className="p-4 text-center">
                                    <Zap className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                                    <h4 className="font-bold text-sm">Live Status</h4>
                                    <p className="text-xs text-muted-foreground">See when your partner is active.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                            <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            Why Use Love-Space?
                        </h2>
                        <p>
                            Whether you're miles apart or sitting on the same couch, Love-Space offers a unique way to bond:
                        </p>
                        <ul className="space-y-3 list-none pl-0 mt-4">
                            <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span><strong>Long-Distance Connection:</strong> Stay connected throughout the day with a space that feels like yours.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span><strong>Secure Conversations:</strong> Discuss private matters without worrying about data being stored on permanent servers.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span><strong>Fun & Games:</strong> Break the ice or just pass the time with built-in mini-games.</span>
                            </li>
                        </ul>

                        <hr className="my-10 border-border/50" />

                        <div className="text-center pb-4">
                            <h3 className="text-2xl font-bold mb-4">Ready to build your private world?</h3>
                            <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg transition-transform hover:scale-105 px-8 py-6 text-lg h-14">
                                <Link href="/love-space">
                                    <Heart className="w-5 h-5 mr-2 animate-bounce fill-white" />
                                    Enter Love-Space Now
                                </Link>
                            </Button>
                        </div>

                    </div>
                </article>
            </div>
        </div>
    );
}
