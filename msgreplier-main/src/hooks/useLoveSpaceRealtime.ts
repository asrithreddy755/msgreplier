'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { LoveRoomMember, LoveMessage } from '@/types/love-space';

export type UseLoveSpaceRealtimeProps = {
    roomId: string;
    currentMemberId: string;
};

export type RealtimeState = {
    messages: LoveMessage[];
    members: LoveRoomMember[];
    gameState: any; // ludo, xox, snake
    ludoState: any;
    onlineUsers: Set<string>;
};

export function useLoveSpaceRealtime({ roomId, currentMemberId }: UseLoveSpaceRealtimeProps) {
    const [messages, setMessages] = useState<LoveMessage[]>([]);
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [gameState, setGameState] = useState<any>(null);
    const [ludoState, setLudoState] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const channelRef = useRef<RealtimeChannel | null>(null);

    // --- Initial Load Functions ---
    const loadInitialMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/love-space/messages?roomId=${roomId}`);
            const data = await res.json();
            if (Array.isArray(data?.messages)) {
                setMessages(data.messages);
            }
        } catch (e) {
            console.error('[Realtime] Failed to load initial messages:', e);
        }
    }, [roomId]);

    const loadInitialMembers = useCallback(async () => {
        try {
            const res = await fetch(`/api/love-space/members?roomId=${roomId}`);
            const data = await res.json();
            if (Array.isArray(data?.members)) {
                setMembers(data.members);
            }
        } catch (e) {
            console.error('[Realtime] Failed to load initial members:', e);
        }
    }, [roomId]);

    const loadInitialGameState = useCallback(async (gameType: string) => {
        try {
            const res = await fetch(`/api/love-space/games?roomId=${roomId}&gameType=${gameType}`);
            const data = await res.json();
            if (data?.game?.game_state) {
                if (gameType === 'ludo') {
                    setLudoState(data.game.game_state);
                } else {
                    setGameState(data.game.game_state);
                }
            }
        } catch (e) {
            console.error('[Realtime] Failed to load initial game state:', e);
        }
    }, [roomId]);

    const loadInitialLudoState = useCallback(async () => {
        try {
            const res = await fetch(`/api/love-space/ludo-state?roomId=${roomId}`);
            const data = await res.json();
            if (data?.game?.game_state) {
                setLudoState(data.game.game_state);
            }
        } catch (e) {
            console.error('[Realtime] Failed to load initial ludo state:', e);
        }
    }, [roomId]);

    // --- Realtime Handlers ---
    const handleMessageChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
        console.log('[Realtime] Message change:', payload);
        if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as LoveMessage]);
        }
    }, []);

    const handleMemberChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
        console.log('[Realtime] Member change:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setMembers(prev => {
                const existing = prev.find(m => m.id === payload.new.id);
                if (existing) {
                    return prev.map(m => m.id === payload.new.id ? payload.new : m);
                }
                return [...prev, payload.new as LoveRoomMember];
            });
        } else if (payload.eventType === 'DELETE') {
            setMembers(prev => prev.filter(m => m.id !== payload.old.id));
        }
    }, []);

    const handleGameChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
        console.log('[Realtime] Game change:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const gameType = payload.new.game_type;
            if (gameType === 'ludo') {
                setLudoState(payload.new.game_state);
            } else {
                setGameState(payload.new.game_state);
            }
        }
    }, []);

    const handleLudoStateChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
        console.log('[Realtime] Ludo state change:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setLudoState(payload.new.game_state);
        }
    }, []);

    // --- Presence ---
    const handlePresenceSync = useCallback(() => {
        if (!channelRef.current) return;
        const state = channelRef.current.presenceState();
        const users = new Set<string>();
        for (const key in state) {
            users.add(key);
        }
        setOnlineUsers(users);
        console.log('[Realtime] Presence sync:', users);
    }, []);

    const handlePresenceJoin = useCallback(({ key, newPresences }: any) => {
        console.log('[Realtime] Presence join:', key, newPresences);
        setOnlineUsers(prev => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });
    }, []);

    const handlePresenceLeave = useCallback(({ key }: any) => {
        console.log('[Realtime] Presence leave:', key);
        setOnlineUsers(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    }, []);

    // --- Subscribe ---
    useEffect(() => {
        if (!roomId || !currentMemberId) return;

        // Create channel
        const channelName = `room:${roomId}`;
        console.log('[Realtime] Subscribing to channel:', channelName);

        const channel = supabase.channel(channelName, {
            config: {
                presence: { key: currentMemberId }
            }
        });

        // Subscribe to presence
        channel
            .on('presence', { event: 'sync' }, handlePresenceSync)
            .on('presence', { event: 'join' }, handlePresenceJoin)
            .on('presence', { event: 'leave' }, handlePresenceLeave);

        // Subscribe to database changes
        channel
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'love_messages',
                filter: `room_id=eq.${roomId}`
            }, handleMessageChange)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'love_room_members',
                filter: `room_id=eq.${roomId}`
            }, handleMemberChange)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'love_games',
                filter: `room_id=eq.${roomId}`
            }, handleGameChange);

        // For backwards compatibility with ludo-state table if it exists
        try {
            channel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'love_ludo_state', // assuming table name
                filter: `room_id=eq.${roomId}`
            }, handleLudoStateChange);
        } catch (e) {
            console.warn('[Realtime] Love ludo state table not found, skipping:', e);
        }

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                console.log('[Realtime] Subscribed successfully');
                await channel.track({
                    online_at: new Date().toISOString()
                });

                // Load initial data
                await Promise.all([
                    loadInitialMessages(),
                    loadInitialMembers()
                ]);
            }
        });

        channelRef.current = channel;

        return () => {
            console.log('[Realtime] Unsubscribing from channel');
            channel.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [
        roomId,
        currentMemberId,
        handleMessageChange,
        handleMemberChange,
        handleGameChange,
        handleLudoStateChange,
        handlePresenceSync,
        handlePresenceJoin,
        handlePresenceLeave,
        loadInitialMessages,
        loadInitialMembers
    ]);

    return {
        messages,
        setMessages,
        members,
        setMembers,
        gameState,
        setGameState,
        ludoState,
        setLudoState,
        onlineUsers,
        loadInitialGameState,
        loadInitialLudoState
    };
}