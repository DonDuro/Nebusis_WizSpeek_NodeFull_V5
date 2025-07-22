import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Send, 
  Zap, 
  MessageSquare, 
  CheckCircle,
  RefreshCw,
  Settings
} from "lucide-react";
import { aiService, type SmartReply } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SmartRepliesProps {
  conversationId: number;
  lastMessageId: number | null;
  onReplySelect: (content: string) => void;
  disabled?: boolean;
}

export function AISmartReplies({ 
  conversationId, 
  lastMessageId, 
  onReplySelect, 
  disabled = false 
}: SmartRepliesProps) {
  const [smartReplies, setSmartReplies] = useState<SmartReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lastMessageId && aiService.isAIEnabled()) {
      generateReplies();
    }
  }, [lastMessageId, conversationId]);

  const generateReplies = async () => {
    if (!lastMessageId || disabled) return;

    setIsLoading(true);
    try {
      const replies = await aiService.generateSmartReplies(conversationId, lastMessageId);
      setSmartReplies(replies);
      setIsVisible(replies.length > 0);
    } catch (error) {
      console.error("Failed to generate smart replies:", error);
      toast({
        title: "AI Assistant",
        description: "Unable to generate smart replies at the moment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySelect = (reply: SmartReply) => {
    onReplySelect(reply.content);
    setIsVisible(false);
    toast({
      title: "Smart Reply Selected",
      description: "AI-generated response added to your message",
    });
  };

  const handleRefresh = () => {
    generateReplies();
    toast({
      title: "AI Assistant",
      description: "Generating new smart reply suggestions...",
    });
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'professional': return '💼';
      case 'casual': return '😊';
      case 'friendly': return '👋';
      case 'formal': return '🎩';
      default: return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quick': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'detailed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'question': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'confirmation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!aiService.isAIEnabled() || disabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* AI Assistant Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Smart Replies
          </span>
          {isLoading && (
            <RefreshCw className="h-3 w-3 animate-spin text-purple-500" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading || !lastMessageId}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Smart Replies */}
      {isVisible && smartReplies.length > 0 && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span>Suggested Responses</span>
              <Badge variant="secondary" className="text-xs">
                AI-Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {smartReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="group relative border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
                    onClick={() => handleReplySelect(reply)}
                  >
                    <div className="flex items-start justify-between space-x-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                          {reply.content}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getTypeColor(reply.type))}
                          >
                            {reply.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getToneIcon(reply.tone)} {reply.tone}
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.round(reply.confidence * 100)}% match
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplySelect(reply);
                        }}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Click any suggestion to add it to your message</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                AI is analyzing the conversation and generating smart replies...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Replies State */}
      {!isLoading && isVisible && smartReplies.length === 0 && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="py-4">
            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">
                No smart replies available for this message
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}