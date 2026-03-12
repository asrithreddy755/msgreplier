"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { LoveRoomMember, SnakeLadderState } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Dices, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import SnakeDice from './SnakeDice';

// Collector's Edition snakes and ladders matching snake.webp exactly
const SNAKES: Record<number, number> = { 28: 9, 33: 27, 38: 18, 41: 39, 43: 24 };
const LADDERS: Record<number, number> = { 3: 24, 6: 16, 14: 26, 30: 49 };

// 5x10 board logic
const BOARDS_CELLS = Array.from({ length: 50 }, (_, i) => i + 1);

export function SnakeLadder({ roomId, currentMember, otherOnline, members = [] }: { roomId: string, currentMember: LoveRoomMember, otherOnline?: boolean, members?: LoveRoomMember[] }) {
    const [state, setState] = useState<SnakeLadderState>({
        player1Position: 1,
        player2Position: 1,
        currentTurn: null,
        winner: null,
    });
    // const [members, setMembers] = useState<LoveRoomMember[]>([]); // Using prop instead
    const [loading, setLoading] = useState(true);
    const [rolling, setRolling] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastRoll, setLastRoll] = useState<number | null>(null);
    const lastStateRef = useRef<string | null>(null);
    const pendingStateRef = useRef<SnakeLadderState | null>(null);
    const isAnimatingRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const [visualP1, setVisualP1] = useState(1);
    const [visualP2, setVisualP2] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);


    useEffect(() => {
        isAnimatingRef.current = isAnimating;
        if (!isAnimating) {
            setVisualP1(state.player1Position);
            setVisualP2(state.player2Position);
        }
    }, [state.player1Position, state.player2Position, isAnimating]);

    const playAnimationAndSync = async (playerNum: number, path: number[], finalState: SnakeLadderState) => {
        setIsAnimating(true);
        try {
            const setVisual = playerNum === 1 ? setVisualP1 : setVisualP2;
            await new Promise(r => setTimeout(r, 200));
            for (const step of path) {
                setVisual(step);
                await new Promise(r => setTimeout(r, 400));
            }
            lastStateRef.current = JSON.stringify(finalState);
            setState(finalState);
        } finally {
            setIsAnimating(false);
        }
    };

    const visualP1Ref = useRef(visualP1);
    const visualP2Ref = useRef(visualP2);
    useEffect(() => { visualP1Ref.current = visualP1; }, [visualP1]);
    useEffect(() => { visualP2Ref.current = visualP2; }, [visualP2]);

    const buildPath = (from: number, to: number) => {
        const path: number[] = [];
        if (to > from) {
            for (let i = from + 1; i <= to; i++) path.push(i);
        } else if (to < from) {
            path.push(to);
        }
        return path;
    };

    const applyRemoteState = useCallback((nextState: SnakeLadderState) => {
        if (isAnimatingRef.current) {
            pendingStateRef.current = nextState;
            return;
        }

        if (nextState.lastRollValue !== undefined) {
            setLastRoll(nextState.lastRollValue);
        }

        const p1From = visualP1Ref.current;
        const p2From = visualP2Ref.current;
        const p1To = nextState.player1Position;
        const p2To = nextState.player2Position;

        const p1Changed = p1From !== p1To;
        const p2Changed = p2From !== p2To;

        if (p1Changed && !p2Changed) {
            const path = (nextState.lastPathPlayer === 1 && nextState.lastPath?.length) ? nextState.lastPath : buildPath(p1From, p1To);
            if (path.length > 0) {
                playAnimationAndSync(1, path, nextState);
                return;
            }
        } else if (!p1Changed && p2Changed) {
            const path = (nextState.lastPathPlayer === 2 && nextState.lastPath?.length) ? nextState.lastPath : buildPath(p2From, p2To);
            if (path.length > 0) {
                playAnimationAndSync(2, path, nextState);
                return;
            }
        }

        lastStateRef.current = JSON.stringify(nextState);
        setState(nextState);
    }, []);

    useEffect(() => {
        const init = async () => {
            if (hasInitializedRef.current) return;
            hasInitializedRef.current = true;
            try {
                const stateRes = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=snake`).then(res => res.json());

                // members are now passed via props

                const lastGame = stateRes?.game;
                if (lastGame?.game_state) {
                    const parsed = lastGame.game_state as SnakeLadderState;
                    applyRemoteState(parsed);
                }
            } catch (err) {
                console.error("Failed to init snake ladder:", err);
                hasInitializedRef.current = false;
            } finally {
                setLoading(false);
            }
        };

        if (roomId && members.length > 0) {
            init();
        }

    }, [roomId, members.length, applyRemoteState]);

    // Set initial turn when members load
    useEffect(() => {
        if (members.length > 0) {
            setState(s => (s.currentTurn ? s : { ...s, currentTurn: members[0].nickname }));
        }
    }, [members]);

    useEffect(() => {
        let isMounted = true;
        let channel: ReturnType<typeof supabase.channel> | null = null;

        channel = supabase
            .channel(`public:love_games:snake:${roomId}`)
            .on(
                'broadcast',
                { event: 'dice_start' },
                (payload) => {
                    if (!isMounted) return;
                    setRolling(true);
                    setIsProcessing(true);
                }
            )
            .on(
                'broadcast',
                { event: 'dice_result' },
                (payload) => {
                    if (!isMounted) return;
                    if (payload.payload?.rollValue) {
                        setLastRoll(payload.payload.rollValue);
                    }
                    setRolling(false);
                }
            )
            .on(
                'postgres_changes',
                {
                    // '*' catches both INSERT (first move) and UPDATE (subsequent moves).
                    event: '*',
                    schema: 'public',
                    table: 'love_games',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload: any) => {
                    if (!isMounted) return;

                    const newGame = payload.new;
                    if (newGame.game_type !== 'snake') return;

                    if (newGame?.game_state) {
                        const parsed = newGame.game_state as SnakeLadderState;
                        const serialized = JSON.stringify(parsed);
                        if (serialized !== lastStateRef.current) {
                            setRolling(false);
                            setIsProcessing(false);
                            applyRemoteState(parsed);
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // We can drop the manual reconnect logic since Supabase JS client
                    // handles Realtime reconnections automatically out of the box.
                    console.log('Realtime Snake Ladder Subscribed');
                }
            });

        channelRef.current = channel;

        return () => {
            isMounted = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, [roomId, applyRemoteState]);

    useEffect(() => {
        if (!isAnimating && pendingStateRef.current) {
            const nextState = pendingStateRef.current;
            pendingStateRef.current = null;
            lastStateRef.current = JSON.stringify(nextState);
            setState(nextState);
        }
    }, [isAnimating]);



    useEffect(() => {
        if (state.winner || members.length === 0) return;
        const hasTurn = state.currentTurn && members.some(m => m.nickname === state.currentTurn);
        if (!hasTurn) {
            const next = members[0].nickname;
            setState(s => (s.currentTurn === next ? s : { ...s, currentTurn: next }));
        }
    }, [members, state.currentTurn, state.winner]);

    const getPlayerIndex = (nickname: string) => {
        if (!members || members.length === 0) return 1;
        // The creator (first to join) is always Player 1
        const player1 = members[0];
        return player1.nickname === nickname ? 1 : 2;
    };

    const roomCreator = members.length > 0 ? members[0] : null;

    const isMyTurn = state.currentTurn === currentMember.nickname;
    const myPlayerNum = getPlayerIndex(currentMember.nickname);

    const rollDice = async (forPlayerNum: number) => {
        if (!isMyTurn || state.winner || rolling || isAnimating || isProcessing || myPlayerNum !== forPlayerNum || !otherOnline) return;

        setIsProcessing(true);
        setRolling(true);

        channelRef.current?.send({
            type: 'broadcast',
            event: 'dice_start',
            payload: { playerNum: myPlayerNum }
        });

        try {
            // Simulate roll animation delay (longer to sync with CSS animation)
            await new Promise(r => setTimeout(r, 800));

            const roll = Math.floor(Math.random() * 6) + 1;
            let newPos = myPlayerNum === 1 ? state.player1Position : state.player2Position;
            let actionMessage: string | null = null;
            const path: number[] = [];

            if (newPos + roll <= 50) {
                for (let i = newPos + 1; i <= newPos + roll; i++) path.push(i);
                newPos += roll;

                if (SNAKES[newPos]) {
                    const dest = SNAKES[newPos];
                    actionMessage = `${currentMember.nickname} hit a snake at ${newPos}, sliding to ${dest}!`;
                    newPos = dest;
                    path.push(newPos);
                } else if (LADDERS[newPos]) {
                    const dest = LADDERS[newPos];
                    actionMessage = `${currentMember.nickname} hit a ladder at ${newPos}, climbing to ${dest}!`;
                    newPos = dest;
                    path.push(newPos);
                }
            }

            let winner = null;
            if (newPos === 50) {
                winner = currentMember.nickname;
                actionMessage = `${currentMember.nickname} reached square 50 and won the game! 🎉`;
            }

            const other = members.find(m => m.nickname !== currentMember.nickname);
            const nextTurn = other ? other.nickname : currentMember.nickname;

            const newState: SnakeLadderState = {
                ...state,
                player1Position: myPlayerNum === 1 ? newPos : state.player1Position,
                player2Position: myPlayerNum === 2 ? newPos : state.player2Position,
                currentTurn: winner ? null : (roll === 6 ? currentMember.nickname : nextTurn), // Roll 6 = extra turn
                winner,
                lastActionMessage: actionMessage || (roll === 6 ? `${currentMember.nickname} rolled a 6 and gets another turn!` : undefined),
                lastPath: path,
                lastPathPlayer: myPlayerNum,
                lastRollValue: roll
            };

            setLastRoll(roll);
            setRolling(false);

            channelRef.current?.send({
                type: 'broadcast',
                event: 'dice_result',
                payload: { playerNum: myPlayerNum, rollValue: roll }
            });

            lastStateRef.current = JSON.stringify(newState);

            const apiPromise = fetch('/api/love-space/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, gameType: 'snake', gameState: newState })
            });

            if (path.length > 0) {
                await Promise.all([playAnimationAndSync(myPlayerNum, path, newState), apiPromise]);
            } else {
                setState(newState);
                await apiPromise;
            }
        } finally {
            setIsProcessing(false);
            setRolling(false);
        }
    };

    const resetGame = async () => {
        if (roomCreator && currentMember.id !== roomCreator.id) {
            toast.error(`Only ${roomCreator.nickname} can restart the game!`);
            return;
        }

        const nextTurnNick = members[0]?.nickname || null;
        const newState: SnakeLadderState = {
            player1Position: 1,
            player2Position: 1,
            currentTurn: nextTurnNick,
            winner: null,
            lastActionMessage: null,
            lastPath: [],
            lastPathPlayer: undefined
        };
        setState(newState);
        setLastRoll(null);

        await fetch('/api/love-space/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, gameType: 'snake', gameState: newState })
        });
    };

    // Board generation (memoized to avoid regenerating on every render/state update)
    const flattenedRows = useMemo(() => {
        const rows = [];
        for (let i = 4; i >= 0; i--) {
            const row = BOARDS_CELLS.slice(i * 10, (i + 1) * 10);
            if (i % 2 !== 0) row.reverse(); // Odd rows reverse for snake pattern
            rows.push(row);
        }
        return rows.flat();
    }, []);

    const getCellCenter = (num: number) => {
        const idx = flattenedRows.indexOf(num);
        if (idx === -1) return { left: '0%', top: '80%', width: '10%', height: '20%' };
        const r = Math.floor(idx / 10);
        const c = idx % 10;
        return {
            left: `${c * 10}%`,
            top: `${r * 20}%`,
            width: '10%',
            height: '20%'
        };
    };

    const getCellSVGCoords = (num: number) => {
        const idx = flattenedRows.indexOf(num);
        if (idx === -1) return { x: 50, y: 450 }; // default to square 1
        const r = Math.floor(idx / 10);
        const c = idx % 10;
        return {
            x: c * 100 + 50,
            y: r * 100 + 50
        };
    };

    // Get colors for players
    const p1Color = "bg-pink-500";
    const p2Color = "bg-blue-500";
    const myColor = myPlayerNum === 1 ? p1Color : p2Color;

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto pb-4 sm:pb-8 gap-2 sm:gap-3">
            <div className="text-center w-full">
                <h2 className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1 sm:mb-2 flex items-center justify-center gap-1.5 sm:gap-2">
                    Snake & Ladder <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </h2>
                <div className="flex gap-2 sm:gap-3 justify-center text-[10px] sm:text-xs items-center">
                    <div className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-white shadow-sm flex items-center gap-1.5 sm:gap-2 ${myColor}`}>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" /> You
                    </div>
                    <div className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full ${isMyTurn ? 'bg-orange-500 text-white shadow-md animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                        {state.winner ? 'Game Over' : (isMyTurn ? 'Your Turn' : 'Waiting...')}
                    </div>
                </div>
            </div>

            {
                state.winner ? (
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-center border border-orange-200 dark:border-orange-900/50 shadow-inner w-full animate-in zoom-in slide-in-from-bottom-4">
                        <Trophy className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-1 sm:mb-2" />
                        <h3 className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-0.5 sm:mb-1">{state.winner} wins!</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-sm">{state.winner === currentMember.nickname ? 'You conquered the board! 🎉' : 'Better luck next time! 🥺'}</p>
                        <Button
                            onClick={resetGame}
                            className={`w-full rounded-xl ${roomCreator && currentMember.id !== roomCreator.id ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                        >
                            Play Again <RotateCcw className="w-4 h-4 ml-2" />
                        </Button>
                        {roomCreator && currentMember.id !== roomCreator.id && (
                            <p className="text-xs text-gray-400 mt-1.5">Waiting for {roomCreator.nickname} to restart...</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 sm:gap-6 w-full">
                        {/* Interactive Player Hub — skeleton while initial fetch is in-flight */}
                        {loading ? (
                            <div className="flex gap-2 sm:gap-4 w-full justify-between items-stretch">
                                <div className="w-1/2 h-24 rounded-2xl sm:rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                                <div className="w-1/2 h-24 rounded-2xl sm:rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                            </div>
                        ) : (
                            <div className="flex gap-2 sm:gap-4 w-full justify-between items-stretch">

                                {/* Player 1 Box */}
                                <div
                                    onClick={() => myPlayerNum === 1 && !rolling && !isAnimating && isMyTurn ? rollDice(1) : undefined}
                                    className={`flex flex-col items-center bg-gray-50 dark:bg-slate-800 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border ${myPlayerNum === 1 && isMyTurn && !rolling && !isAnimating ? 'border-pink-400 dark:border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer hover:bg-pink-50' : 'border-gray-200 dark:border-slate-700 opacity-80'} w-1/2 transition-all`}
                                >
                                    <p className="text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400 mb-0.5 sm:mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                        {members[0] ? (members[0].nickname === currentMember.nickname ? 'You (P1)' : members[0].nickname) : 'Player 1'}
                                    </p>
                                    <div className="flex items-center justify-center w-full sm:mt-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black">Position</span>
                                            <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-200">{state.player1Position}</span>
                                        </div>
                                    </div>
                                    {state.currentTurn === (members[0]?.nickname || '') && !state.winner && (
                                        <div className="mt-1 sm:mt-3 text-[9px] sm:text-[10px] font-bold text-white bg-pink-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                                            Current Turn
                                        </div>
                                    )}
                                </div>

                                {/* Player 2 Box */}
                                <div
                                    onClick={() => myPlayerNum === 2 && !rolling && !isAnimating && isMyTurn ? rollDice(2) : undefined}
                                    className={`flex flex-col items-center bg-gray-50 dark:bg-slate-800 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border ${myPlayerNum === 2 && isMyTurn && !rolling && !isAnimating && !state.winner ? 'border-blue-400 dark:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer hover:bg-blue-50' : 'border-gray-200 dark:border-slate-700 opacity-80'} w-1/2 transition-all`}
                                >
                                    <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mb-0.5 sm:mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                        {members[1] ? (members[1].nickname === currentMember.nickname ? 'You (P2)' : members[1].nickname) : 'Player 2'}
                                    </p>
                                    <div className="flex items-center justify-center w-full sm:mt-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black">Position</span>
                                            <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-200">{state.player2Position}</span>
                                        </div>
                                    </div>
                                    {state.currentTurn === (members[1]?.nickname || '') && !state.winner && (
                                        <div className="mt-1 sm:mt-3 text-[9px] sm:text-[10px] font-bold text-white bg-blue-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                                            Current Turn
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* Central Single Dice — skeleton while initial fetch is in-flight */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center my-2 sm:my-6 w-full">
                                <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center my-2 sm:my-6 relative w-full">
                                {isMyTurn && !rolling && !isAnimating && !state.winner && !isProcessing && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-orange-400/30 to-rose-400/30 animate-pulse blur-xl z-0 pointer-events-none"></div>
                                )}
                                <div className="z-10 relative mt-2 sm:mt-4 transform scale-[1.2] sm:scale-[1.6]">
                                    <SnakeDice
                                        isRolling={rolling}
                                        diceNumber={lastRoll}
                                        colour={state.currentTurn === roomCreator?.nickname ? 'red' : 'blue'}
                                        onDiceClick={() => isMyTurn && !rolling && !isAnimating && !isProcessing && !state.winner ? rollDice(myPlayerNum) : undefined}
                                        playerName={state.currentTurn || 'Rolling...'}
                                        isMyTurn={isMyTurn && !isProcessing}
                                        disabled={!isMyTurn || rolling || isAnimating || isProcessing || !!state.winner}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Fixed-height container to prevent board from shifting up and down */}
                        <div className="h-12 sm:h-16 w-full flex flex-col items-center justify-start z-10">
                            {!otherOnline ? (
                                <div className="text-xs sm:text-sm font-bold text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm">
                                    Partner Offline
                                </div>
                            ) : isMyTurn && !rolling && !isAnimating && !state.winner ? (
                                <div className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 animate-bounce bg-orange-100 dark:bg-orange-900/30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm">
                                    Tap to Roll!
                                </div>
                            ) : lastRoll === 6 && !rolling ? (
                                <p className="text-xs sm:text-sm font-bold text-orange-500 animate-pulse bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                                    Rolled a 6! Extra turn!
                                </p>
                            ) : state.lastActionMessage && !rolling ? (
                                <div className="w-full text-center p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs sm:text-sm font-medium animate-pulse border border-yellow-200 dark:border-yellow-700">
                                    {state.lastActionMessage}
                                </div>
                            ) : null}
                        </div>
                    </div>
                )
            }

            {/* The Board */}
            <div className="w-full mt-2 sm:mt-6 relative overflow-hidden shadow-2xl rounded-xl border-4 border-[#3E2723] bg-white aspect-[2/1]">
                {/* Board image — priority ensures the browser preloads this LCP asset immediately */}
                <Image
                    src="/snake.webp"
                    alt="Snake and Ladder Board"
                    fill
                    priority
                    className="object-fill z-0 pointer-events-none"
                    sizes="(max-width: 640px) 100vw, 384px"
                />

                {/* Player 1 Pin */}
                <div
                    className="absolute z-20 flex items-center justify-center transition-all duration-300 ease-in-out"
                    style={getCellCenter(visualP1)}
                >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-500 shadow-[0_4px_10px_rgba(236,72,153,0.8)] border-2 border-white animate-bounce" title={members[0] ? members[0].nickname : "Player 1"} />
                </div>

                {/* Player 2 Pin */}
                <div
                    className="absolute z-20 flex items-center justify-center transition-all duration-300 ease-in-out"
                    style={getCellCenter(visualP2)}
                >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 shadow-[0_4px_10px_rgba(59,130,246,0.8)] border-2 border-white animate-bounce ${visualP1 === visualP2 ? 'ml-6 sm:ml-8' : ''}`} title={members[1] ? members[1].nickname : "Player 2"} />
                </div>
            </div>
        </div >
    );
}
