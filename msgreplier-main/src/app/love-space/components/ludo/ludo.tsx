"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { WakeUpButton } from '../WakeUpButton';
import { LoveRoomMember } from '@/types/love-space';
import { Provider } from 'react-redux';
import { store, setSyncCallback } from './state/store';
import Game from './components/Game/Game';
import { TPlayerInitData, TPlayerColour } from './types';
import { debounce, throttle } from 'lodash-es';
import { setIsPlaceholderShowing } from './state/slices/diceSlice';
import { changeCoordsOfToken } from './state/slices/playersSlice';
import { setTokenTransitionTime } from './utils/setTokenTransitionTime';
import { FORWARD_TOKEN_TRANSITION_TIME } from './game/tokens/constants';
import { toast } from 'sonner';
import { Bell, Loader2 } from 'lucide-react';
import { WebRTCMessageType } from '@/lib/webrtc/dataChannel';
import { useAssetPreloader } from '../../hooks/useAssetPreloader';
import { GamePreloader } from '../GamePreloader';
import { playDiceSound } from './utils/diceSound';
import bgAsset from './assets/bg.jpg';

interface LudoProps {
    roomId: string;
    currentMember: LoveRoomMember;
    members?: LoveRoomMember[];
    otherOnline?: boolean;
    sendMessage?: (type: WebRTCMessageType, payload?: any, options?: { reliable?: boolean }) => void;
    registerHandler?: (type: WebRTCMessageType, handler: (payload: any) => void) => void;
    unregisterHandler?: (type: WebRTCMessageType, handler?: (payload: any) => void) => void;
}

type LudoMoveRecord = {
    player: string | null;
    dice: number | null;
    updatedAt: number;
};

const serializeState = (state: any) => {
    if (!state) return '';
    const { moves, ...core } = state;
    return JSON.stringify(core);
};

const parseUpdatedAt = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return 0;
};

