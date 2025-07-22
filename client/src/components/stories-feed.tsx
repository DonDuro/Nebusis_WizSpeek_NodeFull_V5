import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Users } from "lucide-react";
import { useState } from "react";
import { StoryViewer } from "./story-viewer";

interface Story {
  id: number;
  userId: number;
  mediaType: string;
  caption: string;
  backgroundColor: string;
  createdAt: string;
  expiresAt: string;
  visibility: string;
  mediaUrl: string | null;
  user: {
    id: number;
    username: string;
    avatar: string | null;
  };
  viewCount: number;
  hasViewed: boolean;
}

export function StoriesFeed() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories/feed"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatExpiresIn = (dateString: string) => {
    const expiresAt = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) return "Expired";
    if (diffInMinutes < 60) return `${diffInMinutes}m left`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h left`;
    return `${Math.floor(diffInHours / 24)}d left`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Users className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Stories Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Be the first to share a story! Stories are a great way to share quick updates with your contacts.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {stories.map((story) => (
          <Card 
            key={story.id} 
            className={`relative cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
              story.hasViewed ? 'opacity-75' : 'ring-2 ring-blue-500'
            }`}
            onClick={() => setSelectedStory(story)}
          >
            <CardContent 
              className="p-0 h-64 flex flex-col justify-between text-white relative"
              style={{ backgroundColor: story.backgroundColor }}
            >
              {story.mediaUrl && (
                <img 
                  src={story.mediaUrl} 
                  alt="Story media" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              
              {/* Header */}
              <div className="relative z-10 flex items-center gap-3 p-3">
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarImage src={story.user.avatar || undefined} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {story.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{story.user.username}</p>
                  <p className="text-xs opacity-90">{formatTimeAgo(story.createdAt)}</p>
                </div>
                {!story.hasViewed && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Caption */}
              {story.caption && (
                <div className="relative z-10 px-3 py-2 flex-1 flex items-center">
                  <p className="text-sm font-medium leading-relaxed line-clamp-4">
                    {story.caption}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="relative z-10 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{story.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatExpiresIn(story.expiresAt)}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {story.visibility}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStory && (
        <StoryViewer 
          story={selectedStory} 
          onClose={() => setSelectedStory(null)}
          onNext={() => {
            const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
            const nextStory = stories[currentIndex + 1];
            if (nextStory) setSelectedStory(nextStory);
          }}
          onPrevious={() => {
            const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
            const prevStory = stories[currentIndex - 1];
            if (prevStory) setSelectedStory(prevStory);
          }}
          hasNext={stories.findIndex(s => s.id === selectedStory.id) < stories.length - 1}
          hasPrevious={stories.findIndex(s => s.id === selectedStory.id) > 0}
        />
      )}
    </>
  );
}