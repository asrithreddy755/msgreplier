"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoomMember, SnakeLadderState } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Dices, Trophy, RotateCcw } from 'lucide-react';

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

    useEffect(() => {
        let channel: any;

        const init = async () => {
            const { data, error } = await supabase
                .from('love_room_members')
                .select('*')
                .eq('room_id', roomId)
                .order('joined_at', { ascending: true });

            if (!error && data) {
                setMembers(data as LoveRoomMember[]);
                if (data.length > 0 && !state.currentTurn) {
                    setState(s => ({ ...s, currentTurn: data[0].nickname }));
                }
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
            setLoading(false);
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [roomId]);

    const getPlayerIndex = (nickname: string) => {
        return members.findIndex(m => m.nickname === nickname) === 0 ? 1 : 2;
    };

    const isMyTurn = state.currentTurn === currentMember.nickname;
    const myPlayerNum = getPlayerIndex(currentMember.nickname);

    const rollDice = async (forPlayerNum: number) => {
        if (!isMyTurn || state.winner || rolling || myPlayerNum !== forPlayerNum) return;

        setRolling(true);

        // Simulate roll animation delay (longer to sync with CSS animation)
        await new Promise(r => setTimeout(r, 600));

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

        const channel = supabase.channel(`game:snake:${roomId}`);
        await channel.send({
            type: 'broadcast',
            event: 'snake_update',
            payload: { state: newState, roll }
        });

        if (winner) {
            await supabase.from('love_games').insert([{
                room_id: roomId,
                game_type: 'snake',
                game_state: newState
            }]);
        }
    };

    const resetGame = async () => {
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

        const channel = supabase.channel(`game:snake:${roomId}`);
        await channel.send({
            type: 'broadcast',
            event: 'snake_update',
            payload: { state: newState }
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
                    <Button onClick={resetGame} className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-xl">
                        Play Again <RotateCcw className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full">
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
                            <div className="flex items-end justify-between w-full h-full relative">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-black">Pos</span>
                                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{state.player1Position}</span>
                                </div>
                                <div className={`relative dice-container w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-inner flex items-center justify-center border-2 border-white dark:border-slate-600 ${rolling && myPlayerNum === 1 ? 'animate-dice-roll' : ''}`}>
                                    {(!rolling && state.currentTurn !== (members[0]?.nickname || '') && lastRoll) || (state.winner && myPlayerNum === 1 && lastRoll) ? (
                                        <span className="text-white font-black text-xl">{lastRoll}</span>
                                    ) : (
                                        <Dices className="text-white w-6 h-6" />
                                    )}
                                    {myPlayerNum === 1 && isMyTurn && !rolling && !state.winner && (
                                        <div className="absolute -inset-1 rounded-xl ring-2 ring-pink-400/50 animate-ping"></div>
                                    )}
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
                            <div className="flex items-end justify-between w-full h-full relative">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-black">Pos</span>
                                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{state.player2Position}</span>
                                </div>
                                <div className={`relative dice-container w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-inner flex items-center justify-center border-2 border-white dark:border-slate-600 ${rolling && myPlayerNum === 2 ? 'animate-dice-roll' : ''}`}>
                                    {(!rolling && state.currentTurn !== (members[1]?.nickname || '') && lastRoll) || (state.winner && myPlayerNum === 2 && lastRoll) ? (
                                        <span className="text-white font-black text-xl">{lastRoll}</span>
                                    ) : (
                                        <Dices className="text-white w-6 h-6" />
                                    )}
                                    {myPlayerNum === 2 && isMyTurn && !rolling && !state.winner && (
                                        <div className="absolute -inset-1 rounded-xl ring-2 ring-blue-400/50 animate-ping"></div>
                                    )}
                                </div>
                            </div>
                            {state.currentTurn === (members[1]?.nickname || '') && !state.winner && (
                                <div className="mt-3 text-[10px] font-bold text-white bg-blue-500 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                                    Current Turn
                                </div>
                            )}
                        </div>

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
            <div className="w-full mt-6 rounded-[1rem] border-[4px] border-green-800 dark:border-green-600 relative overflow-hidden shadow-2xl bg-green-50">
                <div className="relative z-10 grid grid-cols-10 grid-rows-5 w-full aspect-[2/1] sm:aspect-[2.5/1]">
                    {flattenedRows.map((num, idx) => {
                        const isP1 = state.player1Position === num;
                        const isP2 = state.player2Position === num;
                        const rowIdx = Math.floor(idx / 10);
                        const colIdx = idx % 10;
                        const isGreen = (rowIdx + colIdx) % 2 === 0;

                        let displayLabel = num.toString();
                        if (num >= 31 && num <= 40) {
                            const row4Quirk = [40, 32, 33, 34, 35, 36, 37, 38, 39, 40];
                            displayLabel = row4Quirk[colIdx].toString();
                        }

                        return (
                            <div
                                key={`${num}-${idx}`}
                                className={`relative flex items-center justify-center w-full h-full border border-black/5 ${isGreen ? 'bg-green-500/80 text-white' : 'bg-orange-50/90 text-green-900'} transition-colors shadow-inner`}
                            >
                                <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-black opacity-60 pointer-events-none">{displayLabel}</span>

                                {/* Players */}
                                <div className="absolute flex items-center justify-center gap-[2px]">
                                    {isP1 && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 shadow-md border-2 border-white z-20" title="Player 1" />}
                                    {isP2 && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 shadow-md border-2 border-white z-20" title="Player 2" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
