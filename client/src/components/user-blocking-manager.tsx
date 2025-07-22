import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserX, UserCheck, Shield, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BlockedUser {
  id: number;
  blockerId: number;
  blockedId: number;
  createdAt: string;
  reason: string | null;
  blocked: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
    department: string | null;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  department: string | null;
}

export function UserBlockingManager() {
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blockedUsers, isLoading } = useQuery<BlockedUser[]>({
    queryKey: ["/api/users/blocked"],
  });

  // Get all users for blocking (this would need a separate endpoint in practice)
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/users"], // This endpoint would need to be created
    enabled: false, // We'll implement a search/select mechanism instead
  });

  const blockUserMutation = useMutation({
    mutationFn: ({ blockedId, reason }: { blockedId: number; reason: string }) =>
      apiRequest("/api/users/block", {
        method: "POST",
        body: JSON.stringify({ blockedId, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/blocked"] });
      toast({
        title: "User Blocked",
        description: "User has been blocked successfully.",
      });
      setBlockModalOpen(false);
      setBlockReason("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: (blockedId: number) =>
      apiRequest(`/api/users/block/${blockedId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/blocked"] });
      toast({
        title: "User Unblocked",
        description: "User has been unblocked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unblock user",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBlockUser = () => {
    if (selectedUser && blockReason.trim()) {
      blockUserMutation.mutate({ 
        blockedId: selectedUser.id, 
        reason: blockReason.trim() 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">User Blocking System</p>
              <p className="mt-1">
                Block users to prevent them from contacting you or seeing your content. 
                This feature provides mutual and private blocking protection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blocked Users</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Users you have blocked cannot contact you or see your stories
              </p>
            </div>
            <Button 
              onClick={() => setBlockModalOpen(true)}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <UserX className="w-4 h-4 mr-2" />
              Block User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!blockedUsers || blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Blocked Users</h3>
              <p className="text-muted-foreground">
                You haven't blocked any users yet. When you do, they'll appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {blockedUsers.map((block) => (
                  <Card key={block.id} className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={block.blocked.avatar || undefined} />
                            <AvatarFallback className="bg-gray-500 text-white">
                              {block.blocked.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{block.blocked.username}</p>
                            <p className="text-sm text-muted-foreground">{block.blocked.email}</p>
                            {block.blocked.department && (
                              <p className="text-xs text-muted-foreground">{block.blocked.department}</p>
                            )}
                            {block.reason && (
                              <p className="text-xs text-red-600 mt-1">
                                Reason: {block.reason}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Blocked {formatDate(block.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblockUserMutation.mutate(block.blockedId)}
                          disabled={unblockUserMutation.isPending}
                          className="text-green-600 hover:text-green-700 ml-4"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Unblock
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Block User Modal */}
      <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="w-5 h-5" />
              Block User
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">How blocking works:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>They can't send you messages</li>
                  <li>They can't see your stories</li>
                  <li>You won't see their content</li>
                  <li>They won't be notified</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <div className="text-sm text-muted-foreground mb-2">
                For demo purposes, you can block any of these test users: alice, bob, charlie, blockeduser
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason (Optional)</Label>
              <Textarea
                id="block-reason"
                placeholder="Why are you blocking this user? (optional)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={2}
              />
            </div>
            
            {/* For demo purposes, show quick block buttons */}
            <div className="space-y-2">
              <Label>Quick Block (Demo)</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 4, username: "alice", email: "alice@example.com" },
                  { id: 5, username: "bob", email: "bob@example.com" }, 
                  { id: 6, username: "charlie", email: "charlie@example.com" },
                  { id: 7, username: "blockeduser", email: "blocked@example.com" }
                ].map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setBlockReason("Demo block for testing purposes");
                    }}
                  >
                    {user.username}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBlockModalOpen(false);
              setSelectedUser(null);
              setBlockReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBlockUser}
              disabled={!selectedUser || blockUserMutation.isPending}
            >
              {blockUserMutation.isPending ? "Blocking..." : "Block User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}