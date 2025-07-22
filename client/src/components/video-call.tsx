import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Maximize,
  Minimize,
  User
} from "lucide-react";
import { webrtcManager, type CallState } from "@/lib/webrtc";
import { cn } from "@/lib/utils";

interface VideoCallProps {
  remoteUser?: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export function VideoCall({ remoteUser }: VideoCallProps) {
  const [callState, setCallState] = useState<CallState>(webrtcManager.getCallState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const unsubscribe = webrtcManager.onStateChange(setCallState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (callState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (callState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  const handleStartCall = async (type: 'video' | 'audio') => {
    if (remoteUser) {
      try {
        await webrtcManager.initiateCall(remoteUser.id, type);
      } catch (error) {
        console.error('Failed to start call:', error);
      }
    }
  };

  const handleEndCall = () => {
    webrtcManager.endCall();
  };

  const handleToggleVideo = () => {
    webrtcManager.toggleVideo();
  };

  const handleToggleAudio = () => {
    webrtcManager.toggleAudio();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!callState.isInCall && callState.callStatus === 'idle') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStartCall('video')}
          disabled={!remoteUser}
          className="flex items-center gap-1"
        >
          <Video className="h-4 w-4" />
          Video Call
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStartCall('audio')}
          disabled={!remoteUser}
          className="flex items-center gap-1"
        >
          <Phone className="h-4 w-4" />
          Audio Call
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-0 bg-black text-white",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full max-w-4xl mx-auto"
    )}>
      <CardContent className="p-0 relative h-[400px] overflow-hidden">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Remote User Placeholder */}
        {!callState.remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {remoteUser?.avatar ? (
                  <img 
                    src={remoteUser.avatar} 
                    alt={remoteUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
              <p className="text-lg font-medium">{remoteUser?.username}</p>
              <Badge variant="secondary" className="mt-2">
                {callState.callStatus === 'calling' && 'Calling...'}
                {callState.callStatus === 'ringing' && 'Ringing...'}
                {callState.callStatus === 'connected' && 'Connected'}
              </Badge>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {callState.localStream && callState.isVideoEnabled && (
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Call Status */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
            {callState.callStatus === 'calling' && 'Calling...'}
            {callState.callStatus === 'ringing' && 'Incoming Call'}
            {callState.callStatus === 'connected' && 'Connected'}
            {callState.callStatus === 'ended' && 'Call Ended'}
          </Badge>
        </div>

        {/* Fullscreen Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        {/* Call Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            {/* Microphone Toggle */}
            <Button
              size="sm"
              variant={callState.isAudioEnabled ? "secondary" : "destructive"}
              onClick={handleToggleAudio}
              className="rounded-full p-2"
            >
              {callState.isAudioEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>

            {/* Video Toggle */}
            <Button
              size="sm"
              variant={callState.isVideoEnabled ? "secondary" : "destructive"}
              onClick={handleToggleVideo}
              className="rounded-full p-2"
            >
              {callState.isVideoEnabled ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>

            {/* End Call */}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEndCall}
              className="rounded-full p-2"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Incoming Call Actions */}
        {callState.callStatus === 'ringing' && !callState.isInitiator && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant="destructive"
                onClick={() => webrtcManager.rejectCall(callState.remoteUserId!)}
                className="rounded-full p-4"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                variant="default"
                onClick={() => {
                  // This would be handled by accepting the current offer
                  // For now, we auto-accept in the WebRTC manager
                }}
                className="rounded-full p-4 bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}