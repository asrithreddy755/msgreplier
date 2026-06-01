'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { LoveRoomMember, LoveMessage } from '@/types/love-space';
import type { RealtimeMessageType, RealtimeMessage } from '@/lib/realtime/types';

export type UseLoveSpaceRealtimeProps = {
    roomId: string;
    currentMemberId: string;
};

export type ConnectionState = 'Connecting...' | 'Connected' | 'Opponent disconnected' | 'Paused (Idle)' | 'Background (Paused)';

const PING_INTERVAL_MS = 5000;
const ACK_TIMEOUT_MS = 2500;
const MAX_ACK_ATTEMPTS = 5;
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes idle timeout

export function useLoveSpaceRealtime({ roomId, currentMemberId }: UseLoveSpaceRealtimeProps) {
    const [messages, setMessages] = useState<LoveMessage[]>([]);
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [gameState, setGameState] = useState<any>(null);
    const [ludoState, setLudoState] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [connectionState, setConnectionState] = useState<ConnectionState>('Connecting...');
    const [latencyMs, setLatencyMs] = useState(0);
    const [isIdle, setIsIdle] = useState(false);
    const [reconnectTrigger, setReconnectTrigger] = useState(0);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const channelSubscribedRef = useRef(false); // guard: only send when SUBSCRIBED
    const handlersRef = useRef<Map<RealtimeMessageType, Set<(payload: any) => void>>>(new Map());
    const pingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingAcksRef = useRef<Map<string, { timer: NodeJS.Timeout; attempts: number }>>(new Map());
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef(true);

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

    // --- Realtime Handlers for Database Changes ---
    const handleMessageChange = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
        console.log('[Realtime] Message change:', payload);
        if (payload.eventType === 'INSERT') {
            setMessages(prev => {
                if (prev.some(m => m.id === payload.new.id)) return prev;
                return [...prev, payload.new as LoveMessage];
            });
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
        const presenceState = channelRef.current.presenceState();
        const users = new Set<string>();
        for (const key in presenceState) {
            users.add(key.toLowerCase());
        }
        setOnlineUsers(users);
        console.log('[Realtime] Presence sync:', users);
    }, []);

    const handlePresenceJoin = useCallback(({ key, newPresences }: any) => {
        console.log('[Realtime] Presence join:', key, newPresences);
        setOnlineUsers(prev => {
            const next = new Set(prev);
            next.add(String(key).toLowerCase());
            return next;
        });
    }, []);

    const handlePresenceLeave = useCallback(({ key }: any) => {
        console.log('[Realtime] Presence leave:', key);
        setOnlineUsers(prev => {
            const next = new Set(prev);
            next.delete(String(key).toLowerCase());
            return next;
        });
    }, []);

    // --- Broadcast Client-to-Client Messaging System ---
    const sendMessage = useCallback(
        (type: RealtimeMessageType, payload?: any, options?: { reliable?: boolean; id?: string }) => {
            // Only send if the channel is currently SUBSCRIBED (avoids REST fallback warning)
            if (!channelRef.current || !channelSubscribedRef.current) return;

            const id = options?.id || (options?.reliable ? crypto.randomUUID() : undefined);
            const msg: RealtimeMessage = { type, payload };
            if (id) msg.id = id;

            console.log(`[Realtime Broadcast] Sending event: ${type}`);
            channelRef.current.send({
                type: 'broadcast',
                event: 'realtime_broadcast',
                payload: msg
            }).catch(() => {});

            if (options?.reliable && id) {
                const timer = setTimeout(() => {
                    const pending = pendingAcksRef.current.get(id);
                    if (pending) {
                        if (pending.attempts < MAX_ACK_ATTEMPTS) {
                            sendMessage(type, payload, { reliable: true, id });
                            pendingAcksRef.current.set(id, { 
                                timer: setTimeout(() => {}, ACK_TIMEOUT_MS), 
                                attempts: pending.attempts + 1 
                            });
                        } else {
                            pendingAcksRef.current.delete(id);
                        }
                    }
                }, ACK_TIMEOUT_MS);
                pendingAcksRef.current.set(id, { timer, attempts: 1 });
            }
        },
        []
    );

    const registerHandler = useCallback((type: RealtimeMessageType, handler: (payload: any) => void) => {
        if (!handlersRef.current.has(type)) {
            handlersRef.current.set(type, new Set());
        }
        handlersRef.current.get(type)!.add(handler);
    }, []);

    const unregisterHandler = useCallback((type: RealtimeMessageType, handler?: (payload: any) => void) => {
        const handlers = handlersRef.current.get(type);
        if (handlers) {
            if (handler) handlers.delete(handler);
            else handlers.clear();
        }
    }, []);

    const reconnect = useCallback(() => {
        setReconnectTrigger(prev => prev + 1);
    }, []);

    const teardown = useCallback(() => {
        channelSubscribedRef.current = false; // mark unsubscribed before teardown
        if (pingTimerRef.current) {
            clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
        }
        pendingAcksRef.current.forEach(p => clearTimeout(p.timer));
        pendingAcksRef.current.clear();
        if (channelRef.current) {
            channelRef.current.unsubscribe();
            channelRef.current = null;
        }
    }, []);

    // --- Resume Session (Resume from Idle or Background) ---
    const resumeSession = useCallback(() => {
        console.log('[Realtime] Resuming active connection...');
        setIsIdle(false);
        shouldReconnectRef.current = true;
        setConnectionState('Connecting...');
        reconnect();
    }, [reconnect]);

    // --- Activity & Visibility Handling ---
    useEffect(() => {
        if (!roomId || !currentMemberId) return;

        const resetIdleTimer = () => {
            if (isIdle) {
                resumeSession();
            }
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                console.warn('[Realtime] User went idle. Tearing down WebSocket connection.');
                setIsIdle(true);
                setConnectionState('Paused (Idle)');
                teardown();
            }, IDLE_TIMEOUT_MS);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.log('[Realtime] Tab backgrounded. Tearing down connection.');
                shouldReconnectRef.current = false;
                setConnectionState('Background (Paused)');
                teardown();
            } else if (document.visibilityState === 'visible' && !isIdle) {
                console.log('[Realtime] Tab active. Re-connecting WebSocket.');
                shouldReconnectRef.current = true;
                setConnectionState('Connecting...');
                reconnect();
            }
        };

        // Activity listeners
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
        window.addEventListener('click', resetIdleTimer);
        window.addEventListener('scroll', resetIdleTimer);
        window.addEventListener('touchstart', resetIdleTimer);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initialize Idle Timer
        resetIdleTimer();

        return () => {
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('click', resetIdleTimer);
            window.removeEventListener('scroll', resetIdleTimer);
            window.removeEventListener('touchstart', resetIdleTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [roomId, currentMemberId, isIdle, teardown, reconnect, resumeSession]);

    // --- Channel Subscription ---
    useEffect(() => {
        if (!roomId || !currentMemberId || isIdle || !shouldReconnectRef.current) return;

        teardown();

        const channelName = `room:${roomId}`;
        console.log('[Realtime] Creating single consolidated channel:', channelName);

        const channel = supabase.channel(channelName, {
            config: {
                presence: { key: currentMemberId }
            }
        });

        // Register Presence listeners
        channel
            .on('presence', { event: 'sync' }, handlePresenceSync)
            .on('presence', { event: 'join' }, handlePresenceJoin)
            .on('presence', { event: 'leave' }, handlePresenceLeave);

        // Register Broadcast listener
        channel.on('broadcast', { event: 'realtime_broadcast' }, (data) => {
            const msg = data.payload as RealtimeMessage;
            if (!msg) return;

            // Handle reliability ACKs
            if (msg.id !== undefined && msg.type !== 'ack') {
                sendMessage('ack', { id: msg.id });
            }

            if (msg.type === 'ack') {
                const payloadId = msg.payload?.id;
                if (payloadId) {
                    const pending = pendingAcksRef.current.get(payloadId);
                    if (pending) {
                        clearTimeout(pending.timer);
                        pendingAcksRef.current.delete(payloadId);
                    }
                }
                return;
            }

            // Latency measurement
            if (msg.type === 'ping') {
                sendMessage('pong', { timestamp: msg.payload?.timestamp });
                return;
            }

            if (msg.type === 'pong') {
                if (msg.payload?.timestamp) {
                    setLatencyMs(Date.now() - msg.payload.timestamp);
                }
                return;
            }

            // Dispatch to handlers
            const handlers = handlersRef.current.get(msg.type);
            if (handlers) {
                handlers.forEach(h => {
                    try { h(msg.payload); } catch (e) { console.error('[Realtime Broadcast] Handler error:', e); }
                });
            }
        });

        // Register Postgres Changes table listeners
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

        // Optional Love Ludo state compatibility listener
        try {
            channel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'love_ludo_state',
                filter: `room_id=eq.${roomId}`
            }, handleLudoStateChange);
        } catch (e) {
            console.warn('[Realtime] Love ludo state table not found, skipping:', e);
        }

        channel.subscribe(async (status) => {
            console.log('[Realtime Channel] Status changed to:', status);
            if (status === 'SUBSCRIBED') {
                channelSubscribedRef.current = true;
                setConnectionState('Connected');
                await channel.track({
                    online_at: new Date().toISOString()
                });

                // Load initial DB states
                await Promise.all([
                    loadInitialMessages(),
                    loadInitialMembers()
                ]);

                // Start ping/pong ping loop — only when fully subscribed
                if (pingTimerRef.current) clearInterval(pingTimerRef.current);
                pingTimerRef.current = setInterval(() => {
                    sendMessage('ping', { timestamp: Date.now() });
                }, PING_INTERVAL_MS);
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
                // Stop ping loop immediately so no sends fire on a dead channel
                channelSubscribedRef.current = false;
                if (pingTimerRef.current) {
                    clearInterval(pingTimerRef.current);
                    pingTimerRef.current = null;
                }
                setConnectionState('Opponent disconnected');
            }
        });

        channelRef.current = channel;

        return () => {
            teardown();
            supabase.removeChannel(channel);
        };
    }, [
        roomId,
        currentMemberId,
        isIdle,
        reconnectTrigger,
        handleMessageChange,
        handleMemberChange,
        handleGameChange,
        handleLudoStateChange,
        handlePresenceSync,
        handlePresenceJoin,
        handlePresenceLeave,
        loadInitialMessages,
        loadInitialMembers,
        sendMessage,
        teardown
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
        loadInitialLudoState,
        connectionState,
        latencyMs,
        isIdle,
        resumeSession,
        sendMessage,
        registerHandler,
        unregisterHandler,
        reconnect,
        teardown,
        reconnectTrigger
    };
}