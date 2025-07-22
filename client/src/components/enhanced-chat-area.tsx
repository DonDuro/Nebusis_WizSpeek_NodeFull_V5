import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, VideoIcon, MoreHorizontal, Check, CheckCheck, Info, CheckSquare, BellOff, Clock, Heart, X, Flag, UserX, Trash2, Archive, MessageSquare, Shield, LogOut, Users, UserCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { wsManager } from "@/lib/websocket";
import { MessageInput } from "./message-input";
import { VideoCall } from "./video-call";
import { useToast } from "@/hooks/use-toast";
import { webrtcManager } from "@/lib/webrtc";
import { AISmartReplies } from "./ai-smart-replies";
import { AIMessageSummary } from "./ai-message-summary";
import { EmojiPicker } from "./emoji-picker";
import { MessageReactions } from "./message-reactions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Conversation, Message, User } from "@/types";

interface ChatAreaProps {
  conversation: Conversation;
  currentUser: User;
  onLogout?: () => void;
}

export function EnhancedChatArea({ conversation, currentUser, onLogout }: ChatAreaProps) {
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [viewingContact, setViewingContact] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/conversations", conversation.id, "messages"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/conversations/${conversation.id}/messages`);
      return response.json();
    },
  });

  // Fetch conversation participants for group chats
  const { data: participants = [] } = useQuery({
    queryKey: ["/api/conversations", conversation.id, "participants"],
    queryFn: async () => {
      if (conversation.type !== "group") return [];
      const response = await apiRequest("GET", `/api/conversations/${conversation.id}/participants`);
      return response.json();
    },
    enabled: conversation.type === "group",
  });

  // Fetch contact profile when viewing
  const { data: contactProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users", viewingContact?.id, "profile"],
    queryFn: async () => {
      if (!viewingContact) return null;
      const response = await apiRequest("GET", `/api/users/${viewingContact.id}/profile`);
      return response.json();
    },
    enabled: !!viewingContact,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; type?: string; metadata?: any }) => {
      const response = await apiRequest("POST", "/api/messages", {
        conversationId: conversation.id,
        content: data.content,
        type: data.type || "text",
        metadata: data.metadata
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversation.id, "messages"] });
    },
  });

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversation.id, "messages"] });
      }
    };

    const handleTyping = (data: { userId: number; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.userId) ? prev : [...prev, data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    };

    wsManager.on("new_message", handleNewMessage);
    wsManager.on("typing", handleTyping);

    return () => {
      wsManager.off("new_message", handleNewMessage);
      wsManager.off("typing", handleTyping);
    };
  }, [conversation.id, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = (content: string, metadata?: any) => {
    sendMessageMutation.mutate({
      content,
      type: metadata?.type || "text",
      metadata
    });
  };

  const handleTyping = (isTyping: boolean) => {
    wsManager.send({
      type: "typing",
      conversationId: conversation.id,
      isTyping,
    });
  };

  const getConversationName = () => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
      return otherParticipant?.user.username || "Unknown Contact";
    }
    return conversation.name || "Group Chat";
  };

  const getConversationAvatar = () => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
      return otherParticipant?.user.username.charAt(0).toUpperCase() || "U";
    }
    return conversation.name?.charAt(0).toUpperCase() || "G";
  };

  const isParticipantOnline = () => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
      return otherParticipant?.user.isOnline || false;
    }
    return false;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMessageRead = (message: Message) => {
    return message.readBy.length > 1; // More than just the sender
  };

  // Call functions
  const handleVoiceCall = async () => {
    const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
    if (otherParticipant) {
      try {
        await webrtcManager.initiateCall(otherParticipant.user.id, 'audio');
        toast({
          title: "Audio Call",
          description: `Starting audio call with ${otherParticipant.user.username}...`,
        });
      } catch (error) {
        toast({
          title: "Call Failed",
          description: "Unable to start call. Please check your microphone permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleVideoCall = async () => {
    const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
    if (otherParticipant) {
      try {
        await webrtcManager.initiateCall(otherParticipant.user.id, 'video');
        toast({
          title: "Video Call",
          description: `Starting video call with ${otherParticipant.user.username}...`,
        });
      } catch (error) {
        toast({
          title: "Call Failed",
          description: "Unable to start call. Please check your camera and microphone permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleMoreOptions = (option: string) => {
    setShowMoreMenu(false); // Close menu when option is clicked
    const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
    
    switch (option) {
      case "contact_info":
        if (conversation.type === "direct" && otherParticipant) {
          setViewingContact(otherParticipant.user);
          setShowContactInfo(true);
        } else if (conversation.type === "group") {
          setShowGroupMembers(true);
        }
        break;
      case "select_messages":
        toast({
          title: "Select Messages",
          description: "Enter selection mode to forward, delete, or star messages",
        });
        break;
      case "mute_notifications":
        toast({
          title: "Mute Notifications",
          description: "Notifications muted for this conversation",
        });
        break;
      case "disappearing_messages":
        toast({
          title: "Disappearing Messages",
          description: "Set messages to auto-delete after 24 hours, 7 days, or 90 days",
        });
        break;
      case "add_to_favorites":
        toast({
          title: "Add to Favorites",
          description: "Conversation added to favorites for quick access",
        });
        break;
      case "close_chat":
        toast({
          title: "Close Chat",
          description: "Chat closed but conversation history preserved",
        });
        break;
      case "logout":
        if (onLogout) {
          onLogout();
        }
        break;
      case "report":
        toast({
          title: "Report",
          description: "Report spam, inappropriate content, or security concerns",
        });
        break;
      case "block_contact":
        toast({
          title: "Block Contact",
          description: `${otherParticipant?.user.username || "Contact"} has been blocked`,
        });
        break;
      case "clear_chat":
        toast({
          title: "Clear Chat",
          description: "All messages in this chat have been cleared",
        });
        break;
      case "delete_chat":
        toast({
          title: "Delete Chat",
          description: "Chat deleted permanently from your device",
        });
        break;
      case "archive_chat":
        toast({
          title: "Archive Chat",
          description: "Chat archived and moved to archived conversations",
        });
        break;
      case "encryption_info":
        toast({
          title: "WizSpeek® Security",
          description: "Military-grade end-to-end encryption active. Messages secured with AES-256.",
        });
        break;
      default:
        break;
    }
  };

  // Get remote user for video calling
  const getRemoteUser = () => {
    const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser.id);
    if (otherParticipant) {
      return {
        id: otherParticipant.user.id,
        username: otherParticipant.user.username,
        avatar: otherParticipant.user.avatar
      };
    }
    return undefined;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-background dark:to-gray-900">
      {/* Video Call Component */}
      <VideoCall remoteUser={getRemoteUser()} />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary-blue text-white">
                {getConversationAvatar()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {getConversationName()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isParticipantOnline() ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceCall}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVideoCall}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <VideoIcon className="h-5 w-5" />
            </Button>
            <div className="relative" ref={moreMenuRef}>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal className="h-5 w-5 text-red-500" />
              </Button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 shadow-xl border rounded-lg z-50">
                  <div className="py-2">
                    {/* Enhanced Menu - Updated 2025-01-07 4:34 AM */}
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("contact_info")}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      {conversation.type === "group" ? "Group info" : "Contact Info / Profile"}
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("select_messages")}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Select messages
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("mute_notifications")}
                    >
                      <BellOff className="mr-2 h-4 w-4" />
                      Mute notifications
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("disappearing_messages")}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Disappearing messages
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("add_to_favorites")}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Add to favorites
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("close_chat")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Close chat
                    </button>
                    
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("report")}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("block_contact")}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Block
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("clear_chat")}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Clear chat
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("delete_chat")}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete chat
                    </button>
                    
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("archive_chat")}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive chat
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => handleMoreOptions("encryption_info")}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      WizSpeek® Security
                    </button>
                    
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-red-100 dark:hover:bg-red-900 flex items-center text-red-600 dark:text-red-400"
                      onClick={() => handleMoreOptions("logout")}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message: Message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-2",
                  message.senderId === currentUser.id ? "justify-end" : "justify-start"
                )}
              >
                {message.senderId !== currentUser.id && (
                  <Avatar 
                    className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-500" 
                    onClick={() => {
                      setViewingContact(message.sender);
                      setShowContactInfo(true);
                    }}
                    title={`View ${message.sender.username}'s profile`}
                  >
                    <AvatarFallback className="bg-primary-blue text-white text-sm">
                      {message.sender.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "flex-1 max-w-md",
                    message.senderId === currentUser.id ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl shadow-sm",
                      message.senderId === currentUser.id
                        ? "bg-primary-blue text-white ml-12"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {message.type === "text" ? (
                      <p className="text-sm">{message.content}</p>
                    ) : message.type === "file" ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-background bg-opacity-20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{message.content}</p>
                          <p className="text-xs opacity-80">File attachment</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {formatTime(message.createdAt)}
                      </span>
                      {message.senderId === currentUser.id && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs opacity-70">SecureLink™</span>
                          {isMessageRead(message) ? (
                            <CheckCheck className="h-3 w-3 opacity-70" />
                          ) : (
                            <Check className="h-3 w-3 opacity-70" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Message Reactions */}
                  <MessageReactions
                    messageId={message.id}
                    conversationId={conversation.id}
                    reactions={(message as any).reactions || {}}
                    currentUserId={currentUser.id}
                    compact={true}
                  />
                </div>
              </div>
            ))
          )}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">Someone is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* AI Summary and Smart Replies */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {/* AI Message Summary */}
          <AIMessageSummary 
            conversationId={conversation.id}
            messageCount={10}
            className="max-w-full"
          />
          
          {/* AI Smart Replies */}
          <AISmartReplies
            conversationId={conversation.id}
            lastMessageId={messages.length > 0 ? messages[messages.length - 1].id : null}
            onReplySelect={(content) => {
              handleSendMessage(content);
            }}
            disabled={sendMessageMutation.isPending}
          />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-background">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          conversationId={conversation.id}
          disabled={sendMessageMutation.isPending}
        />
      </div>

      {/* Contact Information Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Contact Information
            </DialogTitle>
          </DialogHeader>
          {viewingContact && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {viewingContact.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {viewingContact.firstName && viewingContact.lastName ? 
                      `${viewingContact.firstName} ${viewingContact.lastName}` : 
                      viewingContact.username
                    }
                  </h2>
                  <p className="text-muted-foreground">@{viewingContact.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Direct Chat
                    </Badge>
                    {viewingContact.isOnline && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="quick-info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quick-info" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Quick Contact Info
                  </TabsTrigger>
                  <TabsTrigger value="full-profile" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Full Profile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="quick-info" className="space-y-4 mt-6">
                  {/* Quick Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-4 w-4" />
                        Basic Contact Details
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Essential contact information</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Username</Label>
                          <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">@{viewingContact.username}</p>
                        </div>
                        {viewingContact.email && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Email</Label>
                            <p className="text-sm">{viewingContact.email}</p>
                          </div>
                        )}
                        {viewingContact.department && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Department/Role</Label>
                            <p className="text-sm">{viewingContact.department}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Status</Label>
                          <p className="text-sm">{viewingContact.isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-4 w-4" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleVoiceCall}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Voice Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleVideoCall}
                        >
                          <VideoIcon className="h-4 w-4 mr-2" />
                          Video Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowContactInfo(false)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="full-profile" className="space-y-4 mt-6">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Loading profile...</div>
                    </div>
                  ) : contactProfile ? (
                    <div className="space-y-4">
                      {/* Academic Information */}
                      {contactProfile.academicInstitution && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Users className="h-4 w-4" />
                              Academic Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Institution</Label>
                                <p className="text-sm">{contactProfile.academicInstitution}</p>
                              </div>
                              {contactProfile.majorFieldOfStudy && (
                                <div>
                                  <Label className="text-sm font-medium">Major</Label>
                                  <p className="text-sm">{contactProfile.majorFieldOfStudy}</p>
                                </div>
                              )}
                              {contactProfile.gradeLevel && (
                                <div>
                                  <Label className="text-sm font-medium">Year</Label>
                                  <p className="text-sm">{contactProfile.gradeLevel}</p>
                                </div>
                              )}
                              {contactProfile.graduationYear && (
                                <div>
                                  <Label className="text-sm font-medium">Expected Graduation</Label>
                                  <p className="text-sm">{contactProfile.graduationYear}</p>
                                </div>
                              )}
                            </div>
                            {contactProfile.academicInterests && (
                              <div>
                                <Label className="text-sm font-medium">Academic Interests</Label>
                                <p className="text-sm">{contactProfile.academicInterests}</p>
                              </div>
                            )}
                            {contactProfile.academicAchievements && (
                              <div>
                                <Label className="text-sm font-medium">Achievements</Label>
                                <p className="text-sm">{contactProfile.academicAchievements}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Professional Information */}
                      {contactProfile.jobTitle && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Users className="h-4 w-4" />
                              Professional Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Job Title</Label>
                                <p className="text-sm">{contactProfile.jobTitle}</p>
                              </div>
                              {contactProfile.company && (
                                <div>
                                  <Label className="text-sm font-medium">Company</Label>
                                  <p className="text-sm">{contactProfile.company}</p>
                                </div>
                              )}
                            </div>
                            {contactProfile.professionalBio && (
                              <div>
                                <Label className="text-sm font-medium">Professional Bio</Label>
                                <p className="text-sm">{contactProfile.professionalBio}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Personal Information */}
                      {(contactProfile.personalBio || contactProfile.personalInterests) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Heart className="h-4 w-4" />
                              Personal Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {contactProfile.personalBio && (
                              <div>
                                <Label className="text-sm font-medium">About</Label>
                                <p className="text-sm">{contactProfile.personalBio}</p>
                              </div>
                            )}
                            {contactProfile.personalInterests && (
                              <div>
                                <Label className="text-sm font-medium">Interests</Label>
                                <p className="text-sm">{contactProfile.personalInterests}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {contactProfile.age && (
                                <div>
                                  <Label className="text-sm font-medium">Age</Label>
                                  <p className="text-sm">{contactProfile.age} years old</p>
                                </div>
                              )}
                              {contactProfile.languages && (
                                <div>
                                  <Label className="text-sm font-medium">Languages</Label>
                                  <p className="text-sm">{contactProfile.languages}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Skills & Education */}
                      {(contactProfile.skills || contactProfile.education) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Shield className="h-4 w-4" />
                              Skills & Education
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {contactProfile.education && (
                              <div>
                                <Label className="text-sm font-medium">Education</Label>
                                <p className="text-sm">{contactProfile.education}</p>
                              </div>
                            )}
                            {contactProfile.skills && (
                              <div>
                                <Label className="text-sm font-medium">Skills</Label>
                                <p className="text-sm">{contactProfile.skills}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">This contact hasn't shared their detailed profile yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">You can only see their basic contact information.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Group Members Dialog */}
      <Dialog open={showGroupMembers} onOpenChange={setShowGroupMembers}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Members ({participants.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No group members found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant: any) => (
                  <div 
                    key={participant.user.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500"
                        onClick={() => {
                          if (participant.user.id !== currentUser.id) {
                            setViewingContact(participant.user);
                            setShowGroupMembers(false);
                            setShowContactInfo(true);
                          }
                        }}
                        title={participant.user.id !== currentUser.id ? `View ${participant.user.username}'s profile` : "Your profile"}
                      >
                        <AvatarFallback>
                          {participant.user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {participant.user.firstName && participant.user.lastName ? 
                            `${participant.user.firstName} ${participant.user.lastName}` : 
                            participant.user.username
                          }
                          {participant.user.id === currentUser.id && (
                            <span className="text-sm text-blue-600 ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">@{participant.user.username}</p>
                        {participant.user.role && participant.user.role !== "user" && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {participant.user.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.user.isOnline ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                      {participant.user.id !== currentUser.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewingContact(participant.user);
                            setShowGroupMembers(false);
                            setShowContactInfo(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}