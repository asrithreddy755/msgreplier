"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
    sendMessage?: (type: WebRTCMessageType, payload?: any) => void;
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
    const [myColour, setMyColour] = useState<TPlayerColour | null>(null);
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
    const ludoBackupKey = useMemo(() => `ludo_backup_${roomId}`, [roomId]);

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
        const currentUpdatedAt = latestUpdatedAtRef.current;
        const shouldApply = !latestStateRef.current || normalizedUpdatedAt >= currentUpdatedAt;
        if (!shouldApply) return;

        const serialized = serializeState(incomingState);
        if (serialized !== lastBroadcastStateRef.current) {
            lastBroadcastStateRef.current = serialized;
            store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: incomingState });
        }

        latestStateRef.current = incomingState;
        latestUpdatedAtRef.current = normalizedUpdatedAt || Date.now();
        if (Array.isArray(incomingState.moves)) {
            moveHistoryRef.current = incomingState.moves.slice(-200);
        }

        if (shouldBackup) {
            try {
                localStorage.setItem(ludoBackupKey, JSON.stringify({ state: incomingState, updatedAt: latestUpdatedAtRef.current }));
            } catch {
                return;
            }
        }
    }, [ludoBackupKey]);

    const saveToDb = useMemo(() => throttle((stateToSave: any, updatedAt: number) => {
        const serialized = serializeState(stateToSave);
        if (serialized === lastDbStateRef.current) return;
        lastDbStateRef.current = serialized;
        fetch('/api/love-space/ludo-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, gameState: stateToSave, lastUpdated: updatedAt }),
        }).catch(() => {
            return;
        });
    }, 3000, { leading: true, trailing: true }), [roomId]);

    useEffect(() => {
        return () => {
            saveToDb.cancel();
        };
    }, [saveToDb]);

    const requestSync = useCallback((reason: string) => {
        if (!sendMessage) return;
        const now = Date.now();
        if (now - lastSyncRequestAtRef.current < 1200) return;
        lastSyncRequestAtRef.current = now;
        sendMessage('sync_request', { game: 'ludo', roomId, senderId: currentMemberId, reason, sentAt: now });
    }, [sendMessage, roomId, currentMemberId]);

    const persistState = useCallback(debounce((stateToSave: any) => {
        const serialized = serializeState(stateToSave);
        if (serialized === lastBroadcastStateRef.current) return;

        const updatedAt = Date.now();
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
        };

        lastBroadcastStateRef.current = serialized;
        latestStateRef.current = payloadState;
        latestUpdatedAtRef.current = updatedAt;

        try {
            localStorage.setItem(ludoBackupKey, JSON.stringify({ state: payloadState, updatedAt }));
        } catch {
            return;
        }

        sendMessage?.('game_move', { game: 'ludo', state: payloadState, updatedAt });
        saveToDb(payloadState, updatedAt);
    }, 400), [sendMessage, saveToDb, ludoBackupKey]);

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
    }, [roomId]);

    useEffect(() => {
        if (hasInitializedRef.current) return;

        const init = async () => {
            const currentMembers = membersRef.current;
            if (!roomId || currentMembers.length === 0) return;

            const initialPlayers = [
                { name: currentMembers[0]?.nickname || 'Player 1', isBot: false },
                { name: currentMembers[1]?.nickname || 'Player 2', isBot: false },
            ];
            setInitData(initialPlayers);
            const idx = currentMembers.findIndex(m => m.id === currentMemberId);
            const sequence: TPlayerColour[] = ['blue', 'green'];
            setMyColour(sequence[idx === -1 ? 0 : idx] || 'blue');

            hasInitializedRef.current = true;
            try {
                const backupRaw = localStorage.getItem(ludoBackupKey);
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

        if (roomId && membersRef.current.length > 0) {
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
            const state = latestStateRef.current || store.getState();
            const updatedAt = latestUpdatedAtRef.current || Date.now();
            sendMessage?.('sync_state', { game: 'ludo', state, updatedAt });
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
    }, [registerHandler, unregisterHandler, sendMessage, currentMemberId, applyIncomingState, requestSync]);

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

        registerHandler('dice_start', handleDiceStart);
        registerHandler('dice_resolved', handleDiceResolved);
        registerHandler('token_moving', handleTokenMoving);

        let prevSpinnerState: Record<string, boolean> = {};
        let prevTokenCoords: Record<string, { x: number; y: number }> = {};

        const unsubscribeStore = store.subscribe(() => {
            const state = store.getState();
            const currentMyColour = myColourRef.current;

            if (state.dice?.dice) {
                for (const dice of state.dice.dice) {
                    const wasSpinning = prevSpinnerState[dice.colour] ?? false;
                    const isSpinning = dice.isPlaceholderShowing ?? false;

                    if (dice.colour === currentMyColour && sendMessage) {
                        if (isSpinning && !wasSpinning) {
                            sendMessage('dice_start', { colour: dice.colour, senderId: currentMemberId });
                        }
                        if (!isSpinning && wasSpinning) {
                            sendMessage('dice_resolved', { colour: dice.colour, diceNumber: dice.diceNumber, senderId: currentMemberId });
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
                            });
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
            <div className="absolute inset-0 p-2 sm:p-4 flex items-center justify-center ludo-wrapper overflow-y-auto overflow-x-hidden">
                <Game initData={initData} myColour={myColour || 'blue'} otherOnline={otherOnline} />
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

