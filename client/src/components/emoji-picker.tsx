import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const EMOJI_CATEGORIES = {
  reactions: {
    name: "Reactions",
    emojis: ["👍", "👎", "😀", "😢", "😮", "❤️", "😂", "😡", "👏", "🔥", "💯", "✅"]
  },
  smileys: {
    name: "Smileys & People",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"]
  },
  gestures: {
    name: "Gestures",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤏", "💪", "🦾", "🙏", "✍️", "🤝", "👏", "👐"]
  },
  hearts: {
    name: "Hearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"]
  },
  symbols: {
    name: "Symbols",
    emojis: ["💯", "🔥", "✨", "⭐", "🌟", "💫", "⚡", "💥", "💢", "💨", "💤", "💦", "💧", "💪", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎯", "🎲", "🎮", "🎰"]
  }
};

export function EmojiPicker({ onEmojiSelect, trigger, size = "md" }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("reactions");

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size={size === "sm" ? "sm" : "icon"}
      className={size === "sm" ? "h-6 w-6 p-0" : "h-8 w-8"}
    >
      <Smile className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
    </Button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0 px-3"
                onClick={() => setActiveCategory(key)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-3 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].emojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-accent"
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}