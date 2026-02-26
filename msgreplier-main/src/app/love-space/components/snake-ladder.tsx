"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoomMember, SnakeLadderState } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Dices, Trophy, RotateCcw } from 'lucide-react';

const SNAKES: Record<number, number> = { 40: 10, 47: 25, 32: 14, 28: 8 };
const LADDERS: Record<number, number> = { 3: 15, 20: 35, 12: 26, 30: 44 };

// 10x5 board logic
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

    const rollDice = async () => {
        if (!isMyTurn || state.winner || rolling) return;

        setRolling(true);

        // Simulate roll animation delay
        await new Promise(r => setTimeout(r, 600));

        const roll = Math.floor(Math.random() * 6) + 1;
        let newPos = myPlayerNum === 1 ? state.player1Position : state.player2Position;

        if (newPos + roll <= 50) {
            newPos += roll;
            // Check snakes and ladders
            if (SNAKES[newPos]) newPos = SNAKES[newPos];
            if (LADDERS[newPos]) newPos = LADDERS[newPos];
        }

        let winner = null;
        if (newPos === 50) {
            winner = currentMember.nickname;
        }

        const nextTurn = members.find(m => m.nickname !== currentMember.nickname)?.nickname || currentMember.nickname;

        const newState: SnakeLadderState = {
            ...state,
            player1Position: myPlayerNum === 1 ? newPos : state.player1Position,
            player2Position: myPlayerNum === 2 ? newPos : state.player2Position,
            currentTurn: winner ? null : (roll === 6 ? currentMember.nickname : nextTurn), // Roll 6 = extra turn
            winner
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
            winner: null
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

    if (loading) return <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading Game...</div>;

    // Board generation (bottom to top, alternating rows)
    const rows = [];
    for (let i = 4; i >= 0; i--) {
        const row = BOARDS_CELLS.slice(i * 10, (i + 1) * 10);
        if (i % 2 !== 0) row.reverse(); // Odd rows reverse for snake pattern
        rows.push(row);
    }

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
                    <div className="flex gap-4 bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 w-full justify-between items-center shadow-inner">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">P1</p>
                            <p className="font-bold text-pink-600 dark:text-pink-400 text-lg">{state.player1Position}</p>
                        </div>
                        <div className="flex flex-col items-center min-w-[60px]">
                            <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Roll</div>
                            <div className="text-3xl font-black text-orange-500 h-10 flex items-center justify-center">
                                {rolling ? <Dices className="w-6 h-6 animate-spin" /> : (lastRoll || '-')}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">P2</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">{state.player2Position}</p>
                        </div>
                    </div>

                    <Button
                        onClick={rollDice}
                        disabled={!isMyTurn || rolling}
                        className={`w-full h-14 rounded-2xl text-lg font-bold shadow-md transition-all ${isMyTurn ? 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 hover:scale-105 active:scale-95 text-white' : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-gray-500'}`}
                    >
                        {rolling ? 'Rolling...' : 'Roll Dice'} <Dices className="w-5 h-5 ml-2" />
                    </Button>

                    {lastRoll === 6 && !rolling && (
                        <p className="text-xs font-bold text-orange-500 animate-pulse">Rolled a 6! Extra turn!</p>
                    )}
                </div>
            )}

            {/* The Board */}
            <div className="w-full mt-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 p-3 rounded-2xl border-4 border-emerald-300 dark:border-emerald-700/50 relative overflow-hidden shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                {/* Decorative snakes and ladders info */}
                <div className="absolute top-1 left-2 text-[8px] text-emerald-700/60 dark:text-emerald-300/60 font-black tracking-widest uppercase">Start: 1 | Finish: 50</div>

                <div className="grid grid-cols-10 gap-[2px]">
                    {rows.flat().map((num) => {
                        const isP1 = state.player1Position === num;
                        const isP2 = state.player2Position === num;
                        const isLadderStart = !!LADDERS[num];
                        const isLadderEnd = Object.values(LADDERS).includes(num);
                        const isSnakeHead = !!SNAKES[num];
                        const isSnakeTail = Object.values(SNAKES).includes(num);

                        return (
                            <div
                                key={num}
                                className={`
                            relative h-10 sm:h-12 flex items-center justify-center rounded-md text-[10px] sm:text-xs font-black border transition-colors
                            ${num % 2 === 0 ? 'bg-emerald-100/80 border-emerald-200/50 dark:bg-emerald-900/40 dark:border-emerald-800/40' : 'bg-green-50/80 border-green-200/50 dark:bg-green-900/20 dark:border-green-800/20'}
                            ${num === 50 ? 'bg-gradient-to-br from-yellow-200 to-amber-300 text-yellow-800 border-yellow-400 dark:from-yellow-900/60 dark:to-amber-800/60 dark:text-yellow-300 dark:border-yellow-700 shadow-inner' : 'text-emerald-700/70 dark:text-emerald-400/70'}
                            hover:bg-white/50 dark:hover:bg-black/20
                        `}
                            >
                                <span className={`opacity-50 ${num === 50 && 'animate-pulse'}`}>{num}</span>

                                {/* Cell Features Markers */}
                                {isLadderStart && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-sm shadow-sm ring-1 ring-white/50 dark:ring-black/50" title={`Ladder to ${LADDERS[num]}`} />}
                                {isLadderEnd && <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-cyan-200/80 dark:bg-cyan-800/80 rounded-sm" />}
                                {isSnakeHead && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-sm ring-1 ring-white/50 dark:ring-black/50" title={`Snake to ${SNAKES[num]}`} />}
                                {isSnakeTail && <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-red-200/80 dark:bg-rose-900/80 rounded-full" />}

                                {/* Players */}
                                <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                                    {isP1 && <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-[1.5px] border-white dark:border-slate-800 z-10 animate-in zoom-in spin-in-12" />}
                                    {isP2 && <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-[1.5px] border-white dark:border-slate-800 z-10 animate-in zoom-in spin-in-12" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-3 flex justify-between text-[10px] sm:text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-sm shadow-sm" /> Ladders go Up</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-sm" /> Snakes go Down</span>
                </div>
            </div>
        </div>
    );
}
