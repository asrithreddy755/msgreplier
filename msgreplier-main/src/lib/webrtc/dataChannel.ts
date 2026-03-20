// src/lib/webrtc/dataChannel.ts

export type WebRTCMessageType = 'chat' | 'game_move' | 'dice_roll' | 'dice_resolved' | 'dice_start' | 'token_moving' | 'sync_request' | 'sync_state' | 'chat_sync_request' | 'chat_sync_state' | 'ping' | 'pong' | 'player_ready' | 'heartbeat' | 'ack' | 'typing' | 'reaction' | 'flames_reveal' | 'flames_sync' | 'presence_update';

export interface WebRTCMessage {
    type: WebRTCMessageType;
    payload?: any;
}

export class WebRTCDataChannelManager {
    public dataChannel: RTCDataChannel | null = null;
    
    // Message Queues
    private messageQueue: WebRTCMessage[] = []; // Outgoing queue (waiting for channel to open)
    private incomingQueue: WebRTCMessage[] = []; // Incoming queue (waiting for handlers to register)

    // Handlers mapped by message type (supports multiple handlers per type)
    private messageHandlers: Map<WebRTCMessageType, Set<(payload: any) => void>> = new Map();
    
    // Fallback handler for unknown message types
    private fallbackHandler: ((msg: WebRTCMessage) => void) | null = null;
    private onOpenCallback: (() => void) | null = null;
    private onCloseCallback: (() => void) | null = null;
    private onDisconnectFallback: (() => void) | null = null;

    // Heartbeat mechanism properties
    private heartbeatIntervalId: NodeJS.Timeout | null = null;
    private missedPongs: number = 0;
    
    // Expected ping frequency
    private readonly PING_INTERVAL_MS = 5000; // 5 seconds
    private readonly MAX_MISSED_PONGS = 3;
    
    // Latency & Stats
    public latencyMs: number = 0;
    public messagesSent: number = 0;
    public messagesReceived: number = 0;
    
    // Optional callbacks for stats
    private onLatencyUpdateCallback: ((latency: number) => void) | null = null;

    // Reliable messaging tracking
    private pendingAcks: Map<string, { type: WebRTCMessageType, payload: any, attempts: number, timer: NodeJS.Timeout }> = new Map();
    private readonly MAX_ACK_ATTEMPTS = 5;
    private readonly ACK_TIMEOUT_MS = 3000;

    constructor() {
        // Register default internal handlers
        this.registerHandler('ping', (payload) => {
            // Immediately respond to pings
            this.sendMessage('pong', { timestamp: payload?.timestamp });
        });

        this.registerHandler('pong', (payload) => {
             // Reset missed pongs upon receiving a pong
             this.missedPongs = 0;
             if (payload?.timestamp) {
                 this.latencyMs = Date.now() - payload.timestamp;
                 if (this.onLatencyUpdateCallback) {
                     this.onLatencyUpdateCallback(this.latencyMs);
                 }
             }
        });

        this.registerHandler('ack', (payload) => {
            if (payload && payload.id) {
                const pending = this.pendingAcks.get(payload.id);
                if (pending) {
                    clearTimeout(pending.timer);
                    this.pendingAcks.delete(payload.id);
                    console.log(`[WebRTC] ACK received for ${payload.id}`);
                }
            }
        });
    }

    public attachDataChannel(channel: RTCDataChannel) {
        this.dataChannel = channel;
        this.setupListeners();
    }

    public createDataChannel(peerConnection: RTCPeerConnection) {
        this.dataChannel = peerConnection.createDataChannel('game-channel');
        this.setupListeners();
    }

    private setupListeners() {
        if (!this.dataChannel) return;

        // Handle case where channel is already open (race condition safety)
        if (this.dataChannel.readyState === 'open') {
             console.log("DataChannel already open — triggering handlers");
             this.startHeartbeat();
             if (this.onOpenCallback) this.onOpenCallback();
             
             // Flush message queues
             this.flushQueue();
             this.flushIncomingQueue();
        }

        this.dataChannel.onopen = () => {
            console.log("DataChannel opened");
            this.flushQueue(); // Flush outgoing messages
            this.flushIncomingQueue(); // Flush any buffered incoming messages
            this.startHeartbeat();
            if (this.onOpenCallback) this.onOpenCallback();
        };

        this.dataChannel.onclose = () => {
            console.log("DataChannel closed");
            this.stopHeartbeat();
            if (this.onCloseCallback) this.onCloseCallback();
        };

        this.dataChannel.onerror = (error) => {
            console.error("DataChannel error:", error);
        };

        // 1. Add a Message Router
        this.dataChannel.onmessage = (event) => {
            try {
                const msg: WebRTCMessage = JSON.parse(event.data);
                this.routeMessage(msg);
            } catch (error) {
                console.error("Failed to parse incoming DataChannel message:", event.data, error);
            }
        };
    }

    private flushQueue() {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open' || this.messageQueue.length === 0) return;
        
        console.log(`Flushing ${this.messageQueue.length} queued messages...`);
        this.messageQueue.forEach(msg => {
            try {
                this.dataChannel?.send(JSON.stringify(msg));
            } catch (e) {
                console.error("Queue flush error:", e);
            }
        });
        this.messageQueue = [];
    }

