"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { LoveRoomMember } from '@/types/love-space';
import { Provider } from 'react-redux';
import { store, setSyncCallback } from './state/store';
import Game from './components/Game/Game';
import { TPlayerInitData, TPlayerColour } from './types';
import { debounce } from 'lodash-es';

interface LudoProps {
    roomId: string;
    currentMember: LoveRoomMember;
    members?: LoveRoomMember[];
}

export function Ludo({ roomId, currentMember, members = [] }: LudoProps) {
    const [initData, setInitData] = useState<TPlayerInitData[]>([]);
    const [loading, setLoading] = useState(true);
    const lastBroadcastStateRef = useRef<string | null>(null);
    const [myColour, setMyColour] = useState<TPlayerColour | null>(null);

    const persistState = useCallback(debounce(async (stateToSave: any) => {
        const serialized = JSON.stringify(stateToSave);
        if (serialized === lastBroadcastStateRef.current) return;
        lastBroadcastStateRef.current = serialized;
        await fetch('/api/love-space/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, gameType: 'ludo', gameState: stateToSave })
        });
    }, 500), [roomId]);

    useEffect(() => {
        setSyncCallback((state) => {
            persistState(state);
        });
    }, [persistState]);

    useEffect(() => {
        const init = async () => {
            try {
                const gameRes = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=ludo`).then(res => res.json());

                const initialPlayers = [
                    { name: members[0]?.nickname || 'Player 1', isBot: false },
                    { name: members[1]?.nickname || 'Player 2', isBot: false },
                ];
                setInitData(initialPlayers);
                const idx = Math.max(0, members.findIndex(m => m.id === currentMember.id));
                const sequence: TPlayerColour[] = ['blue', 'green'];
                setMyColour(sequence[idx === -1 ? 0 : idx] || 'blue');

                const gameData = gameRes?.game;
                if (gameData?.game_state && Object.keys(gameData.game_state).length > 0) {
                    lastBroadcastStateRef.current = JSON.stringify(gameData.game_state);
                    store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: gameData.game_state });
                }
            } catch (err) {
                console.error("Failed to init ludo:", err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [roomId, members]);

    useEffect(() => {
        let isMounted = true;
        let eventSource: EventSource | null = null;

        try {
            eventSource = new EventSource(`/api/love-space/games/stream?roomId=${roomId}&gameType=ludo`);
            eventSource.addEventListener('game', (event) => {
                try {
                    const payload = JSON.parse((event as MessageEvent).data) as { game_state?: any };
                    if (payload?.game_state && Object.keys(payload.game_state).length > 0) {
                        const serialized = JSON.stringify(payload.game_state);
                        if (serialized !== lastBroadcastStateRef.current) {
                            lastBroadcastStateRef.current = serialized;
                            store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: payload.game_state });
                        }
                    }
                } catch {
                    // ignore parse errors
                }
            });
        } catch { }

        return () => {
            isMounted = false;
            if (eventSource) eventSource.close();
        };
    }, [roomId]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const gameRes = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=ludo`).then(res => res.json());
                const gameData = gameRes?.game;
                if (gameData?.game_state && Object.keys(gameData.game_state).length > 0) {
                    const serialized = JSON.stringify(gameData.game_state);
                    if (serialized !== lastBroadcastStateRef.current) {
                        lastBroadcastStateRef.current = serialized;
                        store.dispatch({ type: 'HYDRATE_GAME_STATE', payload: gameData.game_state });
                    }
                }
            } catch {
                // ignore
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [roomId]);

    if (loading) {
        return <div className="text-gray-400 dark:text-gray-500 animate-pulse text-center p-4">Loading Ludo...</div>;
    }

    return (
        <Provider store={store}>
            <div className="w-full h-full relative flex items-center justify-center ludo-wrapper">
                <Game initData={initData} myColour={myColour || 'blue'} />
            </div>
        </Provider>
    );
}
