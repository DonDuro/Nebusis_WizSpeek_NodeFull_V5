import { wsManager } from "./websocket";

export interface CallState {
  isInCall: boolean;
  isInitiator: boolean;
  remoteUserId: number | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  callStatus: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
}

export interface CallOffer {
  from: number;
  to: number;
  type: 'video' | 'audio';
  offer: RTCSessionDescriptionInit;
}

export interface CallAnswer {
  from: number;
  to: number;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidate {
  from: number;
  to: number;
  candidate: RTCIceCandidateInit;
}

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callStateListeners: ((state: CallState) => void)[] = [];
  private currentCallState: CallState = {
    isInCall: false,
    isInitiator: false,
    remoteUserId: null,
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    callStatus: 'idle'
  };

  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor() {
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    wsManager.on('call_offer', this.handleCallOffer.bind(this));
    wsManager.on('call_answer', this.handleCallAnswer.bind(this));
    wsManager.on('ice_candidate', this.handleIceCandidate.bind(this));
    wsManager.on('call_ended', this.handleCallEnded.bind(this));
    wsManager.on('call_rejected', this.handleCallRejected.bind(this));
  }

  public onStateChange(listener: (state: CallState) => void) {
    this.callStateListeners.push(listener);
    return () => {
      this.callStateListeners = this.callStateListeners.filter(l => l !== listener);
    };
  }

  private updateCallState(updates: Partial<CallState>) {
    this.currentCallState = { ...this.currentCallState, ...updates };
    this.callStateListeners.forEach(listener => listener(this.currentCallState));
  }

  public async initiateCall(userId: number, type: 'video' | 'audio' = 'video'): Promise<void> {
    try {
      this.updateCallState({ 
        callStatus: 'calling', 
        isInitiator: true, 
        remoteUserId: userId 
      });

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video' ? { width: 1280, height: 720 } : false,
        audio: true
      });

      this.updateCallState({ 
        localStream: this.localStream,
        isVideoEnabled: type === 'video',
        isInCall: true
      });

      // Create peer connection
      this.createPeerConnection();

      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Send offer via WebSocket
      wsManager.emit('call_offer', {
        to: userId,
        type,
        offer: offer
      });

    } catch (error) {
      console.error('Error initiating call:', error);
      this.endCall();
      throw error;
    }
  }

  private async handleCallOffer(data: CallOffer) {
    try {
      this.updateCallState({
        callStatus: 'ringing',
        isInitiator: false,
        remoteUserId: data.from
      });

      // Show incoming call UI - this would be handled by the UI component
      // For now, we'll auto-accept for demo purposes
      setTimeout(() => this.acceptCall(data), 1000);
    } catch (error) {
      console.error('Error handling call offer:', error);
    }
  }

  public async acceptCall(offer: CallOffer): Promise<void> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: offer.type === 'video',
        audio: true
      });

      this.updateCallState({
        localStream: this.localStream,
        isVideoEnabled: offer.type === 'video',
        isInCall: true,
        callStatus: 'connected'
      });

      // Create peer connection
      this.createPeerConnection();

      // Add tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Set remote description
      await this.peerConnection!.setRemoteDescription(offer.offer);

      // Create answer
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      // Send answer
      wsManager.emit('call_answer', {
        to: offer.from,
        answer: answer
      });

    } catch (error) {
      console.error('Error accepting call:', error);
      this.rejectCall(offer.from);
    }
  }

  public rejectCall(userId: number) {
    wsManager.emit('call_rejected', { to: userId });
    this.updateCallState({ callStatus: 'idle', remoteUserId: null });
  }

  private async handleCallAnswer(data: CallAnswer) {
    try {
      await this.peerConnection?.setRemoteDescription(data.answer);
      this.updateCallState({ callStatus: 'connected' });
    } catch (error) {
      console.error('Error handling call answer:', error);
    }
  }

  private async handleIceCandidate(data: IceCandidate) {
    try {
      await this.peerConnection?.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  private handleCallEnded() {
    this.endCall();
  }

  private handleCallRejected() {
    this.updateCallState({ callStatus: 'ended' });
    setTimeout(() => this.endCall(), 2000);
  }

  private createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentCallState.remoteUserId) {
        wsManager.emit('ice_candidate', {
          to: this.currentCallState.remoteUserId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.updateCallState({ remoteStream: this.remoteStream });
    };

    // Handle connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        this.updateCallState({ callStatus: 'connected' });
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    };
  }

  public toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.updateCallState({ isVideoEnabled: videoTrack.enabled });
      }
    }
  }

  public toggleAudio(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.updateCallState({ isAudioEnabled: audioTrack.enabled });
      }
    }
  }

  public endCall(): void {
    // Notify remote user
    if (this.currentCallState.remoteUserId) {
      wsManager.emit('call_ended', { to: this.currentCallState.remoteUserId });
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop media streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;

    // Reset state
    this.updateCallState({
      isInCall: false,
      isInitiator: false,
      remoteUserId: null,
      localStream: null,
      remoteStream: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      callStatus: 'idle'
    });
  }

  public getCallState(): CallState {
    return this.currentCallState;
  }
}

export const webrtcManager = new WebRTCManager();