    private routeMessage(msg: WebRTCMessage & { id?: string }) {
        this.messagesReceived++;

        // Automatically ACK reliable messages
        if (msg.id && msg.type !== 'ack') {
            this.sendMessage('ack', { id: msg.id });
        }

        const handlers = this.messageHandlers.get(msg.type);
        
        if (handlers && handlers.size > 0) {
            console.log(`[WebRTC] Handling message type: ${msg.type}`, msg.payload);
            handlers.forEach(handler => {
                try {
                    handler(msg.payload);
                } catch (e) {
                    console.error(`[WebRTC] Error in handler for ${msg.type}:`, e);
                }
            });
        } else {
            console.warn(`[WebRTC] No handler registered for message type: ${msg.type}. Buffering message...`);
            this.incomingQueue.push(msg);
            
            if (this.fallbackHandler) {
                this.fallbackHandler(msg);
            }
        }
    }

    public registerHandler(type: WebRTCMessageType, handler: (payload: any) => void) {
        console.log(`[WebRTC] Registering handler for: ${type}`);
        let handlers = this.messageHandlers.get(type);
        if (!handlers) {
            handlers = new Set();
            this.messageHandlers.set(type, handlers);
        }
        handlers.add(handler);
        
        // Try to flush buffered messages for this type
        this.flushIncomingQueue(type);
    }
    
    private flushIncomingQueue(type?: WebRTCMessageType) {
        if (this.incomingQueue.length === 0) return;

        console.log(`[WebRTC] Checking incoming buffer for ${type || 'all types'}...`);
        
        const remaining: WebRTCMessage[] = [];
        this.incomingQueue.forEach(msg => {
            const handlers = this.messageHandlers.get(msg.type);
            if ((!type || msg.type === type) && handlers && handlers.size > 0) {
                console.log(`[WebRTC] Processing buffered message: ${msg.type}`);
                handlers.forEach(h => {
                    try {
                        h(msg.payload);
                    } catch (e) {
                        console.error(`[WebRTC] Error processing buffered ${msg.type}:`, e);
                    }
                });
            } else {
                remaining.push(msg);
            }
        });
        
        this.incomingQueue = remaining;
    }

    public unregisterHandler(type: WebRTCMessageType, handler?: (payload: any) => void) {
        if (type === 'ping' || type === 'pong') return;
        
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            if (handler) {
                handlers.delete(handler);
            } else {
                handlers.clear();
            }
        }
    }

    public setFallbackHandler(handler: (msg: WebRTCMessage) => void) {
        this.fallbackHandler = handler;
    }

    public setCallbacks(
        onOpen: () => void, 
        onClose: () => void, 
        onDisconnectFallback: () => void,
        onLatencyUpdate?: (latency: number) => void
    ) {
        this.onOpenCallback = onOpen;
        this.onCloseCallback = onClose;
        this.onDisconnectFallback = onDisconnectFallback;
        if (onLatencyUpdate) {
             this.onLatencyUpdateCallback = onLatencyUpdate;
        }
    }

    public sendMessage(type: WebRTCMessageType, payload?: any, options?: { reliable?: boolean, id?: string }) {
        const id = options?.id || (options?.reliable ? crypto.randomUUID() : undefined);
        const msg: WebRTCMessage & { id?: string } = { type, payload };
        if (id) msg.id = id;

        if (options?.reliable && id) {
            this.trackReliableMessage(id, type, payload);
        }

        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
            console.log(`DataChannel not open, queueing message payload:`, type);
            this.messageQueue.push(msg);
            return;
        }

        try {
            this.dataChannel.send(JSON.stringify(msg));
            this.messagesSent++;
        } catch (error) {
            console.error("Error sending DataChannel message:", error);
        }
    }

    private trackReliableMessage(id: string, type: WebRTCMessageType, payload: any) {
        const attempt = (attempts: number) => {
            if (attempts >= this.MAX_ACK_ATTEMPTS) {
                console.error(`[WebRTC] Reliable message ${id} (${type}) failed after ${this.MAX_ACK_ATTEMPTS} attempts`);
                this.pendingAcks.delete(id);
                return;
            }

            const timer = setTimeout(() => {
                const pending = this.pendingAcks.get(id);
                if (pending) {
                    console.warn(`[WebRTC] No ACK for ${id} (${type}), resending (attempt ${attempts + 1})`);
                    pending.attempts++;
                    this.sendMessage(type, payload, { id }); // Send again with same ID
                    attempt(pending.attempts);
                }
            }, this.ACK_TIMEOUT_MS);

            this.pendingAcks.set(id, { type, payload, attempts, timer });
        };

        attempt(1);
    }

    // 3. Add Heartbeat Ping System
    private startHeartbeat() {
        this.stopHeartbeat(); // Clear existing
        this.missedPongs = 0;

        // Send pings and check thresholds every 5 seconds
        this.heartbeatIntervalId = setInterval(() => {
            if (this.dataChannel && this.dataChannel.readyState === "open") {
                this.missedPongs++;
                
                if (this.missedPongs >= this.MAX_MISSED_PONGS) {
                     console.log(`Missed ${this.missedPongs} pongs. Marking peer as disconnected.`);
                     this.stopHeartbeat();
                     if (this.onDisconnectFallback) {
                         this.onDisconnectFallback();
                     }
                     return;
                }

                this.sendMessage('ping', { timestamp: Date.now() });
            }
        }, this.PING_INTERVAL_MS);
    }

    private stopHeartbeat() {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }

    public close() {
        this.stopHeartbeat();
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
    }
}
