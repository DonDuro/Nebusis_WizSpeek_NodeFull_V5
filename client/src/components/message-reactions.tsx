import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmojiPicker } from "./emoji-picker";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MessageReactionsProps {
  messageId: number;
  conversationId: number;
  reactions: { [emoji: string]: number[] };
  currentUserId: number;
  compact?: boolean;
}

export function MessageReactions({ 
  messageId, 
  conversationId, 
  reactions, 
  currentUserId, 
  compact = false 
}: MessageReactionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addReactionMutation = useMutation({
    mutationFn: (emoji: string) =>
      apiRequest("POST", `/api/messages/${messageId}/reactions`, {
        body: JSON.stringify({ emoji }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: (emoji: string) =>
      apiRequest("DELETE", `/api/messages/${messageId}/reactions`, {
        body: JSON.stringify({ emoji }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to remove reaction",
        variant: "destructive",
      });
    },
  });

  const handleReactionClick = (emoji: string) => {
    const userIds = reactions[emoji] || [];
    if (userIds.includes(currentUserId)) {
      removeReactionMutation.mutate(emoji);
    } else {
      addReactionMutation.mutate(emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    addReactionMutation.mutate(emoji);
  };

  const hasReactions = Object.keys(reactions).length > 0;

  if (!hasReactions && compact) {
    return (
      <div className="flex items-center gap-1">
        <EmojiPicker 
          onEmojiSelect={handleEmojiSelect} 
          size="sm"
          trigger={
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
              <Plus className="h-3 w-3" />
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 flex-wrap mt-1">
        {Object.entries(reactions).map(([emoji, userIds]) => {
          const isReacted = userIds.includes(currentUserId);
          const count = userIds.length;
          
          if (count === 0) return null;

          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Badge
                  variant={isReacted ? "default" : "secondary"}
                  className={`cursor-pointer px-2 py-1 text-xs hover:bg-accent ${
                    isReacted ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600" : ""
                  }`}
                  onClick={() => handleReactionClick(emoji)}
                >
                  <span className="mr-1">{emoji}</span>
                  <span>{count}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isReacted ? "You and" : ""} {count} {count === 1 ? "person" : "people"} reacted</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        <EmojiPicker 
          onEmojiSelect={handleEmojiSelect} 
          size="sm"
          trigger={
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
              <Plus className="h-3 w-3" />
            </Button>
          }
        />
      </div>
    </TooltipProvider>
  );
}