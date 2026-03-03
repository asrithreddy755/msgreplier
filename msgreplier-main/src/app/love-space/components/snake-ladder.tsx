"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { LoveRoomMember, SnakeLadderState } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Dices, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Collector's Edition snakes and ladders matching snake.webp exactly
const SNAKES: Record<number, number> = { 12: 9, 33: 27, 37: 23, 41: 39, 43: 24 };
const LADDERS: Record<number, number> = { 3: 18, 6: 16, 14: 26, 30: 49 };

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
    const [lastRoll, setLastRoll] = useState<number | null>(null);
    const lastStateRef = useRef<string | null>(null);
    const pendingStateRef = useRef<SnakeLadderState | null>(null);
    const isAnimatingRef = useRef(false);

    const [visualP1, setVisualP1] = useState(1);
    const [visualP2, setVisualP2] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

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
            } finally {
                setLoading(false);
            }
        };

        init();

    }, [roomId, applyRemoteState]);

    // Set initial turn when members load
    useEffect(() => {
        if (members.length > 0) {
            setState(s => (s.currentTurn ? s : { ...s, currentTurn: members[0].nickname }));
        }
    }, [members]);

    useEffect(() => {
        let isMounted = true;
        let pollInterval: ReturnType<typeof setInterval> | null = null;
        let eventSource: EventSource | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

        const poll = async () => {
            try {
                const data = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=snake`).then(res => res.json());
                if (!isMounted) return;
                const lastGame = data?.game;
                if (lastGame?.game_state) {
                    const nextState = lastGame.game_state as SnakeLadderState;
                    const serialized = JSON.stringify(nextState);
                    if (serialized !== lastStateRef.current) {
                        applyRemoteState(nextState);
                    }
                }
            } catch {
                // ignore polling errors
            }
        };

        const startPolling = () => {
            if (pollInterval) return;
            pollInterval = setInterval(poll, 2000);
        };

        const connectSSE = () => {
            if (!isMounted) return;
            try {
                if (eventSource) eventSource.close();

                eventSource = new EventSource(`/api/love-space/games/stream?roomId=${roomId}&gameType=snake`);

                eventSource.onopen = () => {
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                };

                eventSource.addEventListener('game', (event: any) => {
                    try {
                        const payload = JSON.parse(event.data) as { game_state?: SnakeLadderState };
                        if (payload?.game_state) {
                            const serialized = JSON.stringify(payload.game_state);
                            if (serialized !== lastStateRef.current) {
                                applyRemoteState(payload.game_state);
                            }
                        }
                    } catch {
                        // ignore parse errors
                    }
                });

                eventSource.onerror = () => {
                    if (eventSource) {
                        eventSource.close();
                        eventSource = null;
                    }
                    startPolling();
                    // Attempt to reconnect
                    if (reconnectTimeout) clearTimeout(reconnectTimeout);
                    reconnectTimeout = setTimeout(connectSSE, 3000);
                };
            } catch {
                startPolling();
                if (reconnectTimeout) clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(connectSSE, 5000);
            }
        };

        connectSSE();

        return () => {
            isMounted = false;
            if (pollInterval) clearInterval(pollInterval);
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
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

    const syncNow = useCallback(async () => {
        setSyncing(true);
        try {
            const data = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=snake`).then(res => res.json());
            const lastGame = data?.game;
            if (lastGame?.game_state) {
                applyRemoteState(lastGame.game_state as SnakeLadderState);
            }
            setLastSyncAt(new Date().toISOString());
        } finally {
            setSyncing(false);
        }
    }, [roomId, applyRemoteState]);

    // Auto-sync every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            syncNow();
        }, 5000);
        return () => clearInterval(interval);
    }, [syncNow]);

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
        if (!isMyTurn || state.winner || rolling || isAnimating || myPlayerNum !== forPlayerNum) return;

        setRolling(true);

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
            } else {
                actionMessage = `${currentMember.nickname} rolled ${roll} and moved to ${newPos}.`;
            }
        } else {
            actionMessage = `${currentMember.nickname} rolled ${roll} but needs exactly ${50 - newPos} to finish!`;
        }

        let winner = null;
        if (newPos === 50) {
            winner = currentMember.nickname;
            actionMessage = `Player ${currentMember.nickname} reached square 50 and won the game! 🎉`;
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
            lastPathPlayer: myPlayerNum
        };

        setLastRoll(roll);
        setRolling(false);
        lastStateRef.current = JSON.stringify(newState);

        await fetch('/api/love-space/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, gameType: 'snake', gameState: newState })
        });

        if (path.length > 0) {
            await playAnimationAndSync(myPlayerNum, path, newState);
        } else {
            setState(newState);
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

    if (loading) return <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading Game...</div>;

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
                    <button
                        type="button"
                        onClick={syncNow}
                        disabled={syncing}
                        className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-xs transition-all ${syncing ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
                    >
                        {syncing ? 'Syncing...' : 'Sync'}
                    </button>
                </div>
                {lastSyncAt && (
                    <div className="mt-1 text-[10px] sm:text-xs text-gray-400">
                        Synced
                    </div>
                )}
            </div>

            {state.winner ? (
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
                    {/* Interactive Player Hub */}
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

                    {/* Central Single Dice */}
                    <div className="flex flex-col items-center justify-center my-2 sm:my-6 relative w-full">
                        {isMyTurn && !rolling && !isAnimating && !state.winner && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-orange-400/30 to-rose-400/30 animate-pulse blur-xl z-0"></div>
                        )}
                        <button
                            onClick={() => isMyTurn && !rolling && !isAnimating && !state.winner ? rollDice(myPlayerNum) : undefined}
                            disabled={!isMyTurn || rolling || isAnimating || !!state.winner}
                            className={`
                                relative dice-container w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl flex items-center justify-center border-3 sm:border-4 border-white/90 dark:border-slate-700/90 backdrop-blur-md z-10 transition-all duration-300
                                ${rolling ? 'animate-dice-roll shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-gradient-to-br from-orange-400 to-rose-500' : ''}
                                ${isMyTurn && !rolling && !isAnimating && !state.winner ? 'cursor-pointer hover:scale-105 active:scale-95 bg-gradient-to-br from-orange-400 to-rose-500 hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] hover:-translate-y-1' : ''}
                                ${(!isMyTurn || !!state.winner) && !rolling ? 'cursor-default bg-gray-100 dark:bg-slate-800 opacity-90' : ''}
                            `}
                        >
                            {!rolling && lastRoll ? (
                                <div className="flex flex-col items-center justify-center">
                                    <span className={`font-black text-3xl sm:text-6xl drop-shadow-lg ${isMyTurn || rolling || state.winner ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{lastRoll}</span>
                                </div>
                            ) : (
                                <Dices className={`w-8 h-8 sm:w-14 sm:h-14 drop-shadow-md transition-colors ${isMyTurn || rolling ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                            )}
                        </button>
                    </div>

                    {/* Fixed-height container to prevent board from shifting up and down */}
                    <div className="h-12 sm:h-16 w-full flex flex-col items-center justify-start z-10">
                        {isMyTurn && !rolling && !isAnimating && !state.winner ? (
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
            )}

            {/* The Board */}
            <div className="w-full mt-2 sm:mt-6 relative overflow-hidden shadow-2xl rounded-xl border-4 border-[#3E2723] bg-white aspect-[2/1]">
                {/* Custom User Board Image */}
                <img src="/snake.webp" alt="Snake and Ladder Board" className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none" />

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
        </div>
    );
}
