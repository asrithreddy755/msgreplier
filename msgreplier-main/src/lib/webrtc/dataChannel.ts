// src/lib/webrtc/dataChannel.ts

export type WebRTCMessageType = 'chat' | 'game_move' | 'dice_roll' | 'dice_resolved' | 'dice_start' | 'token_moving' | 'sync_request' | 'sync_state' | 'chat_sync_request' | 'chat_sync_state' | 'ping' | 'pong' | 'player_ready' | 'heartbeat' | 'ack' | 'typing' | 'reaction' | 'flames_reveal' | 'flames_sync' | 'presence_update' | 'room_closed' | 'wake_up';

export interface WebRTCMessage {
    type: WebRTCMessageType;
    payload?: any;
}

export class WebRTCDataChannelManager {
    public dataChannel: RTCDataChannel | null = null;
    
    // Message Queues
    private readonly MAX_QUEUE_SIZE = 50;
    private messageQueue: WebRTCMessage[] = []; // Outgoing queue
    private incomingQueue: WebRTCMessage[] = []; // Incoming queue (waiting for handlers)

    private messageHandlers: Map<WebRTCMessageType, Set<(payload: any) => void>> = new Map();
    
    private fallbackHandler: ((msg: WebRTCMessage) => void) | null = null;
    private onOpenCallback: (() => void) | null = null;
    private onCloseCallback: (() => void) | null = null;
    private onDisconnectFallback: (() => void) | null = null;
    private onHeartbeatWarningCallback: (() => void) | null = null;
    private onLatencyUpdateCallback: ((latency: number) => void) | null = null;
    private onAckFailureCallback: (() => void) | null = null;

    private heartbeatIntervalId: NodeJS.Timeout | null = null;
    private missedPongs: number = 0;
    
    private readonly PING_INTERVAL_MS = 5000;
    private readonly MAX_SOFT_MISSED = 3;
    private readonly MAX_HARD_MISSED = 6;
    
    public latencyMs: number = 0;
    public messagesSent: number = 0;
    public messagesReceived: number = 0;
    
    private readonly MAX_PENDING_ACKS = 100;
    private pendingAcks: Map<string, { type: WebRTCMessageType, payload: any, attempts: number, timer: NodeJS.Timeout }> = new Map();
    private readonly MAX_ACK_ATTEMPTS = 5;
    private readonly ACK_TIMEOUT_MS = 2500;

    constructor() {
        this.registerHandler('ack', (payload) => {
            if (payload && payload.id) {
                const pending = this.pendingAcks.get(payload.id);
                if (pending) {
                    clearTimeout(pending.timer);
                    this.pendingAcks.delete(payload.id);
                    console.log(`[RTC] ACK received for ${payload.id}`);
                }
            }
        });
    }

    public cleanup() {
        this.stopHeartbeat();
        this.pendingAcks.forEach((item) => clearTimeout(item.timer));
        this.pendingAcks.clear();
        this.messageQueue = [];
        console.log("[RTC] DataChannelManager cleanup completed.");
    }

    public attachDataChannel(channel: RTCDataChannel) {
        this.dataChannel = channel;
        this.setupListeners();
    }

    private setupListeners() {
        if (!this.dataChannel) return;

        if (this.dataChannel.readyState === 'open') {
             this.startHeartbeat();
             if (this.onOpenCallback) this.onOpenCallback();
             this.flushQueue();
             this.flushIncomingQueue();
        }

        this.dataChannel.onopen = () => {
            console.log("[RTC] DataChannel opened");
            this.flushQueue();
            this.flushIncomingQueue();
            this.startHeartbeat();
            if (this.onOpenCallback) this.onOpenCallback();
        };

        this.dataChannel.onclose = () => {
            console.log("[RTC] DataChannel closed");
            this.stopHeartbeat();
            if (this.onCloseCallback) this.onCloseCallback();
        };

        this.dataChannel.onerror = (error) => {
            if (this.dataChannel?.readyState === 'closing' || this.dataChannel?.readyState === 'closed') return;
            console.error("[RTC] DataChannel error:", error);
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const msg: WebRTCMessage = JSON.parse(event.data);
                this.routeMessage(msg);
            } catch (error) {
                console.error("[RTC] Parse failed:", event.data, error);
            }
        };

        const handleVisibility = () => {
            if (document.hidden) {
                this.stopHeartbeat();
            } else if (this.dataChannel?.readyState === 'open') {
                this.startHeartbeat();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
    }

    private flushQueue() {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open' || this.messageQueue.length === 0) return;
        this.messageQueue.forEach(msg => {
            try {
                this.dataChannel?.send(JSON.stringify(msg));
            } catch (e) {
                console.error("[RTC] Queue flush error:", e);
            }
        });
        this.messageQueue = [];
    }

    private routeMessage(msg: WebRTCMessage & { id?: string }) {
        this.messagesReceived++;
        if (msg.type === 'ping') {
            this.sendMessage('pong', { timestamp: msg.payload?.timestamp });
            return;
        }
        if (msg.type === 'pong') {
            this.missedPongs = 0;
            if (msg.payload?.timestamp) {
                this.latencyMs = Date.now() - msg.payload.timestamp;
                if (this.onLatencyUpdateCallback) this.onLatencyUpdateCallback(this.latencyMs);
            }
            return;
        }
        if (msg.id && msg.type !== 'ack') {
            this.sendMessage('ack', { id: msg.id });
        }

        const handlers = this.messageHandlers.get(msg.type);
        if (handlers && handlers.size > 0) {
            handlers.forEach(handler => {
                try { handler(msg.payload); } catch (e) { console.error(`[RTC] Handler error:`, e); }
            });
        } else {
            this.incomingQueue.push(msg);
            if (this.fallbackHandler) this.fallbackHandler(msg);
        }
    }

    public registerHandler(type: WebRTCMessageType, handler: (payload: any) => void) {
        if (type === 'ping' || type === 'pong') return;
        let handlers = this.messageHandlers.get(type);
        if (!handlers) {
            handlers = new Set();
            this.messageHandlers.set(type, handlers);
        }
        handlers.add(handler);
        this.flushIncomingQueue(type);
    }
    
    private flushIncomingQueue(type?: WebRTCMessageType) {
        if (this.incomingQueue.length === 0) return;
        const remaining: WebRTCMessage[] = [];
        this.incomingQueue.forEach(msg => {
            const handlers = this.messageHandlers.get(msg.type);
            if ((!type || msg.type === type) && handlers && handlers.size > 0) {
                handlers.forEach(h => h(msg.payload));
            } else {
                remaining.push(msg);
            }
        });
        this.incomingQueue = remaining;
    }

    public unregisterHandler(type: WebRTCMessageType, handler?: (payload: any) => void) {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            if (handler) handlers.delete(handler);
            else handlers.clear();
        }
    }