export function Ludo({
    roomId,
    currentMember,
    members = [],
    otherOnline = true,
    sendMessage,
    registerHandler,
    unregisterHandler
}: LudoProps) {
    const currentMemberId = currentMember.id;
    const [initData, setInitData] = useState<TPlayerInitData[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
    const [myColour, setMyColour] = useState<TPlayerColour | null>(null);
    const [currentPlayerColour, setCurrentPlayerColour] = useState<string | null>(null);
    const hasInitializedRef = useRef(false);
    const membersRef = useRef(members);
    const myColourRef = useRef<TPlayerColour | null>(null);
    const lastOnlineStateRef = useRef(otherOnline);
    const lastBroadcastStateRef = useRef<string | null>(null);
    const lastDbStateRef = useRef<string | null>(null);
    const latestStateRef = useRef<any | null>(null);
    const latestUpdatedAtRef = useRef(0);
    const lastSyncRequestAtRef = useRef(0);
    const moveHistoryRef = useRef<LudoMoveRecord[]>([]);
    const ludoBackupKey = useRef(`love_space_${roomId}_ludo`);
    const hasUnsavedChangesRef = useRef(false);
    const currentVersionRef = useRef(0);

    const isHost = members.length > 0 && members[0].id === currentMember.id;

    const { isLoaded, progress } = useAssetPreloader([
        bgAsset.src,
        '/dice-roll.mp3'
    ]);

    useEffect(() => {
        membersRef.current = members;
    }, [members]);

    useEffect(() => {
        myColourRef.current = myColour;
    }, [myColour]);

    const applyIncomingState = useCallback((incomingState: any, incomingUpdatedAt: number, shouldBackup = false) => {
        if (!incomingState || Object.keys(incomingState).length === 0) return;
        const normalizedUpdatedAt = Number.isFinite(incomingUpdatedAt) ? incomingUpdatedAt : 0;
        
        const incomingVersion = incomingState.version || 0;
        const currentVersion = currentVersionRef.current;

        // Version-Controlled Acceptance
        if (incomingVersion > currentVersion) {
            console.log(`[RTC] Ludo sync received (version ${incomingVersion})`);
        } else if (incomingVersion === currentVersion && hasUnsavedChangesRef.current && !shouldBackup) {
            console.log(`[RTC] Ignored Ludo sync with matching version (v${incomingVersion}) due to pending local state.`);
            return;
        } else if (!shouldBackup) {
            console.log(`[RTC] Ignored stale Ludo sync (v${incomingVersion} <= v${currentVersion})`);
            return;
        }
        const serialized = serializeState(incomingState);
        if (serialized !== lastBroadcastStateRef.current) {
            lastBroadcastStateRef.current = serialized;
            store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: incomingState });
        }

        currentVersionRef.current = incomingVersion;
        latestStateRef.current = incomingState;
        latestUpdatedAtRef.current = normalizedUpdatedAt || Date.now();
        
        if (Array.isArray(incomingState.moves)) {
            moveHistoryRef.current = incomingState.moves.slice(-200);
        }

        if (shouldBackup) {
            try {
                localStorage.setItem(ludoBackupKey.current, JSON.stringify({ state: incomingState, updatedAt: latestUpdatedAtRef.current }));
            } catch {
                return;
            }
        }
    }, []);

    // --- DB PERSISTENCE LOGIC ---
    const saveToDb = async (stateToSave: any, updatedAt: number, isImmediate = false) => {
        if (!hasUnsavedChangesRef.current && !isImmediate) return;
        
        const serialized = serializeState(stateToSave);
        if (serialized === lastDbStateRef.current && !isImmediate) return;
        
        const version = stateToSave.version || currentVersionRef.current;
        console.log(`[SYNC] ${isImmediate ? 'Immediate' : 'Lazy'} sync triggered for Ludo (v${version})`);
        setSyncStatus('syncing');

        try {
            // Conflict Protection
            const res = await fetch(`/api/love-space/ludo-state?roomId=${roomId}`, { cache: 'no-store' });
            const data = await res.json();
            const dbState = data?.game?.game_state;

            if (dbState && dbState.version > version) {
                console.warn(`[SYNC] Skipped outdated Ludo write. DB has v${dbState.version}, local is v${version}`);
                hasUnsavedChangesRef.current = false;
                setSyncStatus('idle');
                if (sendMessage) sendMessage('sync_request', { game: 'ludo' });
                return;
            }

            await fetch('/api/love-space/ludo-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, gameState: stateToSave, lastUpdated: updatedAt }),
            });
            
            console.log(`[SYNC] Ludo state saved (version ${version})`);
            lastDbStateRef.current = serialized;
            hasUnsavedChangesRef.current = false;
            setSyncStatus('saved');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (err) {
            console.error("[SYNC] Failed to save Ludo state:", err);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 3000);
        }
    };

    // Immediate flush logic
    const flushNow = useCallback(() => {
        if (hasUnsavedChangesRef.current) {
            console.log("[SYNC] Immediate flush triggered (Exit/Offline)");
            const currentState = latestStateRef.current || store.getState();
            const updatedAt = latestUpdatedAtRef.current || Date.now();
            saveToDb(currentState, updatedAt, true);
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
            const currentState = latestStateRef.current || store.getState();
            const updatedAt = latestUpdatedAtRef.current || Date.now();
            saveToDb(currentState, updatedAt);
        }, 15000);
        return () => clearInterval(interval);
    }, [roomId]);

    const requestSync = useCallback((reason: string, attempt = 1) => {
        if (!sendMessage) return;
        const now = Date.now();
        if (attempt === 1 && now - lastSyncRequestAtRef.current < 1200) return;
        lastSyncRequestAtRef.current = now;
        
        console.log(`[Ludo] Requesting sync (reason: ${reason}, attempt: ${attempt})`);
        sendMessage('sync_request', { game: 'ludo', roomId, senderId: currentMemberId, reason, sentAt: now });

        // One-time fallback if no state received
        if (attempt === 1) {
             setTimeout(() => {
                 if (currentVersionRef.current === 0) {
                     console.warn("[Ludo] Sync timeout - retrying sync_request...");
                     requestSync(reason, 2);
                 }
             }, 3000);
        }
    }, [sendMessage, roomId, currentMemberId]);

    const persistState = useCallback(debounce((stateToSave: any) => {
        const serialized = serializeState(stateToSave);
        if (serialized === lastBroadcastStateRef.current) return;

        const updatedAt = Date.now();
        const newVersion = currentVersionRef.current + 1;
        currentVersionRef.current = newVersion;

        const diceValue = stateToSave?.dice?.dice?.find(
            (d: any) => d.colour === stateToSave?.players?.currentPlayerColour
        )?.diceNumber ?? null;

        const moveRecord: LudoMoveRecord = {
            player: stateToSave?.players?.currentPlayerColour ?? null,
            dice: typeof diceValue === 'number' ? diceValue : null,
            updatedAt,
        };

        moveHistoryRef.current = [...moveHistoryRef.current.slice(-199), moveRecord];
        const payloadState = {
            ...stateToSave,
            moves: moveHistoryRef.current,
            version: newVersion,
            updatedAt
        };

        lastBroadcastStateRef.current = serialized;
        latestStateRef.current = payloadState;
        latestUpdatedAtRef.current = updatedAt;
        hasUnsavedChangesRef.current = true;

        try {
            localStorage.setItem(ludoBackupKey.current, JSON.stringify({ state: payloadState, updatedAt }));
        } catch {
            return;
        }

        sendMessage?.('game_move', { game: 'ludo', state: payloadState, updatedAt }, { reliable: true });
        saveToDb(payloadState, updatedAt);
    }, 400), [sendMessage, saveToDb, roomId]);

    useEffect(() => {
        setSyncCallback((state) => {
            persistState(state);
        });
    }, [persistState]);

    useEffect(() => {
        hasInitializedRef.current = false;
        setLoading(true);
        latestStateRef.current = null;
        latestUpdatedAtRef.current = 0;
        lastBroadcastStateRef.current = null;
        lastDbStateRef.current = null;
        moveHistoryRef.current = [];
        
        // Reset Redux store on roomId change to prevent stale state issues
        store.dispatch({ type: 'players/clearPlayersState' });
        store.dispatch({ type: 'dice/clearDiceState' });
        store.dispatch({ type: 'board/clearBoardState' });
        store.dispatch({ type: 'session/clearSessionState' });
    }, [roomId]);

    useEffect(() => {
        const currentMembers = membersRef.current;
        if (roomId && currentMembers.length > 0) {
            const initialPlayers = [
                { name: currentMembers[0]?.nickname || 'Player 1', isBot: false },
                { name: currentMembers[1]?.nickname || 'Player 2', isBot: false },
            ];
            setInitData(initialPlayers);
            const idx = currentMembers.findIndex(m => m.id === currentMemberId);
            const sequence: TPlayerColour[] = ['blue', 'green'];
            setMyColour(sequence[idx === -1 ? 0 : idx] || 'blue');
        }

        if (hasInitializedRef.current) return;

        const init = async () => {
            hasInitializedRef.current = true;
            try {
                const backupRaw = localStorage.getItem(ludoBackupKey.current);
                if (backupRaw) {
                    const backup = JSON.parse(backupRaw);
                    applyIncomingState(backup?.state, parseUpdatedAt(backup?.updatedAt), false);
                }

                const gameRes = await fetch(`/api/love-space/ludo-state?roomId=${roomId}`, { cache: 'no-store' }).then(res => res.json());
                const gameData = gameRes?.game;
                if (gameData?.game_state && Object.keys(gameData.game_state).length > 0) {
                    applyIncomingState(gameData.game_state, parseUpdatedAt(gameData.last_updated), true);
                }
            } catch (err) {
                console.error('[Ludo] Failed to initialize state', err);
                hasInitializedRef.current = false;
            } finally {
                setLoading(false);
                requestSync('init');
            }
        };

        if (roomId && currentMembers.length > 0) {
            init();
        }
    }, [roomId, members.length, currentMemberId, ludoBackupKey, applyIncomingState, requestSync]);

    useEffect(() => {
        if (!registerHandler || !unregisterHandler) return;

        const handleGameMove = (payload: any) => {
            if (!payload || payload.game !== 'ludo') return;
            const state = payload.state;
            const updatedAt = parseUpdatedAt(payload.updatedAt) || Date.now();
            applyIncomingState(state, updatedAt, true);
        };

        const handleSyncRequest = (payload: any) => {
            if (!payload || payload.senderId === currentMemberId) return;
            if (payload.game && payload.game !== 'ludo') return;
            
            // Host Authority System: Only host responds to sync_request
            if (isHost && sendMessage) {
                console.log("[RTC] Responding to sync request as HOST (Ludo)");
                const state = latestStateRef.current || store.getState();
                const updatedAt = latestUpdatedAtRef.current || Date.now();
                sendMessage('sync_state', { game: 'ludo', state, updatedAt });
            }
        };

        const handleSyncState = (payload: any) => {
            if (!payload || payload.game !== 'ludo') return;
            const state = payload.state;
            const updatedAt = parseUpdatedAt(payload.updatedAt);
            applyIncomingState(state, updatedAt, true);
        };

        registerHandler('game_move', handleGameMove);
        registerHandler('sync_request', handleSyncRequest);
        registerHandler('sync_state', handleSyncState);

        requestSync('handler_registered');

        return () => {
            unregisterHandler('game_move', handleGameMove);
            unregisterHandler('sync_request', handleSyncRequest);
            unregisterHandler('sync_state', handleSyncState);
        };
    }, [registerHandler, unregisterHandler, sendMessage, currentMemberId, applyIncomingState, requestSync, isHost]);

    useEffect(() => {
        if (otherOnline && !lastOnlineStateRef.current) {
            requestSync('peer_reconnected');
        }
        lastOnlineStateRef.current = otherOnline;
    }, [otherOnline, requestSync]);

    useEffect(() => {
        if (!registerHandler || !unregisterHandler) return;

        const handleDiceStart = (payload: any) => {
            if (!payload || payload.senderId === currentMemberId) return;
            playDiceSound();
            store.dispatch(setIsPlaceholderShowing({ colour: payload.colour, isPlaceholderShowing: true }));
        };

        const handleDiceResolved = (payload: any) => {
            if (!payload || payload.senderId === currentMemberId) return;
            store.dispatch({
                type: 'dice/resolveBroadcastRoll',
                payload: { colour: payload.colour, diceNumber: payload.diceNumber }
            });
        };

        const handleTokenMoving = (payload: any) => {
            if (!payload || payload.senderId === currentMemberId) return;
            setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME, { colour: payload.colour, id: payload.tokenId } as any);
            store.dispatch(changeCoordsOfToken({
                colour: payload.colour,
                id: payload.tokenId,
                newCoords: payload.currentTile,
            }));
        };

        const handleSyncRequest = (payload: any) => {
            if (!payload || payload.senderId === currentMemberId) return;
            if (payload.game && payload.game !== 'ludo') return;
            
            // Global handler in page.tsx now handles 'wake_up'
        };

        registerHandler('dice_start', handleDiceStart);
        registerHandler('dice_resolved', handleDiceResolved);
        registerHandler('token_moving', handleTokenMoving);
        registerHandler('sync_request', handleSyncRequest);

        let prevSpinnerState: Record<string, boolean> = {};
        let prevTokenCoords: Record<string, { x: number; y: number }> = {};

        const unsubscribeStore = store.subscribe(() => {
            const state = store.getState();
            const currentMyColour = myColourRef.current;

            if (state.players?.currentPlayerColour !== currentPlayerColour) {
                setCurrentPlayerColour(state.players.currentPlayerColour);
            }

            if (state.dice?.dice) {
                for (const dice of state.dice.dice) {
                    const wasSpinning = prevSpinnerState[dice.colour] ?? false;
                    const isSpinning = dice.isPlaceholderShowing ?? false;

                    if (dice.colour === currentMyColour && sendMessage) {
                        if (isSpinning && !wasSpinning) {
                            sendMessage('dice_start', { colour: dice.colour, senderId: currentMemberId }, { reliable: true });
                        }
                        if (!isSpinning && wasSpinning) {
                            sendMessage('dice_resolved', { colour: dice.colour, diceNumber: dice.diceNumber, senderId: currentMemberId }, { reliable: true });
                        }
                    }
                    prevSpinnerState[dice.colour] = isSpinning;
                }
            }

            if (state.players?.isAnyTokenMoving && state.players?.players) {
                if (state.players.currentPlayerColour !== currentMyColour) return;

                for (const player of state.players.players) {
                    for (const token of player.tokens) {
                        const key = `${player.colour}_${token.id}`;
                        const prev = prevTokenCoords[key];
                        const curr = token.coordinates;
                        if (!prev || prev.x !== curr.x || prev.y !== curr.y) {
                            sendMessage?.('token_moving', {
                                colour: player.colour,
                                tokenId: token.id,
                                currentTile: curr,
                                senderId: currentMemberId,
                            }, { reliable: true });
                            prevTokenCoords[key] = { x: curr.x, y: curr.y };
                        }
                    }
                }
            }
        });

        return () => {
            unsubscribeStore();
            unregisterHandler('dice_start', handleDiceStart);
            unregisterHandler('dice_resolved', handleDiceResolved);
            unregisterHandler('token_moving', handleTokenMoving);
        };
    }, [registerHandler, unregisterHandler, sendMessage, currentMemberId]);

    if (!isLoaded) {
        return (
            <div className="absolute inset-0 p-2 sm:p-4 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl w-full h-full">
                <GamePreloader progress={progress} gameName="Ludo" />
            </div>
        );
    }

    return (
        <Provider store={store}>
            <div className="absolute inset-0 p-2 sm:p-4 flex flex-col items-center justify-center ludo-wrapper overflow-y-auto overflow-x-hidden">
                {/* Sync Status Badge for Ludo */}
                <div className="absolute top-4 left-4 z-50">
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

                <Game initData={initData} myColour={myColour || 'blue'} otherOnline={otherOnline} />
                
                {/* Wake Up Button for Ludo */}
                {otherOnline && currentPlayerColour && myColour && currentPlayerColour !== myColour && (
                    <div className="mt-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <WakeUpButton 
                            sendMessage={sendMessage} 
                            currentMember={currentMember} 
                            targetNickname={members.find(m => m.id !== currentMember.id)?.nickname || 'Partner'}
                            gameName="ludo"
                        />
                    </div>
                )}

                {loading && (
                    <div
                        className="absolute inset-0 z-50 flex items-end justify-center pb-4 pointer-events-none"
                        aria-label="Loading game state..."
                    >
                        <div className="w-full max-w-[600px] mx-auto px-4">
                            <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse opacity-70" />
                        </div>
                    </div>
                )}
            </div>
        </Provider>
    );
}

