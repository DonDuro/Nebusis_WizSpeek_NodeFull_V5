import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, ChevronLeft, ChevronRight, Eye, Clock, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

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

interface StoryView {
  id: number;
  storyId: number;
  viewerId: number;
  viewedAt: string;
  viewer: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function StoryViewer({ story, onClose, onNext, onPrevious, hasNext, hasPrevious }: StoryViewerProps) {
  const [showViews, setShowViews] = useState(false);
  const queryClient = useQueryClient();

  // Record story view
  const recordViewMutation = useMutation({
    mutationFn: () => apiRequest(`/api/stories/${story.id}/view`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories/feed"] });
    }
  });

  // Get story views (only for own stories)
  const { data: storyViews } = useQuery<StoryView[]>({
    queryKey: [`/api/stories/${story.id}/views`],
    enabled: showViews, // Only fetch when viewing
  });

  // Record view when story is opened (if not already viewed)
  useEffect(() => {
    if (!story.hasViewed) {
      recordViewMutation.mutate();
    }
  }, [story.id]);

  // Auto-progress timer (like Instagram Stories)
  useEffect(() => {
    if (hasNext) {
      const timer = setTimeout(() => {
        onNext?.();
      }, 5000); // 5 seconds per story

      return () => clearTimeout(timer);
    }
  }, [story.id, hasNext, onNext]);

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Story Display */}
          <div 
            className="flex-1 relative flex flex-col justify-between text-white"
            style={{ backgroundColor: story.backgroundColor }}
          >
            {story.mediaUrl && (
              <img 
                src={story.mediaUrl} 
                alt="Story media" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            
            {/* Progress bars */}
            <div className="relative z-20 flex gap-1 p-4">
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 px-4 pb-2">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={story.user.avatar || undefined} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {story.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">{story.user.username}</p>
                <p className="text-sm opacity-90">{formatTimeAgo(story.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatExpiresIn(story.expiresAt)}</span>
              </div>
            </div>

            {/* Caption */}
            {story.caption && (
              <div className="relative z-10 px-4 py-6 flex-1 flex items-center justify-center">
                <p className="text-xl font-medium text-center leading-relaxed max-w-lg">
                  {story.caption}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowViews(!showViews)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {story.viewCount}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {story.visibility}
                </Badge>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute inset-y-0 left-4 flex items-center">
              {hasPrevious && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={onPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
            </div>
            
            <div className="absolute inset-y-0 right-4 flex items-center">
              {hasNext && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={onNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-20 p-2"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Story Views Panel */}
          {showViews && (
            <div className="w-80 bg-background border-l">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h3 className="font-semibold">Seen by {story.viewCount}</h3>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100%-80px)]">
                {storyViews && storyViews.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {storyViews.map((view) => (
                      <div key={view.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={view.viewer.avatar || undefined} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {view.viewer.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{view.viewer.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(view.viewedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No views yet</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}