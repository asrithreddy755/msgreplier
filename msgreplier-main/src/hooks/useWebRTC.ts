// src/hooks/useWebRTC.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { WebRTCConnection } from '@/lib/webrtc/connection';
import { WebRTCSignaling } from '@/lib/webrtc/signaling';
import { WebRTCDataChannelManager, WebRTCMessageType } from '@/lib/webrtc/dataChannel';

export type WebRTCConnectionState = 'Connecting...' | 'Waiting for opponent' | 'Connected' | 'Opponent disconnected';

export function useWebRTC(roomId: string, localMemberId: string, isCreator: boolean) {
    const [connectionState, setConnectionState] = useState<WebRTCConnectionState>('Connecting...');
    const [latencyMs, setLatencyMs] = useState<number>(0);
    const [rtcStats, setRtcStats] = useState<any>(null);
    
    const connectionRef = useRef<WebRTCConnection | null>(null);
    const signalingRef = useRef<WebRTCSignaling | null>(null);
    const dataChannelManagerRef = useRef<WebRTCDataChannelManager | null>(null);
    const [manager, setManager] = useState<WebRTCDataChannelManager | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectInProgressRef = useRef(false);
    const wasEverConnectedRef = useRef(false);
    
    // Limits & Tracking
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY_MS = 3000;

    useEffect(() => {
        if (!roomId || !localMemberId) return;

        let isMounted = true;
        
        // Function to fully tear down any existing connection
        const teardown = () => {
             console.log("[WebRTC] Tearing down all instances...");
             isMounted = false; // Prevent any async operations from continuing

             if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
             }
             
             // Close connections and channels
             connectionRef.current?.close();
             signalingRef.current?.disconnect();
             dataChannelManagerRef.current?.close();

             // Nullify refs to release memory and prevent reuse
             connectionRef.current = null;
             signalingRef.current = null;
             dataChannelManagerRef.current = null;
             setManager(null);
             
             reconnectInProgressRef.current = false;
        };

        const reconnect = () => {
            if (!isMounted) return;
            if (reconnectInProgressRef.current) return;
            if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                console.error("Max WebRTC reconnect attempts reached. Connection failed completely.");
                setConnectionState('Opponent disconnected');
                return;
            }

            reconnectInProgressRef.current = true;
            reconnectAttemptsRef.current++;
            setConnectionState('Connecting...');
            console.log(`[WebRTC] Connection lost. Reconnecting... (Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

            // Fully tear down before re-initializing
            teardown();

            // Re-initialize after a delay
            reconnectTimerRef.current = setTimeout(() => {
                if (isMounted) {
                    initWebRTC();
                }
            }, RECONNECT_DELAY_MS);
        };

        const initWebRTC = async () => {
            try {
                // Each mount gets its own fresh start
                if (!isMounted) return;

                const conn = new WebRTCConnection();
                const sig = new WebRTCSignaling(roomId, localMemberId);
                const dcManager = new WebRTCDataChannelManager();

                // 1. Connection Callbacks
                conn.setCallbacks(
                    (state) => {
                        if (!isMounted) return;
                        if (state === 'connected') {
                            setConnectionState('Connected');
                            reconnectAttemptsRef.current = 0;
                            reconnectInProgressRef.current = false;
                            wasEverConnectedRef.current = true;
                        } else if (state === 'disconnected' || state === 'failed') {
                            reconnect();
                        }
                    },
                    (iceState) => {
                        if (!isMounted) return;
                        console.log("WebRTC ICE State Change:", iceState);
                        // Delay signaling disconnect until ICE is stable
                        if (iceState === 'connected' || iceState === 'completed') {
                            setTimeout(() => {
                                if (isMounted && signalingRef.current && connectionRef.current?.peerConnection?.iceConnectionState.match(/connected|completed/)) {
                                    console.log("WebRTC ICE stable, closing Supabase signaling...");
                                    signalingRef.current.disconnect();
                                }
                            }, 5000); // 5 second grace period
                        }
                    },
                    (candidate) => {
                        sig.sendIceCandidate(candidate).catch(e => console.error("Error sending ICE candidate:", e));
                    }
                );

                sig.setCallbacks(
                    async (offer, senderId) => {
                        if (!isMounted || isCreator) return; // Only non-creators handle offers in this flow
                        console.log("Processing incoming offer from", senderId);
                        const answer = await conn.handleOffer(offer);
                        if (answer) {
                            await sig.sendAnswer(answer);
                        }
                    },
                    async (answer, senderId) => {
                        if (!isMounted || !isCreator) return; // Only creators handle answers in this flow
                        console.log("Processing incoming answer from", senderId);
                        await conn.handleAnswer(answer);
                    },
                    async (candidateInit, senderId) => {
                        if (!isMounted) return;
                        await conn.handleIceCandidate(candidateInit);
                    }
                );

                dcManager.setCallbacks(
                    () => {
                        if (!isMounted) return;
                        setConnectionState('Connected');
                        if (wasEverConnectedRef.current || reconnectAttemptsRef.current > 0) {
                            dcManager.sendMessage('sync_request', { reason: 'channel_open_recovery', timestamp: Date.now() });
                        }
                        wasEverConnectedRef.current = true;
                        reconnectAttemptsRef.current = 0;
                        reconnectInProgressRef.current = false;
                    },
                    () => {
                        if (!isMounted) return;
                        setConnectionState('Opponent disconnected');
                        reconnect();
                    },
                    () => {
                        if (!isMounted) return;
                        console.warn("[WebRTC] Silent freeze detected (missed heartbeats). Forcing reconnect...");
                        setConnectionState('Opponent disconnected');
                        reconnect();
                    },
                    (latency) => {
                        if (!isMounted) return;
                        setLatencyMs(latency);
                    }
                );

                if (isCreator && conn.peerConnection) {
                    setConnectionState('Waiting for opponent');
                    // Creator establishes the data channel BEFORE signaling connects
                    dcManager.createDataChannel(conn.peerConnection);
                } else if (conn.peerConnection) {
                    setConnectionState('Connecting...');
                    // CRITICAL: Set ondatachannel BEFORE sig.connect() so it is in place
                    // before any incoming offer/answer/ICE can complete the negotiation
                    conn.peerConnection.ondatachannel = (event) => {
                        console.log("[WebRTC] ondatachannel fired — attaching channel");
                        dcManager.attachDataChannel(event.channel);
                    };
                }

                await sig.connect();
                if (!isMounted) {
                    sig.disconnect();
                    conn.close();
                    return;
                }
                
                console.log("Signaling connected");

                // Assign to refs only after success and if still mounted
                connectionRef.current = conn;
                signalingRef.current = sig;
                dataChannelManagerRef.current = dcManager;
                setManager(dcManager);

                // If creator, start the offer process after signaling is ready
                if (isCreator) {
                     // Fire repeatedly until the peer connection is established to prevent race conditions
                     // where the non-creator joins just after the first offer is sent.
                     const offerIntervalId = setInterval(async () => {
                         if (!isMounted || !connectionRef.current || !signalingRef.current) {
                             clearInterval(offerIntervalId);
                             return;
                         }
                         if (connectionRef.current.peerConnection?.connectionState === 'connected') {
                             clearInterval(offerIntervalId);
                             return;
                         }

                         try {
                             const offer = await connectionRef.current.createOffer();
                             if (offer) {
                                 await signalingRef.current.sendOffer(offer);
                             }
                         } catch (e) {
                             console.warn("Failed to generate/send polling offer:", e);
                         }
                     }, 3000); // Poll every 3 seconds

                     // Also do an immediate attempt after 1 second so fast joiners don't have to wait 3s
                     setTimeout(async () => {
                         if (isMounted && connectionRef.current && signalingRef.current && connectionRef.current.peerConnection?.connectionState !== 'connected') {
                             const offer = await connectionRef.current.createOffer();
                             if (offer) await signalingRef.current.sendOffer(offer);
                         }
                     }, 1000);
                }

            } catch (error) {
                console.error("WebRTC Initialization failed:", error);
                if (isMounted) {
                    setConnectionState('Opponent disconnected');
                }
            }
        };


        initWebRTC();

        return () => {
            isMounted = false;
            teardown();
        };
    }, [roomId, localMemberId, isCreator]);

    // Polling loop for pc.getStats() and DataChannel metrics
    useEffect(() => {
         const interval = setInterval(async () => {
              if (connectionState === 'Connected' && connectionRef.current?.peerConnection) {
                   try {
                       const stats = await connectionRef.current.peerConnection.getStats();
                       let parsedStats: any = {
                           messagesSent: dataChannelManagerRef.current?.messagesSent || 0,
                           messagesReceived: dataChannelManagerRef.current?.messagesReceived || 0,
                           packetLoss: 0,
                           jitter: 0,
                           currentRoundTripTime: 0,
                           connectionType: 'unknown',
                           remoteCandidateType: 'unknown'
                       };

                       stats.forEach(report => {
                            if (report.type === 'remote-inbound-rtp') {
                                parsedStats.packetLoss = report.packetsLost;
                                parsedStats.jitter = report.jitter;
                                parsedStats.currentRoundTripTime = report.roundTripTime;
                            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                                const localCandidate = stats.get(report.localCandidateId);
                                const remoteCandidate = stats.get(report.remoteCandidateId);
                                if (localCandidate) parsedStats.connectionType = localCandidate.candidateType;
                                if (remoteCandidate) parsedStats.remoteCandidateType = remoteCandidate.candidateType;
                            }
                       });

                       setRtcStats(parsedStats);
                   } catch (e) {
                       console.error("Failed to parse getStats:", e);
                   }
              }
         }, 2000);

         return () => clearInterval(interval);
    }, [connectionState]);

    const sendMessage = useCallback((type: WebRTCMessageType, payload?: any, options?: { reliable?: boolean }) => {
        if (dataChannelManagerRef.current) {
            dataChannelManagerRef.current.sendMessage(type, payload, options);
        } else {
            console.warn(`[WebRTC] Manager not ready, message ${type} will be dropped (no persistent queue in hook yet)`);
        }
    }, []);

    const registerHandler = useCallback((type: WebRTCMessageType, handler: (payload: any) => void) => {
        if (manager) {
            manager.registerHandler(type, handler);
        }
    }, [manager]);

    const unregisterHandler = useCallback((type: WebRTCMessageType, handler?: (payload: any) => void) => {
        if (manager) {
            manager.unregisterHandler(type, handler);
        }
    }, [manager]);

    return {
        connectionState,
        latencyMs,
        rtcStats,
        sendMessage,
        registerHandler,
        unregisterHandler,
    };
}
