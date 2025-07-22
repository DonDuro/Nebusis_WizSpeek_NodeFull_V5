import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Share2, 
  Users, 
  Calendar, 
  Eye, 
  Download, 
  Shield, 
  Copy, 
  Clock,
  User,
  Settings,
  AlertTriangle,
  Check
} from "lucide-react";
import { type FilePermissions, type SecureFileShare } from "@/lib/file-encryption";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileShareManagerProps {
  fileId: string;
  fileName: string;
  currentShare?: SecureFileShare;
  onCreateShare: (permissions: FilePermissions, expiresIn?: number, allowedUsers?: number[]) => void;
  onUpdateShare: (shareId: string, permissions: FilePermissions) => void;
  onRevokeShare: (shareId: string) => void;
  availableUsers?: Array<{ id: number; username: string; email?: string }>;
  className?: string;
}

export function FileShareManager({
  fileId,
  fileName,
  currentShare,
  onCreateShare,
  onUpdateShare,
  onRevokeShare,
  availableUsers = [],
  className
}: FileShareManagerProps) {
  const [shareSettings, setShareSettings] = useState<{
    canView: boolean;
    canDownload: boolean;
    canShare: boolean;
    requiresAuth: boolean;
    maxViews?: number;
    expiresIn?: number;
    allowedUsers: number[];
    shareMessage: string;
  }>({
    canView: true,
    canDownload: true,
    canShare: false,
    requiresAuth: true,
    allowedUsers: [],
    shareMessage: ''
  });

  const [shareUrl, setShareUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'manage'>('settings');
  const { toast } = useToast();

  const handleCreateShare = async () => {
    setIsCreating(true);
    
    try {
      const permissions: FilePermissions = {
        canView: shareSettings.canView,
        canDownload: shareSettings.canDownload,
        canShare: shareSettings.canShare,
        requiresAuth: shareSettings.requiresAuth,
        allowedUsers: shareSettings.allowedUsers.length > 0 ? shareSettings.allowedUsers : undefined,
        maxViews: shareSettings.maxViews
      };

      onCreateShare(permissions, shareSettings.expiresIn, shareSettings.allowedUsers);
      
      // Generate mock share URL for demo
      const mockUrl = `https://wizspeak.nebusis.com/share/${fileId}/${Date.now()}`;
      setShareUrl(mockUrl);
      
      toast({
        title: "Share Created",
        description: "Secure file share link has been generated",
      });

    } catch (error) {
      toast({
        title: "Share Creation Failed",
        description: "Unable to create secure share link",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied to Clipboard",
        description: "Share link copied successfully",
      });
    }
  };

  const handleRevokeShare = () => {
    if (currentShare) {
      onRevokeShare(currentShare.fileId);
      setShareUrl('');
      toast({
        title: "Share Revoked",
        description: "The share link has been deactivated",
        variant: "destructive"
      });
    }
  };

  const getExpirationText = (hours: number) => {
    if (hours < 24) return `${hours} hours`;
    if (hours < 168) return `${Math.floor(hours / 24)} days`;
    return `${Math.floor(hours / 168)} weeks`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share File</span>
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'manage' ? 'default' : 'outline'}
              onClick={() => setActiveTab('manage')}
            >
              Manage
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{fileName}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {activeTab === 'settings' && (
          <>
            {/* Permission Settings */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Permissions</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      <Eye className="h-3 w-3" />
                      <span>Allow viewing</span>
                    </Label>
                    <p className="text-xs text-gray-500">Recipients can view the file</p>
                  </div>
                  <Switch
                    checked={shareSettings.canView}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, canView: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      <Download className="h-3 w-3" />
                      <span>Allow downloading</span>
                    </Label>
                    <p className="text-xs text-gray-500">Recipients can download the file</p>
                  </div>
                  <Switch
                    checked={shareSettings.canDownload}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, canDownload: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      <Share2 className="h-3 w-3" />
                      <span>Allow re-sharing</span>
                    </Label>
                    <p className="text-xs text-gray-500">Recipients can share with others</p>
                  </div>
                  <Switch
                    checked={shareSettings.canShare}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, canShare: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>Require authentication</span>
                    </Label>
                    <p className="text-xs text-gray-500">Users must be logged in</p>
                  </div>
                  <Switch
                    checked={shareSettings.requiresAuth}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, requiresAuth: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Access Control</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="allowed-users">Specific Users (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select users who can access this file" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} {user.email && `(${user.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max-views">Maximum Views (Optional)</Label>
                  <Input
                    id="max-views"
                    type="number"
                    placeholder="Unlimited"
                    min="1"
                    max="1000"
                    value={shareSettings.maxViews || ''}
                    onChange={(e) => 
                      setShareSettings(prev => ({ 
                        ...prev, 
                        maxViews: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Expiration Settings */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Expiration</span>
              </h4>

              <div>
                <Label htmlFor="expires-in">Link expires in</Label>
                <Select
                  value={shareSettings.expiresIn?.toString() || 'never'}
                  onValueChange={(value) => 
                    setShareSettings(prev => ({ 
                      ...prev, 
                      expiresIn: value === 'never' ? undefined : parseInt(value) 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="24">1 day</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                    <SelectItem value="720">1 month</SelectItem>
                    <SelectItem value="8760">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Share Message */}
            <div className="space-y-2">
              <Label htmlFor="share-message">Message (Optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a message for recipients..."
                value={shareSettings.shareMessage}
                onChange={(e) => 
                  setShareSettings(prev => ({ ...prev, shareMessage: e.target.value }))
                }
                className="min-h-[80px]"
              />
            </div>

            {/* Create/Update Share Button */}
            <div className="space-y-3">
              <Button
                onClick={handleCreateShare}
                disabled={isCreating || !shareSettings.canView}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating Secure Link...' : 'Create Share Link'}
              </Button>

              {shareUrl && (
                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyShareUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    This link is encrypted and secure. Only users with proper permissions can access the file.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'manage' && (
          <>
            {/* Current Share Status */}
            {currentShare ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Active Share</h4>
                  <Badge variant="default" className="flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Active</span>
                  </Badge>
                </div>

                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Share ID</span>
                      <span className="text-sm font-mono">{currentShare.fileId.slice(-8)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Created</span>
                      <span className="text-sm">{new Date(currentShare.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {currentShare.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Expires</span>
                        <span className="text-sm">{new Date(currentShare.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Permissions</span>
                      <div className="flex flex-wrap gap-1">
                        {currentShare.permissions.canView && (
                          <Badge variant="outline" className="text-xs">View</Badge>
                        )}
                        {currentShare.permissions.canDownload && (
                          <Badge variant="outline" className="text-xs">Download</Badge>
                        )}
                        {currentShare.permissions.canShare && (
                          <Badge variant="outline" className="text-xs">Share</Badge>
                        )}
                        {currentShare.permissions.requiresAuth && (
                          <Badge variant="outline" className="text-xs">Auth Required</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('settings')}
                        className="flex-1"
                      >
                        <Settings className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRevokeShare}
                        className="flex-1"
                      >
                        <AlertTriangle className="h-3 w-3 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    No Active Shares
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create a secure share link to share this file with others
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('settings')}
                >
                  Create Share Link
                </Button>
              </div>
            )}

            {/* Share History (Mock) */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Share History
              </h4>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No previous shares for this file
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}