    public setCallbacks(
        onOpen: () => void,
        onClose: () => void,
        onDisconnectFallback: () => void,
        onLatencyUpdate?: (latency: number) => void,
        onHeartbeatWarning?: () => void,
        onAckFailure?: () => void
    ) {
        this.onOpenCallback = onOpen;
        this.onCloseCallback = onClose;
        this.onDisconnectFallback = onDisconnectFallback;
        if (onLatencyUpdate) this.onLatencyUpdateCallback = onLatencyUpdate;
        if (onHeartbeatWarning) this.onHeartbeatWarningCallback = onHeartbeatWarning;
        if (onAckFailure) this.onAckFailureCallback = onAckFailure;
    }

    public sendMessage(type: WebRTCMessageType, payload?: any, options?: { reliable?: boolean, id?: string }) {
        const id = options?.id || (options?.reliable ? crypto.randomUUID() : undefined);
        const msg: WebRTCMessage & { id?: string } = { type, payload };
        if (id) msg.id = id;

        if (this.dataChannel?.readyState === 'open') {
            try {
                this.dataChannel.send(JSON.stringify(msg));
                this.messagesSent++;
                if (options?.reliable && id) {
                    this.trackReliableMessage(id, type, payload);
                }
            } catch (error) {
                console.error(`[RTC] Send failed:`, error);
                this.queueMessage(msg);
            }
        } else {
            this.queueMessage(msg);
        }
    }

    private queueMessage(msg: any) {
        // Prioritization: Critical messages go to front
        const criticalTypes = ['sync_state', 'sync_request', 'player_ready', 'chat_sync_state'];
        if (this.messageQueue.length >= this.MAX_QUEUE_SIZE) {
            this.messageQueue.shift();
        }
        if (criticalTypes.includes(msg.type)) {
            this.messageQueue.unshift(msg);
        } else {
            this.messageQueue.push(msg);
        }
    }

    private trackReliableMessage(id: string, type: WebRTCMessageType, payload: any, attemptCount = 1) {
        if (this.pendingAcks.size >= this.MAX_PENDING_ACKS) {
            const oldestId = this.pendingAcks.keys().next().value;
            if (oldestId) {
                const oldest = this.pendingAcks.get(oldestId);
                if (oldest) clearTimeout(oldest.timer);
                this.pendingAcks.delete(oldestId);
            }
        }

        // 🧨 Jittered Retries: 2500ms + random jitter (±500ms)
        const jitter = Math.floor(Math.random() * 500) - 250;
        const timeout = Math.max(500, this.ACK_TIMEOUT_MS + jitter);

        const timer = setTimeout(() => {
            const pending = this.pendingAcks.get(id);
            if (pending) {
                if (attemptCount < this.MAX_ACK_ATTEMPTS) {
                    console.warn(`[RTC] No ACK for ${id} (${type}), resending (attempt ${attemptCount + 1}/${this.MAX_ACK_ATTEMPTS})`);
                    this.sendMessage(type, payload, { reliable: true, id });
                    this.trackReliableMessage(id, type, payload, attemptCount + 1);
                } else {
                    console.error(`[RTC] Reliable message ${id} (${type}) failed after ${this.MAX_ACK_ATTEMPTS} attempts. Triggering fallback.`);
                    this.pendingAcks.delete(id);
                    if (this.onAckFailureCallback) this.onAckFailureCallback();
                }
            }
        }, timeout);

        this.pendingAcks.set(id, { type, payload, attempts: attemptCount, timer });
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.missedPongs = 0;
        this.heartbeatIntervalId = setInterval(() => {
            if (this.dataChannel?.readyState === 'open') {
                this.sendMessage('ping', { timestamp: Date.now() });
                this.missedPongs++;
                if (this.missedPongs >= this.MAX_HARD_MISSED) {
                    this.stopHeartbeat();
                    if (this.onDisconnectFallback) this.onDisconnectFallback();
                } else if (this.missedPongs >= this.MAX_SOFT_MISSED) {
                    if (this.onHeartbeatWarningCallback) this.onHeartbeatWarningCallback();
                }
            } else this.stopHeartbeat();
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
        this.pendingAcks.forEach(p => clearTimeout(p.timer));
        this.pendingAcks.clear();
        if (this.dataChannel) {
            this.dataChannel.onopen = null;
            this.dataChannel.onclose = null;
            this.dataChannel.onerror = null;
            this.dataChannel.onmessage = null;
            this.dataChannel.close();
            this.dataChannel = null;
        }
    }
}
