"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoomMember, SnakeLadderState } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Dices, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Collector's Edition snakes and ladders 
const SNAKES: Record<number, number> = { 43: 24, 41: 39, 23: 22, 28: 34, 12: 9 };
const LADDERS: Record<number, number> = { 3: 21, 4: 17, 29: 49 }; // 26 handled dynamically

// 5x10 board logic
const BOARDS_CELLS = Array.from({ length: 50 }, (_, i) => i + 1);

export function SnakeLadder({ roomId, currentMember }: { roomId: string, currentMember: LoveRoomMember }) {
    const [state, setState] = useState<SnakeLadderState>({
        player1Position: 1,
        player2Position: 1,
        currentTurn: null,
        winner: null,
    });
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [rolling, setRolling] = useState(false);
    const [lastRoll, setLastRoll] = useState<number | null>(null);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        let channel: any;

        const init = async () => {
            try {
                const fetchPromise = supabase
                    .from('love_room_members')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('joined_at', { ascending: true });

                const statePromise = supabase
                    .from('love_games')
                    .select('*')
                    .eq('room_id', roomId)
                    .eq('game_type', 'snake')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                const safeStatePromise = (async () => {
                    try { return await statePromise; } catch { return null; }
                })();

                const timeoutPromise = new Promise<any[]>((_, reject) =>
                    setTimeout(() => reject(new Error("Supabase timeout")), 1500)
                );

                try {
                    const [membersRes, stateRes] = await Promise.race([
                        Promise.all([fetchPromise, safeStatePromise]),
                        timeoutPromise
                    ]) as any;

                    const membersData = membersRes?.data;
                    const membersError = membersRes?.error;

                    if (!membersError && membersData) {
                        const sortedData = membersData.sort((a: any, b: any) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
                        setMembers(sortedData as LoveRoomMember[]);

                        // We set currentTurn but ONLY if state doesn't override it later
                        if (sortedData.length > 0 && !state.currentTurn) {
                            setState(s => ({ ...s, currentTurn: sortedData[0].nickname }));
                        }
                    }

                    const lastGame = stateRes?.data;
                    if (lastGame && lastGame.game_state) {
                        const parsed = lastGame.game_state as SnakeLadderState;
                        setState(parsed);
                    }
                } catch (e) {
                    console.warn("Init timeout/error:", e);
                }

                channel = supabase.channel(`game:snake:${roomId}`, {
                    config: { broadcast: { self: true } }
                });

                channel.on('broadcast', { event: 'snake_update' }, (payload: { payload: { state: SnakeLadderState, roll?: number } }) => {
                    setState(payload.payload.state);
                    if (payload.payload.roll) {
                        setLastRoll(payload.payload.roll);
                    }
                });

                channel.subscribe();
                channelRef.current = channel;
            } catch (err) {
                console.error("Failed to init snake ladder:", err);
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [roomId]);

    const getPlayerIndex = (nickname: string) => {
        return members.findIndex(m => m.nickname === nickname) === 0 ? 1 : 2;
    };

    const roomCreator = members.length > 0 ? members[0] : null;

    const isMyTurn = state.currentTurn === currentMember.nickname;
    const myPlayerNum = getPlayerIndex(currentMember.nickname);

    const rollDice = async (forPlayerNum: number) => {
        if (!isMyTurn || state.winner || rolling || myPlayerNum !== forPlayerNum) return;

        setRolling(true);

        // Simulate roll animation delay (longer to sync with CSS animation)
        await new Promise(r => setTimeout(r, 800));

        const roll = Math.floor(Math.random() * 6) + 1;
        let newPos = myPlayerNum === 1 ? state.player1Position : state.player2Position;
        let actionMessage: string | null = null;

        if (newPos + roll <= 50) {
            newPos += roll;

            if (newPos === 26) {
                const isLadder = Math.random() < 0.5;
                if (isLadder) {
                    newPos = 47;
                    actionMessage = `${currentMember.nickname} reached square 26: Climbed the ladder to 47!`;
                } else {
                    newPos = 5;
                    actionMessage = `${currentMember.nickname} reached square 26: Slid down the snake to 5!`;
                }
            } else if (SNAKES[newPos]) {
                const dest = SNAKES[newPos];
                actionMessage = `${currentMember.nickname} hit a snake at ${newPos}, sliding to ${dest}!`;
                newPos = dest;
            } else if (LADDERS[newPos]) {
                const dest = LADDERS[newPos];
                actionMessage = `${currentMember.nickname} hit a ladder at ${newPos}, climbing to ${dest}!`;
                newPos = dest;
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

        const nextTurn = members.find(m => m.nickname !== currentMember.nickname)?.nickname || currentMember.nickname;

        const newState: SnakeLadderState = {
            ...state,
            player1Position: myPlayerNum === 1 ? newPos : state.player1Position,
            player2Position: myPlayerNum === 2 ? newPos : state.player2Position,
            currentTurn: winner ? null : (roll === 6 ? currentMember.nickname : nextTurn), // Roll 6 = extra turn
            winner,
            lastActionMessage: actionMessage || (roll === 6 ? `${currentMember.nickname} rolled a 6 and gets another turn!` : undefined)
        };

        setState(newState);
        setLastRoll(roll);
        setRolling(false);

        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'snake_update',
                payload: { state: newState, roll }
            });
        }

        if (winner) {
            await supabase.from('love_games').insert([{
                room_id: roomId,
                game_type: 'snake',
                game_state: newState
            }]);
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
            lastActionMessage: null
        };
        setState(newState);
        setLastRoll(null);

        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'snake_update',
                payload: { state: newState }
            });
        }
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
        if (idx === -1) return { x: 0, y: 0 };
        const r = Math.floor(idx / 10);
        const c = idx % 10;
        return { x: c * 10 + 5, y: r * 20 + 10 };
    };

    if (loading) return <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading Game...</div>;

    // Get colors for players
    const p1Color = "bg-pink-500";
    const p2Color = "bg-blue-500";
    const myColor = myPlayerNum === 1 ? p1Color : p2Color;

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto h-full pb-8">
            <div className="mb-4 text-center w-full">
                <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-center justify-center gap-2">
                    Snake & Ladder <Dices className="w-5 h-5 text-orange-500" />
                </h2>
                <div className="flex gap-4 justify-center text-sm items-center">
                    <div className={`px-4 py-1 rounded-full text-white shadow-sm flex items-center gap-2 ${myColor}`}>
                        <div className="w-2 h-2 bg-white rounded-full" /> You
                    </div>
                    <div className={`px-4 py-1 rounded-full ${isMyTurn ? 'bg-orange-500 text-white shadow-md animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                        {state.winner ? 'Game Over' : (isMyTurn ? 'Your Turn' : 'Waiting...')}
                    </div>
                </div>
            </div>

            {state.winner ? (
                <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl text-center border border-orange-200 dark:border-orange-900/50 mt-4 shadow-inner mb-6 w-full animate-in zoom-in slide-in-from-bottom-4">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{state.winner} wins!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{state.winner === currentMember.nickname ? 'You conquered the board! 🎉' : 'Better luck next time! 🥺'}</p>
                    <Button
                        onClick={resetGame}
                        className={`w-full rounded-xl ${roomCreator && currentMember.id !== roomCreator.id ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                        Play Again <RotateCcw className="w-4 h-4 ml-2" />
                    </Button>
                    {roomCreator && currentMember.id !== roomCreator.id && (
                        <p className="text-xs text-gray-400 mt-2">Waiting for {roomCreator.nickname} to restart...</p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 w-full mt-2">
                    {/* Interactive Player Hub */}
                    <div className="flex gap-4 w-full justify-between items-stretch">

                        {/* Player 1 Box */}
                        <div
                            onClick={() => myPlayerNum === 1 && !rolling && isMyTurn ? rollDice(1) : undefined}
                            className={`flex flex-col items-center bg-gray-50 dark:bg-slate-800 p-4 rounded-3xl border ${myPlayerNum === 1 && isMyTurn && !rolling ? 'border-pink-400 dark:border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer hover:bg-pink-50' : 'border-gray-200 dark:border-slate-700 opacity-80'} w-1/2 transition-all`}
                        >
                            <p className="text-sm font-bold text-pink-600 dark:text-pink-400 mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                {members[0] ? (members[0].nickname === currentMember.nickname ? 'You (P1)' : members[0].nickname) : 'Player 1'}
                            </p>
                            <div className="flex items-center justify-center w-full mt-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-gray-400 uppercase font-black">Position</span>
                                    <span className="text-3xl font-black text-slate-700 dark:text-slate-200">{state.player1Position}</span>
                                </div>
                            </div>
                            {state.currentTurn === (members[0]?.nickname || '') && !state.winner && (
                                <div className="mt-3 text-[10px] font-bold text-white bg-pink-500 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                                    Current Turn
                                </div>
                            )}
                        </div>

                        {/* Player 2 Box */}
                        <div
                            onClick={() => myPlayerNum === 2 && !rolling && isMyTurn ? rollDice(2) : undefined}
                            className={`flex flex-col items-center bg-gray-50 dark:bg-slate-800 p-4 rounded-3xl border ${myPlayerNum === 2 && isMyTurn && !rolling && !state.winner ? 'border-blue-400 dark:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer hover:bg-blue-50' : 'border-gray-200 dark:border-slate-700 opacity-80'} w-1/2 transition-all`}
                        >
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                {members[1] ? (members[1].nickname === currentMember.nickname ? 'You (P2)' : members[1].nickname) : 'Player 2'}
                            </p>
                            <div className="flex items-center justify-center w-full mt-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-gray-400 uppercase font-black">Position</span>
                                    <span className="text-3xl font-black text-slate-700 dark:text-slate-200">{state.player2Position}</span>
                                </div>
                            </div>
                            {state.currentTurn === (members[1]?.nickname || '') && !state.winner && (
                                <div className="mt-3 text-[10px] font-bold text-white bg-blue-500 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                                    Current Turn
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Central Single Dice */}
                    <div className="flex flex-col items-center justify-center my-6 relative w-full">
                        {isMyTurn && !rolling && !state.winner && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-orange-400/30 to-rose-400/30 animate-pulse blur-xl z-0"></div>
                        )}
                        <button
                            onClick={() => isMyTurn && !rolling && !state.winner ? rollDice(myPlayerNum) : undefined}
                            disabled={!isMyTurn || rolling || !!state.winner}
                            className={`
                                relative dice-container w-28 h-28 rounded-3xl shadow-xl flex items-center justify-center border-4 border-white/90 dark:border-slate-700/90 backdrop-blur-md z-10 transition-all duration-300
                                ${rolling ? 'animate-dice-roll shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-gradient-to-br from-orange-400 to-rose-500' : ''}
                                ${isMyTurn && !rolling && !state.winner ? 'cursor-pointer hover:scale-105 active:scale-95 bg-gradient-to-br from-orange-400 to-rose-500 hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] hover:-translate-y-1' : ''}
                                ${(!isMyTurn || !!state.winner) && !rolling ? 'cursor-default bg-gray-100 dark:bg-slate-800 opacity-90' : ''}
                            `}
                        >
                            {!rolling && lastRoll ? (
                                <div className="flex flex-col items-center justify-center">
                                    <span className={`font-black text-6xl drop-shadow-lg ${isMyTurn || rolling || state.winner ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{lastRoll}</span>
                                </div>
                            ) : (
                                <Dices className={`w-14 h-14 drop-shadow-md transition-colors ${isMyTurn || rolling ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                            )}
                        </button>

                        {isMyTurn && !rolling && !state.winner && (
                            <div className="mt-4 text-sm font-bold text-orange-600 dark:text-orange-400 animate-bounce bg-orange-100 dark:bg-orange-900/30 px-4 py-1.5 rounded-full shadow-sm">
                                Tap to Roll!
                            </div>
                        )}
                    </div>

                    {lastRoll === 6 && !rolling && (
                        <p className="text-xs font-bold text-orange-500 animate-pulse">Rolled a 6! Extra turn!</p>
                    )}

                    {/* Event Log Window */}
                    {state.lastActionMessage && !rolling && (
                        <div className="w-full text-center mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm font-medium animate-pulse border border-yellow-200 dark:border-yellow-700">
                            {state.lastActionMessage}
                        </div>
                    )}
                </div>
            )}

            {/* The Board */}
            <div className="w-full mt-6 relative overflow-hidden shadow-2xl rounded-xl border-4 border-green-900 dark:border-green-600 bg-white aspect-[525/485]">
                {/* Background Board Image */}
                <img
                    src="/snake.webp"
                    alt="Snake and Ladder Board"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />

                {/* Player Pins Mapping */}
                {/* We map coordinates using exact percentages so they scale with the image aspect ratio */}
                {flattenedRows.map((num, idx) => {
                    const isP1 = state.player1Position === num;
                    const isP2 = state.player2Position === num;

                    if (!isP1 && !isP2) return null; // Only render active player cells

                    // In a 10x5 grid, width per cell is 10%, height is 20%
                    const r = Math.floor(idx / 10);
                    const c = idx % 10;

                    const leftPercent = c * 10;
                    const topPercent = r * 20;

                    return (
                        <div
                            key={`player-pos-${num}`}
                            className="absolute pointer-events-none flex items-center justify-center gap-[2px]"
                            style={{
                                left: `${leftPercent}%`,
                                top: `${topPercent}%`,
                                width: '10%',
                                height: '20%'
                            }}
                        >
                            {isP1 && <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-500 shadow-lg border-2 border-white z-20 animate-bounce" title="Player 1" />}
                            {isP2 && <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 shadow-lg border-2 border-white z-20 animate-bounce" title="Player 2" style={isP1 ? { animationDelay: '0.2s' } : {}} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
