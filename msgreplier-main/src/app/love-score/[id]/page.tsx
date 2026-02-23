"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { toBlob } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { LoveQuiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HeartPulse, Clock, FileWarning, Trophy, RefreshCcw, Heart, Share2, Download, Home } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export const runtime = 'edge';

export default function LoveScoreTaker({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [quiz, setQuiz] = useState<LoveQuiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [step, setStep] = useState<"welcome" | "active" | "result">("welcome");

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Quiz state
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [score, setScore] = useState<number>(0);

    const [showShareOptions, setShowShareOptions] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // 1. Fetch the Quiz
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    setError("Database keys missing. Quiz cannot be loaded.");
                    return;
                }

                const { data, error } = await supabase
                    .from("love_quizzes")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error || !data) {
                    setError("This quiz does not exist or has been deleted.");
                } else {
                    const fetchedQuiz = data as LoveQuiz;
                    setQuiz(fetchedQuiz);
                    setTimeLeft(fetchedQuiz.time_limit_seconds);

                    if (fetchedQuiz.score !== null && fetchedQuiz.score !== undefined) {
                        setScore(fetchedQuiz.score);
                        setStep("result");
                    }
                }
            } catch (err) {
                setError("Failed to load the quiz.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    // 2. Timer Logic
    useEffect(() => {
        if (step === "active" && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (step === "active" && timeLeft === 0) {
            // Auto-submit when time runs out
            handleSubmitQuiz();
        }
    }, [step, timeLeft]);

    const startQuiz = () => {
        setStep("active");
    };

    const calculateScore = () => {
        if (!quiz) return 0;
        let correct = 0;
        quiz.questions.forEach((q) => {
            if (answers[q.id] === q.correctOptionIndex) {
                correct++;
            }
        });
        return Math.round((correct / quiz.questions.length) * 100);
    };

    const handleSubmitQuiz = async () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setStep("result");

        // Save result to DB asynchronously by calling our Server API
        try {
            const res = await fetch('/api/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, score: finalScore })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save score');
            }
        } catch (err: any) {
            console.error("Failed to save result to DB:", err);
            toast({ title: "Save Failed", description: "Could not save your score to the database. " + (err?.message || ""), variant: "destructive" });
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const generateExportBlob = async () => {
        if (!resultRef.current) return null;
        const target = resultRef.current;
        target.classList.add('export-mode');

        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const blob = await toBlob(target, {
                cacheBust: true,
                pixelRatio: 2,
                skipFonts: true,
                style: {
                    transform: 'none',
                },
                filter: (node) => {
                    if (node.tagName === 'LINK' || node.tagName === 'STYLE' || node.tagName === 'IFRAME') {
                        return false;
                    }
                    return true;
                }
            });
            target.classList.remove('export-mode');
            return blob;
        } catch {
            target.classList.remove('export-mode');
            return null;
        }
    };

    const downloadImage = async () => {
        const blob = await generateExportBlob();
        if (!blob) {
            toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
            return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `love-score-result.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "Saved!", description: "Image downloaded to your device." });
        setShowShareOptions(false);
    };

    const shareImage = async () => {
        const blob = await generateExportBlob();
        if (!blob) {
            toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
            return;
        }
        const file = new File([blob], 'love-score-result.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Love Score Result',
                    text: `Check out my Love Score with ${quiz?.sender_name}! Created on msgreplier.com.`,
                    files: [file],
                });
                toast({ title: "Shared!", description: "Result shared successfully." });
            } catch (error) {
                // Ignored
            }
        } else {
            toast({ title: "Not Supported", description: "Your browser does not support native sharing. Please use the Save button instead.", variant: "destructive" });
        }
        setShowShareOptions(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-rose-50 dark:bg-slate-950 flex items-center justify-center">
                <HeartPulse className="w-12 h-12 text-rose-500 animate-pulse" />
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="min-h-screen bg-rose-50 dark:bg-slate-950 flex items-center justify-center px-4">
                <Card className="w-full max-w-md text-center shadow-xl">
                    <CardHeader>
                        <FileWarning className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">Quiz Not Found</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/love-score" className="w-full">
                            <Button className="w-full">Create a New Quiz</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // --- WELCOME STEP ---
    if (step === "welcome") {
        return (
            <div className="min-h-screen bg-rose-50 dark:bg-slate-950 py-12 px-4 flex items-center justify-center relative">
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
                    <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>
                <Card className="w-full max-w-md border-2 border-rose-200 dark:border-rose-900/50 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 mt-12 sm:mt-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Heart className="w-32 h-32 text-rose-500 fill-rose-500 transform rotate-12" />
                    </div>
                    <CardHeader className="text-center relative z-10 space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full w-20 h-20 mx-auto text-3xl shadow-inner text-rose-600">
                            💌
                        </div>
                        <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">
                            Love Score Quiz!
                        </CardTitle>
                        <CardDescription className="text-lg text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-rose-600 dark:text-rose-400">{quiz.sender_name}</span> has challenged you, <span className="font-bold text-rose-600 dark:text-rose-400">{quiz.receiver_name}</span>!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 text-center pb-8 border-b dark:border-slate-800">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 flex flex-col items-center space-y-2 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <Clock className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="text-slate-500 font-medium">You will only have</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 animate-pulse">{quiz.time_limit_seconds} Seconds</p>
                            <p className="text-slate-500 font-medium pt-2 text-sm max-w-xs">to answer {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}. Don't freeze up under pressure!</p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-6 pb-8 bg-slate-50/50 dark:bg-slate-900/50">
                        <Button
                            onClick={startQuiz}
                            size="lg"
                            className="w-full text-lg h-14 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg transition-transform hover:scale-105"
                        >
                            Start The Clock
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // --- RESULT STEP ---
    if (step === "result") {
        let message = "";
        if (score === 100) message = "Perfect Soulmates! 💘";
        else if (score >= 80) message = "It's True Love! ❤️";
        else if (score >= 50) message = "Getting There! 💕";
        else message = "We Need To Talk... 💔";

        return (
            <div className="min-h-screen bg-rose-50 dark:bg-slate-950 flex flex-col py-12 px-4 items-center justify-center">
                <Card className="w-full max-w-md border-2 border-rose-200 dark:border-rose-900/50 shadow-2xl text-center overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                    <div ref={resultRef} className="bg-white dark:bg-slate-950 flex flex-col items-center">
                        <CardHeader className="bg-gradient-to-b from-rose-100/50 to-transparent dark:from-rose-900/20 pb-2 w-full pt-8">
                            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full w-fit mb-4">
                                <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-500/20" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-600 dark:text-slate-400">Your Love Score:</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-6 w-full">
                            <h1 className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-rose-500 to-red-600 drop-shadow-sm">
                                {score}%
                            </h1>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-4">{message}</p>
                            <p className="text-slate-500 pb-2">
                                {calculateScore() === 100 ? "all" : Math.round((score / 100) * quiz.questions.length)} out of {quiz.questions.length} questions correctly.
                            </p>
                            <p className="text-[10px] text-slate-400/80 font-medium tracking-wide mt-2">
                                tested in www.msgreplier.com
                            </p>
                        </CardContent>
                    </div>
                    <CardFooter className="flex flex-col bg-slate-50 dark:bg-slate-900/80 p-6 border-t dark:border-slate-800">
                        {!showShareOptions ? (
                            <div className="flex flex-col space-y-3 w-full">
                                <Button variant="outline" className="w-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-12" onClick={() => setShowShareOptions(true)}>
                                    <Share2 className="mr-2 h-4 w-4" /> Share Result
                                </Button>
                                <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12 text-md">
                                    <Link href="/love-score">
                                        <HeartPulse className="w-4 h-4 mr-2" /> Make A Quiz For {quiz.sender_name}
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 w-full animate-in fade-in slide-in-from-bottom-2">
                                <Button variant="outline" size="sm" className="w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm h-12 flex flex-col items-center justify-center gap-1" onClick={downloadImage}>
                                    <Download className="h-4 w-4" />
                                    <span className="text-xs">Save</span>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm h-12 flex flex-col items-center justify-center gap-1" onClick={shareImage}>
                                    <Share2 className="h-4 w-4" />
                                    <span className="text-xs">Send</span>
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // --- ACTIVE STEP ---
    const timePercentage = (timeLeft / quiz.time_limit_seconds) * 100;
    const isDangerZone = timeLeft <= 10;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Sticky Header with Timer */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 shadow-sm px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <HeartPulse className="w-6 h-6 text-rose-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300 hidden sm:inline-block">Love Score</span>
                    </div>

                    <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border-2 ${isDangerZone ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'} transition-colors`}>
                        <Clock className={`w-4 h-4 ${isDangerZone ? 'animate-bounce' : ''}`} />
                        <span className="font-mono font-bold text-lg tabular-nums tracking-widest">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <Progress value={timePercentage} className={`h-1 w-full max-w-2xl mx-auto mt-4 ${isDangerZone ? '[&>div]:bg-red-500' : '[&>div]:bg-rose-500'}`} />
            </div>

            {/* Quiz Body */}
            <div className="flex-1 w-full max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-8 pb-32">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Answer Fast, <span className="text-rose-600">{quiz.receiver_name}</span>!</h2>
                    <p className="text-slate-500">Select the correct answers before the clock hits zero.</p>
                </div>

                {quiz.questions.map((q, index) => (
                    <Card key={q.id} className="border-2 border-slate-100 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                        <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/20 border-b dark:border-slate-800">
                            <span className="text-xs font-bold text-rose-500 tracking-wider uppercase mb-1 drop-shadow-sm">Question {index + 1} of {quiz.questions.length}</span>
                            <CardTitle className="text-xl leading-relaxed text-slate-800 dark:text-slate-100">{q.text}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <RadioGroup
                                value={answers[q.id]?.toString() || ""}
                                onValueChange={(val) => setAnswers({ ...answers, [q.id]: parseInt(val, 10) })}
                                className="space-y-3"
                            >
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={optIndex.toString()}
                                            id={`q-${q.id}-opt-${optIndex}`}
                                            className="border-slate-300 dark:border-slate-600 text-rose-600 w-5 h-5 focus:ring-rose-500"
                                        />
                                        <Label
                                            htmlFor={`q-${q.id}-opt-${optIndex}`}
                                            className="cursor-pointer flex-1 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-slate-800/80 border dark:border-slate-800 p-4 rounded-lg transition-colors text-base"
                                        >
                                            {opt}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSubmitQuiz}
                        size="lg"
                        className="w-full sm:w-auto px-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg text-lg h-14 font-bold"
                    >
                        Submit Answers
                    </Button>
                </div>
            </div>
        </div>
    );
}
