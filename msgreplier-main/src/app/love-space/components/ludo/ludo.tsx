"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { LoveRoomMember } from '@/types/love-space';
import { Provider } from 'react-redux';
import { store, setSyncCallback } from './state/store';
import Game from './components/Game/Game';
import { TPlayerInitData, TPlayerColour } from './types';
import { debounce } from 'lodash-es';

import { supabase } from '@/lib/supabase';

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

        if (roomId && members.length > 0) {
            init();
        }
    }, [roomId, members, currentMember]);

    useEffect(() => {
        let isMounted = true;
        let channel: ReturnType<typeof supabase.channel> | null = null;

        channel = supabase
            .channel(`public:love_games:ludo:${roomId}`)
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
