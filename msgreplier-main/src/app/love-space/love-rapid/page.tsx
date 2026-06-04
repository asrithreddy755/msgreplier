"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    Heart, Sparkles, Copy, CheckCircle2, Loader2, Send,
    RotateCcw, AlertTriangle, ChevronLeft, Flag, Grid3X3, Dices
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'waiting_for_partner' | 'answering' | 'reveal' | 'error';

interface QuestionItem {
    text: string;
    type: 'choice' | 'written';
    options?: string[];
}

interface SessionState {
    session_id: string;
    room_code: string;
    partner: 'a' | 'b';
    my_name: string;
    partner_name: string;
    questions: QuestionItem[];
}

interface RevealData {
    questions: QuestionItem[];
    answers_a: string[];
    answers_b: string[];
    partner_a_name: string;
    partner_b_name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'loveRapidSession';

function saveSession(s: SessionState) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ─── Floating background hearts ───────────────────────────────────────────────

function FloatingHearts() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
            {[
                { top: '8%', left: '7%', size: 48, delay: 0, dur: 3 },
                { top: '15%', right: '10%', size: 32, delay: 1, dur: 4 },
                { bottom: '20%', left: '12%', size: 24, delay: 0.5, dur: 3.5 },
                { bottom: '35%', right: '8%', size: 40, delay: 1.5, dur: 4.5 },
                { top: '50%', left: '4%', size: 20, delay: 2, dur: 3 },
            ].map((s, i) => (
                <motion.div
                    key={i}
                    className="absolute text-pink-300/40 dark:text-pink-700/30"
                    style={{ top: s.top, left: (s as any).left, right: (s as any).right, bottom: s.bottom }}
                    animate={{ y: [0, -16, 0], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Heart size={s.size} className="fill-pink-200/60 dark:fill-pink-900/40" />
                </motion.div>
            ))}
        </div>
    );
}

function TabWarning() {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Keep this tab open — closing it will end your session.</span>
        </div>
    );
}

