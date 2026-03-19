// src/lib/webrtc/signaling.ts

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type SignalingMessageType = 'offer' | 'answer' | 'ice-candidate';

export interface SignalingMessage {
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

    constructor(roomId: string, localMemberId: string) {
        this.roomId = roomId;
        this.localMemberId = localMemberId;
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                this.disconnect();
            }

            // 6. Supabase Signaling Rules:
            // room-{roomId} handles offer, answer, ice_candidate
            this.channel = supabase.channel(`room-${this.roomId}`);

            this.channel
                .on('broadcast', { event: 'webrtc_signaling' }, (payload) => {
                    this.handleIncomingMessage(payload.payload as SignalingMessage);
                })
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') {
                        console.log(`Subscribed to signaling channel: room-${this.roomId}`);
                        resolve();
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('Signaling channel error:', err);
                        reject(new Error('Failed to subscribe to signaling channel'));
                    }
                });
        });
    }

    private handleIncomingMessage(msg: SignalingMessage) {
        // Ignore our own messages
        if (msg.senderId === this.localMemberId) return;

        try {
            switch (msg.type) {
                case 'offer':
                    console.log('Offer received');
                    if (this.onOfferCallback) this.onOfferCallback(msg.payload, msg.senderId);
                    break;
                case 'answer':
                    console.log('Answer received');
                    if (this.onAnswerCallback) this.onAnswerCallback(msg.payload, msg.senderId);
                    break;
                case 'ice-candidate':
                    console.log('ICE candidate received');
                    if (this.onIceCandidateCallback) this.onIceCandidateCallback(msg.payload, msg.senderId);
                    break;
                default:
                    console.warn('Unknown signaling message type:', msg.type);
            }
        } catch (error) {
            console.error('Error handling signaling message:', error, msg);
        }
    }

    public setCallbacks(
        onOffer: (offer: RTCSessionDescriptionInit, senderId: string) => void,
        onAnswer: (answer: RTCSessionDescriptionInit, senderId: string) => void,
        onIceCandidate: (candidateInit: RTCIceCandidateInit, senderId: string) => void
    ) {
        this.onOfferCallback = onOffer;
        this.onAnswerCallback = onAnswer;
        this.onIceCandidateCallback = onIceCandidate;
    }

    public async sendOffer(offer: RTCSessionDescriptionInit) {
        await this.sendMessage({
            type: 'offer',
            senderId: this.localMemberId,
            payload: offer
        });
        console.log('Offer sent');
    }

    public async sendAnswer(answer: RTCSessionDescriptionInit) {
        await this.sendMessage({
            type: 'answer',
            senderId: this.localMemberId,
            payload: answer
        });
        console.log('Answer sent');
    }

    public async sendIceCandidate(candidate: RTCIceCandidate) {
        await this.sendMessage({
            type: 'ice-candidate',
            senderId: this.localMemberId,
            payload: candidate.toJSON()
        });
    }

    private async sendMessage(msg: SignalingMessage) {
        if (!this.channel) {
            console.error('Cannot send signaling message: channel is not connected');
            return;
        }

        try {
            console.log(`Sending signaling message: ${msg.type}`, msg);
            await this.channel.send({
                type: 'broadcast',
                event: 'webrtc_signaling',
                payload: msg
            });
            console.log(`Signaling message ${msg.type} sent successfully`);
        } catch (error) {
            console.error('Failed to send signaling message via Supabase', error);
        }
    }

    public disconnect() {
        if (this.channel) {
            this.channel.unsubscribe();
            supabase.removeChannel(this.channel);
            this.channel = null;
            console.log(`Unsubscribed from signaling channel: room-${this.roomId}`);
        }
    }
}
