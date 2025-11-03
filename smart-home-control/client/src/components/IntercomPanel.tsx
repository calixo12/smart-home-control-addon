import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { playButtonClick, startRingtone, stopRingtone, startCallingTone, stopCallingTone } from "@/lib/sounds";
import { WebRTCService } from "@/lib/webrtc";

type CallState = "idle" | "calling" | "receiving" | "in-call";

interface IntercomPanelProps {
  currentRoom: string;
  onCallStateChange?: (state: CallState) => void;
}

export default function IntercomPanel({ currentRoom, onCallStateChange }: IntercomPanelProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [targetRoom, setTargetRoom] = useState<string | null>(null);
  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Notify parent of call state changes
  useEffect(() => {
    onCallStateChange?.(callState);
  }, [callState, onCallStateChange]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  const rooms = [
    { id: "media-room", label: "Media Room" },
    { id: "main-room", label: "Main Room" },
    { id: "master-bedroom", label: "Master Bedroom" },
  ];

  useEffect(() => {
    console.log('[IntercomPanel] Room changed to:', currentRoom);
    
    // Disconnect old service if it exists
    if (webrtcServiceRef.current) {
      console.log('[IntercomPanel] Disconnecting old WebRTC service');
      webrtcServiceRef.current.disconnect();
    }

    // Create new service with current room ID
    console.log('[IntercomPanel] Creating new WebRTC service for room:', currentRoom);
    const webrtcService = new WebRTCService(currentRoom);
    webrtcServiceRef.current = webrtcService;
    
    webrtcService.connect();

    webrtcService.setOnIncomingCall((from, offer) => {
      setIncomingFrom(from);
      incomingOfferRef.current = offer;
      setCallState("receiving");
      startRingtone();
    });

    webrtcService.setOnCallAnswered(async (answer) => {
      // This is received by the caller when the other party answers
      stopCallingTone(); // Stop calling tone when call is answered
      setCallState("in-call");
    });

    webrtcService.setOnCallEnded(() => {
      console.log('[IntercomPanel] onCallEnded triggered - resetting to idle state');
      setCallState("idle");
      setTargetRoom(null);
      setIncomingFrom(null);
      stopRingtone(); // Stop incoming ringtone
      stopCallingTone(); // Stop calling tone
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      console.log('[IntercomPanel] State reset complete, should show idle UI');
    });

    webrtcService.setOnRemoteStream((stream) => {
      console.log('[IntercomPanel] Received remote stream:', stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        // Explicitly play the video
        remoteVideoRef.current.play().catch((error) => {
          console.error('[IntercomPanel] Error playing remote video:', error);
        });
      }
    });

    return () => {
      webrtcService.disconnect();
      stopRingtone();
      stopCallingTone();
    };
  }, [currentRoom]);

  const handleCall = async (room: string) => {
    if (room === currentRoom) return;
    
    playButtonClick();
    setTargetRoom(room);
    setCallState("calling");
    startCallingTone(); // Start calling tone when initiating call
    
    try {
      await webrtcServiceRef.current?.startCall(room);
      const localStream = webrtcServiceRef.current?.getLocalStream();
      console.log('[IntercomPanel] Got local stream for calling:', localStream);
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(error => {
          console.error('[IntercomPanel] Error playing local video:', error);
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      stopCallingTone(); // Stop calling tone if call fails
      setCallState("idle");
      setTargetRoom(null);
    }
  };

  const handleAccept = async () => {
    playButtonClick();
    stopRingtone();
    
    if (incomingFrom && incomingOfferRef.current) {
      setCallState("in-call");
      setTargetRoom(incomingFrom);
      
      try {
        await webrtcServiceRef.current?.answerCall(incomingFrom, incomingOfferRef.current);
        const localStream = webrtcServiceRef.current?.getLocalStream();
        console.log('[IntercomPanel] Got local stream for answering:', localStream);
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(error => {
            console.error('[IntercomPanel] Error playing local video:', error);
          });
        }
      } catch (error) {
        console.error("Failed to answer call:", error);
        setCallState("idle");
        setIncomingFrom(null);
      }
    }
  };

  const handleDecline = () => {
    playButtonClick();
    stopRingtone();
    
    if (incomingFrom) {
      webrtcServiceRef.current?.hangUp(incomingFrom);
    }
    
    setCallState("idle");
    setIncomingFrom(null);
    incomingOfferRef.current = null;
  };

  const handleHangUp = () => {
    playButtonClick();
    console.log('[IntercomPanel] handleHangUp called, targetRoom:', targetRoom);
    
    if (targetRoom) {
      webrtcServiceRef.current?.hangUp(targetRoom);
    }
    
    stopCallingTone(); // Stop calling tone if hanging up during call setup
    setCallState("idle");
    setTargetRoom(null);
    setIncomingFrom(null);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    console.log('[IntercomPanel] handleHangUp complete, state should be idle');
  };

  const toggleVideo = () => {
    playButtonClick();
    const stream = webrtcServiceRef.current?.getLocalStream();
    if (stream) {
      stream.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    playButtonClick();
    const stream = webrtcServiceRef.current?.getLocalStream();
    if (stream) {
      stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  console.log('[IntercomPanel] Rendering with callState:', callState, 'targetRoom:', targetRoom, 'incomingFrom:', incomingFrom);

  // Incoming Call UI - rendered as overlay with background blur
  if (callState === "receiving" && incomingFrom) {
    const callerName = rooms.find(r => r.id === incomingFrom)?.label || incomingFrom;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center px-8">
        {/* Blurred background overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-md"
          style={{
            background: "rgba(0,0,0,0.3)",
          }}
        />
        
        {/* Incoming call card */}
        <div 
          className="relative rounded-xl p-12 flex flex-col items-center justify-center w-full max-w-7xl h-[600px] animate-[flyIn_0.4s_ease-out]"
          style={{
            background: `
              radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
              linear-gradient(145deg, #2a2a2a, #1a1a1a)
            `,
            boxShadow: "0 20px 60px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.4)",
            border: "1px solid #444",
          }}
        >
        <div 
          className="text-4xl font-bold mb-3"
          style={{
            color: "#e8e8e8",
            textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.1)",
            letterSpacing: "-0.01em"
          }}
        >
          Incoming Call
        </div>
        <div 
          className="text-3xl mb-16"
          style={{
            color: "#b0b0b0",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {callerName}
        </div>
        
        <div className="flex gap-12">
          {/* Decline Button - Square Glossy Red */}
          <button
            onClick={handleDecline}
            className="w-36 h-36 rounded-xl relative"
            style={{
              background: `
                radial-gradient(ellipse at top, rgba(255,100,100,0.5), transparent 50%),
                linear-gradient(145deg, #ff3333, #cc0000)
              `,
              boxShadow: `
                0 8px 24px rgba(0,0,0,0.6),
                0 2px 8px rgba(255,0,0,0.4),
                inset 0 2px 4px rgba(255,255,255,0.4),
                inset 0 -2px 8px rgba(0,0,0,0.5)
              `,
              border: "2px solid #990000",
            }}
            data-testid="button-decline-call"
          >
            <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2">
              <PhoneOff className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              <span className="text-white text-sm font-bold drop-shadow-lg">Decline</span>
            </div>
          </button>
          
          {/* Accept Button - Square Glossy Green */}
          <button
            onClick={handleAccept}
            className="w-36 h-36 rounded-xl relative"
            style={{
              background: `
                radial-gradient(ellipse at top, rgba(100,255,100,0.5), transparent 50%),
                linear-gradient(145deg, #33ff33, #00cc00)
              `,
              boxShadow: `
                0 8px 24px rgba(0,0,0,0.6),
                0 2px 8px rgba(0,255,0,0.4),
                inset 0 2px 4px rgba(255,255,255,0.4),
                inset 0 -2px 8px rgba(0,0,0,0.5)
              `,
              border: "2px solid #009900",
            }}
            data-testid="button-accept-call"
          >
            <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2">
              <Phone className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              <span className="text-white text-sm font-bold drop-shadow-lg">Accept</span>
            </div>
          </button>
        </div>
        </div>
      </div>
    );
  }

  // In-Call UI - iOS 4 FaceTime Style
  if (callState === "in-call" || callState === "calling") {
    const displayName = targetRoom ? (rooms.find(r => r.id === targetRoom)?.label || targetRoom) : "";
    
    return (
      <div 
        className="relative rounded-xl overflow-hidden w-full max-w-7xl h-[600px]"
        style={{
          background: "#000",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.15)",
          border: "1px solid #444",
        }}
      >
        {/* Remote Video - Fullscreen Background */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="video-remote"
        />
        
        {/* Local Video - Top Right Corner (iOS 4 FaceTime Style) */}
        <div 
          className="absolute top-6 right-6 w-32 h-40 rounded-lg overflow-hidden z-10"
          style={{
            background: "#000",
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.9),
              inset 0 0 0 2px rgba(255,255,255,0.15),
              inset 0 1px 2px rgba(255,255,255,0.2)
            `,
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            data-testid="video-local"
          />
        </div>
        
        {/* Call Status Label - Top Center */}
        {callState === "calling" && (
          <div 
            className="absolute top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-lg font-bold z-10"
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Calling {displayName}...
          </div>
        )}
        
        {/* Controls - Bottom Left Corner (iOS 4 FaceTime Style - iPad Skeuomorphic Buttons) */}
        <div className="absolute bottom-6 left-6 flex gap-4 z-10">
          {/* Video Toggle - iPad Style Glossy */}
          <button
            onClick={toggleVideo}
            className="w-16 h-16 rounded-xl relative overflow-hidden"
            style={{
              background: videoEnabled 
                ? `
                  linear-gradient(180deg, 
                    rgba(255,255,255,0.95) 0%,
                    rgba(230,230,230,0.95) 50%,
                    rgba(210,210,210,0.95) 100%
                  )
                `
                : `
                  linear-gradient(180deg, 
                    rgba(80,80,80,0.95) 0%,
                    rgba(50,50,50,0.95) 50%,
                    rgba(40,40,40,0.95) 100%
                  )
                `,
              boxShadow: videoEnabled
                ? `
                  0 8px 20px rgba(0,0,0,0.6),
                  inset 0 1px 1px rgba(255,255,255,0.9),
                  inset 0 -1px 3px rgba(0,0,0,0.2)
                `
                : `
                  0 6px 16px rgba(0,0,0,0.8),
                  inset 0 1px 1px rgba(255,255,255,0.15),
                  inset 0 -1px 3px rgba(0,0,0,0.6)
                `,
            }}
            data-testid="button-toggle-video"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
              }}
            />
            {videoEnabled ? (
              <Video className="w-7 h-7 mx-auto relative z-10 drop-shadow-sm" style={{ color: "#333" }} />
            ) : (
              <VideoOff className="w-7 h-7 mx-auto relative z-10 drop-shadow-sm" style={{ color: "#aaa" }} />
            )}
          </button>
          
          {/* Audio Toggle - iPad Style Glossy */}
          <button
            onClick={toggleAudio}
            className="w-16 h-16 rounded-xl relative overflow-hidden"
            style={{
              background: audioEnabled 
                ? `
                  linear-gradient(180deg, 
                    rgba(255,255,255,0.95) 0%,
                    rgba(230,230,230,0.95) 50%,
                    rgba(210,210,210,0.95) 100%
                  )
                `
                : `
                  linear-gradient(180deg, 
                    rgba(80,80,80,0.95) 0%,
                    rgba(50,50,50,0.95) 50%,
                    rgba(40,40,40,0.95) 100%
                  )
                `,
              boxShadow: audioEnabled
                ? `
                  0 8px 20px rgba(0,0,0,0.6),
                  inset 0 1px 1px rgba(255,255,255,0.9),
                  inset 0 -1px 3px rgba(0,0,0,0.2)
                `
                : `
                  0 6px 16px rgba(0,0,0,0.8),
                  inset 0 1px 1px rgba(255,255,255,0.15),
                  inset 0 -1px 3px rgba(0,0,0,0.6)
                `,
            }}
            data-testid="button-toggle-audio"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
              }}
            />
            {audioEnabled ? (
              <Mic className="w-7 h-7 mx-auto relative z-10 drop-shadow-sm" style={{ color: "#333" }} />
            ) : (
              <MicOff className="w-7 h-7 mx-auto relative z-10 drop-shadow-sm" style={{ color: "#aaa" }} />
            )}
          </button>
          
          {/* Hang Up - iPad Style Glossy Red */}
          <button
            onClick={handleHangUp}
            className="w-20 h-16 rounded-xl relative overflow-hidden"
            style={{
              background: `
                linear-gradient(180deg, 
                  rgba(255,80,80,0.98) 0%,
                  rgba(230,40,40,0.98) 50%,
                  rgba(200,20,20,0.98) 100%
                )
              `,
              boxShadow: `
                0 8px 20px rgba(0,0,0,0.7),
                0 2px 8px rgba(255,0,0,0.5),
                inset 0 1px 1px rgba(255,200,200,0.7),
                inset 0 -1px 3px rgba(100,0,0,0.5)
              `,
            }}
            data-testid="button-hang-up"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%)",
              }}
            />
            <PhoneOff className="w-8 h-8 text-white mx-auto relative z-10 drop-shadow-md" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // Room Selection UI
  return (
    <div 
      className="rounded-md p-10 flex gap-8 w-full max-w-7xl"
      style={{
        background: `
          radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
          linear-gradient(145deg, #2a2a2a, #1a1a1a)
        `,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex flex-col w-full">
        <div className="text-base text-white drop-shadow-lg uppercase tracking-wide mb-8 text-center font-bold">
          Intercommunications
        </div>
        <div className="flex gap-6 justify-center">
          {rooms.map((room, index) => {
            const isCurrentRoom = room.id === currentRoom;
            const hotkeyNumber = index + 1;

            return (
              <div key={room.id} className="flex flex-col items-center gap-3">
                <button
                  onClick={() => !isCurrentRoom && handleCall(room.id)}
                  className={`relative rounded-md transition-all flex items-center justify-center overflow-hidden h-48 w-48 ${
                    isCurrentRoom ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  style={{
                    background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                    boxShadow: isCurrentRoom
                      ? "inset 0 6px 14px rgba(0,0,0,0.8)"
                      : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                  data-testid={`button-hotkey-${hotkeyNumber}`}
                  disabled={isCurrentRoom}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div 
                      className="absolute w-[70%] h-[70%] rounded-full"
                      style={{
                        background: "radial-gradient(circle, #4a4a4a, #3a3a3a)",
                        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div 
                        className="absolute inset-[15%] rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                          boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                        }}
                      >
                        <Phone className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                      </div>
                    </div>
                  </div>
                </button>
                <div className="text-sm font-bold text-white text-center" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                  {room.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
