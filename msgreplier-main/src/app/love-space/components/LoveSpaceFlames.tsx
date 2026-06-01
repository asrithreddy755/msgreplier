"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Sparkles, RefreshCcw, Share2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { RealtimeMessageType } from "@/lib/realtime/types";
import { toast } from "sonner";

interface LoveSpaceFlamesProps {
    sendMessage?: (type: RealtimeMessageType, payload?: any, options?: { reliable?: boolean }) => void;
    registerHandler?: (type: RealtimeMessageType, handler: (payload: any) => void) => void;
    unregisterHandler?: (type: RealtimeMessageType, handler?: (payload: any) => void) => void;
    currentMember: { id: string; nickname: string };
    otherMember?: { id: string; nickname: string } | null;
}

const FLAMES_DATA: Record<string, { meaning: string; color: string; emoji: string; description: string }> = {
    F: { meaning: "Friendship", color: "text-blue-500", emoji: "🤝", description: "Best friends forever! A bond that stands the test of time." },
    L: { meaning: "Love", color: "text-red-500", emoji: "❤️", description: "True romance is in the air. You are destined for each other." },
    A: { meaning: "Affection", color: "text-pink-500", emoji: "🥰", description: "Sweet and fond feelings. A cute relationship is blossoming." },
    M: { meaning: "Marriage", color: "text-purple-500", emoji: "💍", description: "The ultimate commitment. Wedding bells might be ringing soon!" },
    E: { meaning: "Enemy", color: "text-orange-500", emoji: "⚔️", description: "Uh oh! Sparks will fly, but maybe not the good kind." },
    S: { meaning: "Sister", color: "text-teal-500", emoji: "👯", description: "A protective, sibling-like bond. You care deeply like family." },
};

