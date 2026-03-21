// src/hooks/useWebRTC.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { WebRTCConnection } from '@/lib/webrtc/connection';
import { WebRTCSignaling } from '@/lib/webrtc/signaling';
import { WebRTCDataChannelManager, WebRTCMessageType } from '@/lib/webrtc/dataChannel';

export type WebRTCConnectionState = 'Connecting...' | 'Waiting for opponent' | 'Connected' | 'Opponent disconnected';

export function useWebRTC(
    roomId: string, 
    localMemberId: string, 
    isCreator: boolean, 
    isLeader: boolean = true
) {
    const [connectionState, setConnectionState] = useState<WebRTCConnectionState>('Connecting...');
    const [latencyMs, setLatencyMs] = useState<number>(0);
    const [rtcStats, setRtcStats] = useState<any>(null);

    const connectionRef = useRef<WebRTCConnection | null>(null);
    const signalingRef = useRef<WebRTCSignaling | null>(null);
    const dcManagerRef = useRef<WebRTCDataChannelManager | null>(null);
    
    const isReconnectingRef = useRef(false);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 10;
    const wasEverConnectedRef = useRef(false);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const connectionWatchdogRef = useRef<NodeJS.Timeout | null>(null);
    const connectionStateRef = useRef<WebRTCConnectionState>('Connecting...');
    const initWebRTCRef = useRef<() => Promise<void>>(null as any);
    const lastInitParamsRef = useRef<string>('');

    const handlersRef = useRef<Map<WebRTCMessageType, Set<(payload: any) => void>>>(new Map());

    const teardown = useCallback(() => {
        console.log("[RTC] Tearing down WebRTC stack...");
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (connectionWatchdogRef.current) {
            clearTimeout(connectionWatchdogRef.current);
            connectionWatchdogRef.current = null;
        }

        if (dcManagerRef.current) dcManagerRef.current.close();
        if (signalingRef.current) signalingRef.current.disconnect();
        if (connectionRef.current) connectionRef.current.close();
        
        connectionRef.current = null;
        signalingRef.current = null;
        dcManagerRef.current = null;
        setConnectionState('Opponent disconnected');
        connectionStateRef.current = 'Opponent disconnected';
    }, []);

    const internalReconnect = useCallback(async (options: { soft: boolean }) => {
        if (!roomId || !localMemberId || isReconnectingRef.current || !isLeader) return;
        
        if (options.soft) {
            if (!isCreator) {
                console.log("[RTC] Soft reconnect: Host-only duty. Passive waiting.");
                return;
            }

            // Critical check: only restart ICE if we are actually connected according to the Ref
            if (connectionRef.current && connectionStateRef.current === 'Connected') {
                const offer = await connectionRef.current.restartIce();
                if (offer && signalingRef.current) {
                    await signalingRef.current.sendOffer(offer);
                    return;
                } else if (!offer) {
                    console.warn("[RTC] Soft reconnect failed or aborted. Escalating to Hard Reconnect.");
                }
            }
        }

        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            console.error("[RTC] Max reconnect attempts reached.");
            teardown();
            return;
        }

        isReconnectingRef.current = true;
        reconnectAttemptsRef.current++;
        lastInitParamsRef.current = ""; // 🧨 Clear guard to force reset
        
        const delay = Math.min(30000, 2000 * Math.pow(1.5, reconnectAttemptsRef.current - 1));
        console.log(`[RTC] Hard reconnect in ${Math.round(delay)}ms (Attempt ${reconnectAttemptsRef.current})`);
        
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
            initWebRTCRef.current?.();
            isReconnectingRef.current = false;
        }, delay);
    }, [roomId, localMemberId, isCreator, isLeader, teardown]);

    const initWebRTC = useCallback(async () => {
        const updateState = (state: WebRTCConnectionState) => {
            setConnectionState(state);
            connectionStateRef.current = state;
        };

        if (!isLeader) {
            updateState('Waiting for opponent');
            return;
        }

        // 🧨 Guard: Only fully re-initialize if core params changed
        const currentParams = JSON.stringify({ roomId, localMemberId, isCreator, isLeader });
        if (lastInitParamsRef.current === currentParams && connectionRef.current) {
            console.log("[RTC] initWebRTC: Params unchanged, skipping full reset.");
            return;
        }
        lastInitParamsRef.current = currentParams;

        try {
            teardown();
            
            // 🧨 Initial immediate state update to avoid "Opponent disconnected" hang
            // MUST be after teardown() so teardown doesn't overwrite it
            updateState('Connecting...');
            
            console.log("[RTC] Initializing (Active Leader)...");
            const conn = new WebRTCConnection(!isCreator);
            const sig = new WebRTCSignaling(roomId, localMemberId);
            const dcManager = new WebRTCDataChannelManager();

            connectionRef.current = conn;
            signalingRef.current = sig;
            dcManagerRef.current = dcManager;

            // 🧨 Connection Watchdog: 15s to reach "Connected"
            // Gives signaling (10 retries * 1.2s = 12s) time to finish
            if (connectionWatchdogRef.current) clearTimeout(connectionWatchdogRef.current);
            connectionWatchdogRef.current = setTimeout(() => {
                if (connectionStateRef.current !== 'Connected') {
                    console.error(`[RTC] Connection Watchdog Triggered: Stuck in ${connectionStateRef.current} state > 15s.`);
                    internalReconnect({ soft: false });
                }
            }, 15000);
            conn.setCallbacks(
                (state) => {
                    const mappedState = state === 'connected' ? 'Connected' : 'Connecting...';
                    updateState(mappedState);
                    if (state === 'connected' && connectionWatchdogRef.current) {
                        clearTimeout(connectionWatchdogRef.current);
                        connectionWatchdogRef.current = null;
                    }
                },
                (channel) => dcManager.attachDataChannel(channel),
                (candidate) => sig.sendIceCandidate(candidate)
            );

            sig.setCallbacks(
                async (offer) => {
                    const answer = await conn.handleOffer(offer);
                    if (answer) await sig.sendAnswer(answer);
                },
                async (answer) => await conn.handleAnswer(answer),
                async (candidate) => await conn.handleIceCandidate(candidate),
                () => {
                    console.error("[RTC] Signaling ACK failure. Escalating Reconnect (Soft).");
                    internalReconnect({ soft: true });
                }
            );

            dcManager.setCallbacks(
                () => {
                    updateState('Connected');
                    if (connectionWatchdogRef.current) {
                        clearTimeout(connectionWatchdogRef.current);
                        connectionWatchdogRef.current = null;
                    }
                    if (wasEverConnectedRef.current || reconnectAttemptsRef.current > 0) {
                        dcManager.sendMessage('sync_request', { reason: 'recovery', timestamp: Date.now() });
                    }
                    wasEverConnectedRef.current = true;
                    reconnectAttemptsRef.current = 0;
                },
                () => internalReconnect({ soft: false }),
                () => internalReconnect({ soft: false }),
                (lat) => setLatencyMs(lat),
                () => internalReconnect({ soft: true }),
                () => {
                    console.error("[RTC] DataChannel ACK failure. Escalating Reconnect.");
                    internalReconnect({ soft: false });
                }
            );

            handlersRef.current.forEach((handlerSet, type) => {
                handlerSet.forEach(handler => dcManager.registerHandler(type, handler));
            });
            await sig.connect();
            
            if (isCreator) {
                // 🧨 Critical: Creator MUST initiate a DataChannel before the offer
                const channel = conn.createDataChannel("messaging");
                if (channel) dcManager.attachDataChannel(channel);

                setTimeout(async () => {
                    const offer = await conn.createOffer();
                    if (offer) await sig.sendOffer(offer);
                }, 1000);
            }
        } catch (error) {
            internalReconnect({ soft: false });
        }
    }, [roomId, localMemberId, isCreator, isLeader, internalReconnect, teardown]);

    // Keep the ref up to date
    useEffect(() => {
        initWebRTCRef.current = initWebRTC;
    }, [initWebRTC]);

    useEffect(() => {
        if (!roomId || !localMemberId) return;
        initWebRTC();
        return () => teardown();
    }, [roomId, localMemberId, initWebRTC, teardown]);

    const sendMessage = useCallback((type: WebRTCMessageType, payload?: any, options?: any) => {
        if (!isLeader) return;
        if (dcManagerRef.current) dcManagerRef.current.sendMessage(type, payload, options);
    }, [isLeader]);

    const registerHandler = useCallback((type: WebRTCMessageType, handler: (payload: any) => void) => {
        if (!handlersRef.current.has(type)) {
            handlersRef.current.set(type, new Set());
        }
        handlersRef.current.get(type)!.add(handler);
        if (dcManagerRef.current) dcManagerRef.current.registerHandler(type, handler);
    }, []);

    const unregisterHandler = useCallback((type: WebRTCMessageType, handler?: (payload: any) => void) => {
        if (handler && handlersRef.current.has(type)) {
            handlersRef.current.get(type)!.delete(handler);
            if (handlersRef.current.get(type)!.size === 0) {
                handlersRef.current.delete(type);
            }
        } else {
            handlersRef.current.delete(type);
        }
        if (dcManagerRef.current) dcManagerRef.current.unregisterHandler(type, handler);
    }, []);

    const reconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0;
        lastInitParamsRef.current = ""; // 🧨 Force reset
        internalReconnect({ soft: false });
    }, [internalReconnect]);

    return {
        connectionState,
        latencyMs,
        rtcStats,
        sendMessage,
        registerHandler,
        unregisterHandler,
        reconnect,
        teardown
    };
}
