import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, MessageCircle, Shield, Users, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedChatArea } from "@/components/enhanced-chat-area";
import { ComplianceDashboard } from "@/components/compliance-dashboard";
import { apiRequest } from "@/lib/queryClient";
import { authApi, removeAuthToken } from "@/lib/auth";
import { wsManager } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import { EmojiPicker } from "@/components/emoji-picker";
import { MessageReactions } from "@/components/message-reactions";
import { useTranslation, getCurrentLanguage } from "@/lib/translations";
import type { User, Conversation } from "@/types";
import wizSpeakIcon from "@/assets/wizspeak-icon.svg";

interface ChatPageProps {
  onLogout: () => void;
}

export default function ChatPage({ onLogout }: ChatPageProps) {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "compliance">("chat");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation(getCurrentLanguage());

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/profile");
      return response.json();
    },
    enabled: true,
    retry: false,
    staleTime: 30000,
    gcTime: 60000,
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/conversations");
      return response.json();
    },
    enabled: !!user,
    retry: false,
    staleTime: 15000,
  });

  useEffect(() => {
    // Connect to WebSocket
    wsManager.connect();

    return () => {
      wsManager.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      removeAuthToken();
      wsManager.disconnect();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      removeAuthToken();
      wsManager.disconnect();
      onLogout();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  // Handle authentication errors
  if (userError) {
    console.error("User authentication error:", userError);
    // Don't auto-logout on error, just show loading
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to WizSpeek®...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={wizSpeakIcon} alt="WizSpeek" className="w-16 h-16 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">WizSpeek®</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search_conversations')}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat/Compliance Toggle */}
        <div className="p-4 border-b">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              onClick={() => setActiveView("chat")}
              variant={activeView === "chat" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('chat')}
            </Button>
            <Button
              onClick={() => setActiveView("compliance")}
              variant={activeView === "compliance" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              {t('compliance')}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {activeView === "chat" && (
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowGroupModal(true)}
              >
                <Users className="w-4 h-4 mr-2" />
{t('new_group')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowQRModal(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
{t('link_device')}
              </Button>
            </div>
          </div>
        )}

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                  activeConversation?.id === conversation.id && "bg-accent"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conversation.type === 'direct' 
                        ? (conversation.participants.find(p => p.user.id !== user.id)?.user.username.charAt(0).toUpperCase() || 'U')
                        : (conversation.name?.charAt(0).toUpperCase() || 'G')
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conversation.type === 'direct' 
                        ? (conversation.participants.find(p => p.user.id !== user.id)?.user.username || 'Unknown Contact')
                        : (conversation.name || 'Group Chat')
                      }
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
  {conversation.type === 'group' ? t('group_chat') : t('direct_message')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeView === "compliance" ? (
          <div className="h-full p-6 overflow-y-auto">
            <ComplianceDashboard currentUser={user} />
          </div>
        ) : activeConversation ? (
          <EnhancedChatArea
            conversation={activeConversation}
            currentUser={user}
            onLogout={handleLogout}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img src={wizSpeakIcon} alt="WizSpeek" className="w-20 h-20" />
              </div>
              <h2 className="text-4xl font-bold text-primary mb-6">WizSpeek®</h2>
              <p className="text-lg text-muted-foreground mb-8">{t('select_conversation')}</p>
              <div className="flex items-center justify-center mb-8">
                <div className="flex-1 h-px bg-border max-w-24"></div>
                <p className="text-base text-muted-foreground mx-6">
                  {t('talk_smart_stay_secure')}
                </p>
                <div className="flex-1 h-px bg-border max-w-24"></div>
              </div>
              <p className="text-sm text-primary">
                {t('powered_by_nebusis')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Group Creation Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group conversation with multiple participants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="Enter group name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Group Description (Optional)</Label>
              <Input
                placeholder="Describe your group..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGroupModal(false)}
              >
                Cancel
              </Button>
              <Button>
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device Linking Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Device Relay Setup</DialogTitle>
            <DialogDescription>
              Scan this Relay Code to sync WizSpeek® across your devices securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Relay Code</p>
                  <p className="text-xs text-gray-400 mt-1">SecureSync™</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">How to sync your device:</h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>1. Install WizSpeek® on your mobile device</li>
                <li>2. Open Settings → Device Relay</li>
                <li>3. Tap "Add Device" and scan this Relay Code</li>
              </ol>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowQRModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