export function LoveSpaceFlames({ 
    sendMessage, 
    registerHandler, 
    unregisterHandler, 
    currentMember, 
    otherMember 
}: LoveSpaceFlamesProps) {
    const [name1, setName1] = useState(currentMember.nickname);
    const [name2, setName2] = useState(otherMember?.nickname || "");
    const [isRevealing, setIsRevealing] = useState(false);
    const [result, setResult] = useState<{ letter: string; name1: string; name2: string } | null>(null);
    const [remoteRevealing, setRemoteRevealing] = useState(false);

    // Sync otherMember name when it changes
    useEffect(() => {
        if (otherMember?.nickname && !name2) {
            setName2(otherMember.nickname);
        }
    }, [otherMember, name2]);

    const calculateFlames = (n1Str: string, n2Str: string) => {
        const n1 = n1Str.toLowerCase().replace(/\s/g, "").split("");
        const n2 = n2Str.toLowerCase().replace(/\s/g, "").split("");

        const count1 = n1.filter((char) => !n2.includes(char)).length;
        const count2 = n2.filter((char) => !n1.includes(char)).length;
        const totalRemaining = count1 + count2;

        const flames = ["F", "L", "A", "M", "E", "S"];
        let index = 0;
        const currentFlames = [...flames];

        if (totalRemaining === 0) return "F"; // Edge case

        while (currentFlames.length > 1) {
            index = (index + totalRemaining - 1) % currentFlames.length;
            currentFlames.splice(index, 1);
        }
        return currentFlames[0];
    };

    const handleReveal = () => {
        if (!name1.trim() || !name2.trim()) {
            toast.error("Please enter both names first!");
            return;
        }

        const letter = calculateFlames(name1, name2);
        setIsRevealing(true);
        
        // Broadcast to other player
        if (sendMessage) {
            sendMessage('flames_reveal', { 
                name1, 
                name2, 
                letter,
                senderNickname: currentMember.nickname 
            });
        }

        // Local reveal animation delay
        setTimeout(() => {
            setResult({ letter, name1, name2 });
            setIsRevealing(false);
        }, 3000);
    };

    const handleIncomingReveal = useCallback((payload: any) => {
        if (!payload || payload.senderNickname === currentMember.nickname) return;

        setRemoteRevealing(true);
        setName1(payload.name1);
        setName2(payload.name2);

        setTimeout(() => {
            setResult({ 
                letter: payload.letter, 
                name1: payload.name1, 
                name2: payload.name2 
            });
            setRemoteRevealing(false);
            toast(`${payload.senderNickname} revealed your FLAMES! 🔥`, {
                icon: <Flame className="w-4 h-4 text-pink-500" />,
            });
        }, 3000);
    }, [currentMember.nickname]);

    useEffect(() => {
        if (registerHandler && unregisterHandler) {
            registerHandler('flames_reveal', handleIncomingReveal);
            return () => unregisterHandler('flames_reveal', handleIncomingReveal);
        }
    }, [registerHandler, unregisterHandler, handleIncomingReveal]);

    const reset = () => {
        setResult(null);
        setIsRevealing(false);
        setRemoteRevealing(false);
    };

    return (
        <div className="w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-pink-100 dark:border-pink-900/30 shadow-lg relative overflow-hidden">
            <Heart className="absolute -right-6 -bottom-6 w-32 h-32 text-pink-500/5 rotate-12" strokeWidth={1} />
            
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/40 rounded-xl">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-pink-100 leading-tight">Love Score (FLAMES)</h3>
                    <p className="text-[10px] uppercase tracking-widest text-pink-500/70 dark:text-pink-400/70 font-bold">Relationship Destiny</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {(!result && !isRevealing && !remoteRevealing) ? (
                    <motion.div 
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 ml-1">Your Name</label>
                                <Input 
                                    placeholder="You" 
                                    value={name1} 
                                    onChange={(e) => setName1(e.target.value)}
                                    className="bg-white/80 dark:bg-slate-800/80 border-pink-100 dark:border-pink-900/30 rounded-2xl h-11 text-sm font-bold focus:ring-pink-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 ml-1">Partner's Name</label>
                                <Input 
                                    placeholder="Partner" 
                                    value={name2} 
                                    onChange={(e) => setName2(e.target.value)}
                                    className="bg-white/80 dark:bg-slate-800/80 border-pink-100 dark:border-pink-900/30 rounded-2xl h-11 text-sm font-bold focus:ring-pink-200"
                                />
                            </div>
                        </div>

                        <Button 
                            onClick={handleReveal}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-500/20 transition-all active:scale-[0.98]"
                        >
                            Reveal Our Flames
                        </Button>
                    </motion.div>
                ) : (isRevealing || remoteRevealing) ? (
                    <motion.div 
                        key="revealing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-8 space-y-4"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-20 h-20 bg-pink-100 dark:bg-pink-900/40 rounded-full flex items-center justify-center"
                            >
                                <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
                            </motion.div>
                            <motion.div 
                                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                                className="absolute inset-0 bg-pink-500/20 rounded-full"
                            />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 animate-pulse">
                            {remoteRevealing ? `${otherMember?.nickname} is revealing...` : "Calculating Destiny..."}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center space-y-4 py-2"
                    >
                        <div className="relative">
                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl bg-white dark:bg-slate-800 border-4 border-pink-100 dark:border-pink-900/50 shadow-xl ${FLAMES_DATA[result!.letter].color}`}>
                                {FLAMES_DATA[result!.letter].emoji}
                            </div>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-3 -right-3 bg-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-tighter"
                            >
                                {FLAMES_DATA[result!.letter].meaning}
                            </motion.div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-gray-800 dark:text-pink-100 tracking-tight">
                                {result?.name1} & {result?.name2}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium px-4 leading-relaxed">
                                {FLAMES_DATA[result!.letter].description}
                            </p>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={reset}
                            className="text-pink-500 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full px-4 text-[10px] font-black uppercase tracking-wider mt-2"
                        >
                            <RefreshCcw className="w-3 h-3 mr-2" /> Try Again
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
