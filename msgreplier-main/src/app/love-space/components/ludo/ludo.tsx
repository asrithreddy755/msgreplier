"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoomMember } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Dices, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { LudoBoard } from './ludo-board';
import { LudoGameState, PlayerColour } from './types';
import {
    createInitialState,
    createPlayer,
    rollDice,
    canPlayerMove,
    getMovableTokens,
    moveToken,
    getNextTurn,
} from './game-logic';
import { PLAYER_COLOURS } from './constants';

interface LudoProps {
    roomId: string;
    currentMember: LoveRoomMember;
}

export function Ludo({ roomId, currentMember }: LudoProps) {
    const [state, setState] = useState<LudoGameState>(createInitialState());
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [rolling, setRolling] = useState(false);
    const [lastRoll, setLastRoll] = useState<number | null>(null);
    const [consecutiveSixes, setConsecutiveSixes] = useState(0);
    const [awaitingTokenSelect, setAwaitingTokenSelect] = useState(false);
    const channelRef = useRef<any>(null);

    // Determine my colour (first member = blue, second = green)
    const myColour: PlayerColour | null = members.length > 0
        ? (members.findIndex(m => m.nickname === currentMember.nickname) === 0 ? 'blue' : 'green')
        : null;

    const isMyTurn = myColour !== null && state.currentTurn === myColour;
    const myPlayer = state.players.find(p => p.colour === myColour);

    // Movable tokens for current dice value
    const movableTokens = (isMyTurn && lastRoll && awaitingTokenSelect && myPlayer)
        ? getMovableTokens(myPlayer, lastRoll).map(t => ({ colour: t.colour, id: t.id }))
        : [];

    // Initialize game
    useEffect(() => {
        let channel: any;

        const init = async () => {
            try {
                const { data: membersData } = await supabase
                    .from('love_room_members')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('joined_at', { ascending: true });

                if (membersData) {
                    const sorted = membersData.sort((a: any, b: any) =>
                        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
                    );
                    setMembers(sorted as LoveRoomMember[]);
                }

                // Check for existing game state
                const { data: gameData } = await supabase
                    .from('love_games')
                    .select('*')
                    .eq('room_id', roomId)
                    .eq('game_type', 'ludo')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (gameData?.game_state) {
                    setState(gameData.game_state as LudoGameState);
                }

                // Set up real-time channel
                channel = supabase.channel(`game:ludo:${roomId}`, {
                    config: { broadcast: { self: true } }
                });

                channel.on('broadcast', { event: 'ludo_update' }, (payload: any) => {
                    if (payload.payload.sender === currentMember.id) return;
                    const data = payload.payload;

                    if (data.state) setState(data.state);
                    if (data.roll !== undefined) setLastRoll(data.roll);
                    if (data.awaitingSelect !== undefined) setAwaitingTokenSelect(data.awaitingSelect);
                });

                channel.subscribe((status: string) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Ludo channel subscribed');
                    }
                });
                channelRef.current = channel;
            } catch (err) {
                console.error("Failed to init ludo:", err);
            } finally {
                setLoading(false);
            }
        };

        init();
        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [roomId, currentMember.id]);

    // Broadcast state
    const broadcast = useCallback(async (data: any) => {
        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'ludo_update',
                payload: { ...data, sender: currentMember.id },
            });
        }
    }, [currentMember.id]);

    // Start game
    const startGame = async () => {
        if (members.length < 2) {
            toast.error("Need 2 players to start!");
            return;
        }

        const newState: LudoGameState = {
            ...createInitialState(),
            players: [
                createPlayer(members[0].nickname, 'blue'),
                createPlayer(members[1].nickname, 'green'),
            ],
            currentTurn: 'blue',
            gameStarted: true,
            lastAction: `${members[0].nickname} goes first!`,
        };

        setState(newState);
        setLastRoll(null);
        setConsecutiveSixes(0);
        setAwaitingTokenSelect(false);
        await broadcast({ state: newState, roll: null, awaitingSelect: false });
    };

    // Roll dice
    const handleRollDice = async () => {
        if (!isMyTurn || rolling || state.winner || awaitingTokenSelect) return;

        setRolling(true);
        await new Promise(r => setTimeout(r, 600));

        const roll = rollDice();
        setLastRoll(roll);
        setRolling(false);

        const player = state.players.find(p => p.colour === myColour)!;

        // Track consecutive sixes
        let newConsecutiveSixes = consecutiveSixes;
        if (roll === 6) {
            newConsecutiveSixes = consecutiveSixes + 1;
            setConsecutiveSixes(newConsecutiveSixes);

            // Penalty for 3 consecutive sixes
            if (newConsecutiveSixes >= 3) {
                const nextColour = myColour === 'blue' ? 'green' : 'blue';
                const newState: LudoGameState = {
                    ...state,
                    currentTurn: nextColour,
                    diceValue: roll,
                    lastAction: `${player.nickname} rolled three 6s in a row! Turn skipped! 😤`,
                };
                setState(newState);
                setConsecutiveSixes(0);
                setAwaitingTokenSelect(false);
                await broadcast({ state: newState, roll, awaitingSelect: false });
                return;
            }
        } else {
            newConsecutiveSixes = 0;
            setConsecutiveSixes(0);
        }

        // Check if player can move
        if (!canPlayerMove(player, roll)) {
            const nextColour = getNextTurn(state, roll, false, false, newConsecutiveSixes);
            const newState: LudoGameState = {
                ...state,
                currentTurn: nextColour,
                diceValue: roll,
                lastAction: `${player.nickname} rolled ${roll} but can't move! ❌`,
            };
            setState(newState);
            setAwaitingTokenSelect(false);
            if (nextColour !== myColour) setConsecutiveSixes(0);
            await broadcast({ state: newState, roll, awaitingSelect: false });
            return;
        }

        // Check if only one token can move -> auto-move
        const movable = getMovableTokens(player, roll);
        if (movable.length === 1) {
            await handleTokenSelect(myColour!, movable[0].id, roll, newConsecutiveSixes);
            return;
        }

        // Multiple tokens can move -> wait for selection
        setAwaitingTokenSelect(true);
        const updatedState = { ...state, diceValue: roll, lastAction: `${player.nickname} rolled ${roll}. Pick a piece to move!` };
        setState(updatedState);
        await broadcast({ state: updatedState, roll, awaitingSelect: true });
    };

    // Handle token selection
    const handleTokenSelect = async (colour: PlayerColour, tokenId: number, diceVal?: number, sixes?: number) => {
        const roll = diceVal ?? lastRoll;
        const curSixes = sixes ?? consecutiveSixes;
        if (!roll || !isMyTurn) return;

        const result = moveToken(state, colour, tokenId, roll);

        // Determine next turn
        const nextColour = getNextTurn(result.newState, roll, result.captured, result.reachedHome, curSixes);
        const finalState: LudoGameState = {
            ...result.newState,
            currentTurn: nextColour,
        };

        setState(finalState);
        setAwaitingTokenSelect(false);
        if (nextColour !== myColour) setConsecutiveSixes(0);
        await broadcast({ state: finalState, roll, awaitingSelect: false });

        // Save to DB on win
        if (finalState.winner) {
            await supabase.from('love_games').insert([{
                room_id: roomId,
                game_type: 'ludo',
                game_state: finalState,
            }]);
        }
    };

    // Reset game
    const resetGame = async () => {
        const creator = members[0];
        if (creator && currentMember.id !== creator.id) {
            toast.error(`Only ${creator.nickname} can restart!`);
            return;
        }
        await startGame();
    };

    if (loading) {
        return <div className="text-gray-400 dark:text-gray-500 animate-pulse text-center p-4">Loading Ludo...</div>;
    }

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto pb-4 sm:pb-8 gap-2 sm:gap-3">
            {/* Header */}
            <div className="text-center w-full">
                <h2 className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-2 flex items-center justify-center gap-1.5 sm:gap-2">
                    Ludo <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                </h2>
                {state.gameStarted && (
                    <div className="flex gap-3 sm:gap-4 justify-center text-xs sm:text-sm items-center">
                        <div
                            className="px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-white shadow-sm flex items-center gap-1.5"
                            style={{ backgroundColor: PLAYER_COLOURS[myColour || 'blue'] }}
                        >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" /> You
                        </div>
                        <div className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full ${isMyTurn ? 'bg-emerald-500 text-white shadow-md animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                            {state.winner ? 'Game Over' : (isMyTurn ? (awaitingTokenSelect ? 'Pick a piece!' : 'Your Turn') : 'Waiting...')}
                        </div>
                    </div>
                )}
            </div>

            {/* Not started / Start button */}
            {!state.gameStarted && (
                <div className="text-center py-6 sm:py-8 w-full">
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                        {members.length < 2 ? 'Waiting for another player to join...' : 'Ready to play Ludo!'}
                    </p>
                    {members.length >= 2 && members[0]?.id === currentMember.id && (
                        <Button onClick={startGame} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6">
                            Start Game 🎲
                        </Button>
                    )}
                    {members.length >= 2 && members[0]?.id !== currentMember.id && (
                        <p className="text-xs text-gray-400">Waiting for {members[0]?.nickname} to start...</p>
                    )}
                </div>
            )}

            {/* Winner screen */}
            {state.winner && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-center border border-emerald-200 dark:border-emerald-900/50 shadow-inner w-full animate-in zoom-in">
                    <Trophy className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-1 sm:mb-2" />
                    <h3 className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">{state.winner} wins!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
                        {state.winner === currentMember.nickname ? 'You conquered the board! 🎉' : 'Better luck next time! 🥺'}
                    </p>
                    <Button onClick={resetGame} className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                        Play Again <RotateCcw className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {/* Active game UI */}
            {state.gameStarted && !state.winner && (
                <div className="flex flex-col items-center gap-2 sm:gap-4 w-full">
                    {/* Player info cards */}
                    <div className="flex gap-2 sm:gap-4 w-full justify-between items-stretch">
                        {state.players.map(player => {
                            const isCurrentTurn = state.currentTurn === player.colour;
                            const tokensHome = player.tokens.filter(t => t.hasReachedHome).length;
                            return (
                                <div
                                    key={player.colour}
                                    className={`flex flex-col items-center bg-gray-50 dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border w-1/2 transition-all
                    ${isCurrentTurn ? 'shadow-lg' : 'opacity-80'}
                  `}
                                    style={{
                                        borderColor: isCurrentTurn ? PLAYER_COLOURS[player.colour] : undefined,
                                        boxShadow: isCurrentTurn ? `0 0 15px ${PLAYER_COLOURS[player.colour]}33` : undefined,
                                    }}
                                >
                                    <p className="text-xs sm:text-sm font-bold truncate w-full text-center" style={{ color: PLAYER_COLOURS[player.colour] }}>
                                        {player.nickname === currentMember.nickname ? `You` : player.nickname}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">Home:</span>
                                        <span className="text-sm sm:text-lg font-black text-slate-700 dark:text-slate-200">{tokensHome}/4</span>
                                    </div>
                                    {isCurrentTurn && (
                                        <div
                                            className="mt-1 text-[9px] sm:text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse"
                                            style={{ backgroundColor: PLAYER_COLOURS[player.colour] }}
                                        >
                                            {awaitingTokenSelect ? 'Pick piece' : 'Rolling...'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Dice */}
                    <div className="flex flex-col items-center justify-center my-1 sm:my-4 relative w-full">
                        {isMyTurn && !rolling && !awaitingTokenSelect && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-emerald-400/30 to-teal-400/30 animate-pulse blur-xl z-0" />
                        )}
                        <button
                            onClick={handleRollDice}
                            disabled={!isMyTurn || rolling || !!state.winner || awaitingTokenSelect}
                            className={`
                relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl flex items-center justify-center border-3 sm:border-4 border-white/90 dark:border-slate-700/90 backdrop-blur-md z-10 transition-all duration-300
                ${rolling ? 'animate-spin shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-gradient-to-br from-emerald-400 to-teal-500' : ''}
                ${isMyTurn && !rolling && !awaitingTokenSelect ? 'cursor-pointer hover:scale-105 active:scale-95 bg-gradient-to-br from-emerald-400 to-teal-500' : ''}
                ${(!isMyTurn || awaitingTokenSelect) && !rolling ? 'cursor-default bg-gray-100 dark:bg-slate-800 opacity-90' : ''}
              `}
                        >
                            {!rolling && lastRoll ? (
                                <span className={`font-black text-3xl sm:text-5xl drop-shadow-lg ${isMyTurn || rolling ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {lastRoll}
                                </span>
                            ) : (
                                <Dices className={`w-8 h-8 sm:w-12 sm:h-12 ${isMyTurn || rolling ? 'text-white' : 'text-gray-400'}`} />
                            )}
                        </button>

                        {isMyTurn && !rolling && !awaitingTokenSelect && (
                            <div className="mt-1.5 sm:mt-3 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-bounce bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full shadow-sm">
                                Tap to Roll!
                            </div>
                        )}

                        {awaitingTokenSelect && isMyTurn && (
                            <div className="mt-1.5 sm:mt-3 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 animate-bounce bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full shadow-sm">
                                Tap a glowing piece to move!
                            </div>
                        )}
                    </div>

                    {/* Extra turn / action message */}
                    {lastRoll === 6 && !rolling && !awaitingTokenSelect && (
                        <p className="text-xs font-bold text-emerald-500 animate-pulse">Rolled a 6! Extra turn!</p>
                    )}

                    {state.lastAction && !rolling && (
                        <div className="w-full text-center p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs sm:text-sm font-medium border border-emerald-200 dark:border-emerald-700">
                            {state.lastAction}
                        </div>
                    )}
                </div>
            )}

            {/* Board */}
            {state.gameStarted && (
                <div className="w-full mt-2 sm:mt-4 rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-800 dark:border-emerald-600">
                    <LudoBoard
                        players={state.players}
                        currentTurn={state.currentTurn}
                        onTokenClick={(colour, tokenId) => handleTokenSelect(colour, tokenId)}
                        movableTokenIds={movableTokens}
                        isMyTurn={isMyTurn}
                    />
                </div>
            )}
        </div>
    );
}
