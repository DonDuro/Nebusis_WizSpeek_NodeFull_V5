import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Type, Palette, Globe, Lock } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BACKGROUND_COLORS = [
  "#2E5A87", // WizSpeek Blue
  "#E74C3C", // Red
  "#27AE60", // Green
  "#F39C12", // Orange
  "#8E44AD", // Purple
  "#1ABC9C", // Turquoise
  "#E67E22", // Carrot
  "#34495E", // Dark Blue Gray
  "#16A085", // Dark Turquoise
  "#C0392B"  // Dark Red
];

export function CreateStoryModal({ open, onOpenChange }: CreateStoryModalProps) {
  const [mediaType, setMediaType] = useState<"text" | "image" | "video">("text");
  const [caption, setCaption] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createStoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories/feed"] });
      toast({
        title: "Story Created",
        description: "Your story has been shared successfully!",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create story",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Set media type based on file type
      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      }
    }
  };

  const handleSubmit = () => {
    if (mediaType === "text" && !caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please enter a caption for your text story.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("mediaType", mediaType);
    formData.append("caption", caption);
    formData.append("backgroundColor", backgroundColor);
    formData.append("visibility", visibility);
    
    if (selectedFile) {
      formData.append("media", selectedFile);
    }

    createStoryMutation.mutate(formData);
  };

  const handleClose = () => {
    setCaption("");
    setMediaType("text");
    setBackgroundColor(BACKGROUND_COLORS[0]);
    setVisibility("public");
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Story Type Selection */}
          <div className="space-y-3">
            <Label>Story Type</Label>
            <div className="flex gap-3">
              <Button
                variant={mediaType === "text" ? "default" : "outline"}
                onClick={() => {
                  setMediaType("text");
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="flex-1"
              >
                <Type className="w-4 h-4 mr-2" />
                Text
              </Button>
              <Button
                variant={mediaType === "image" ? "default" : "outline"}
                onClick={() => {
                  setMediaType("image");
                  fileInputRef.current?.click();
                }}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                onClick={() => {
                  setMediaType("video");
                  fileInputRef.current?.click();
                }}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaType === "image" ? "image/*" : "video/*"}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Preview */}
          <Card className="overflow-hidden">
            <CardContent 
              className="p-8 h-64 flex items-center justify-center text-white relative"
              style={{ backgroundColor: mediaType === "text" ? backgroundColor : undefined }}
            >
              {previewUrl ? (
                mediaType === "image" ? (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <video src={previewUrl} className="max-w-full max-h-full" controls />
                )
              ) : (
                <div className="text-center">
                  {caption ? (
                    <p className="text-lg font-medium leading-relaxed">{caption}</p>
                  ) : (
                    <div className="text-white/60">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                        {mediaType === "text" ? (
                          <Type className="w-8 h-8" />
                        ) : mediaType === "image" ? (
                          <Camera className="w-8 h-8" />
                        ) : (
                          <Upload className="w-8 h-8" />
                        )}
                      </div>
                      <p className="text-sm">
                        {mediaType === "text" 
                          ? "Enter your caption below" 
                          : "Select a file to preview"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          {/* Background Color (for text stories) */}
          {mediaType === "text" && (
            <div className="space-y-3">
              <Label>Background Color</Label>
              <div className="flex gap-2 flex-wrap">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full border-2 ${
                      backgroundColor === color ? "border-primary scale-110" : "border-transparent"
                    } transition-all hover:scale-105`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(value: "public" | "private") => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Public - Everyone can see</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Private - Only contacts</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createStoryMutation.isPending}
              className="bg-[#2E5A87] hover:bg-[#1e3a5f]"
            >
              {createStoryMutation.isPending ? "Creating..." : "Share Story"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}