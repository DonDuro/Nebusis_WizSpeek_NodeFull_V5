import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserPlus, Eye, Contact, Smartphone, Mail, Shield, QrCode, Send, CheckCircle } from "lucide-react";

interface ContactDiscoveryProps {
  currentUser: any;
}

export function ContactDiscovery({ currentUser }: ContactDiscoveryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contactsEnabled, setContactsEnabled] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch all users who could be potential contacts
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  // Fetch existing contacts to filter them out
  const { data: existingContacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contacts");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  // Send invitation to existing user
  const sendConnectionRequest = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contact-invitations", data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-invitations"] });
      toast({
        title: "Connection Request Sent",
        description: `Your request has been sent to ${variables.inviteeName}`,
      });
      setSelectedUser(null);
      setShowInviteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request.",
        variant: "destructive",
      });
    },
  });

  // Filter available users (exclude current user and existing contacts)
  const availableUsers = allUsers.filter((user: any) => 
    user.id !== currentUser?.id && 
    !existingContacts.some((contact: any) => contact.contact.id === user.id)
  );

  const handleSendRequest = (user: any) => {
    const invitationData = {
      inviteeEmail: user.email,
      inviteeName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username,
      visibilityLevel: "general-non-specific",
      customMessage: `Hi ${user.firstName || user.username}! I'd like to connect with you on WizSpeek® for secure messaging.`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'connection_request'
    };

    sendConnectionRequest.mutate(invitationData);
  };

  const handleContactSync = () => {
    setContactsEnabled(true);
    toast({
      title: "Contact Sync Enabled",
      description: "In a real implementation, this would request permission to access your device contacts and securely match them with WizSpeek® users.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Contact Sync Permission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contact className="h-5 w-5" />
            Find Friends on WizSpeek®
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {contactsEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Users className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Access Your Contacts</h4>
              <p className="text-sm text-muted-foreground">
                {contactsEnabled 
                  ? "Contact sync is enabled. We'll help you find friends who are already on WizSpeek®."
                  : "Allow WizSpeek® to securely check your contacts for friends already using the platform"
                }
              </p>
            </div>
            {!contactsEnabled && (
              <Button onClick={handleContactSync}>
                <Smartphone className="h-4 w-4 mr-2" />
                Enable Contact Sync
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <Shield className="h-4 w-4 inline mr-1" />
            <strong>Privacy Protected:</strong> Your contacts are encrypted and only used to find mutual connections. 
            Phone numbers and emails are never stored, shared, or sold. You can disable this at any time.
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            People You May Know
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {contactsEnabled 
              ? "Based on your contacts and mutual connections"
              : "Users already on WizSpeek® that you can connect with"
            }
          </p>
        </CardHeader>
        <CardContent>
          {availableUsers.length > 0 ? (
            <div className="space-y-3">
              {availableUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.username ? user.username[0].toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.department && (
                          <Badge variant="outline" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                        {contactsEnabled && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            <Contact className="h-3 w-3 mr-1" />
                            In Contacts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowInviteDialog(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No New Contacts Found</h3>
              <p className="text-muted-foreground mb-4">
                {contactsEnabled 
                  ? "None of your contacts are currently using WizSpeek®"
                  : "Enable contact sync to find friends already on WizSpeek®"
                }
              </p>
              <div className="flex gap-2 justify-center">
                {!contactsEnabled && (
                  <Button variant="outline" onClick={handleContactSync}>
                    <Contact className="h-4 w-4 mr-2" />
                    Sync Contacts
                  </Button>
                )}
                <Button>
                  <QrCode className="h-4 w-4 mr-2" />
                  Share QR Code Instead
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Request Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Connection Request</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.username
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Connection Type</Label>
                <Select defaultValue="general-non-specific">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-non-specific">General Connection</SelectItem>
                    <SelectItem value="professional-non-specific">Professional</SelectItem>
                    <SelectItem value="personal-non-specific">Personal</SelectItem>
                    <SelectItem value="academic-non-specific">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Personal Message (Optional)</Label>
                <Textarea 
                  placeholder={`Hi ${selectedUser.firstName || selectedUser.username}! I'd like to connect with you on WizSpeek®.`}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => handleSendRequest(selectedUser)}
                  disabled={sendConnectionRequest.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendConnectionRequest.isPending ? "Sending..." : "Send Request"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}