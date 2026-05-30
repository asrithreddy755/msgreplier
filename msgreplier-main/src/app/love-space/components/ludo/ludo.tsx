"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { WakeUpButton } from '../WakeUpButton';
import { LoveRoomMember } from '@/types/love-space';
import { Provider } from 'react-redux';
import { store, setSyncCallback } from './state/store';
import Game from './components/Game/Game';
import { TPlayerInitData, TPlayerColour } from './types';
import { debounce } from 'lodash-es';
import { setIsPlaceholderShowing } from './state/slices/diceSlice';
import { changeCoordsOfToken } from './state/slices/playersSlice';
import { setTokenTransitionTime } from './utils/setTokenTransitionTime';
import { FORWARD_TOKEN_TRANSITION_TIME } from './game/tokens/constants';
import { toast } from 'sonner';
import { Loader2, RotateCcw, Bell } from 'lucide-react';
import { WebRTCMessageType } from '@/lib/webrtc/dataChannel';
import { useAssetPreloader } from '../../hooks/useAssetPreloader';
import { GamePreloader } from '../GamePreloader';
import { playDiceSound } from './utils/diceSound';
import bgAsset from './assets/bg.jpg';

const initializedRooms = new Map<string, boolean>();
interface LudoProps {
    roomId: string;
    currentMember: LoveRoomMember;
    members?: LoveRoomMember[];
    otherOnline?: boolean;
    connectionState?: string;
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
    connectionState,
    sendMessage,
    registerHandler,
    unregisterHandler
}: LudoProps) {
    const currentMemberId = currentMember.id;
    const [initData, setInitData] = useState<TPlayerInitData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSynced, setIsSynced] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
    const [myColour, setMyColour] = useState<TPlayerColour | null>(null);
    const [currentPlayerColour, setCurrentPlayerColour] = useState<string | null>(null);
    const [showDisconnectBanner, setShowDisconnectBanner] = useState(false);

    // Nudge & Shake animation state
    const [nudge, setNudge] = useState<{ from: string } | null>(null);
    const [diceShake, setDiceShake] = useState(false);

    // hasInitializedRef replaced by module-level initializedRooms Map (1b)
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

    // Disconnect handling refs
    const frozenTurnRef = useRef<string | null>(null);
    const pendingRollRef = useRef<{ colour: string, diceNumber: number, createdAt: number } | null>(null);
    const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Activity tracking for wake-up rule
    const lastActivityAtRef = useRef<number>(Date.now());
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    const requestSync = useCallback((reason: string, attempt = 1) => {
        if (!sendMessage) return;

        // Layer 2: Pending Roll Flush
        if (pendingRollRef.current) {
            const { colour, diceNumber, createdAt } = pendingRollRef.current;

            // Safety: if pending roll is older than 8s, clear it to unlock dice
            if (Date.now() - createdAt > 8000) {
                console.log("[Ludo] Clearing stale pending roll to unlock dice:", diceNumber);
                pendingRollRef.current = null;
            } else {
                console.log("[Ludo] Flushing pending roll during requestSync:", diceNumber);
                sendMessage('dice_resolved', { colour, diceNumber, senderId: currentMemberId }, { reliable: true });
            }
        }

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

    // --- CONNECTION HANDLING ---
    useEffect(() => {
        if (!connectionState) return;

        const isDisconnected = connectionState !== 'Connected';
        const isConnected = connectionState === 'Connected';

        if (isDisconnected) {
            console.log("[Ludo] Disconnect detected - unlocking dice and clearing pending state");
            // Clear all dice placeholders
            store.dispatch(setIsPlaceholderShowing({ colour: 'blue', isPlaceholderShowing: false }));
            store.dispatch(setIsPlaceholderShowing({ colour: 'green', isPlaceholderShowing: false }));

            // Clear pending roll to unlock dice
            pendingRollRef.current = null;

            const state = store.getState();
            if (state.players?.currentPlayerColour && !frozenTurnRef.current) {
                frozenTurnRef.current = state.players.currentPlayerColour;
            }

            if (!disconnectTimerRef.current) {
                disconnectTimerRef.current = setTimeout(() => {
                    setShowDisconnectBanner(true);
                }, 10000);
            }
        } else if (isConnected) {
            console.log("[Ludo] Reconnected - resuming game");
            if (disconnectTimerRef.current) {
                clearTimeout(disconnectTimerRef.current);
                disconnectTimerRef.current = null;
            }
            setShowDisconnectBanner(false);

            // Restore turn if frozen
            if (frozenTurnRef.current) {
                const turn = frozenTurnRef.current;
                frozenTurnRef.current = null;
                // Note: Ludo turn is in Redux, normally it doesn't change unless synced.
            }

            // Flush pending roll (if any still exists)
            if (pendingRollRef.current && sendMessage) {
                const { colour, diceNumber } = pendingRollRef.current;
                console.log("[Ludo] Flushing pending roll:", diceNumber);
                sendMessage('dice_resolved', { colour, diceNumber, senderId: currentMemberId }, { reliable: true });
                pendingRollRef.current = null;
            }

            requestSync('reconnect');
        }

        return () => {
            if (disconnectTimerRef.current) {
                clearTimeout(disconnectTimerRef.current);
            }
        };
    }, [connectionState, currentMemberId, sendMessage, requestSync]);

    // --- AUTO-CLEAR STALE PENDING ROLL ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (pendingRollRef.current && (Date.now() - pendingRollRef.current.createdAt > 5000)) {
                console.log("[Ludo] Auto-clearing stale pending roll (5s timeout) to unlock dice");
                pendingRollRef.current = null;
                // Also clear any dice placeholders just in case
                store.dispatch(setIsPlaceholderShowing({ colour: 'blue', isPlaceholderShowing: false }));
                store.dispatch(setIsPlaceholderShowing({ colour: 'green', isPlaceholderShowing: false }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

    // --- WAKE UP TRIGGER ---
    const triggerWakeUp = useCallback(() => {
        console.log("[Ludo] 10 seconds of inactivity - triggering wake up!");
        // Send wake up message to partner
        sendMessage?.('wake_up', { 
            game: 'ludo', 
            from: currentMember.nickname,
            senderId: currentMemberId
        });
        // Also trigger sync
        requestSync('wake_up');
    }, [sendMessage, currentMember, currentMemberId, requestSync]);

    const resetActivityTimer = useCallback(() => {
        lastActivityAtRef.current = Date.now();
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        // Only start timer if it's our turn to play
        const state = store.getState();
        const isMyTurn = state.players?.currentPlayerColour === myColourRef.current;
        if (isMyTurn && otherOnline) {
            inactivityTimerRef.current = setTimeout(() => {
                triggerWakeUp();
            }, 10000); // 10 seconds
        }
    }, [triggerWakeUp, otherOnline]);

    // Debounce activity-ping to avoid too many calls
    const debouncedActivityPing = useCallback(debounce(() => {
        fetch(`/api/love-space/activity-ping?roomId=${roomId}`, { method: 'POST' }).catch(() => { });
    }, 3000), [roomId]);

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

        // Part B: Activity ping (debounced)
        debouncedActivityPing();

        sendMessage?.('game_move', { game: 'ludo', state: payloadState, updatedAt }, { reliable: true });
        saveToDb(payloadState, updatedAt);
        
        // Reset activity timer on game move
        resetActivityTimer();
    }, 400), [sendMessage, saveToDb, roomId, resetActivityTimer, debouncedActivityPing]);

    useEffect(() => {
        setSyncCallback((state) => {
            persistState(state);
        });
    }, [persistState]);

    // 1a: Removed the destructive clear-on-roomId-change useEffect.
    // The Redux store holds its state while the component is unmounted (tab switch).
    // Init is guarded by initializedRooms Map so it never re-runs on remount.

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

        if (initializedRooms.get(roomId)) return;

        const init = async () => {
            initializedRooms.set(roomId, true);
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
                initializedRooms.delete(roomId); // allow retry on next mount
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

            // Handle reset sentinel broadcast from host's New Game action
            if (payload.reset) {
                store.dispatch({ type: 'players/clearPlayersState' });
                store.dispatch({ type: 'dice/clearDiceState' });
                store.dispatch({ type: 'board/clearBoardState' });
                store.dispatch({ type: 'session/clearSessionState' });
                localStorage.removeItem(ludoBackupKey.current);
                latestStateRef.current = null;
                latestUpdatedAtRef.current = 0;
                lastBroadcastStateRef.current = null;
                lastDbStateRef.current = null;
                moveHistoryRef.current = [];
                currentVersionRef.current = 0;
                hasUnsavedChangesRef.current = false;
                initializedRooms.delete(roomId);
                return;
            }

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
            setIsSynced(true);
        };

        const handleWakeUp = (payload: any) => {
            if (!payload || payload.game !== 'ludo' || payload.senderId === currentMemberId) return;

            // Layer 1: Partner Animation (visual only)
            setNudge({ from: payload.from || 'Your partner' });
            setDiceShake(true);

            // Layer 3: Manual Unlock for Wake Up
            setDiceShake(true);
            // Force isRolling to false via Redux
            const state = store.getState();
            if (state.dice?.dice) {
                state.dice.dice.forEach((d: any) => {
                    if (d.isPlaceholderShowing) {
                        store.dispatch(setIsPlaceholderShowing({ colour: d.colour, isPlaceholderShowing: false }));
                    }
                });
            }

            // Clear pendingRoll if it's older than 5 seconds
            if (pendingRollRef.current && (Date.now() - pendingRollRef.current.createdAt > 5000)) {
                console.log("[Ludo] Manual unlock: clearing old pending roll");
                pendingRollRef.current = null;
            }

            setTimeout(() => {
                setNudge(null);
                setDiceShake(false);
            }, 3000);

            // Layer 2: Hidden Sync (background only)
            requestSync('wake_up_received');
        };

        const handleGameOver = (payload: any) => {
            if (!payload || payload.game !== 'ludo' || payload.senderId === currentMemberId) return;
            // The sync logic will handle state update, but we ensure we are synced
            console.log("[Ludo] Game over received from partner");
            requestSync('game_over_received');
            // Clear inactivity timer when game ends
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };

        const handlePlayAgain = (payload: any) => {
            if (!payload || payload.game !== 'ludo' || payload.senderId === currentMemberId) return;
            console.log("[Ludo] Play again received - resetting board");
            handleNewGame(false); // reset locally without broadcasting again
        };

        registerHandler('game_move', handleGameMove);
        registerHandler('sync_request', handleSyncRequest);
        registerHandler('sync_state', handleSyncState);
        registerHandler('wake_up', handleWakeUp);
        registerHandler('game_over', handleGameOver);
        registerHandler('play_again', handlePlayAgain);

        requestSync('handler_registered');

        return () => {
            unregisterHandler('game_move', handleGameMove);
            unregisterHandler('sync_request', handleSyncRequest);
            unregisterHandler('sync_state', handleSyncState);
            unregisterHandler('wake_up', handleWakeUp);
            unregisterHandler('game_over', handleGameOver);
            unregisterHandler('play_again', handlePlayAgain);
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

            // Winner broadcast logic
            if (state.players?.isGameEnded && state.players?.playerFinishOrder?.length > 0) {
                const winner = state.players.playerFinishOrder[0];
                if (winner.colour === currentMyColour && sendMessage) {
                    // We are the winner, broadcast game_over
                    sendMessage('game_over', { game: 'ludo', winner: currentMemberId }, { reliable: true });
                }
            }

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
                            const diceNumber = dice.diceNumber;
                            pendingRollRef.current = { colour: dice.colour, diceNumber, createdAt: Date.now() };
                            sendMessage('dice_resolved', { colour: dice.colour, diceNumber, senderId: currentMemberId }, { reliable: true });
                        }
                    }
                    prevSpinnerState[dice.colour] = isSpinning;
                }
            }

            if (state.players?.isAnyTokenMoving && state.players?.players) {
                pendingRollRef.current = null;
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

    // 1c: New Game handler — host only
    const roomCreator = members.length > 0 ? members[0] : null;
    const handleNewGame = useCallback(async (shouldBroadcast = true) => {
        if (shouldBroadcast && (!roomCreator || currentMemberId !== roomCreator.id)) {
            toast.error(`Only ${roomCreator?.nickname || 'the host'} can start a new game!`);
            return;
        }

        // 1. Clear Redux
        store.dispatch({ type: 'players/clearPlayersState' });
        store.dispatch({ type: 'dice/clearDiceState' });
        store.dispatch({ type: 'board/clearBoardState' });
        store.dispatch({ type: 'session/clearSessionState' });

        // 2. Clear all refs
        localStorage.removeItem(ludoBackupKey.current);
        latestStateRef.current = null;
        latestUpdatedAtRef.current = 0;
        lastBroadcastStateRef.current = null;
        lastDbStateRef.current = null;
        moveHistoryRef.current = [];
        currentVersionRef.current = 0;
        hasUnsavedChangesRef.current = false;

        // 3. Allow init to re-run on next mount
        initializedRooms.delete(roomId);

        // 4. Clear DB state
        if (shouldBroadcast) {
            try {
                await fetch(`/api/love-space/ludo-state?roomId=${roomId}`, { method: 'DELETE' });
            } catch (e) {
                console.error('[Ludo] Failed to clear DB state on new game:', e);
            }

            // 5. Broadcast reset sentinel so non-creator peer also clears
            sendMessage?.('game_move', { game: 'ludo', reset: true }, { reliable: true });
            sendMessage?.('play_again', { game: 'ludo', senderId: currentMemberId }, { reliable: true });
        }

        // Part B: Activity ping (debounced)
        debouncedActivityPing();

        if (shouldBroadcast) toast.success('New game started!');
    }, [currentMemberId, roomCreator, roomId, sendMessage, ludoBackupKey, debouncedActivityPing]);

    // --- TRACK TURN CHANGES TO START/STOP INACTIVITY TIMER ---
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            const currentPlayerColour = state.players?.currentPlayerColour;
            if (currentPlayerColour) {
                // Reset activity timer when it's someone's turn
                resetActivityTimer();
            }
        });
        // Initial check
        resetActivityTimer();
        return unsubscribe;
    }, [resetActivityTimer]);

    // --- CLEAN UP TIMERS ON UNMOUNT ---
    useEffect(() => {
        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (loading) return;
        const t = setTimeout(() => {
            setIsSynced(prev => {
                if (!prev) console.warn('[Ludo] isSynced safety timeout fired — unlocking UI');
                return true;
            });
        }, 5000);
        return () => clearTimeout(t);
    }, [loading]);

    useEffect(() => {
        const interval = setInterval(() => {
            const state = store.getState();
            if (state.dice?.dice) {
                state.dice.dice.forEach((d: any) => {
                    // Safety: if dice has been rolling for more than 3s, force it to stop
                    // Note: we don't have a direct 'rollStartedAt' in Redux, but we can check if it's still showing
                    // This is a broad safety net.
                });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!isLoaded) {
        return (
            <div className="absolute inset-0 p-2 sm:p-4 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl w-full h-full">
                <GamePreloader progress={progress} gameName="Ludo" />
            </div>
        );
    }

    const isMyTurn = currentPlayerColour === myColour;
    const canRoll = connectionState === 'Connected' && isSynced && !pendingRollRef.current && isMyTurn;

    return (
        <Provider store={store}>
            <div className="absolute inset-0 p-2 sm:p-4 flex flex-col items-center justify-center ludo-wrapper overflow-y-auto overflow-x-hidden">
                {/* Nudge Toast */}
                {nudge && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold py-2 px-4 rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
                            <Bell className="w-3 h-3 text-orange-400" />
                            <span>{nudge.from} is waiting for you! 👋</span>
                        </div>
                    </div>
                )}

                {/* Dice Shake Animation */}
                <style jsx global>{`
                    @keyframes shake {
                        0% { transform: translate(1px, 1px) rotate(0deg); }
                        10% { transform: translate(-1px, -2px) rotate(-1deg); }
                        20% { transform: translate(-3px, 0px) rotate(1deg); }
                        30% { transform: translate(3px, 2px) rotate(0deg); }
                        40% { transform: translate(1px, -1px) rotate(1deg); }
                        50% { transform: translate(-1px, 2px) rotate(-1deg); }
                        60% { transform: translate(-3px, 1px) rotate(0deg); }
                        70% { transform: translate(3px, 1px) rotate(-1deg); }
                        80% { transform: translate(-1px, -1px) rotate(1deg); }
                        90% { transform: translate(1px, 2px) rotate(0deg); }
                        100% { transform: translate(1px, -2px) rotate(-1deg); }
                    }
                    .animate-shake {
                        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                        animation-iteration-count: 2;
                    }
                `}</style>

                {/* Disconnect Banner */}
                {showDisconnectBanner && (
                    <div className="absolute top-0 left-0 right-0 z-[100] animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-red-500/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold py-2 px-4 rounded-xl shadow-lg border border-white/20 text-center">
                            ⚠️ Partner offline or connection lost. The game will resume when both are back.
                        </div>
                    </div>
                )}

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

                <Game
                    initData={initData}
                    myColour={myColour || 'blue'}
                    otherOnline={otherOnline}
                    connectionStatus={connectionState}
                    diceShake={diceShake}
                    isDisabled={!canRoll}
                    onRestart={() => handleNewGame(true)}
                />

                {/* Wake Up Button for Ludo */}
                {!otherOnline ? (
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <div className="px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-xs font-bold text-red-600 dark:text-red-400 animate-pulse shadow-sm">
                            Partner Offline
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Waiting for your partner to reconnect…</p>
                    </div>
                ) : currentPlayerColour && myColour && currentPlayerColour !== myColour && (
                    <div className="mt-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <WakeUpButton
                            sendMessage={sendMessage}
                            currentMember={currentMember}
                            targetNickname={members.find(m => m.id !== currentMemberId)?.nickname || 'Partner'}
                            gameName="ludo"
                            onRequestSync={() => {
                                // Manual unlock for local player too
                                const state = store.getState();
                                if (state.dice?.dice) {
                                    state.dice.dice.forEach((d: any) => {
                                        if (d.isPlaceholderShowing) {
                                            store.dispatch(setIsPlaceholderShowing({ colour: d.colour, isPlaceholderShowing: false }));
                                        }
                                    });
                                }
                                if (pendingRollRef.current && (Date.now() - pendingRollRef.current.createdAt > 5000)) {
                                    pendingRollRef.current = null;
                                }
                                requestSync('wake_up_clicked');
                            }}
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

