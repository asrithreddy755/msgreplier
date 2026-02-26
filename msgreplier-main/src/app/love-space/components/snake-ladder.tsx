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

    if (loading) return <div className="text-gray-400 animate-pulse">Loading Game...</div>;

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
                <h2 className="text-2xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-2">
                    Snake & Ladder <Dices className="w-5 h-5 text-orange-500" />
                </h2>
                <div className="flex gap-4 justify-center text-sm items-center">
                    <div className={`px-4 py-1 rounded-full text-white shadow-sm flex items-center gap-2 ${myColor}`}>
                        <div className="w-2 h-2 bg-white rounded-full" /> You
                    </div>
                    <div className={`px-4 py-1 rounded-full ${isMyTurn ? 'bg-orange-500 text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                        {state.winner ? 'Game Over' : (isMyTurn ? 'Your Turn' : 'Waiting...')}
                    </div>
                </div>
            </div>

            {state.winner ? (
                <div className="bg-orange-50 p-6 rounded-3xl text-center border border-orange-200 mt-4 shadow-inner mb-6 w-full animate-in zoom-in slide-in-from-bottom-4">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-orange-600 mb-1">{state.winner} wins!</h3>
                    <p className="text-gray-500 mb-4">{state.winner === currentMember.nickname ? 'You conquered the board! 🎉' : 'Better luck next time! 🥺'}</p>
                    <Button onClick={resetGame} className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-xl">
                        Play Again <RotateCcw className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-full justify-between items-center shadow-inner">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase">P1</p>
                            <p className="font-bold text-pink-600 text-lg">{state.player1Position}</p>
                        </div>
                        <div className="flex flex-col items-center min-w-[60px]">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Roll</div>
                            <div className="text-3xl font-black text-orange-500 h-10 flex items-center justify-center">
                                {rolling ? <Dices className="w-6 h-6 animate-spin" /> : (lastRoll || '-')}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase">P2</p>
                            <p className="font-bold text-blue-600 text-lg">{state.player2Position}</p>
                        </div>
                    </div>

                    <Button
                        onClick={rollDice}
                        disabled={!isMyTurn || rolling}
                        className={`w-full h-14 rounded-2xl text-lg font-bold shadow-md transition-all ${isMyTurn ? 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 hover:scale-105 active:scale-95 text-white' : 'bg-gray-200 text-gray-400'}`}
                    >
                        {rolling ? 'Rolling...' : 'Roll Dice'} <Dices className="w-5 h-5 ml-2" />
                    </Button>

                    {lastRoll === 6 && !rolling && (
                        <p className="text-xs font-bold text-orange-500 animate-pulse">Rolled a 6! Extra turn!</p>
                    )}
                </div>
            )}

            {/* The Board */}
            <div className="w-full mt-6 bg-green-50 p-2 rounded-xl border-4 border-orange-200 relative overflow-hidden shadow-lg">
                {/* Decorative snakes and ladders info */}
                <div className="absolute top-1 left-2 text-[8px] text-green-700/50 font-bold uppercase">Start: 1 | Finish: 50</div>

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
                            relative h-8 sm:h-10 flex items-center justify-center rounded-sm text-[10px] font-bold border border-green-200/50
                            ${num % 2 === 0 ? 'bg-green-100' : 'bg-green-50'}
                            ${num === 50 ? 'bg-yellow-200 text-yellow-700 border-yellow-400' : 'text-green-700'}
                        `}
                            >
                                <span className="opacity-40">{num}</span>

                                {/* Cell Features Markers */}
                                {isLadderStart && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-300 rounded-bl-full shadow-sm" title={`Ladder to ${LADDERS[num]}`} />}
                                {isLadderEnd && <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-400 rounded-tr-full" />}
                                {isSnakeHead && <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full shadow-sm" title={`Snake to ${SNAKES[num]}`} />}
                                {isSnakeTail && <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-300 rounded-full" />}

                                {/* Players */}
                                <div className="absolute inset-0 flex items-center justify-center gap-[1px]">
                                    {isP1 && <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-md border border-white z-10 animate-in zoom-in" />}
                                    {isP2 && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md border border-white z-10 animate-in zoom-in" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-2 flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-300 rounded-bl-full" /> Ladders go Up</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full" /> Snakes go Down</span>
                </div>
            </div>
        </div>
    );
}
