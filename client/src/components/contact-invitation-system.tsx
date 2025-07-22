import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, UserPlus, QrCode, Copy, Share2, Eye, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QRContactGenerator } from "./qr-contact-generator";
import { ContactDiscovery } from "./contact-discovery";

// Schema for contact invitation
const invitationSchema = z.object({
  inviteeName: z.string().min(1, "Name is required"),
  inviteeEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  inviteePhone: z.string().optional(),
  invitationMethod: z.enum(["email", "sms", "both"]),
  customMessage: z.string().optional(),
  visibilityLevel: z.enum([
    "general-non-specific", "general-specific", 
    "personal-non-specific", "personal-specific",
    "professional-non-specific", "professional-specific"
  ]).default("general-non-specific"),
  expiresInDays: z.number().min(1).max(30).default(7),
});

type InvitationData = z.infer<typeof invitationSchema>;

interface ContactInvitationSystemProps {
  currentUser: any;
}

export function ContactInvitationSystem({ currentUser }: ContactInvitationSystemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);

  const form = useForm<InvitationData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      inviteeName: "",
      inviteeEmail: "",
      inviteePhone: "",
      invitationMethod: "email",
      customMessage: "",
      visibilityLevel: "general-non-specific",
      expiresInDays: 7,
    },
  });

  // Fetch existing invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["/api/contact-invitations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact-invitations");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  // Fetch users on platform for contact discovery
  const { data: usersOnPlatform = [] } = useQuery({
    queryKey: ["/api/users/discover"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (data: InvitationData) => {
      const response = await apiRequest("POST", "/api/contact-invitations", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Your contact invitation has been sent successfully!",
      });
      setShowInviteDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contact-invitations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InvitationData) => {
    // Validate that we have contact method
    if (data.invitationMethod === "email" && !data.inviteeEmail) {
      form.setError("inviteeEmail", { message: "Email is required for email invitations" });
      return;
    }
    if (data.invitationMethod === "sms" && !data.inviteePhone) {
      form.setError("inviteePhone", { message: "Phone number is required for SMS invitations" });
      return;
    }
    if (data.invitationMethod === "both" && (!data.inviteeEmail || !data.inviteePhone)) {
      if (!data.inviteeEmail) form.setError("inviteeEmail", { message: "Email is required" });
      if (!data.inviteePhone) form.setError("inviteePhone", { message: "Phone is required" });
      return;
    }

    createInvitationMutation.mutate(data);
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard!",
    });
  };

  const shareInvitation = (invitation: any) => {
    if (navigator.share) {
      navigator.share({
        title: `Join me on WizSpeek®`,
        text: `${currentUser.displayName || currentUser.username} invited you to join WizSpeek® - Talk Smart. Stay Secure.`,
        url: `${window.location.origin}/invite/${invitation.inviteCode}`,
      });
    } else {
      copyInviteLink(invitation.inviteCode);
    }
  };

  // Filter users to show who's already on the platform
  const existingUsers = usersOnPlatform.filter((user: any) => user.id !== currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header with invite button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contact Invitations</h2>
          <p className="text-sm text-muted-foreground">
            Invite friends via email or text message to join WizSpeek®
          </p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Someone to WizSpeek®</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteeName">Contact Name</Label>
                <Input
                  {...form.register("inviteeName")}
                  placeholder="Enter their name"
                />
                {form.formState.errors.inviteeName && (
                  <p className="text-sm text-destructive">{form.formState.errors.inviteeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitationMethod">Invitation Method</Label>
                <Select 
                  value={form.watch("invitationMethod")} 
                  onValueChange={(value) => form.setValue("invitationMethod", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">Text Message (SMS)</SelectItem>
                    <SelectItem value="both">Both Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(form.watch("invitationMethod") === "email" || form.watch("invitationMethod") === "both") && (
                <div className="space-y-2">
                  <Label htmlFor="inviteeEmail">Email Address</Label>
                  <Input
                    {...form.register("inviteeEmail")}
                    type="email"
                    placeholder="their.email@example.com"
                  />
                  {form.formState.errors.inviteeEmail && (
                    <p className="text-sm text-destructive">{form.formState.errors.inviteeEmail.message}</p>
                  )}
                </div>
              )}

              {(form.watch("invitationMethod") === "sms" || form.watch("invitationMethod") === "both") && (
                <div className="space-y-2">
                  <Label htmlFor="inviteePhone">Phone Number</Label>
                  <Input
                    {...form.register("inviteePhone")}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  />
                  {form.formState.errors.inviteePhone && (
                    <p className="text-sm text-destructive">{form.formState.errors.inviteePhone.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="visibilityLevel">Privacy Level</Label>
                <Select 
                  value={form.watch("visibilityLevel")} 
                  onValueChange={(value) => form.setValue("visibilityLevel", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-non-specific">General (Basic info)</SelectItem>
                    <SelectItem value="general-specific">General (Full info)</SelectItem>
                    <SelectItem value="personal-non-specific">Personal (Basic)</SelectItem>
                    <SelectItem value="personal-specific">Personal (Full)</SelectItem>
                    <SelectItem value="professional-non-specific">Professional (Basic)</SelectItem>
                    <SelectItem value="professional-specific">Professional (Full)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Personal Message (Optional)</Label>
                <Textarea
                  {...form.register("customMessage")}
                  placeholder="Add a personal message to your invitation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                <Select 
                  value={form.watch("expiresInDays").toString()} 
                  onValueChange={(value) => form.setValue("expiresInDays", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createInvitationMutation.isPending}
                  className="flex-1"
                >
                  {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="qr">QR Codes</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Generate QR Contact Codes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create QR codes that others can scan to connect with you at different profile levels
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button 
                  onClick={() => setShowQRGenerator(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Generate New QR Code
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">How QR Contact Codes Work:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Choose what profile information level to share (general, personal, professional, or academic)</p>
                  <p>• Generate a QR code that others can scan with any QR scanner</p>
                  <p>• If they have WizSpeek®, they'll auto-connect with your chosen profile level</p>
                  <p>• If they don't have WizSpeek®, they'll be directed to sign up first, then auto-connect</p>
                  <p>• All connections start with general information that you can customize later</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading invitations...</p>
              </CardContent>
            </Card>
          ) : invitations.filter((inv: any) => inv.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">No pending invitations</p>
                <p className="text-sm text-muted-foreground">Invite friends to join you on WizSpeek®</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invitations.filter((inv: any) => inv.status === 'pending').map((invitation: any) => (
                <Card key={invitation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{invitation.inviteeName}</h4>
                          <Badge variant="outline">{invitation.visibilityLevel}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {invitation.inviteeEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {invitation.inviteeEmail}
                            </span>
                          )}
                          {invitation.inviteePhone && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {invitation.inviteePhone}
                            </span>
                          )}
                        </div>
                        {invitation.customMessage && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{invitation.customMessage}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInviteLink(invitation.inviteCode)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareInvitation(invitation)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <ContactDiscovery currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {invitations.map((invitation: any) => (
              <Card key={invitation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{invitation.inviteeName}</h4>
                        <Badge 
                          variant={invitation.status === 'accepted' ? 'default' : 
                                  invitation.status === 'declined' ? 'destructive' : 'secondary'}
                        >
                          {invitation.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sent {new Date(invitation.createdAt).toLocaleDateString()}
                        {invitation.usedAt && ` • Accepted ${new Date(invitation.usedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Generator Modal */}
      {showQRGenerator && (
        <QRContactGenerator 
          currentUser={currentUser}
          onClose={() => setShowQRGenerator(false)}
        />
      )}
    </div>
  );
}