function WaitingDots() {
    return (
        <span className="inline-flex gap-1 items-end ml-1">
            {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.8, delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </span>
    );
}

export default function LoveRapidPage() {
    // ── Core state ──────────────────────────────────────────────────────────
    const [phase, setPhase] = useState<Phase>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [session, setSession] = useState<SessionState | null>(null);
    const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [partnerSubmitted, setPartnerSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revealData, setRevealData] = useState<RevealData | null>(null);
    const [isPlayingAgain, setIsPlayingAgain] = useState(false);

    // ── Refs ─────────────────────────────────────────────────────────────────
    const channelRef = useRef<RealtimeChannel | null>(null);
    const sessionRef = useRef<SessionState | null>(null);

    // Keep sessionRef in sync so Realtime handlers always see the latest value
    useEffect(() => { sessionRef.current = session; }, [session]);

    // ── Realtime helpers ─────────────────────────────────────────────────────

    const fetchAndStartNewSession = useCallback(
        async (newSessionId: string, partner: 'a' | 'b', myName: string) => {
            try {
                const { data } = await supabase
                    .from('love_rapid_sessions')
                    .select('id, room_code, questions, partner_a_name, partner_b_name, status, a_submitted, b_submitted, answers_a, answers_b')
                    .eq('id', newSessionId)
                    .single();

                if (!data) return;

                const newSession: SessionState = {
                    session_id: newSessionId,
                    room_code: data.room_code,
                    partner,
                    my_name: myName,
                    partner_name:
                        partner === 'a' ? (data.partner_b_name ?? '') : (data.partner_a_name ?? ''),
                    questions: data.questions as QuestionItem[],
                };

                saveSession(newSession);
                setSession(newSession);
                setAnswers(['', '', '', '', '']);
                setHasSubmitted(false);
                setPartnerSubmitted(false);
                setRevealData(null);
                setPhase('answering');
                subscribeToSession(newSessionId, partner);
            } catch (err) {
                console.error('[LoveRapid] Error fetching new session:', err);
                toast.error('Could not load new game. Please refresh.');
                setIsPlayingAgain(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const subscribeToSession = useCallback(
        (sessionId: string, partnerRole: 'a' | 'b') => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }

            const channel = supabase
                .channel(`love-rapid-session:${sessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'love_rapid_sessions',
                        filter: `id=eq.${sessionId}`,
                    },
                    (payload) => {
                        const row = payload.new as Record<string, unknown>;
                        const currentSession = sessionRef.current;
                        if (!currentSession) return;

                        // Play-again
                        if (row.next_session_id && row.next_room_code) {
                            fetchAndStartNewSession(
                                row.next_session_id as string,
                                currentSession.partner,
                                currentSession.my_name
                            );
                            return;
                        }

                        // Status transitions
                        const status = row.status as string;

                        setPhase((prev) => {
                            if (prev === 'waiting_for_partner' && status === 'in_progress') return 'answering';
                            if (prev === 'answering' && status === 'revealing') return 'reveal';
                            return prev;
                        });

                        if (status === 'in_progress') {
                            setSession((prev) => {
                                if (!prev) return prev;
                                const partnerName =
                                    prev.partner === 'a'
                                        ? ((row.partner_b_name as string) ?? '')
                                        : ((row.partner_a_name as string) ?? '');
                                return { ...prev, partner_name: partnerName };
                            });
                        }

                        // Track partner's submission status
                        if (partnerRole === 'a') {
                            setPartnerSubmitted(Boolean(row.b_submitted));
                        } else {
                            setPartnerSubmitted(Boolean(row.a_submitted));
                        }

                        // Capture full reveal data
                        if (status === 'revealing') {
                            setRevealData({
                                questions: row.questions as QuestionItem[],
                                answers_a: (row.answers_a as string[]) ?? [],
                                answers_b: (row.answers_b as string[]) ?? [],
                                partner_a_name: (row.partner_a_name as string) ?? 'Partner A',
                                partner_b_name: (row.partner_b_name as string) ?? 'Partner B',
                            });
                        }
                    }
                )
                .subscribe();

            channelRef.current = channel;
        },
        [fetchAndStartNewSession]
    );

    // Cleanup channel on unmount
    useEffect(() => {
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, []);

    // ── Room Mode Setup ──────────────────────────────────────────────────────

    const initRoomSession = async (rId: string, myNickname: string) => {
        try {
            const res = await fetch('/api/love-rapid/init-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: rId }),
            });
            const data = await res.json();
            
            if (data.error === 'waiting_for_partner') {
                setPhase('waiting_for_partner');
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Failed to initialize session');

            const isPartnerA = data.partner_a_name.trim().toLowerCase() === myNickname.trim().toLowerCase();
            const role = isPartnerA ? 'a' : 'b';
            const partnerName = isPartnerA ? data.partner_b_name : data.partner_a_name;

            const activeSession: SessionState = {
                session_id: data.session_id,
                room_code: data.room_code,
                partner: role,
                my_name: myNickname,
                partner_name: partnerName,
                questions: data.questions,
            };

            saveSession(activeSession);
            setSession(activeSession);

            const mySubmitted = role === 'a' ? data.a_submitted : data.b_submitted;
            const oppSubmitted = role === 'a' ? data.b_submitted : data.a_submitted;

            setHasSubmitted(mySubmitted);
            setPartnerSubmitted(oppSubmitted);

            const myAnswersFromDB = role === 'a' ? data.answers_a : data.answers_b;
            if (myAnswersFromDB && Array.isArray(myAnswersFromDB)) {
                setAnswers(myAnswersFromDB);
            } else {
                setAnswers(['', '', '', '', '']);
            }

            if (data.status === 'revealing') {
                setRevealData({
                    questions: data.questions,
                    answers_a: data.answers_a || [],
                    answers_b: data.answers_b || [],
                    partner_a_name: data.partner_a_name,
                    partner_b_name: data.partner_b_name,
                });
                setPhase('reveal');
            } else {
                setPhase('answering');
            }

            subscribeToSession(data.session_id, role);

        } catch (err: any) {
            setPhase('error');
            setErrorMsg(err.message || 'An error occurred while loading the game.');
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const rId = params.get('roomId');
        if (!rId) {
            setPhase('error');
            setErrorMsg('Please open this game from inside your Love Space room.');
            return;
        }
        setRoomId(rId);

        // Fetch current member from sessionStorage
        const savedSession = sessionStorage.getItem(`loveRoom_${rId}`);
        if (!savedSession) {
            setPhase('error');
            setErrorMsg('Your Love Space room session is missing. Please re-enter the room first.');
            return;
        }

        let myNickname = '';
        try {
            const parsed = JSON.parse(savedSession);
            myNickname = parsed.nickname;
        } catch {
            setPhase('error');
            setErrorMsg('Invalid session. Please re-enter the room.');
            return;
        }

        if (!myNickname) {
            setPhase('error');
            setErrorMsg('Nickname not found. Please re-enter the room.');
            return;
        }

        initRoomSession(rId, myNickname);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!session) return;
        if (answers.some((a) => !a.trim())) {
            toast.error('Please answer all 5 questions before submitting!');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/love-rapid/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: session.session_id,
                    partner: session.partner,
                    answers: answers.map((a) => a.trim()),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setHasSubmitted(true);
            toast.success('Answers submitted! 💌');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to submit answers.';
            toast.error(msg);
            setIsSubmitting(false);
        }
    };

    const handlePlayAgain = async () => {
        if (!session || isPlayingAgain) return;
        setIsPlayingAgain(true);
        try {
            const res = await fetch('/api/love-rapid/play-again', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_session_id: session.session_id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (session.partner === 'a') {
                await fetchAndStartNewSession(data.new_session_id as string, 'a', session.my_name);
            }
            if (session.partner === 'b') {
                await fetchAndStartNewSession(data.new_session_id as string, 'b', session.my_name);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to start new game.';
            toast.error(msg);
            setIsPlayingAgain(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const backUrl = roomId ? `/love-space/${roomId}` : '/love-space';

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-pink-950 dark:via-purple-950 dark:to-pink-950 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
            <FloatingHearts />

            {/* Back link */}
            <motion.a
                href={backUrl}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold text-pink-500 hover:text-pink-700 transition-colors z-20"
                id="love-rapid-back-link"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Space
            </motion.a>

            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6 z-10"
            >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Love Space
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                    Love Rapid ⚡
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                    Answer 5 questions simultaneously, then reveal how you both responded.
                </p>
            </motion.div>

            {/* ── Phase Switcher ─────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {/* ══════════════════════════════════════════════════════════
                    PHASE: LOADING
                ══════════════════════════════════════════════════════════ */}
                {phase === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md flex justify-center py-10 z-10"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-455">Initializing game session...</p>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PHASE: WAITING FOR PARTNER (Not joined Love Room)
                ══════════════════════════════════════════════════════════ */}
                {phase === 'waiting_for_partner' && (
                    <motion.div
                        key="waiting_for_partner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md z-10"
                    >
                        <Card className="shadow-2xl border-pink-200/60 dark:border-pink-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400" />
                            <CardContent className="pt-8 pb-7 px-6 flex flex-col items-center gap-6">
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.25)]"
                                    >
                                        <Heart className="w-9 h-9 text-pink-500 fill-pink-500" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full border-2 border-pink-300 dark:border-pink-700"
                                    />
                                </div>

                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        Waiting for partner to join
                                        <WaitingDots />
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                        Your partner needs to enter the Love Space room first so we can sync names.
                                    </p>
                                </div>

                                <Button 
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold h-11"
                                >
                                    Check Again
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PHASE: ANSWERING
                ══════════════════════════════════════════════════════════ */}
                {phase === 'answering' && session && (
                    <motion.div
                        key="answering"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-2xl flex flex-col gap-4 z-10"
                    >
                        {/* Header card */}
                        <Card className="shadow-lg border-pink-100 dark:border-pink-900/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden">
                            <div className="h-0.5 w-full bg-gradient-to-r from-pink-400 to-purple-400" />
                            <CardContent className="py-4 px-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-gray-100">
                                        Answer all 5 questions 💌
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Your partner is answering simultaneously — no peeking!
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${partnerSubmitted ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`} />
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {session.partner_name
                                            ? (partnerSubmitted ? `${session.partner_name} done ✓` : `${session.partner_name} answering…`)
                                            : 'Partner answering…'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question cards */}
                        <div className="flex flex-col gap-3">
                            {session.questions.map((question, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                >
                                    <Card className="shadow-sm border-pink-100/60 dark:border-pink-900/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden">
                                        <CardContent className="pt-4 pb-4 px-5 space-y-2">
                                            <label
                                                htmlFor={`answer-${i}`}
                                                className="block text-xs font-black uppercase tracking-widest text-pink-500 dark:text-pink-400"
                                            >
                                                Q{i + 1} • {question.type === 'choice' ? 'Pick One Option' : 'Written Answer'}
                                            </label>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                                                {question.text}
                                            </p>

                                            {question.type === 'choice' ? (
                                                <div className="grid grid-cols-2 gap-3 mt-2 pt-1">
                                                    {question.options?.map((opt) => {
                                                        const isSelected = answers[i] === opt;
                                                        return (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (hasSubmitted) return;
                                                                    const next = [...answers];
                                                                    next[i] = opt;
                                                                    setAnswers(next);
                                                                }}
                                                                disabled={hasSubmitted}
                                                                className={`p-3.5 rounded-xl font-bold text-sm border text-center transition-all ${
                                                                    isSelected
                                                                        ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white border-pink-400 shadow-md scale-[1.02]'
                                                                        : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-pink-100/70 dark:border-pink-900/30 hover:bg-pink-50/50 dark:hover:bg-pink-900/20'
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <textarea
                                                    id={`answer-${i}`}
                                                    value={answers[i]}
                                                    onChange={(e) => {
                                                        if (hasSubmitted) return;
                                                        const next = [...answers];
                                                        next[i] = e.target.value;
                                                        setAnswers(next);
                                                    }}
                                                    disabled={hasSubmitted}
                                                    placeholder="Your answer…"
                                                    rows={2}
                                                    className="w-full resize-none rounded-xl border border-pink-200 dark:border-pink-900/50 bg-pink-50/50 dark:bg-pink-950/20 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Submit / waiting state */}
                        <AnimatePresence mode="wait">
                            {!hasSubmitted ? (
                                <motion.div key="submit-btn" exit={{ opacity: 0, scale: 0.95 }}>
                                    <Button
                                        id="love-rapid-submit-btn"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl font-black text-base shadow-xl shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-95 gap-2"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                        {isSubmitting ? 'Submitting…' : 'Submit My Answers'}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="waiting-partner"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="border-green-200 dark:border-green-900/40 bg-green-50/80 dark:bg-green-950/30 shadow-md overflow-hidden">
                                        <CardContent className="py-5 px-6 flex flex-col items-center gap-3 text-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center"
                                            >
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            </motion.div>
                                            <div>
                                                <p className="font-bold text-green-800 dark:text-green-300 text-sm">
                                                    Your answers are in! ✅
                                                </p>
                                                {partnerSubmitted ? (
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                                                        {session.partner_name || 'Your partner'} is done too — revealing soon…
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                                                        Waiting for {session.partner_name || 'your partner'} to finish
                                                        <WaitingDots />
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <TabWarning />
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PHASE: REVEAL
                ══════════════════════════════════════════════════════════ */}
                {phase === 'reveal' && session && revealData && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-3xl flex flex-col gap-5 z-10"
                    >
                        {/* Reveal header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: 2 }}
                                className="text-4xl mb-2"
                            >
                                🎉
                            </motion.div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                                Time to Reveal!
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                See how you both answered each question
                            </p>
                        </motion.div>

                        {/* Column headers */}
                        <div className="grid grid-cols-2 gap-3 px-1">
                            <div className="flex items-center gap-2 px-4 py-2 bg-pink-100/80 dark:bg-pink-900/30 rounded-xl border border-pink-200 dark:border-pink-800/40 justify-center">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 shrink-0" />
                                <span className="font-black text-sm text-pink-700 dark:text-pink-300 truncate">
                                    {revealData.partner_a_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100/80 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800/40 justify-center">
                                <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                                <span className="font-black text-sm text-purple-700 dark:text-purple-300 truncate">
                                    {revealData.partner_b_name}
                                </span>
                            </div>
                        </div>

                        {/* Question pairs — staggered reveal */}
                        <div className="flex flex-col gap-4">
                            {revealData.questions.map((question, i) => {
                                const ansA = revealData.answers_a?.[i] || '';
                                const ansB = revealData.answers_b?.[i] || '';
                                const isMatch = question.type === 'choice' && ansA === ansB && ansA !== '';

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: i * 0.3,
                                            duration: 0.5,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        <Card className={`shadow-md border-pink-100/60 dark:border-pink-900/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden transition-all ${
                                            isMatch ? 'ring-2 ring-pink-400 dark:ring-pink-500/50 shadow-lg shadow-pink-200/50 dark:shadow-none' : ''
                                        }`}>
                                            {/* Question */}
                                            <div className="px-5 pt-4 pb-3 border-b border-pink-100/60 dark:border-pink-900/30 flex items-center justify-between flex-wrap gap-2">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 dark:text-pink-500 block mb-0.5">
                                                        Question {i + 1} • {question.type === 'choice' ? 'Choice' : 'Written'}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                                        {question.text}
                                                    </p>
                                                </div>
                                                {isMatch && (
                                                    <span className="text-[10px] font-black uppercase bg-pink-100 dark:bg-pink-900/80 text-pink-600 dark:text-pink-300 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-850 animate-bounce flex items-center gap-1 shadow-sm">
                                                        💘 Match!
                                                    </span>
                                                )}
                                            </div>

                                            {/* Answers side by side */}
                                            <div className="grid grid-cols-2 divide-x divide-pink-100 dark:divide-pink-900/30">
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.3 + 0.2 }}
                                                    className="px-4 py-3"
                                                >
                                                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-wider mb-1">
                                                        {revealData.partner_a_name}
                                                    </p>
                                                    <p className={`text-sm leading-snug font-medium ${
                                                        isMatch ? 'text-pink-600 dark:text-pink-400 font-bold' : 'text-gray-700 dark:text-gray-250'
                                                    }`}>
                                                        {ansA || <span className="italic text-gray-400">—</span>}
                                                    </p>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.3 + 0.3 }}
                                                    className="px-4 py-3"
                                                >
                                                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-1">
                                                        {revealData.partner_b_name}
                                                    </p>
                                                    <p className={`text-sm leading-snug font-medium ${
                                                        isMatch ? 'text-pink-600 dark:text-pink-400 font-bold' : 'text-gray-700 dark:text-gray-250'
                                                    }`}>
                                                        {ansB || <span className="italic text-gray-400">—</span>}
                                                    </p>
                                                </motion.div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Play Again */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: revealData.questions.length * 0.3 + 0.3 }}
                            className="flex flex-col items-center gap-3 pt-2 pb-6"
                        >
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                Want to go again with 5 fresh questions?
                            </p>
                            <Button
                                id="love-rapid-play-again-btn"
                                onClick={handlePlayAgain}
                                disabled={isPlayingAgain}
                                className="h-13 px-8 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-2xl font-black shadow-xl shadow-pink-500/25 transition-all hover:scale-[1.03] active:scale-95 gap-2"
                            >
                                {isPlayingAgain ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-5 h-5" />
                                )}
                                {isPlayingAgain ? 'Starting new game…' : 'Play Again ⚡'}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PHASE: ERROR
                ══════════════════════════════════════════════════════════ */}
                {phase === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md z-10"
                    >
                        <Card className="shadow-2xl border-red-200/60 dark:border-red-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden text-center">
                            <div className="h-1 w-full bg-red-500" />
                            <CardHeader className="pt-6 pb-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/45 flex items-center justify-center text-red-500 mb-2">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
                                    Access Restricted
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {errorMsg || 'This page can only be accessed from within an active Love Space room.'}
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/love-space'}
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold"
                                >
                                    Go to Love Space
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
