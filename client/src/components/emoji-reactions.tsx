import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasUserReacted: boolean;
}

interface EmojiReactionsProps {
  messageId: number;
  reactions?: Reaction[];
  onReactionAdd: (messageId: number, emoji: string) => void;
  onReactionRemove: (messageId: number, emoji: string) => void;
  className?: string;
}

// Quick reaction emojis (similar to WhatsApp)
const quickReactions = ["👍", "❤️", "😍", "😂", "😮", "😢", "😡"];

export function EmojiReactions({
  messageId,
  reactions = [],
  onReactionAdd,
  onReactionRemove,
  className,
}: EmojiReactionsProps) {
  const [showQuickReactions, setShowQuickReactions] = useState(false);

  const handleReactionClick = (emoji: string, hasUserReacted: boolean) => {
    if (hasUserReacted) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionAdd(messageId, emoji);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    onReactionAdd(messageId, emoji);
    setShowQuickReactions(false);
  };

  if (reactions.length === 0 && !showQuickReactions) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1 mt-1", className)}>
      {/* Existing Reactions */}
      {reactions.map((reaction, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs rounded-full",
                  reaction.hasUserReacted
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                    : "bg-muted hover:bg-muted/80"
                )}
                onClick={() => handleReactionClick(reaction.emoji, reaction.hasUserReacted)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                {reaction.users.length === 1
                  ? `${reaction.users[0]} reacted with ${reaction.emoji}`
                  : reaction.users.length === 2
                  ? `${reaction.users[0]} and ${reaction.users[1]} reacted with ${reaction.emoji}`
                  : `${reaction.users[0]} and ${reaction.users.length - 1} others reacted with ${reaction.emoji}`}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Add Reaction Button */}
      <Popover open={showQuickReactions} onOpenChange={setShowQuickReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full opacity-60 hover:opacity-100"
            onClick={() => setShowQuickReactions(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent text-lg"
                onClick={() => handleQuickReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent"
              onClick={() => {
                // This would open the full emoji picker
                // For now, just show a smiley
                setShowQuickReactions(false);
              }}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Floating reaction bar for messages (appears on hover)
interface FloatingReactionBarProps {
  messageId: number;
  onReactionAdd: (messageId: number, emoji: string) => void;
  className?: string;
}

export function FloatingReactionBar({
  messageId,
  onReactionAdd,
  className,
}: FloatingReactionBarProps) {
  return (
    <div
      className={cn(
        "absolute -top-8 right-0 bg-background border border-border rounded-full p-1 shadow-lg flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
    >
      {quickReactions.slice(0, 5).map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent text-sm"
          onClick={() => onReactionAdd(messageId, emoji)}
        >
          {emoji}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-accent"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}