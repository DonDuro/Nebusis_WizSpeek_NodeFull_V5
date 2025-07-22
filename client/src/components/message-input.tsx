import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Mic, Send, Square, Play, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FileAttachment } from "./file-attachment";
import { EmojiPicker } from "./emoji-picker";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MessageInputProps {
  onSendMessage: (message: string, metadata?: any) => void;
  onTyping: (isTyping: boolean) => void;
  conversationId?: number;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, onTyping, conversationId, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [pendingFile, setPendingFile] = useState<any>(null);
  const [showFileAttachment, setShowFileAttachment] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      // Send message with file attachment
      onSendMessage(`📎 Shared file: ${data.file.filename}`, {
        type: "file",
        fileId: data.file.id,
        fileName: data.file.filename,
        fileSize: data.file.size,
        mimeType: data.file.mimeType
      });
      setPendingFile(null);
      setShowFileAttachment(false);
      toast({
        title: "File Shared",
        description: "File has been encrypted and shared successfully"
      });
    },
    onError: (error) => {
      console.error("File upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Unable to upload file. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's a pending file, upload it first
    if (pendingFile) {
      handleFileUpload();
      return;
    }
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFileSelected = (encryptedFile: any) => {
    setPendingFile(encryptedFile);
    setShowFileAttachment(false);
  };

  const handleFileUpload = async () => {
    if (!pendingFile || !conversationId) return;

    const formData = new FormData();
    
    // Create a new blob with encrypted data
    const encryptedBlob = new Blob([pendingFile.encryptedData], { 
      type: pendingFile.file.type 
    });
    
    formData.append("file", encryptedBlob, pendingFile.file.name);
    formData.append("encryptedKey", pendingFile.keyData);
    formData.append("iv", Array.from(pendingFile.iv).join(","));
    formData.append("category", pendingFile.metadata.category);
    formData.append("messageId", ""); // Will be set after message creation

    fileUploadMutation.mutate(formData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.length > 0) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    } else {
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const toggleFileAttachment = () => {
    setShowFileAttachment(!showFileAttachment);
  };

  const startRecording = async () => {
    console.log('Starting recording...');
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted, creating MediaRecorder...');
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        console.log('Audio blob created:', audioBlob.size, 'bytes');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      console.log('Recording started successfully');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Recording voice message... Tap again to stop.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      let errorMessage = "Unable to access microphone. Please check permissions.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Microphone access denied. Please allow microphone access and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        }
      }
      
      toast({
        title: "Microphone Error",
        description: errorMessage,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording Stopped",
        description: `Voice message recorded (${recordingTime}s). Click play to review.`,
      });
    }
  };

  const handleVoiceRecord = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Microphone button clicked, isRecording:', isRecording);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      // In a real app, you would upload the audio blob to the server
      onSendMessage(`🎤 Voice message (${recordingTime}s)`);
      setAudioBlob(null);
      setRecordingTime(0);
      
      toast({
        title: "Voice Message Sent",
        description: "Your voice message has been sent successfully.",
      });
    }
  };

  const discardVoiceMessage = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    toast({
      title: "Recording Discarded",
      description: "Voice message has been deleted.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmojiSelect = (emoji: string) => {
    // If the emoji is the only content or if we're sending as emoji-only message
    if (!message.trim()) {
      // Send as emoji-only message
      onSendMessage(emoji, { type: "emoji" });
    } else {
      // Add emoji to current message
      setMessage(prev => prev + emoji);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Show voice message interface if we have a recorded audio
  if (audioBlob) {
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center justify-between bg-muted rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Voice Message</span>
            <span className="text-xs text-muted-foreground">{formatTime(recordingTime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={discardVoiceMessage}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
            <Button
              size="sm"
              onClick={sendVoiceMessage}
              className="bg-primary-blue hover:bg-primary-blue/90"
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      {/* File Attachment Interface */}
      {showFileAttachment && (
        <div className="mb-3">
          <FileAttachment 
            onFileSelected={handleFileSelected}
            conversationId={conversationId}
            disabled={disabled || isRecording}
          />
        </div>
      )}

      {/* Pending File Display */}
      {pendingFile && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Ready to send: {pendingFile.file.name}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPendingFile(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center bg-destructive/10 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-destructive">Recording...</span>
            <span className="text-sm text-destructive/80">{formatTime(recordingTime)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={stopRecording}
              className="text-destructive hover:text-destructive"
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <div className="flex items-center space-x-2 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleFileAttachment}
              className="h-8 w-8"
              disabled={isRecording}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceRecord}
              className={cn(
                "h-8 w-8",
                isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              size="sm"
            />
          </div>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording voice message..." : "Type your message..."}
            className="min-h-[2.5rem] max-h-32 resize-none"
            disabled={disabled || isRecording}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={(!message.trim() && !pendingFile) || disabled || isRecording || fileUploadMutation.isPending}
          className="bg-primary-blue hover:bg-primary-blue/90 flex-shrink-0"
        >
          {fileUploadMutation.isPending ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
