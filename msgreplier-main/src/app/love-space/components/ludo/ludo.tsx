"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
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

import { supabase } from '@/lib/supabase';

interface LudoProps {
    roomId: string;
    currentMember: LoveRoomMember;
    members?: LoveRoomMember[];
    otherOnline?: boolean;
}

export function Ludo({ roomId, currentMember, members = [], otherOnline = true }: LudoProps) {
    const currentMemberId = currentMember.id;
    const [initData, setInitData] = useState<TPlayerInitData[]>([]);
    const [loading, setLoading] = useState(true);
    const lastBroadcastStateRef = useRef<string | null>(null);
    const [myColour, setMyColour] = useState<TPlayerColour | null>(null);
    // Ensures the init fetch + store hydration only ever runs once per roomId,
    // even if the parent re-renders with a new `members` array reference.
    const hasInitializedRef = useRef(false);
    // Keep a ref to the latest members so the init callback can read them
    // without having members in the effect dep array.
    const membersRef = useRef(members);
    useEffect(() => { membersRef.current = members; }, [members]);

    const persistState = useCallback(debounce(async (stateToSave: any) => {
        const serialized = JSON.stringify(stateToSave);
        if (serialized === lastBroadcastStateRef.current) return;
        lastBroadcastStateRef.current = serialized;
        try {
            await fetch('/api/love-space/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, gameType: 'ludo', gameState: stateToSave })
            });
        } catch (err) {
            console.error("Failed to persist ludo state:", err);
        }
    }, 500), [roomId]);

    useEffect(() => {
        setSyncCallback((state) => {
            persistState(state);
        });
    }, [persistState]);

    useEffect(() => {
        // Guard: only initialise once per roomId. Without this, every time the parent
        // calls setMembers() (e.g. on presence sync), the `members.length` dep would
        // re-trigger this effect, causing a double-fetch and a second HYDRATE_GAME_STATE
        // dispatch that overwrites any moves made since first load.
        if (hasInitializedRef.current) return;

        const init = async () => {
            // Read the latest members from the ref so we don't need members in the dep array
            const currentMembers = membersRef.current;
            if (!roomId || currentMembers.length === 0) return;

            hasInitializedRef.current = true;
            try {
                const gameRes = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=ludo`).then(res => res.json());

                const initialPlayers = [
                    { name: currentMembers[0]?.nickname || 'Player 1', isBot: false },
                    { name: currentMembers[1]?.nickname || 'Player 2', isBot: false },
                ];
                setInitData(initialPlayers);
                const idx = currentMembers.findIndex(m => m.id === currentMemberId);
                const sequence: TPlayerColour[] = ['blue', 'green'];
                setMyColour(sequence[idx === -1 ? 0 : idx] || 'blue');

                const gameData = gameRes?.game;
                if (gameData?.game_state && Object.keys(gameData.game_state).length > 0) {
                    lastBroadcastStateRef.current = JSON.stringify(gameData.game_state);
                    store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: gameData.game_state });
                }
            } catch (err) {
                console.error("Failed to init ludo:", err);
                hasInitializedRef.current = false; // allow retry on error
            } finally {
                setLoading(false);
            }
        };

        if (roomId && membersRef.current.length > 0) {
            init();
        }
        // Deps: roomId resets the whole session (correct). members.length triggers the
        // first run once the parent has loaded members, but hasInitializedRef prevents
        // any subsequent runs caused by members array reference changes.
    }, [roomId, members.length, currentMemberId]);

    // ─── Postgres Changes: authoritative turn-end state sync ────────────────
    useEffect(() => {
        let isMounted = true;
        let channel: ReturnType<typeof supabase.channel> | null = null;

        channel = supabase
            .channel(`public:love_games:ludo:${roomId}`)
            .on(
                'postgres_changes',
                {
                    // '*' catches both INSERT (first move, no row yet) and UPDATE (subsequent moves).
                    // With UPSERT, the very first write is an INSERT — subscribing only to 'UPDATE'
                    // would miss it and leave the opponent's board empty until they refresh.
                    event: '*',
                    schema: 'public',
                    table: 'love_games',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload: any) => {
                    if (!isMounted) return;

                    const newGame = payload.new;
                    // We only care about ludo updates in this component
                    if (newGame.game_type !== 'ludo') return;

                    if (newGame?.game_state && Object.keys(newGame.game_state).length > 0) {
                        const serialized = JSON.stringify(newGame.game_state);
                        // Prevent echo loops
                        if (serialized !== lastBroadcastStateRef.current) {
                            lastBroadcastStateRef.current = serialized;
                            store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: newGame.game_state });
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

    // Keep a ref to myColour to avoid closure staleness
    const myColourRef = useRef<TPlayerColour | null>(null);
    useEffect(() => { myColourRef.current = myColour; }, [myColour]);

    // ─── Broadcast Channel: transient dice + token animation sync ───────────
    // This sends animation signals peer-to-peer via WebSocket with ZERO DB writes.
    // It lets the opponent see dice spinning and token movement in real-time,
    // while the authoritative state (final positions, turn order) arrives via postgres_changes.
    useEffect(() => {
        if (!roomId) return;

        const broadcastChannel = supabase.channel(`room:ludo:broadcast:${roomId}`);

        // Receive: opponent rolled — show their dice animation locally
        broadcastChannel
            .on('broadcast', { event: 'dice_start' }, ({ payload }) => {
                if (!payload || payload.senderId === currentMemberId) return;
                store.dispatch(setIsPlaceholderShowing({ colour: payload.colour, isPlaceholderShowing: true }));
            })
            .on('broadcast', { event: 'dice_resolved' }, ({ payload }) => {
                if (!payload || payload.senderId === currentMemberId) return;
                // Dispatch both to turn off the spinner AND to explicitly set the incoming dice number!
                store.dispatch({
                    type: 'dice/resolveBroadcastRoll',
                    payload: { colour: payload.colour, diceNumber: payload.diceNumber }
                });
            })
            // Receive: opponent's token moved one step — show the movement animation locally
            .on('broadcast', { event: 'token_moving' }, ({ payload }) => {
                if (!payload || payload.senderId === currentMemberId) return;
                // Dispatch changeCoordsOfToken to animate the token step-by-step on this client.
                setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME, { colour: payload.colour, id: payload.tokenId } as any);
                // This is purely visual — the authoritative coordinates arrive via HYDRATE_GAME_STATE.
                store.dispatch(changeCoordsOfToken({
                    colour: payload.colour,
                    id: payload.tokenId,
                    newCoords: payload.currentTile,
                }));
            })
            .subscribe();

        // Send: watch store for state transitions and broadcast them
        let prevSpinnerState: Record<string, boolean> = {};
        // Track previous token coordinates per colour+id to detect per-step moves
        let prevTokenCoords: Record<string, { x: number; y: number }> = {};

        const unsubscribeStore = store.subscribe(() => {
            const state = store.getState();
            const currentMyColour = myColourRef.current;

            // ── Dice animation events ──────────────────────────────────────────
            if (state.dice?.dice) {
                for (const dice of state.dice.dice) {
                    const wasSpinning = prevSpinnerState[dice.colour] ?? false;
                    const isSpinning = dice.isPlaceholderShowing ?? false;

                    // ONLY broadcast state changes if we are the owner of this colour
                    if (dice.colour === currentMyColour) {
                        if (isSpinning && !wasSpinning) {
                            broadcastChannel.send({
                                type: 'broadcast',
                                event: 'dice_start',
                                payload: { colour: dice.colour, senderId: currentMemberId },
                            }).catch(() => { });
                        }
                        if (!isSpinning && wasSpinning) {
                            broadcastChannel.send({
                                type: 'broadcast',
                                event: 'dice_resolved',
                                payload: { colour: dice.colour, diceNumber: dice.diceNumber, senderId: currentMemberId },
                            }).catch(() => { });
                        }
                    }
                    prevSpinnerState[dice.colour] = isSpinning;
                }
            }

            // ── Token movement events ──────────────────────────────────────────
            // Only broadcast while a token is actively moving to avoid spamming
            // token_moving events during the initial HYDRATE or idle state changes.
            if (state.players?.isAnyTokenMoving && state.players?.players) {
                for (const player of state.players.players) {
                    // ONLY broadcast moves for our own tokens
                    if (player.colour !== currentMyColour) continue;

                    for (const token of player.tokens) {
                        const key = `${player.colour}_${token.id}`;
                        const prev = prevTokenCoords[key];
                        const curr = token.coordinates;
                        if (!prev || prev.x !== curr.x || prev.y !== curr.y) {
                            broadcastChannel.send({
                                type: 'broadcast',
                                event: 'token_moving',
                                payload: {
                                    colour: player.colour,
                                    tokenId: token.id,
                                    currentTile: curr,
                                    senderId: currentMemberId,
                                },
                            }).catch(() => { });
                            prevTokenCoords[key] = { x: curr.x, y: curr.y };
                        }
                    }
                }
            }
        });

        return () => {
            unsubscribeStore();
            supabase.removeChannel(broadcastChannel);
        };
    }, [roomId, currentMemberId]);

    return (
        <Provider store={store}>
            <div className="absolute inset-0 p-2 sm:p-4 flex items-center justify-center ludo-wrapper overflow-y-auto overflow-x-hidden">
                <Game initData={initData} myColour={myColour || 'blue'} otherOnline={otherOnline} />
                {/* Skeleton overlay: only dims the dice panel while the initial fetch is in-flight */}
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

