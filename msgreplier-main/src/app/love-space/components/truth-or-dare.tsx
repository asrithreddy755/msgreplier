"use client";

import { useEffect, useState } from 'react';
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

    useEffect(() => {
        let channel: any;

        const init = async () => {
            // 1. Get members to know turns
            const { data, error } = await supabase
                .from('love_room_members')
                .select('*')
                .eq('room_id', roomId)
                .order('joined_at', { ascending: true });

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
            setLoading(false);
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
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

        const channel = supabase.channel(`game:truth:${roomId}`);
        await channel.send({
            type: 'broadcast',
            event: 'truth_update',
            payload: newState
        });
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

            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[200px]">
                {state.currentPrompt ? (
                    <div className="w-full bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center shadow-inner relative animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-widest text-rose-500 border border-rose-100">
                            {state.promptType}
                        </div>
                        <p className="text-xl font-medium text-gray-800 mt-4 leading-relaxed">
                            "{state.currentPrompt}"
                        </p>
                    </div>
                ) : (
                    <div className="text-gray-400 text-center flex flex-col items-center gap-2 opacity-60">
                        <Sparkles className="w-10 h-10 text-rose-300" />
                        <p>Pick Truth or Dare to start!</p>
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
