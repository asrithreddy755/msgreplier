"use client";

import React, { useState } from "react";
import { useFieldArray, useForm, SubmitHandler } from "react-hook-form";
import { quizFormSchema, QuizFormValues } from "@/lib/love-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, PlusCircle, Copy, Check, HeartPulse, Send, Wand2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import presetQuestions from "@/data/love-questions.json";
import { v4 as uuidv4 } from "uuid";

export default function LoveScoreCreator() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    const form = useForm<QuizFormValues>({
        resolver: async (values) => {
            const result = quizFormSchema.safeParse(values);
            if (result.success) {
                return {
                    values: result.data,
                    errors: {},
                } as any;
            }
            return {
                values: {},
                errors: result.error.formErrors.fieldErrors as any,
            } as any;
        },
        defaultValues: {
            sender_name: "",
            receiver_name: "",
            time_limit_seconds: "1" as any,
            questions: [
                {
                    text: "Where did we first meet?",
                    options: ["At school", "Online", "At a party", "Through friends"],
                    correctOptionIndex: 0,
                    hint: "",
                },
            ],
        },
    });

    const { fields, append, remove, replace, update } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const onSubmit: SubmitHandler<QuizFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            // 2. Format the payload
            const payload = {
                sender_name: data.sender_name,
                receiver_name: data.receiver_name,
                time_limit_seconds: parseInt(data.time_limit_seconds, 10) * 60,
                questions: data.questions.map((q) => ({
                    id: uuidv4(),
                    text: q.text,
                    options: q.options,
                    correctOptionIndex: q.correctOptionIndex,
                    hint: q.hint || undefined,
                })),
            };

            // 3. Insert into Supabase
            const fetchUrl = "/api/love-quiz";
            console.log("Fetch URL:", fetchUrl);
            const res = await fetch(fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to create quiz.");
            }

            const insertedData = await res.json();

            // 4. Generate the link
            const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
            const url = `${origin}/love-score/${insertedData.id}`;
            setGeneratedLink(url);

            toast({ title: "Success!", description: "Quiz created successfully!" });
        } catch (err: any) {
            console.error(err);
            toast({ title: "Error", description: err?.message || "Something went wrong saving the quiz.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = async () => {
        if (!generatedLink) return;
        await navigator.clipboard.writeText(generatedLink);
        setHasCopied(true);
        toast({ title: "Copied!", description: "Link copied to clipboard. Send it to your partner!" });
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handlePresets = () => {
        if (!presetQuestions || presetQuestions.length === 0) {
            toast({ title: "No Presets", description: "The preset questions list is empty.", variant: "destructive" });
            return;
        }
        const shuffled = [...presetQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5) as any;
        replace(selected);
        toast({ title: "Presets Applied", description: "Loaded up to 5 random questions!" });
    };

    const handleSinglePreset = (index: number) => {
        if (!presetQuestions || presetQuestions.length === 0) return;

        // Get all current questions to avoid duplicates
        const currentQuestions = form.getValues("questions").map(q => q.text);

        // Find presets that aren't already in the form
        const availablePresets = presetQuestions.filter(p => !currentQuestions.includes(p.text));

        if (availablePresets.length === 0) {
            toast({ title: "No More Presets", description: "You are already using all available preset questions!", variant: "destructive" });
            return;
        }

        // Pick a random one from the available ones
        const randomPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)];
        update(index, randomPreset as any);
    };

    if (generatedLink) {
        return (
            <div className="min-h-screen bg-rose-50 dark:bg-slate-950 py-12 px-4 flex items-center justify-center">
                <Card className="w-full max-w-lg border-2 border-rose-100 dark:border-rose-900/50 shadow-xl animate-in zoom-in-95 duration-500">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Ready!</CardTitle>
                        <CardDescription className="text-lg">
                            Your custom Love Score quiz has been created. Send this secret link to {form.getValues().receiver_name}!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Input value={generatedLink} readOnly className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-mono text-sm" />
                            <Button onClick={copyToClipboard} variant="default" className="bg-rose-600 hover:bg-rose-700 w-24">
                                {hasCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {hasCopied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-8 mt-2">
                        <Button variant="outline" onClick={() => { setGeneratedLink(null); form.reset(); }} className="w-full text-rose-600 border-rose-200">
                            Create Another Quiz
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rose-50 dark:bg-slate-950 py-8 px-4 sm:px-6 relative">
            <div className="max-w-3xl mx-auto space-y-6">

                <div className="flex justify-start">
                    <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>

                <div className="text-center space-y-4">
                    <HeartPulse className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Create a <span className="text-rose-500">Love Score</span> Quiz
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        Test how well they really know you. Build a custom quiz, set a trap timer, and send them the secret link!
                    </p>
                </div>

                <Card className="border-2 border-rose-100 dark:border-rose-900/30 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                            {/* Setup Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center border-b pb-2 dark:border-slate-800">
                                    <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                    Setup The names
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="sender_name">Your Name</Label>
                                        <Input id="sender_name" {...form.register("sender_name")} placeholder="e.g. Juliet" className="bg-slate-50 dark:bg-slate-950" />
                                        {form.formState.errors.sender_name && <p className="text-sm text-red-500">{form.formState.errors.sender_name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="receiver_name">Partner Name</Label>
                                        <Input id="receiver_name" {...form.register("receiver_name")} placeholder="e.g. Romeo" className="bg-slate-50 dark:bg-slate-950" />
                                        {form.formState.errors.receiver_name && <p className="text-sm text-red-500">{form.formState.errors.receiver_name.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label>Time Limit (Pressure makes it fun!)</Label>
                                    <RadioGroup
                                        value={["1", "2"].includes(form.watch("time_limit_seconds")) ? form.watch("time_limit_seconds") : "custom"}
                                        onValueChange={(val) => {
                                            if (val === "custom") {
                                                form.setValue("time_limit_seconds", ""); // Clear for custom typing
                                            } else {
                                                form.setValue("time_limit_seconds", val as any);
                                                form.clearErrors("time_limit_seconds");
                                            }
                                        }}
                                        className="flex flex-col sm:flex-row gap-4"
                                    >
                                        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-md border flex-1">
                                            <RadioGroupItem value="1" id="t-60" />
                                            <Label htmlFor="t-60" className="cursor-pointer flex-1">1 Minute</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-md border flex-1">
                                            <RadioGroupItem value="2" id="t-120" />
                                            <Label htmlFor="t-120" className="cursor-pointer flex-1">2 Minutes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-md border flex-1">
                                            <RadioGroupItem value="custom" id="t-custom" />
                                            {["1", "2"].includes(form.watch("time_limit_seconds")) ? (
                                                <Label htmlFor="t-custom" className="cursor-pointer flex-1">Custom</Label>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    placeholder="Minutes"
                                                    className="h-8 text-sm bg-white dark:bg-slate-900"
                                                    {...form.register("time_limit_seconds")}
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    </RadioGroup>
                                    {form.formState.errors.time_limit_seconds && <p className="text-sm text-red-500 mt-1">{form.formState.errors.time_limit_seconds.message}</p>}
                                </div>
                            </div>

                            {/* Questions Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                                    <h3 className="text-xl font-bold flex items-center">
                                        <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                        Build Your Questions
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={handlePresets} className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Presets
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-500">Add options and accurately mark the radio button next to the correct answer.</p>

                                <div className="space-y-8">
                                    {fields.map((field, index) => {
                                        // We must watch the options array to render the correct radio buttons
                                        const currentOptions = form.watch(`questions.${index}.options`);
                                        const currentCorrectIndex = form.watch(`questions.${index}.correctOptionIndex`);
                                        const currentHint = form.watch(`questions.${index}.hint`);

                                        return (
                                            <div key={field.id} className="p-5 border-2 border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 relative animate-in slide-in-from-bottom-4">
                                                <div className="absolute -top-3 -right-3 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSinglePreset(index)}
                                                        className="bg-white dark:bg-slate-800 text-rose-500 border border-slate-200 dark:border-slate-700 p-2 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
                                                        title="Random Preset Question"
                                                    >
                                                        <Wand2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="bg-white dark:bg-slate-800 text-red-500 border border-slate-200 dark:border-slate-700 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                                                        title="Remove Question"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="font-semibold text-rose-600 dark:text-rose-400">Question {index + 1}</Label>
                                                        <Input {...form.register(`questions.${index}.text`)} placeholder="e.g. What is my favorite food?" className="bg-white dark:bg-slate-900 border-slate-200" />
                                                        {form.formState.errors.questions?.[index]?.text && <p className="text-sm text-red-500">{form.formState.errors.questions[index]?.text?.message}</p>}
                                                    </div>

                                                    {currentHint !== undefined ? (
                                                        <div className="space-y-2 pt-1">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-sm text-amber-600 dark:text-amber-500 flex items-center">
                                                                    <Wand2 className="w-3 h-3 mr-1" /> Hint (Optional)
                                                                </Label>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs text-slate-400 hover:text-red-500"
                                                                    onClick={() => {
                                                                        const copy = [...form.getValues("questions")];
                                                                        delete copy[index].hint;
                                                                        form.setValue("questions", copy);
                                                                    }}
                                                                >
                                                                    Remove Hint
                                                                </Button>
                                                            </div>
                                                            <Input {...form.register(`questions.${index}.hint`)} placeholder="e.g. It was raining that day..." className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" />
                                                        </div>
                                                    ) : (
                                                        <div className="pt-1">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs text-slate-500 hover:text-amber-600 border-dashed border-slate-300 dark:border-slate-700 h-8"
                                                                onClick={() => {
                                                                    form.setValue(`questions.${index}.hint`, "");
                                                                }}
                                                            >
                                                                <PlusCircle className="w-3 h-3 mr-1" /> Add Hint
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-rose-100 dark:border-rose-900/50">
                                                        <Label className="text-sm text-slate-500">Provide Answers & Select Correct One:</Label>

                                                        {currentOptions.map((opt, optIndex) => (
                                                            <div key={optIndex} className="flex items-center gap-3">
                                                                <div
                                                                    className="flex items-center justify-center w-8 h-8 rounded-full border-2 cursor-pointer transition-colors shrink-0"
                                                                    style={{
                                                                        borderColor: currentCorrectIndex === optIndex ? '#10b981' : '#cbd5e1',
                                                                        backgroundColor: currentCorrectIndex === optIndex ? '#ecfdf5' : 'transparent',
                                                                    }}
                                                                    onClick={() => form.setValue(`questions.${index}.correctOptionIndex`, optIndex)}
                                                                >
                                                                    {currentCorrectIndex === optIndex && <Check className="w-4 h-4 text-emerald-500" />}
                                                                </div>
                                                                <Input
                                                                    {...form.register(`questions.${index}.options.${optIndex}`)}
                                                                    placeholder={`Option ${optIndex + 1}`}
                                                                    className="bg-white dark:bg-slate-900"
                                                                />
                                                            </div>
                                                        ))}

                                                        <div className="flex justify-between items-center pt-2">
                                                            {form.formState.errors.questions?.[index]?.options && <p className="text-sm text-red-500">Ensure all options are filled.</p>}
                                                            {currentOptions.length < 4 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-rose-600 ml-auto"
                                                                    onClick={() => {
                                                                        const extended = [...currentOptions, ""];
                                                                        form.setValue(`questions.${index}.options`, extended);
                                                                    }}
                                                                >
                                                                    <PlusCircle className="w-4 h-4 mr-1" /> Add Option
                                                                </Button>
                                                            )}
                                                            {currentOptions.length > 2 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-slate-500 ml-2"
                                                                    onClick={() => {
                                                                        const reduced = currentOptions.slice(0, currentOptions.length - 1);
                                                                        form.setValue(`questions.${index}.options`, reduced);
                                                                        // Ensure correct index isn't out of bounds
                                                                        if (currentCorrectIndex >= reduced.length) {
                                                                            form.setValue(`questions.${index}.correctOptionIndex`, 0);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-1" /> Remove Option
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-dashed border-2 py-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                    onClick={() => append({ text: "", options: ["", ""], correctOptionIndex: 0 })}
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" /> Add Another Question
                                </Button>
                                {form.formState.errors.questions?.root && <p className="text-sm text-red-500 text-center">{form.formState.errors.questions.root.message}</p>}
                            </div>

                            {/* Submit Action */}
                            <div className="pt-6 border-t dark:border-slate-800">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg py-6 text-lg font-bold"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center"><HeartPulse className="w-6 h-6 mr-2 animate-bounce" /> Generating Magic Link...</span>
                                    ) : (
                                        <span className="flex items-center"><Send className="w-5 h-5 mr-2" /> Finish & Generate Link</span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Guide & Footer Section */}
            <div className="max-w-3xl mx-auto mt-16 space-y-12">
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">How It Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
                            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Create</h3>
                            <p className="text-sm text-slate-500">Pick your questions and set a ruthless time limit.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
                            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Share</h3>
                            <p className="text-sm text-slate-500">Send them the secret generated link.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
                            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Score</h3>
                            <p className="text-sm text-slate-500">Watch them panic as the clock ticks, and view their final score!</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center bg-rose-50/50 dark:bg-slate-950/50 p-4 rounded-xl border border-rose-100 dark:border-slate-800/80">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Need more details? Check out our full <Link href="/blog/love-score-guide" className="text-rose-600 hover:underline font-medium">Ultimate Guide to the Love Score Quiz</Link>.
                        </p>
                    </div>
                </div>

                {/* Detailed SEO Explanatory Content for Google AdSense */}
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 backdrop-blur-sm space-y-8 text-left">
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What is the MsgReplier Love Score Quiz?</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                            The Love Score Quiz is an interactive, fully customisable relationship game designed to test how well your partner, crush, or best friend actually knows you. Instead of standard online quizzes with generic questions, MsgReplier allows you to craft your own custom questions, set unique answer options, and define which one is correct. You can also specify a countdown timer to add exciting pressure! Once you complete the setup, a private, secure link is generated for you to share directly with your recipient.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why Create a Compatibility Quiz for Your Partner?</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                            In any relationship, sharing trivia, reminiscing about first dates, and laughing over inside jokes builds a deeper connection. A custom couple quiz is a playful way to celebrate your unique story. It sparks conversations about memories you might have forgotten—like the exact movie you watched on your first date, your partner's pet peeve, or your dream travel destination. By testing each other, you can enjoy lighthearted competition and see who holds the highest "Love Score".
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tips for Creating the Ultimate Couple Quiz</h2>
                        <ul className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                            <li><strong className="text-slate-900 dark:text-white">Mix the Easy and Hard:</strong> Include a few obvious questions (like your birthday or favorite color) alongside deeper memory tests (like what you wore when you first met or your first impressions).</li>
                            <li><strong className="text-slate-900 dark:text-white">Add Playful Hints:</strong> Use the optional Hint field to give subtle clues or tease your partner about the answer.</li>
                            <li><strong className="text-slate-900 dark:text-white">Use the Pressure Timer:</strong> Setting a 1 or 2-minute time limit keeps the quiz fast-paced and prevents them from cheating or looking up answers!</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">Are my quiz answers kept private?</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Absolutely. MsgReplier values privacy first. All quiz questions, options, and scores are handled securely and are only accessible by you and the person who receives the unique link.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">How is the Love Score calculated?</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    The final score is a simple percentage of questions answered correctly before the timer runs out. When your partner finishes, they will see their compatibility level instantly.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">Can I create multiple quizzes?</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Yes, you can create as many custom quizzes as you want! You can generate distinct links for different friends or test your partner on different topics.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="pt-8 pb-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} MsgReplier.com</p>
                    <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                        <Link href="/terms-conditions?from=love-score" className="hover:text-rose-600 transition-colors">Terms</Link>
                        <Link href="/privacy-policy?from=love-score" className="hover:text-rose-600 transition-colors">Privacy</Link>
                        <Link href="/contact?from=love-score" className="hover:text-rose-600 transition-colors">Contact</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
