"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Send, PlusCircle, Trash2, CheckCircle2, Timer, Trophy, ArrowRight, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { WebRTCMessageType } from '@/lib/webrtc/dataChannel';
import presetQuestions from "@/data/love-questions.json";

interface LoveQuizProps {
    roomId: string;
    currentMember: { id: string; nickname: string };
    members: { id: string; nickname: string }[];
    sendMessage?: (type: WebRTCMessageType, payload?: any, options?: { reliable?: boolean }) => void;
    registerHandler?: (type: WebRTCMessageType, handler: (payload: any) => void) => void;
    unregisterHandler?: (type: WebRTCMessageType, handler?: (payload: any) => void) => void;
}

export function LoveQuiz({ roomId, currentMember, members, sendMessage, registerHandler, unregisterHandler }: LoveQuizProps) {
    const [view, setView] = useState<'start' | 'create' | 'taking' | 'result'>('start');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [score, setScore] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otherMemberResult, setOtherMemberResult] = useState<any>(null);

    const otherMember = members.find(m => m.id !== currentMember.id);

    // Sync Handlers
    useEffect(() => {
        if (!registerHandler || !unregisterHandler) return;

        const handleIncomingQuiz = (payload: any) => {
            if (payload.senderId === currentMember.id) return;
            setQuestions(payload.questions);
            setView('taking');
            toast(`${payload.senderNickname} sent you a Love Quiz! 💌`);
        };

        const handleIncomingResult = (payload: any) => {
            if (payload.senderId === currentMember.id) return;
            setOtherMemberResult(payload);
            toast(`${payload.senderNickname} finished your quiz! Score: ${payload.score}% 🏆`);
        };

        registerHandler('game_move', (payload: any) => {
            if (payload.game !== 'quiz') return;
            if (payload.type === 'new_quiz') handleIncomingQuiz(payload);
            if (payload.type === 'quiz_result') handleIncomingResult(payload);
        });

        return () => unregisterHandler('game_move');
    }, [registerHandler, unregisterHandler, currentMember.id]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', ''], correctOptionIndex: 0 }]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleUpdateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
    };

    const handleAddOption = (qIndex: number) => {
        if (questions[qIndex].options.length >= 4) return;
        const updated = [...questions];
        updated[qIndex].options.push('');
        setQuestions(updated);
    };

    const handleSendQuiz = () => {
        if (questions.length === 0) {
            toast.error("Add at least one question!");
            return;
        }
        if (questions.some(q => !q.text.trim() || q.options.some((o: string) => !o.trim()))) {
            toast.error("Please fill in all questions and options!");
            return;
        }

        sendMessage?.('game_move', {
            game: 'quiz',
            type: 'new_quiz',
            questions,
            senderId: currentMember.id,
            senderNickname: currentMember.nickname
        });

        toast.success("Quiz sent to your partner!");
        setView('start');
    };

    const handleSubmitAnswer = () => {
        const currentAnswer = answers[currentQuestionIndex];
        if (currentAnswer === undefined) {
            toast.error("Please select an answer!");
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Calculate Score
            let correctCount = 0;
            questions.forEach((q, i) => {
                if (q.correctOptionIndex === answers[i]) correctCount++;
            });
            const finalScore = Math.round((correctCount / questions.length) * 100);
            setScore(finalScore);
            setView('result');

            sendMessage?.('game_move', {
                game: 'quiz',
                type: 'quiz_result',
                score: finalScore,
                senderId: currentMember.id,
                senderNickname: currentMember.nickname
            });
        }
    };

    const loadPresets = () => {
        const shuffled = [...presetQuestions].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 3).map(q => ({
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex
        })));
        toast.success("Loaded 3 random questions!");
    };

    return (
        <div className="flex flex-col gap-4 p-2 sm:p-4 max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
                {view === 'start' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <Card className="border-pink-100 dark:border-pink-900/30 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto bg-pink-100 dark:bg-pink-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-pink-500 shadow-inner">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <CardTitle className="text-2xl font-black text-gray-800 dark:text-pink-100">Love Score Quiz</CardTitle>
                                <CardDescription>Test how well your partner knows you!</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button 
                                        onClick={() => setView('create')}
                                        className="h-24 rounded-2xl flex flex-col gap-2 bg-pink-500 hover:bg-pink-600 text-white border-0 shadow-md group"
                                    >
                                        <PlusCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold">Create Quiz</span>
                                    </Button>
                                    <Card className="h-24 rounded-2xl flex flex-col items-center justify-center bg-muted/30 border-dashed">
                                        <p className="text-xs text-muted-foreground text-center px-4">
                                            Wait for your partner to send a quiz!
                                        </p>
                                    </Card>
                                </div>

                                {otherMemberResult && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-2xl flex items-center gap-4">
                                        <div className="bg-green-500 text-white p-2 rounded-xl">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-green-800 dark:text-green-300">
                                                {otherMemberResult.senderNickname} scored {otherMemberResult.score}%
                                            </p>
                                            <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-black">Latest Result</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {view === 'create' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={() => setView('start')} className="text-muted-foreground">Cancel</Button>
                            <Button onClick={loadPresets} variant="outline" size="sm" className="text-pink-500 border-pink-200">
                                <Wand2 className="w-4 h-4 mr-2" /> Presets
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                            {questions.map((q, qIndex) => (
                                <Card key={qIndex} className="p-4 rounded-2xl border-pink-100 relative">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleRemoveQuestion(qIndex)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-pink-500 uppercase">Question {qIndex + 1}</Label>
                                        <Input 
                                            placeholder="What's my favorite color?" 
                                            value={q.text} 
                                            onChange={(e) => handleUpdateQuestion(qIndex, 'text', e.target.value)}
                                            className="rounded-xl"
                                        />
                                        <div className="space-y-2 pl-4 border-l-2 border-pink-100">
                                            {q.options.map((opt: string, oIndex: number) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <div 
                                                        onClick={() => handleUpdateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                                        className={`w-5 h-5 rounded-full border-2 cursor-pointer flex-shrink-0 flex items-center justify-center ${q.correctOptionIndex === oIndex ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`}
                                                    >
                                                        {q.correctOptionIndex === oIndex && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <Input 
                                                        placeholder={`Option ${oIndex + 1}`} 
                                                        value={opt} 
                                                        onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                                                        className="h-8 rounded-lg text-sm"
                                                    />
                                                </div>
                                            ))}
                                            {q.options.length < 4 && (
                                                <Button variant="ghost" size="sm" onClick={() => handleAddOption(qIndex)} className="text-[10px] uppercase font-black text-pink-400">
                                                    + Add Option
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <Button onClick={handleAddQuestion} variant="outline" className="w-full border-dashed rounded-2xl py-6 border-pink-200 text-pink-500">
                            <PlusCircle className="w-5 h-5 mr-2" /> Add Question
                        </Button>

                        <Button onClick={handleSendQuiz} className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl h-14 font-bold text-lg shadow-lg">
                            <Send className="w-5 h-5 mr-2" /> Send to Partner
                        </Button>
                    </motion.div>
                )}

                {view === 'taking' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-xs font-black text-pink-500 uppercase">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <div className="h-1.5 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-pink-500" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white pt-4">
                                {questions[currentQuestionIndex].text}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {questions[currentQuestionIndex].options.map((opt: string, i: number) => (
                                <Button
                                    key={i}
                                    variant={answers[currentQuestionIndex] === i ? 'default' : 'outline'}
                                    onClick={() => {
                                        const newAnswers = [...answers];
                                        newAnswers[currentQuestionIndex] = i;
                                        setAnswers(newAnswers);
                                    }}
                                    className={`h-16 rounded-2xl text-lg font-bold border-2 ${answers[currentQuestionIndex] === i ? 'bg-pink-500 border-pink-500 shadow-md scale-[1.02]' : 'hover:border-pink-200'}`}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>

                        <Button onClick={handleSubmitAnswer} className="w-full h-14 rounded-2xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-lg mt-4">
                            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}

                {view === 'result' && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full border-8 border-pink-100 dark:border-pink-900/30 flex items-center justify-center text-4xl font-black text-pink-500">
                                {score}%
                            </div>
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-2 -right-2 bg-yellow-400 text-white p-2 rounded-full shadow-md"
                            >
                                <Trophy className="w-5 h-5" />
                            </motion.div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white">Love Score Result!</h2>
                            <p className="text-muted-foreground font-medium px-8">
                                {score! >= 80 ? "You know your partner perfectly! ❤️" : 
                                 score! >= 50 ? "Not bad! You're getting there! 🥰" : 
                                 "Time to spend more time talking! 😅"}
                            </p>
                        </div>

                        <Button onClick={() => { setView('start'); setAnswers([]); setCurrentQuestionIndex(0); setQuestions([]); }} className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 h-12 font-bold">
                            Back to Home
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
