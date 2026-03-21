// src/lib/webrtc/connection.ts

export const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
    ]
};

/**
 * WebRTCConnection: Hardened PeerConnection Wrapper
 */
export class WebRTCConnection {
    public peerConnection: RTCPeerConnection | null = null;
    public isPolite: boolean = false;

    private onConnectionStateChangeCallback: ((state: RTCPeerConnectionState) => void) | null = null;
    private onDataChannelCallback: ((channel: RTCDataChannel) => void) | null = null;
    private onIceCandidateCallback: ((candidate: RTCIceCandidateInit) => void) | null = null;

    private isRestartingIce = false;
    private makingOffer = false;
    private iceRestartAttempts = 0;
    private readonly MAX_ICE_RESTART_ATTEMPTS = 2;

    constructor(isPolite: boolean = false) {
        this.isPolite = isPolite;
        this.initialize();
    }

    private initialize() {
        if (this.peerConnection) this.close();

        console.log(`[RTC] Initializing PeerConnection (polite: ${this.isPolite})`);
        this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

        this.peerConnection.onconnectionstatechange = () => {
             const state = this.peerConnection?.connectionState || 'new';
             console.log(`[RTC] Connection state: ${state}`);
             if (this.onConnectionStateChangeCallback) this.onConnectionStateChangeCallback(state);
        };

        this.peerConnection.oniceconnectionstatechange = () => {
             const state = this.peerConnection?.iceConnectionState;
             console.log(`[RTC] ICE state: ${state}`);
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidateCallback) {
                this.onIceCandidateCallback(event.candidate.toJSON());
            }
        };

        this.peerConnection.ondatachannel = (event) => {
            console.log("[RTC] Remote DataChannel received");
            if (this.onDataChannelCallback) this.onDataChannelCallback(event.channel);
        };
    }

    public setCallbacks(
        onConnectionStateChange: (state: RTCPeerConnectionState) => void,
        onDataChannel: (channel: RTCDataChannel) => void,
        onIceCandidate: (candidate: RTCIceCandidateInit) => void
    ) {
        this.onConnectionStateChangeCallback = onConnectionStateChange;
        this.onDataChannelCallback = onDataChannel;
        this.onIceCandidateCallback = onIceCandidate;
    }

    public createDataChannel(label: string): RTCDataChannel | null {
        if (!this.peerConnection) return null;
        try {
            console.log(`[RTC] Creating DataChannel: ${label}`);
            return this.peerConnection.createDataChannel(label);
        } catch (error) {
            console.error("[RTC] Error creating DataChannel:", error);
            return null;
        }
    }

    public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
        if (!this.peerConnection) return null;
        try {
            this.makingOffer = true;
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            return this.peerConnection.localDescription;
        } catch (error) {
            console.error("[RTC] Error creating offer:", error);
            return null;
        } finally {
            this.makingOffer = false;
        }
    }

    public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
        if (!this.peerConnection) return null;

        const offerCollision = (offer.type === "offer") && 
                             (this.makingOffer || this.peerConnection.signalingState !== "stable" || this.isRestartingIce);

        if (offerCollision) {
            if (!this.isPolite) {
                console.warn("[RTC] Offer collision: Impolite peer ignoring offer.");
                return null;
            }
            console.log("[RTC] Offer collision: Polite peer handling offer.");
        }

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            return this.peerConnection.localDescription;
        } catch (error) {
            console.error("[RTC] Error handling offer:", error);
            return null;
        }
    }

    public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) return;
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            this.isRestartingIce = false;
            this.iceRestartAttempts = 0; // Reset on success
            console.log("[RTC] ICE Restart successful");
        } catch (error) {
            console.error("[RTC] Error handling answer:", error);
            this.isRestartingIce = false;
        }
    }

    public async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) return;
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error("[RTC] Error adding ICE candidate:", error);
        }
    }

    public async restartIce(): Promise<RTCSessionDescriptionInit | null> {
        if (!this.peerConnection) return null;
        
        if (this.iceRestartAttempts >= this.MAX_ICE_RESTART_ATTEMPTS) {
            console.error("[RTC] Max ICE restart attempts reached (2). Forcing hard reconnect via null offer.");
            this.iceRestartAttempts = 0; // Reset for next cycle
            return null;
        }

        if (this.isRestartingIce) {
            console.warn("[RTC] ICE restart already in progress, ignoring.");
            return null;
        }

        try {
            this.isRestartingIce = true;
            this.iceRestartAttempts++;
            console.log(`[RTC] Initializing ICE restart (Attempt ${this.iceRestartAttempts}/${this.MAX_ICE_RESTART_ATTEMPTS})...`);
            
            const offer = await this.peerConnection.createOffer({ iceRestart: true });
            await this.peerConnection.setLocalDescription(offer);
            return this.peerConnection.localDescription;
        } catch (error) {
            console.error("[RTC] ICE restart failed:", error);
            this.isRestartingIce = false;
            return null;
        }
    }

    public close() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }
}
