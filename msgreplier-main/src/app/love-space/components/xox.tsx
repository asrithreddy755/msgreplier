"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoomMember, XOXGameState, XOXPlayer } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Heart, X as XIcon, Circle, RotateCcw, Trophy } from 'lucide-react';

const INITIAL_STATE: XOXGameState = {
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
};

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function XOX({ roomId, currentMember }: { roomId: string, currentMember: LoveRoomMember }) {
    const [gameState, setGameState] = useState<XOXGameState>(INITIAL_STATE);
    const [myPlayer, setMyPlayer] = useState<XOXPlayer>(null);
    const [loading, setLoading] = useState(true);

    // Determine player assignment (X or O) and setup channel
    useEffect(() => {
        let channel: any;

        const init = async () => {
            // 1. Determine player
            const { data: members, error } = await supabase
                .from('love_room_members')
                .select('*')
                .eq('room_id', roomId)
                .order('joined_at', { ascending: true });

            if (!error && members) {
                // First to join is X, second is O
                const pIndex = members.findIndex(m => m.id === currentMember.id);
                if (pIndex === 0) setMyPlayer('X');
                else if (pIndex === 1) setMyPlayer('O');
            }

            // 2. Fetch latest game state from DB if any (to resume) or we rely on broadcast
            // We will just start fresh since we might play multiple times, 
            // but let's check if there's an active non-finished game.
            const { data: lastGame } = await supabase
                .from('love_games')
                .select('*')
                .eq('room_id', roomId)
                .eq('game_type', 'xox')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (lastGame && lastGame.game_state) {
                const parsed = lastGame.game_state as XOXGameState;
                // If the game ended, we can show it, but usually people want to play again so we let them reset
                setGameState(parsed);
            }

            // 3. Subscribe to broadcast
            channel = supabase.channel(`game:xox:${roomId}`, {
                config: { broadcast: { self: true } } // receive our own messages just in case, or handle locally
            });

            channel.on('broadcast', { event: 'xox_update' }, (payload: { payload: XOXGameState }) => {
                setGameState(payload.payload);
            });

            channel.subscribe();
            setLoading(false);
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [roomId, currentMember.id]);

    const checkWinner = (board: XOXPlayer[]): XOXGameState['winner'] => {
        for (let combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(cell => cell !== null)) return 'Draw';
        return null;
    };

    const handleMove = async (index: number) => {
        if (gameState.winner || gameState.board[index] || gameState.currentTurn !== myPlayer) return;

        const newBoard = [...gameState.board];
        newBoard[index] = myPlayer;

        const winner = checkWinner(newBoard);
        const nextTurn = gameState.currentTurn === 'X' ? 'O' : 'X';

        const newState: XOXGameState = { board: newBoard, currentTurn: nextTurn, winner };

        // Optimistic UI update
        setGameState(newState);

        // Broadcast
        const channel = supabase.channel(`game:xox:${roomId}`);
        await channel.send({
            type: 'broadcast',
            event: 'xox_update',
            payload: newState
        });

        // If game ended, save to DB
        if (winner) {
            await supabase.from('love_games').insert([{
                room_id: roomId,
                game_type: 'xox',
                game_state: newState
            }]);
        }
    };

    const resetGame = async () => {
        // Both can reset
        const newState: XOXGameState = { ...INITIAL_STATE, currentTurn: gameState.winner === 'X' ? 'O' : 'X' }; // loser starts or alternate
        setGameState(newState);

        const channel = supabase.channel(`game:xox:${roomId}`);
        await channel.send({
            type: 'broadcast',
            event: 'xox_update',
            payload: newState
        });
    };

    if (loading) return <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading Game...</div>;

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-center gap-2">
                    Tic Tac Toe <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                </h2>
                <div className="flex gap-4 justify-center text-sm">
                    <div className={`px-4 py-1 rounded-full ${myPlayer === 'X' ? 'bg-pink-100 text-pink-700 font-bold border border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800' : 'text-gray-500 dark:text-gray-400'}`}>You: {myPlayer}</div>
                    <div className={`px-4 py-1 rounded-full ${gameState.currentTurn === myPlayer && !gameState.winner ? 'bg-purple-500 text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500'}`}>
                        {gameState.winner ? 'Game Over' : (gameState.currentTurn === myPlayer ? 'Your Turn' : 'Waiting...')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-purple-100 dark:bg-purple-900/20 p-4 rounded-3xl shadow-inner w-full aspect-square relative">
                {gameState.winner && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 rounded-3xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Trophy className={`w-16 h-16 mb-2 ${gameState.winner === 'Draw' ? 'text-gray-400 dark:text-gray-500' : 'text-yellow-400'}`} />
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-400">
                            {gameState.winner === 'Draw' ? "It's a draw!" : `${gameState.winner} wins!`}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 mt-1">
                            {gameState.winner === myPlayer ? "You won! 💖" : (gameState.winner !== 'Draw' ? "Better luck next time! 🥺" : "A perfect match! 🤝")}
                        </p>
                        <Button onClick={resetGame} className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-md text-white px-8">
                            Play Again <RotateCcw className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {gameState.board.map((cell, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleMove(idx)}
                        disabled={!!cell || !!gameState.winner || gameState.currentTurn !== myPlayer}
                        className={`
                bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-purple-50 dark:border-purple-900/30 flex items-center justify-center text-5xl transition-all
                ${!cell && !gameState.winner && gameState.currentTurn === myPlayer ? 'hover:scale-105 active:scale-95 cursor-pointer hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-900/20 dark:hover:border-pink-800' : 'cursor-default'}
                ${cell === 'X' ? 'text-pink-500' : 'text-purple-500'}
            `}
                    >
                        {cell === 'X' && <XIcon className="w-16 h-16 animate-in zoom-in" strokeWidth={2.5} />}
                        {cell === 'O' && <Circle className="w-14 h-14 animate-in zoom-in" strokeWidth={3} />}
                    </button>
                ))}
            </div>

            {!gameState.winner && (
                <Button variant="ghost" className="mt-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" onClick={resetGame}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Restart Game
                </Button>
            )}
        </div>
    );
}
