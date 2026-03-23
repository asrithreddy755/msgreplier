"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { LoveRoomMember, XOXGameState, XOXPlayer } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Heart, X as XIcon, Circle, RotateCcw, Trophy, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WebRTCMessageType } from '@/lib/webrtc/dataChannel';
import { WakeUpButton } from './WakeUpButton';

const INITIAL_STATE: XOXGameState = {
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
    scores: { X: 0, O: 0 },
    roundStarter: 'X',
    version: 0,
    updatedAt: Date.now()
};

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function XOX({ 
    roomId, 
    currentMember, 
    members = [], 
    otherOnline = true,
    sendMessage,
    registerHandler,
    unregisterHandler
}: { 
    roomId: string;
    currentMember: LoveRoomMember;
    members?: LoveRoomMember[];
    otherOnline?: boolean;
    sendMessage?: (type: WebRTCMessageType, payload?: any, options?: { reliable?: boolean }) => void;
    registerHandler?: (type: WebRTCMessageType, handler: (payload: any) => void) => void;
    unregisterHandler?: (type: WebRTCMessageType) => void;
}) {
    const [gameState, setGameState] = useState<XOXGameState>(INITIAL_STATE);
    const [myPlayer, setMyPlayer] = useState<XOXPlayer>(null);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
    const lastStateRef = useRef<string | null>(null);
    const hasUnsavedChangesRef = useRef(false);
    
    // Nudge & Pulse animation state
    const [nudge, setNudge] = useState<{ from: string } | null>(null);
    const [boardPulse, setBoardPulse] = useState(false);

    // Prevents re-running init when the parent re-renders with a new members array reference
    const hasInitializedRef = useRef(false);
    const xoxBackupKey = useRef(`love_space_${roomId}_xox`);

    // Win animation state
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [winningLineCoords, setWinningLineCoords] = useState<string[] | null>(null);

    const isHost = members.length > 0 && members[0].id === currentMember.id;

    // --- DB PERSISTENCE LOGIC ---
    const saveToDb = async (stateToSave: XOXGameState, isImmediate = false) => {
        if (!hasUnsavedChangesRef.current && !isImmediate) return;
        
        console.log(`[SYNC] ${isImmediate ? 'Immediate' : 'Lazy'} sync triggered for XOX (v${stateToSave.version})`);
        setSyncStatus('syncing');
        
        try {
            // Conflict Protection: Fetch latest version from DB before writing
            const res = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=xox`, { cache: 'no-store' });
            const data = await res.json();
            const dbState = data?.game?.game_state as XOXGameState | undefined;

            if (dbState && dbState.version > stateToSave.version) {
                console.warn(`[SYNC] Skipped outdated write. DB has v${dbState.version}, local is v${stateToSave.version}`);
                hasUnsavedChangesRef.current = false;
                setSyncStatus('idle');
                // Request sync from peer to get the latest
                if (sendMessage) sendMessage('sync_request', { game: 'xox' });
                return;
            }

            await fetch('/api/love-space/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    gameType: 'xox',
                    gameState: stateToSave,
                }),
            });
            
            console.log(`[SYNC] State saved (version ${stateToSave.version})`);
            hasUnsavedChangesRef.current = false;
            setSyncStatus('saved');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (err) {
            console.error("[SYNC] Failed to save state:", err);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 3000);
        }
    };

    // Immediate flush logic
    const flushNow = useCallback(() => {
        if (hasUnsavedChangesRef.current) {
            console.log("[SYNC] Immediate flush triggered (Exit/Offline)");
            const currentState = JSON.parse(lastStateRef.current || JSON.stringify(INITIAL_STATE));
            saveToDb(currentState, true);
        }
    }, [roomId]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") flushNow();
        };
        window.addEventListener("beforeunload", flushNow);
        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("offline", flushNow);
        return () => {
            window.removeEventListener("beforeunload", flushNow);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("offline", flushNow);
        };
    }, [flushNow]);

    // Throttled DB Sync Loop (Every 15 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            const currentState = JSON.parse(lastStateRef.current || JSON.stringify(INITIAL_STATE));
            saveToDb(currentState);
        }, 15000);
        return () => clearInterval(interval);
    }, [roomId]);

    // Determine player assignment and load state
    useEffect(() => {
        let isMounted = true;
        if (hasInitializedRef.current) return () => { isMounted = false; };
        if (!roomId || members.length === 0) return () => { isMounted = false; };

        const init = async () => {
            hasInitializedRef.current = true;
            try {
                // 1. Load Local Backup
                const backupRaw = localStorage.getItem(xoxBackupKey.current);
                let latestLocal: XOXGameState | null = null;
                if (backupRaw) {
                    try { latestLocal = JSON.parse(backupRaw); } catch {}
                }

                // 2. Load DB State
                const stateRes = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=xox`).then(res => res.json());
                const dbState = stateRes?.game?.game_state as XOXGameState | undefined;

                // 3. WebRTC Sync Request with Retry
                const requestSync = (reason: string, attempt = 1) => {
                    if (!sendMessage) return;
                    console.log(`[XOX] Requesting sync (reason: ${reason}, attempt: ${attempt})`);
                    sendMessage('sync_request', { 
                        roomId, 
                        senderId: currentMember.id, 
                        game: 'xox',
                        reason, 
                        sentAt: Date.now() 
                    });

                    // One-time fallback if no state received
                    if (attempt === 1) {
                         setTimeout(() => {
                             if (isMounted && hasInitializedRef.current && (lastStateRef.current === null || JSON.parse(lastStateRef.current).version === 0)) {
                                 console.warn("[XOX] Sync timeout - retrying sync_request...");
                                 requestSync(reason, 2);
                             }
                         }, 2500);
                    }
                };

                requestSync('init');

                // Apply latest between Local and DB
                let stateToApply = INITIAL_STATE;
                if (latestLocal && (!dbState || latestLocal.version > dbState.version)) {
                    stateToApply = latestLocal;
                } else if (dbState) {
                    stateToApply = dbState;
                }

                setGameState(stateToApply);
                lastStateRef.current = JSON.stringify(stateToApply);

                // Assign identity
                if (members.length > 0 && members[0].id === currentMember.id) {
                    setMyPlayer('X');
                } else if (members.length > 1 && members[1].id === currentMember.id) {
                    setMyPlayer('O');
                } else {
                    setMyPlayer('X');
                }
            } catch (err) {
                console.error("Failed to init xox:", err);
                setMyPlayer('X');
                hasInitializedRef.current = false;
            } finally {
                setLoading(false);
            }
        };

        init();
        return () => { isMounted = false; };
    }, [roomId, members.length, currentMember.id, sendMessage]);

    // WebRTC Real-time state sync
    useEffect(() => {
        if (!registerHandler || !unregisterHandler) return;

        const handleIncomingMove = (payload: any, isSync = false) => {
            if (payload.game !== 'xox') return;
            const incoming = payload.state as XOXGameState;
            const current = JSON.parse(lastStateRef.current || JSON.stringify(INITIAL_STATE));

            // Version-Controlled Acceptance
            const isNewer = incoming.version > current.version;
            const isSameAndInitial = isSync && incoming.version === current.version;

            if (isNewer || isSameAndInitial) {
                console.log(`[RTC] XOX sync received (version ${incoming.version}, isSync: ${isSync})`);
                const serialized = JSON.stringify(incoming);
                lastStateRef.current = serialized;
                setGameState(incoming);
                localStorage.setItem(xoxBackupKey.current, serialized);
                
                // If it's a newer version from peer, we should mark as NOT dirty (since we just caught up)
                // UNLESS we had our own unsaved changes at the same version (unlikely with strict versioning)
                if (isNewer) {
                    hasUnsavedChangesRef.current = false;
                }
            } else if (incoming.version === current.version && hasUnsavedChangesRef.current) {
                console.log(`[RTC] Ignored XOX sync with matching version (v${incoming.version}) due to pending local state.`);
            } else {
                console.log(`[RTC] Ignored stale XOX sync (v${incoming.version} < v${current.version})`);
            }
        };

        const handleSyncRequest = (payload: any) => {
            if (!payload || payload.senderId === currentMember.id) return;
            if (payload.game && payload.game !== 'xox') return;
            
            // Responder: Always send current state regardless of version or host status
            if (sendMessage) {
                console.log("[RTC] Responding to XOX sync request");
                const state = JSON.parse(lastStateRef.current || JSON.stringify(INITIAL_STATE));
                sendMessage('sync_state', { game: 'xox', state });
            }
        };

        const handleWakeUp = (payload: any) => {
            if (!payload || payload.game !== 'xox' || payload.senderId === currentMember.id) return;
            
            // Layer 1: Partner Animation (visual only)
            setNudge({ from: payload.from || 'Your partner' });
            setBoardPulse(true);
            setTimeout(() => {
                setNudge(null);
                setBoardPulse(false);
            }, 3000);

            // Layer 2: Hidden Sync (background only)
            // Trigger sync from init function logic
            if (sendMessage) {
                sendMessage('sync_request', { 
                    roomId, 
                    senderId: currentMember.id, 
                    game: 'xox',
                    reason: 'wake_up_received', 
                    sentAt: Date.now() 
                });
            }
        };

        registerHandler('game_move', (p) => handleIncomingMove(p, false));
        registerHandler('sync_state', (p) => handleIncomingMove(p, true));
        registerHandler('sync_request', handleSyncRequest);
        registerHandler('wake_up', handleWakeUp);

        return () => {
            unregisterHandler('game_move');
            unregisterHandler('sync_state');
            unregisterHandler('sync_request');
            unregisterHandler('wake_up');
        };
    }, [registerHandler, unregisterHandler, currentMember.id, sendMessage]);

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
        if (gameState.winner || gameState.board[index] || gameState.currentTurn !== myPlayer || !otherOnline) return;

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
            roundStarter: gameState.roundStarter || 'X',
            version: gameState.version + 1,
            updatedAt: Date.now()
        };

        // Optimistic UI update
        const serialized = JSON.stringify(newState);
        lastStateRef.current = serialized;
        setGameState(newState);
        hasUnsavedChangesRef.current = true;
        localStorage.setItem(xoxBackupKey.current, serialized);

        if (sendMessage) {
            sendMessage('game_move', { game: 'xox', state: newState }, { reliable: true });
        }

        // Guaranteed Final Save Event: Sync immediately on win
        if (winner) {
            saveToDb(newState, true);
        }

        // Part B: Activity ping
        fetch(`/api/love-space/activity-ping?roomId=${roomId}`, { method: 'POST' }).catch(() => {});
    };

    const roomCreator = members.length > 0 ? members[0] : null;
    const player1 = members.length > 0 ? members[0] : null;
    const player2 = members.length > 1 ? members[1] : null;

    const getPlayerNickname = (player: 'X' | 'O') => {
        if (player === 'X') return player1?.nickname || 'Player X';
        return player2?.nickname || 'Player O';
    };

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
            scores: gameState.scores || { X: 0, O: 0 },
            version: gameState.version + 1,
            updatedAt: Date.now()
        };
        const serialized = JSON.stringify(newState);
        lastStateRef.current = serialized;
        setGameState(newState);
        hasUnsavedChangesRef.current = true;
        localStorage.setItem(xoxBackupKey.current, serialized);

        if (sendMessage) {
            sendMessage('game_move', { game: 'xox', state: newState }, { reliable: true });
        }
        
        // Immediate sync on reset
        saveToDb(newState, true);

        // Part B: Activity ping
        fetch(`/api/love-space/activity-ping?roomId=${roomId}`, { method: 'POST' }).catch(() => {});
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
            {/* Nudge Toast */}
            {nudge && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold py-2 px-4 rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
                        <Bell className="w-3 h-3 text-orange-400" />
                        <span>{nudge.from} is waiting for you! 👋</span>
                    </div>
                </div>
            )}

            {/* Board Pulse Animation */}
            <style jsx global>{`
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
                    50% { box-shadow: 0 0 20px 10px rgba(168, 85, 247, 0.2); }
                    100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 1s ease-in-out infinite;
                }
            `}</style>
            
            <div className="mb-6 text-center w-full">
                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-center gap-2">
                    Tic Tac Toe <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                </h2>

                {/* Sync Status Badge */}
                <div className="flex justify-center mb-2">
                    {syncStatus === 'syncing' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-[10px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Syncing...
                        </div>
                    )}
                    {syncStatus === 'saved' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-[10px] font-bold text-green-600 dark:text-green-400">
                            Saved ✅
                        </div>
                    )}
                    {syncStatus === 'error' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-[10px] font-bold text-red-600 dark:text-red-400">
                            Sync Failed ⚠️
                        </div>
                    )}
                    {syncStatus === 'idle' && hasUnsavedChangesRef.current && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Unsaved Changes
                        </div>
                    )}
                </div>

                {/* Score Board */}
                <div className="flex flex-col items-center gap-3 mb-4 w-full">
                    <div className="flex justify-center items-center gap-4 bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-sm border border-purple-100 dark:border-purple-900/30 w-fit mx-auto relative">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-xs sm:text-sm max-w-[80px] truncate ${myPlayer === 'X' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} title={getPlayerNickname('X')}>
                                {getPlayerNickname('X')} {myPlayer === 'X' && '(You)'}
                            </span>
                            <span className="bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 px-2.5 py-0.5 rounded-full font-bold text-sm">
                                {gameState.scores?.X || 0}
                            </span>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600 font-bold text-xs">VS</div>
                        <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-pink-300 px-2.5 py-0.5 rounded-full font-bold text-sm">
                                {gameState.scores?.O || 0}
                            </span>
                            <span className={`font-bold text-xs sm:text-sm max-w-[80px] truncate ${myPlayer === 'O' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} title={getPlayerNickname('O')}>
                                {getPlayerNickname('O')} {myPlayer === 'O' && '(You)'}
                            </span>
                        </div>
                    </div>

                    {/* Wake Up Button */}
                    {!gameState.winner && gameState.currentTurn !== myPlayer && otherOnline && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                            <WakeUpButton 
                                sendMessage={sendMessage} 
                                currentMember={currentMember!} 
                                targetNickname={members.find(m => m.id !== currentMember.id)?.nickname || 'Partner'}
                                gameName="xox"
                                onRequestSync={() => {
                                    if (sendMessage) {
                                        sendMessage('sync_request', { 
                                            roomId, 
                                            senderId: currentMember.id, 
                                            game: 'xox',
                                            reason: 'wake_up_clicked', 
                                            sentAt: Date.now() 
                                        });
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 justify-center text-sm items-center">
                    <div className={`px-4 py-1 rounded-full ${!otherOnline ? 'bg-red-100 text-red-500 animate-pulse shadow-sm' : (gameState.winner ? 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500' : (gameState.currentTurn === myPlayer ? 'bg-purple-500 text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500'))}`}>
                        {!otherOnline ? 'Partner Offline' : (gameState.winner ? 'Game Over' : (gameState.currentTurn === myPlayer ? 'Your Turn' : "Opponent's Turn"))}
                    </div>
                    {!otherOnline && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Waiting for your partner to reconnect…</p>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-3 grid-rows-3 gap-3 bg-purple-100 dark:bg-purple-900/20 p-4 rounded-3xl shadow-inner w-full aspect-square relative ${boardPulse ? 'animate-pulse-glow' : ''}`}>
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
                            {gameState.winner === 'Draw' ? "It's a draw!" : `${getPlayerNickname(gameState.winner)} wins!`}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 mt-1 text-center">
                            {gameState.winner === myPlayer ? "You won! 💖" : (gameState.winner !== 'Draw' ? `${getPlayerNickname(gameState.winner as 'X' | 'O')} was too fast! 🥺` : "A perfect match! 🤝")}
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
                        disabled={!!cell || !!gameState.winner || gameState.currentTurn !== myPlayer || !otherOnline}
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
