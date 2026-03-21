// src/lib/webrtc/signaling.ts

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type SignalingMessageType = 'offer' | 'answer' | 'ice-candidate' | 'signaling_ack';

export interface SignalingMessage {
    id: string;
    type: SignalingMessageType;
    senderId: string;
    payload: any;
}

export class WebRTCSignaling {
    private roomId: string;
    private localMemberId: string;
    private channel: RealtimeChannel | null = null;
    
    private onOfferCallback: ((offer: RTCSessionDescriptionInit, senderId: string) => void) | null = null;
    private onAnswerCallback: ((answer: RTCSessionDescriptionInit, senderId: string) => void) | null = null;
    private onIceCandidateCallback: ((candidateInit: RTCIceCandidateInit, senderId: string) => void) | null = null;
    private onAckFailureCallback: (() => void) | null = null;

    private pendingAcks: Map<string, { msg: SignalingMessage, attempts: number, timer: NodeJS.Timeout }> = new Map();
    private readonly MAX_RETRIES = 10;
    private readonly ACK_TIMEOUT_MS = 1200;

    constructor(roomId: string, localMemberId: string) {
        this.roomId = roomId;
        this.localMemberId = localMemberId;
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.channel) this.disconnect();
            this.channel = supabase.channel(`room-${this.roomId}`);
            this.channel
                .on('broadcast', { event: 'webrtc_signaling' }, (payload) => {
                    this.handleIncomingMessage(payload.payload as SignalingMessage);
                })
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') resolve();
                    else if (status === 'CHANNEL_ERROR') reject(err || new Error('Signaling error'));
                });
        });
    }

    public cleanup() {
        this.pendingAcks.forEach((item) => clearTimeout(item.timer));
        this.pendingAcks.clear();
    }

    private handleIncomingMessage(msg: SignalingMessage) {
        if (!msg || msg.senderId === this.localMemberId) return;
        if (msg.type !== 'signaling_ack' && msg.id) this.sendAck(msg.id);

        try {
            switch (msg.type) {
                case 'signaling_ack':
                    const payloadId = msg.payload?.id;
                    if (payloadId) {
                        const pending = this.pendingAcks.get(payloadId);
                        if (pending) {
                            clearTimeout(pending.timer);
                            this.pendingAcks.delete(payloadId);
                        }
                    }
                    break;
                case 'offer':
                    if (this.onOfferCallback) this.onOfferCallback(msg.payload, msg.senderId);
                    break;
                case 'answer':
                    if (this.onAnswerCallback) this.onAnswerCallback(msg.payload, msg.senderId);
                    break;
                case 'ice-candidate':
                    if (this.onIceCandidateCallback) this.onIceCandidateCallback(msg.payload, msg.senderId);
                    break;
            }
        } catch (error) {
            console.error('[RTC] Signaling Handler error:', error);
        }
    }

    public setCallbacks(
        onOffer: (offer: RTCSessionDescriptionInit, senderId: string) => void,
        onAnswer: (answer: RTCSessionDescriptionInit, senderId: string) => void,
        onIceCandidate: (candidateInit: RTCIceCandidateInit, senderId: string) => void,
        onAckFailure?: () => void
    ) {
        this.onOfferCallback = onOffer;
        this.onAnswerCallback = onAnswer;
        this.onIceCandidateCallback = onIceCandidate;
        if (onAckFailure) this.onAckFailureCallback = onAckFailure;
    }

    private async sendAck(msgId: string) {
        if (!this.channel) return;
        this.channel.send({
            type: 'broadcast',
            event: 'webrtc_signaling',
            payload: {
                id: crypto.randomUUID(),
                type: 'signaling_ack',
                senderId: this.localMemberId,
                payload: { id: msgId }
            }
        }).catch(() => {});
    }

    public async sendOffer(offer: RTCSessionDescriptionInit) {
        await this.sendReliableMessage({
            id: crypto.randomUUID(),
            type: 'offer',
            senderId: this.localMemberId,
            payload: offer
        });
    }

    public async sendAnswer(answer: RTCSessionDescriptionInit) {
        await this.sendReliableMessage({
            id: crypto.randomUUID(),
            type: 'answer',
            senderId: this.localMemberId,
            payload: answer
        });
    }

    public async sendIceCandidate(candidate: RTCIceCandidateInit) {
        await this.sendMessage({
            id: crypto.randomUUID(),
            type: 'ice-candidate',
            senderId: this.localMemberId,
            payload: candidate
        });
    }

    private async sendReliableMessage(msg: SignalingMessage, attemptCount = 0) {
        if (attemptCount >= this.MAX_RETRIES) {
            console.error(`[RTC] Signaling ${msg.type} failed after ${this.MAX_RETRIES} attempts.`);
            this.pendingAcks.delete(msg.id);
            if (this.onAckFailureCallback) this.onAckFailureCallback();
            return;
        }

        // 🧨 Jittered Retries for Signaling
        const jitter = Math.floor(Math.random() * 500) - 250;
        const timeout = Math.max(500, this.ACK_TIMEOUT_MS + jitter);

        const timer = setTimeout(() => {
            this.sendReliableMessage(msg, attemptCount + 1);
        }, timeout);

        this.pendingAcks.set(msg.id, { msg, attempts: attemptCount + 1, timer });

        console.log(`[RTC] Sending ${msg.type} (attempt ${attemptCount + 1})`);
        this.sendMessage(msg);
    }

    private async sendMessage(msg: SignalingMessage) {
        if (!this.channel) return;
        try {
            await this.channel.send({
                type: 'broadcast',
                event: 'webrtc_signaling',
                payload: msg
            });
        } catch (error) {
            console.error(`[RTC] Send failed:`, error);
        }
    }

    public disconnect() {
        if (this.channel) {
            this.pendingAcks.forEach(p => clearTimeout(p.timer));
            this.pendingAcks.clear();
            this.channel.unsubscribe();
            supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }
}
