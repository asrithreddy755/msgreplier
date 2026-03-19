// src/lib/webrtc/connection.ts

export const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Fallback TURN server for restricted networks (symmetric NAT, corporate firewalls)
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
    ]
};

export class WebRTCConnection {
    public peerConnection: RTCPeerConnection | null = null;
    private onConnectionStateChangeCallback: ((state: RTCPeerConnectionState) => void) | null = null;
    private onIceConnectionStateChangeCallback: ((state: RTCIceConnectionState) => void) | null = null;
    private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        // 4. Prevent Duplicate Peer Connections
        this.close();

        this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

        // 2. Add Connection State Handling
        this.peerConnection.onconnectionstatechange = () => {
            if (!this.peerConnection) return;
            
            const state = this.peerConnection.connectionState;
            console.log("Connection state:", state);

            if (state === "disconnected" || state === "failed" || state === "closed") {
                console.log("Peer disconnected");
            } else if (state === "connected") {
                console.log("Peer connected");
            }

            if (this.onConnectionStateChangeCallback) {
                this.onConnectionStateChangeCallback(state);
            }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            if (!this.peerConnection) return;
            const state = this.peerConnection.iceConnectionState;
            console.log("ICE Connection state:", state);
            if (this.onIceConnectionStateChangeCallback) {
                this.onIceConnectionStateChangeCallback(state);
            }
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidateCallback) {
                this.onIceCandidateCallback(event.candidate);
            }
        };
    }

    public setCallbacks(
        onConnectionStateChange: (state: RTCPeerConnectionState) => void,
        onIceConnectionStateChange: (state: RTCIceConnectionState) => void,
        onIceCandidate: (candidate: RTCIceCandidate) => void
    ) {
        this.onConnectionStateChangeCallback = onConnectionStateChange;
        this.onIceConnectionStateChangeCallback = onIceConnectionStateChange;
        this.onIceCandidateCallback = onIceCandidate;
    }

    public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
        if (!this.peerConnection) return null;
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            console.log("Offer created and set as local description");
            return offer;
        } catch (error) {
            console.error("Error creating offer:", error);
            return null;
        }
    }

    public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
        if (!this.peerConnection) return null;
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            console.log("Offer received, Answer created and set as local description");
            return answer;
        } catch (error) {
            console.error("Error handling offer:", error);
            return null;
        }
    }

    public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) return;
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("Answer received and set as remote description");
        } catch (error) {
            console.error("Error handling answer:", error);
        }
    }

    public async handleIceCandidate(candidateInit: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) return;
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidateInit));
            console.log("ICE candidate received and added");
        } catch (error) {
            console.error("Error adding received ice candidate", error);
        }
    }

    public close() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }
}
