export class WebRTCService {
  private ws: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomId: string;
  private onIncomingCall: ((from: string, offer: RTCSessionDescriptionInit) => void) | null = null;
  private onCallAnswered: ((answer: RTCSessionDescriptionInit) => void) | null = null;
  private onCallEnded: (() => void) | null = null;
  private onRemoteStream: ((stream: MediaStream) => void) | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  async connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log('[WebRTC] Connecting to WebSocket:', wsUrl, 'for room:', this.roomId);
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('[WebRTC] WebSocket connection opened, sending register for room:', this.roomId);
      this.ws?.send(JSON.stringify({
        type: 'register',
        roomId: this.roomId
      }));
    };
    
    this.ws.onerror = (error) => {
      console.error('[WebRTC] WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('[WebRTC] WebSocket connection closed');
    };

    this.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('[WebRTC] Received WebSocket message:', data.type);
      
      switch (data.type) {
        case 'incoming-call':
          console.log('[WebRTC] Incoming call from:', data.from);
          if (this.onIncomingCall) {
            this.onIncomingCall(data.from, data.offer);
          }
          break;
          
        case 'call-answered':
          console.log('[WebRTC] Call answered, applying remote description');
          if (this.peerConnection && data.answer) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log('[WebRTC] Remote description applied successfully');
          }
          if (this.onCallAnswered) {
            this.onCallAnswered(data.answer);
          }
          break;
          
        case 'ice-candidate':
          if (this.peerConnection && data.candidate) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;
          
        case 'call-ended':
          if (this.onCallEnded) {
            this.onCallEnded();
          }
          this.endCall();
          break;
      }
    };
  }

  async startCall(targetRoom: string) {
    await this.initializeMedia();
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.localStream?.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, this.localStream!);
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          targetRoom,
          candidate: event.candidate
        }));
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.ws?.send(JSON.stringify({
      type: 'call',
      targetRoom,
      offer
    }));
  }

  async answerCall(targetRoom: string, offer: RTCSessionDescriptionInit) {
    await this.initializeMedia();
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.localStream?.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, this.localStream!);
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          targetRoom,
          candidate: event.candidate
        }));
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.ws?.send(JSON.stringify({
      type: 'answer',
      targetRoom,
      answer
    }));
  }

  async initializeMedia() {
    if (!this.localStream) {
      try {
        // Try to get real media devices first
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (error) {
        console.warn('Could not access camera/microphone, creating fake stream for testing:', error);
        // Create a fake stream for testing/demo purposes
        this.localStream = await this.createFakeMediaStream();
      }
    }
    return this.localStream;
  }

  private async createFakeMediaStream(): Promise<MediaStream> {
    // Create a canvas with a gradient
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;
    
    // Draw a gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Camera Not Available', canvas.width / 2, canvas.height / 2);
    ctx.font = '18px sans-serif';
    ctx.fillText('(Test Mode)', canvas.width / 2, canvas.height / 2 + 40);
    
    // Get video stream from canvas
    const videoStream = (canvas as any).captureStream(30);
    
    // Create silent audio track
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.001; // Nearly silent
    oscillator.connect(gainNode);
    gainNode.connect(destination);
    oscillator.start();
    
    // Combine video and audio streams
    const mediaStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...destination.stream.getAudioTracks()
    ]);
    
    return mediaStream;
  }

  getLocalStream() {
    return this.localStream;
  }

  hangUp(targetRoom: string) {
    this.ws?.send(JSON.stringify({
      type: 'hang-up',
      targetRoom
    }));
    this.endCall();
  }

  private endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
  }

  setOnIncomingCall(callback: (from: string, offer: RTCSessionDescriptionInit) => void) {
    this.onIncomingCall = callback;
  }

  setOnCallAnswered(callback: (answer: RTCSessionDescriptionInit) => void) {
    this.onCallAnswered = callback;
  }

  setOnCallEnded(callback: () => void) {
    this.onCallEnded = callback;
  }

  setOnRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStream = callback;
  }

  disconnect() {
    this.endCall();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
