"use client";

import { useEffect, useState, useRef } from 'react';
import { LoveRoomMember, XOXGameState, XOXPlayer } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Heart, X as XIcon, Circle, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const INITIAL_STATE: XOXGameState = {
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
    scores: { X: 0, O: 0 },
    roundStarter: 'X'
};

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function XOX({ roomId, currentMember }: { roomId: string, currentMember: LoveRoomMember }) {
    const [gameState, setGameState] = useState<XOXGameState>(INITIAL_STATE);
    const [myPlayer, setMyPlayer] = useState<XOXPlayer>(null);
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const lastStateRef = useRef<string | null>(null);

    // Win animation state
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [winningLineCoords, setWinningLineCoords] = useState<string[] | null>(null);

    // Determine player assignment and load state
    useEffect(() => {
        const init = async () => {
            try {
                const [membersRes, stateRes] = await Promise.all([
                    fetch(`/api/love-space/members?roomId=${roomId}`).then(res => res.json()),
                    fetch(`/api/love-space/games?roomId=${roomId}&gameType=xox`).then(res => res.json())
                ]);

                const membersData = Array.isArray(membersRes?.members) ? membersRes.members : [];
                const sortedMembers = membersData.sort((a: LoveRoomMember, b: LoveRoomMember) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
                setMembers(sortedMembers as LoveRoomMember[]);

                if (sortedMembers.length > 0 && sortedMembers[0].id === currentMember.id) {
                    setMyPlayer('X');
                } else if (sortedMembers.length > 1 && sortedMembers[1].id === currentMember.id) {
                    setMyPlayer('O');
                } else {
                    setMyPlayer('X');
                }

                const lastGame = stateRes?.game;
                if (lastGame?.game_state) {
                    const parsed = lastGame.game_state as XOXGameState;
                    setGameState(parsed);
                    lastStateRef.current = JSON.stringify(parsed);
                }
            } catch (err) {
                console.error("Failed to init xox:", err);
                setMyPlayer('X');
            } finally {
                setLoading(false);
            }
        };

        if (roomId) init();
    }, [roomId, currentMember.id]);

    useEffect(() => {
        let isMounted = true;
        let channel: ReturnType<typeof supabase.channel> | null = null;

        channel = supabase
            .channel(`public:love_games:xox:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'love_games',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload: any) => {
                    if (!isMounted) return;

                    const newGame = payload.new;
                    if (newGame.game_type !== 'xox') return;

                    if (newGame?.game_state) {
                        const parsed = newGame.game_state as XOXGameState;
                        const serialized = JSON.stringify(parsed);
                        if (serialized !== lastStateRef.current) {
                            lastStateRef.current = serialized;
                            setGameState(parsed);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, [roomId]);

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

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (gameState.winner && gameState.winner !== 'Draw') {
            // Find winning combo
            let coords: string[] | null = null;
            for (const combo of WINNING_COMBOS) {
                const [a, b, c] = combo;
                if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
                    const key = combo.join(',');
                    const map: Record<string, string[]> = {
                        '0,1,2': ['5', '16.5', '95', '16.5'], // Row 1
                        '3,4,5': ['5', '50', '95', '50'],     // Row 2
                        '6,7,8': ['5', '83.5', '95', '83.5'], // Row 3
                        '0,3,6': ['16.5', '5', '16.5', '95'], // Col 1
                        '1,4,7': ['50', '5', '50', '95'],     // Col 2
                        '2,5,8': ['83.5', '5', '83.5', '95'], // Col 3
                        '0,4,8': ['5', '5', '95', '95'],      // Diag 1
                        '2,4,6': ['95', '5', '5', '95'],      // Diag 2
                    };
                    coords = map[key] || null;
                    break;
                }
            }
            setWinningLineCoords(coords);
            timer = setTimeout(() => setShowWinOverlay(true), 1500);
        } else if (gameState.winner === 'Draw') {
            setWinningLineCoords(null);
            timer = setTimeout(() => setShowWinOverlay(true), 1000);
        } else {
            setWinningLineCoords(null);
            setShowWinOverlay(false);
        }
        return () => { if (timer) clearTimeout(timer); };
    }, [gameState.winner, gameState.board]);

    const handleMove = async (index: number) => {
        if (gameState.winner || gameState.board[index] || gameState.currentTurn !== myPlayer) return;

        const newBoard = [...gameState.board];
        newBoard[index] = myPlayer;

        const winner = checkWinner(newBoard);
        const nextTurn = gameState.currentTurn === 'X' ? 'O' : 'X';

        const newScores = { ...(gameState.scores || { X: 0, O: 0 }) };
        if (winner && winner !== 'Draw') {
            newScores[winner as 'X' | 'O'] += 1;
        }

        const newState: XOXGameState = {
            board: newBoard,
            currentTurn: nextTurn,
            winner,
            scores: newScores,
            roundStarter: gameState.roundStarter || 'X'
        };

        // Optimistic UI update
        setGameState(newState);

        await fetch('/api/love-space/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, gameType: 'xox', gameState: newState })
        });
    };

    const roomCreator = members.length > 0 ? members[0] : null;

    const resetGame = async () => {
        if (roomCreator && currentMember.id !== roomCreator.id) {
            toast.error(`Only ${roomCreator.nickname} can restart the game!`);
            return;
        }

        // Alternate who starts the round
        const nextStarter = gameState.roundStarter === 'X' ? 'O' : 'X';
        const newState: XOXGameState = {
            ...INITIAL_STATE,
            currentTurn: nextStarter,
            roundStarter: nextStarter,
            scores: gameState.scores || { X: 0, O: 0 }
        };
        setGameState(newState);

        await fetch('/api/love-space/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, gameType: 'xox', gameState: newState })
        });
    };

    if (loading) return <div className="text-gray-400 dark:text-gray-500 animate-pulse w-full text-center">Loading Game...</div>;

    if (!myPlayer) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-4 p-8 text-center text-sm">
                <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"></div>
                <p>Waiting for the game to initialize...</p>
                <p className="text-xs opacity-70">If this takes too long, try reloading the page.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto">
            <div className="mb-6 text-center w-full">
                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-center gap-2">
                    Tic Tac Toe <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                </h2>

                {/* Score Board */}
                <div className="flex justify-center items-center gap-4 mb-3 bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-sm border border-purple-100 dark:border-purple-900/30 w-fit mx-auto">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${myPlayer === 'X' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`}>Player X {myPlayer === 'X' && '(You)'}</span>
                        <span className="bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 px-2.5 py-0.5 rounded-full font-bold text-sm">
                            {gameState.scores?.X || 0}
                        </span>
                    </div>
                    <div className="text-gray-300 dark:text-gray-600 font-bold">VS</div>
                    <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold text-sm">
                            {gameState.scores?.O || 0}
                        </span>
                        <span className={`font-bold ${myPlayer === 'O' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>Player O {myPlayer === 'O' && '(You)'}</span>
                    </div>
                </div>

                <div className="flex gap-4 justify-center text-sm">
                    <div className={`px-4 py-1 rounded-full ${gameState.currentTurn === myPlayer && !gameState.winner ? 'bg-purple-500 text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500'}`}>
                        {gameState.winner ? 'Game Over' : (gameState.currentTurn === myPlayer ? 'Your Turn' : "Opponent's Turn")}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 grid-rows-3 gap-3 bg-purple-100 dark:bg-purple-900/20 p-4 rounded-3xl shadow-inner w-full aspect-square relative">
                {winningLineCoords && (
                    <svg className="absolute inset-4 pointer-events-none z-10 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line
                            x1={winningLineCoords[0]} y1={winningLineCoords[1]}
                            x2={winningLineCoords[2]} y2={winningLineCoords[3]}
                            stroke={gameState.winner === 'X' ? '#ec4899' : '#a855f7'}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="150"
                            strokeDashoffset="150"
                            style={{ animation: 'draw-winning-line 0.6s ease-out forwards' }}
                        />
                        <style>{`
                            @keyframes draw-winning-line {
                                to { stroke-dashoffset: 0; }
                            }
                        `}</style>
                    </svg>
                )}
                {showWinOverlay && gameState.winner && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 rounded-3xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Trophy className={`w-16 h-16 mb-2 ${gameState.winner === 'Draw' ? 'text-gray-400 dark:text-gray-500' : 'text-yellow-400'}`} />
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-400">
                            {gameState.winner === 'Draw' ? "It's a draw!" : `${gameState.winner} wins!`}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 mt-1 text-center">
                            {gameState.winner === myPlayer ? "You won! 💖" : (gameState.winner !== 'Draw' ? "Better luck next time! 🥺" : "A perfect match! 🤝")}
                        </p>
                        <Button
                            onClick={resetGame}
                            className={`bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-md text-white px-8 ${roomCreator && currentMember.id !== roomCreator.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Play Again <RotateCcw className="w-4 h-4 ml-2" />
                        </Button>
                        {roomCreator && currentMember.id !== roomCreator.id && (
                            <p className="text-xs text-slate-500 mt-3 absolute bottom-4">Waiting for {roomCreator.nickname} to restart...</p>
                        )}
                    </div>
                )}

                {gameState.board.map((cell, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleMove(idx)}
                        disabled={!!cell || !!gameState.winner || gameState.currentTurn !== myPlayer}
                        className={`
                w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-purple-50 dark:border-purple-900/30 flex items-center justify-center text-5xl transition-all
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
                <div className="mt-6 flex flex-col items-center">
                    <Button
                        variant="ghost"
                        className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ${roomCreator && currentMember.id !== roomCreator.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={resetGame}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Restart Game
                    </Button>
                    {roomCreator && currentMember.id !== roomCreator.id && (
                        <p className="text-[10px] text-gray-400 mt-1">Only {roomCreator.nickname} can restart</p>
                    )}
                </div>
            )}
        </div>
    );
}
