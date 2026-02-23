import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, Clock, HeartPulse, Check, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "The Ultimate Guide to the Love Score Quiz",
    description: "Discover how to test your partner's knowledge under pressure with the Love Score Quiz. Learn how the timer, questions, and sharing mechanics work.",
};

export default function LoveScoreGuidePost() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="mb-8 flex items-center justify-between gap-3">
                    <Link href="/blog" className="inline-flex">
                        <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                    <Link href="/love-score" className="hidden sm:inline-flex">
                        <Button variant="default" className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
                            Create a Quiz
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <header className="mb-10 md:mb-12">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-medium text-xs">
                            <Tag className="h-3 w-3" /> Love & Fun
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> February 24, 2026
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 5 min read
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        The Ultimate Guide to the <span className="text-rose-600">Love Score Quiz</span>
                    </h1>

                    <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                        Want to know if your partner was actually listening when you told them your favorite movie? It's time to put them to the test. Here is a complete guide on how to use the Love Score feature.
                    </p>
                </header>

                <article className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm backdrop-blur">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">

                        <div className="flex items-center justify-center py-6 mb-8 mt-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50">
                            <HeartPulse className="w-16 h-16 text-rose-500 animate-pulse" />
                        </div>

                        <p className="text-lg">
                            Dating apps tell you if you are a match, but the <strong>Love Score Quiz</strong> tells you if they are paying attention. The Love Score is a high-pressure, timer-based trivia game where you build questions about yourself, and your partner has to answer them before the clock runs out.
                        </p>

                        <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            How to Create a Trap... Er, Quiz
                        </h2>
                        <p>
                            Creating the quiz is the easiest part. The hard part is coming up with questions that aren't *too* evil.
                        </p>
                        <ol className="space-y-4 list-decimal pl-6 mt-4">
                            <li>
                                <strong>Set the Stage:</strong> Enter your name and your partner's name. This personalizes the welcome screen so they know exactly who is challenging them.
                            </li>
                            <li>
                                <strong>The Pressure Cooker:</strong> Choose a time limit. You can select 1 minute, 2 minutes, or set a completely custom time. Remember, the timer doesn't stop! If they run out of time, whatever questions they haven't answered are marked wrong.
                            </li>
                            <li>
                                <strong>Draft Your Questions:</strong> Add as many questions as you want. Write the question text, provide up to four options, and critically, <strong>click the circle</strong> next to the correct answer.
                            </li>
                        </ol>

                        <Card className="my-8 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                            <CardContent className="p-4 flex items-start gap-3">
                                <MousePointerClick className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-400 m-0 text-base">Pro Tip: Use the Presets!</h4>
                                    <p className="text-sm text-amber-700/80 dark:text-amber-500/80 m-0 mt-1">
                                        Having writer's block? Click the "Presets" magic wand icon to instantly load 5 random, fun questions like "Where did we first meet?" or "What is my biggest pet peeve?".
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            Sharing the Secret Link
                        </h2>
                        <p>
                            Once you click "Finish & Generate Link", your quiz is securely stored in our database, and you receive a unique, secret link.
                        </p>
                        <ul className="space-y-2 list-none pl-0 mt-4">
                            <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Copy the link and text it to your partner.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>When they open it, they will see a customized welcome screen telling them exactly how many seconds they have to survive.</span>
                            </li>
                        </ul>

                        <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            The Results & Hall of Shame
                        </h2>
                        <p>
                            When the clock hits zero (or they submit early), the algorithm instantly calculates their Love Score as a percentage.
                        </p>
                        <p>
                            If they score a perfect 100%, they are a <strong>Perfect Soulmate</strong>! If they score below 50%, the app gently suggests <em>"We Need To Talk... 💔"</em>.
                        </p>
                        <p>
                            The best part? <strong>The result is permanent.</strong> They can only take the quiz once. If they try to refresh the page or click the link again, they will be immediately redirected to their final score. No cheating allowed!
                        </p>
                        <p>
                            They can then download a sleek image of their score to send back to you, or share it directly to their social media apps.
                        </p>

                        <hr className="my-10 border-border/50" />

                        <div className="text-center pb-4">
                            <h3 className="text-2xl font-bold mb-4">Ready to test your relationship?</h3>
                            <Button asChild size="lg" className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg transition-transform hover:scale-105 px-8 py-6 text-lg h-14">
                                <Link href="/love-score">
                                    <HeartPulse className="w-5 h-5 mr-2 animate-bounce" />
                                    Create Your Love Score Quiz Now
                                </Link>
                            </Button>
                        </div>

                    </div>
                </article>
            </div>
        </div>
    );
}
