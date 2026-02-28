"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoomMember, TruthOrDareState } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Flame } from 'lucide-react';

const TRUTH_PROMPTS = [
    "What was your first impression of me?",
    "When did you start liking me?",
    "What is one thing you secretly admire about me?",
    "What's your favorite memory of us?",
    "If you could change one thing about our first date, what would it be?",
    "What's a secret you've never told me?",
    "When did you realize you loved me?",
    "What's your favorite physical feature of mine?",
    "What emoji reminds you of me the most?",
    "What's a weird habit of mine that you actually find cute?"
];

const DARE_PROMPTS = [
    "Send a voice note saying I miss you.",
    "Send a cute selfie right now.",
    "Say one cheesy pickup line.",
    "Change my contact name in your phone to something cute and send a screenshot.",
    "Dedicate a romantic song to me right now.",
    "Send me a picture of the most embarrassing thing in your camera roll.",
    "Text me the 3rd picture in your gallery without any context.",
    "Do an impression of me.",
    "Write me a short, corny poem.",
    "Tell me a joke. If I don't laugh, you owe me a kiss later."
];

const INITIAL_STATE: TruthOrDareState = {
    currentTurn: null, // Will be set on init
    currentPrompt: null,
    promptType: null,
};

export function TruthOrDare({ roomId, currentMember }: { roomId: string, currentMember: LoveRoomMember }) {
    const [state, setState] = useState<TruthOrDareState>(INITIAL_STATE);
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        let channel: any;

        const init = async () => {
            try {
                // 1. Get members to know turns with a fast timeout
                const fetchPromise = supabase
                    .from('love_room_members')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('joined_at', { ascending: true });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Supabase timeout")), 2000)
                );

                const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
                const data = response?.data;
                const error = response?.error;

                if (!error && data) {
                    setMembers(data as LoveRoomMember[]);
                    if (data.length > 0 && !state.currentTurn) {
                        setState(s => ({ ...s, currentTurn: data[0].nickname })); // First joiner starts
                    }
                }

                // 2. Setup Broadcast channel
                channel = supabase.channel(`game:truth:${roomId}`, {
                    config: { broadcast: { self: true } }
                });

                channel.on('broadcast', { event: 'truth_update' }, (payload: { payload: TruthOrDareState }) => {
                    setState(payload.payload);
                });

                channel.subscribe();
                channelRef.current = channel;
            } catch (err) {
                console.error("Failed to init truth or dare:", err);
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [roomId]);

    const getOpponent = () => {
        return members.find(m => m.nickname !== currentMember.nickname)?.nickname || 'Waiting for partner...';
    };

    const handleSelect = async (type: 'truth' | 'dare') => {
        if (state.currentTurn !== currentMember.nickname) return;

        const prompts = type === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

        // Opponent's turn next
        const nextTurnNick = members.find(m => m.nickname !== currentMember.nickname)?.nickname || currentMember.nickname;

        const newState: TruthOrDareState = {
            currentTurn: nextTurnNick,
            currentPrompt: randomPrompt,
            promptType: type
        };

        setState(newState);

        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'truth_update',
                payload: newState
            });
        }
    };

    if (loading) return <div className="text-gray-400 animate-pulse">Loading Game...</div>;

    const isMyTurn = state.currentTurn === currentMember.nickname;

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto h-full justify-center">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-rose-600 mb-2 flex items-center justify-center gap-2">
                    Truth or Dare <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                </h2>

                <div className="flex gap-4 justify-center text-sm mt-4">
                    <div className={`px-4 py-1 rounded-full ${isMyTurn ? 'bg-rose-500 text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                        {isMyTurn ? "Your Turn!" : `${state.currentTurn}'s Turn`}
                    </div>
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[200px] relative mt-4 mb-4">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-rose-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

                {state.currentPrompt ? (
                    <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 text-center shadow-xl relative animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 z-10">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-1.5 rounded-full text-xs font-black shadow-lg uppercase tracking-widest text-white border-2 border-white dark:border-slate-800">
                            {state.promptType}
                        </div>
                        <Heart className="w-6 h-6 text-rose-300 fill-rose-100 dark:fill-rose-900/50 mx-auto mb-3 opacity-60" />
                        <p className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-2 leading-relaxed italic">
                            "{state.currentPrompt}"
                        </p>
                        <Heart className="w-6 h-6 text-rose-300 fill-rose-100 dark:fill-rose-900/50 mx-auto mt-3 opacity-60 rotate-180" />
                    </div>
                ) : (
                    <div className="text-rose-400 dark:text-rose-500/60 text-center flex flex-col items-center gap-3 opacity-80 bg-rose-50/50 dark:bg-rose-950/20 p-8 rounded-3xl border border-rose-100/50 dark:border-rose-900/30 backdrop-blur-sm z-10 w-full shadow-sm">
                        <div className="relative">
                            <Heart className="w-12 h-12 text-rose-300 fill-rose-200 dark:fill-rose-900 animate-pulse" />
                            <Sparkles className="w-5 h-5 text-pink-400 absolute -top-1 -right-2 animate-bounce" />
                        </div>
                        <p className="font-medium">Pick Truth or Dare to start!</p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex gap-4 w-full px-4">
                <Button
                    onClick={() => handleSelect('truth')}
                    disabled={!isMyTurn}
                    className="flex-1 bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white shadow-md h-16 rounded-2xl text-lg font-bold transition-transform active:scale-95"
                >
                    Truth
                </Button>
                <Button
                    onClick={() => handleSelect('dare')}
                    disabled={!isMyTurn}
                    className="flex-1 bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-md h-16 rounded-2xl text-lg font-bold transition-transform active:scale-95"
                >
                    Dare <Flame className="w-5 h-5 ml-1" />
                </Button>
            </div>

            {!isMyTurn && state.currentTurn && members.length > 1 && (
                <p className="mt-6 text-xs text-rose-400 animate-pulse text-center">
                    Waiting for {state.currentTurn} to pick...
                </p>
            )}
        </div>
    );
}
