import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Copy, Share2, Plus, Eye, EyeOff, UserPlus, Clock, Link, Mail, Phone, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const visibilityLevels = [
  { value: "general-non-specific", label: "General Non-Specific", description: "Basic info with general descriptors (e.g., 'Tech Company' instead of specific name)" },
  { value: "general-specific", label: "General Specific", description: "Basic info with specific details (company names, locations, etc.)" },
  { value: "personal-non-specific", label: "Personal Non-Specific", description: "Personal info with general descriptors only" },
  { value: "personal-specific", label: "Personal Specific", description: "Personal info with specific details" },
  { value: "professional-non-specific", label: "Professional Non-Specific", description: "Professional info with general descriptors only" },
  { value: "professional-specific", label: "Professional Specific", description: "Professional info with specific details" },
];

const inviteFormSchema = z.object({
  inviteeName: z.string().optional(),
  inviteeEmail: z.string().email().optional().or(z.literal("")),
  inviteePhone: z.string().optional(),
  visibilityLevel: z.string().default("general-non-specific"),
  customMessage: z.string().optional(),
  nameDisplayOverride: z.enum(["full", "first_initial_last", "first_last_initial", "pseudonym"]).optional(),
  customPseudonym: z.string().optional(),
  expiresIn: z.number().optional(), // days
  maxUses: z.number().min(1).default(1),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface ContactInvitationManagerProps {
  currentUser: any;
}

export function ContactInvitationManager({ currentUser }: ContactInvitationManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvite, setSelectedInvite] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      inviteeName: "",
      inviteeEmail: "",
      inviteePhone: "",
      visibilityLevel: "general-non-specific",
      customMessage: "",
      nameDisplayOverride: undefined,
      customPseudonym: "",
      expiresIn: 7,
      maxUses: 1,
    },
  });

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["/api/contact-invitations"],
  });

  const createInviteMutation = useMutation({
    mutationFn: (data: InviteFormData) => apiRequest("/api/contact-invitations", {
      method: "POST",
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-invitations"] });
      toast({
        title: "Invitation Created",
        description: "Contact invitation created successfully with QR code!",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invitation",
        variant: "destructive",
      });
    },
  });

  const deactivateInviteMutation = useMutation({
    mutationFn: (inviteId: string) => apiRequest(`/api/contact-invitations/${inviteId}/deactivate`, {
      method: "PATCH",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-invitations"] });
      toast({
        title: "Invitation Deactivated",
        description: "The invitation has been deactivated.",
      });
    },
  });

  const onSubmit = (data: InviteFormData) => {
    // Convert expiresIn to actual date for API call
    const submitData = {
      ...data,
      expiresIn: data.expiresIn, // Keep this for API processing
    };
    createInviteMutation.mutate(submitData);
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard!",
    });
  };

  const shareInvite = (invite: any) => {
    const link = `${window.location.origin}/join/${invite.inviteCode}`;
    const message = invite.customMessage ? 
      `${invite.customMessage}\n\nJoin me on WizSpeek: ${link}` :
      `Join me on WizSpeek: ${link}`;

    if (navigator.share) {
      navigator.share({
        title: "Join me on WizSpeek",
        text: message,
        url: link,
      });
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: "Message Copied",
        description: "Invitation message copied to clipboard!",
      });
    }
  };

  const generateQRCode = (inviteCode: string) => {
    const link = `${window.location.origin}/join/${inviteCode}`;
    // Using QR.js library or similar - for now, we'll use a QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const getVisibilityLevelInfo = (level: string) => {
    return visibilityLevels.find(v => v.value === level) || visibilityLevels[0];
  };

  return (
    <div className="space-y-6">
      {/* Create New Invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Contact Invitation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate personalized invitations with custom privacy settings and QR codes for easy sharing.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Invitee Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="inviteeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inviteeEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inviteePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Privacy Level for This Invitation</h4>
                
                <FormField
                  control={form.control}
                  name="visibilityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What can this contact see initially?</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {visibilityLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex flex-col">
                                  <span>{level.label}</span>
                                  <span className="text-xs text-muted-foreground">{level.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Name Display Override */}
                <FormField
                  control={form.control}
                  name="nameDisplayOverride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name Display Override (Optional)</FormLabel>
                      <FormControl>
                        <Select value={field.value || ""} onValueChange={(value) => field.onChange(value || undefined)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Use profile default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Use profile default</SelectItem>
                            <SelectItem value="full">Full Name (John Smith)</SelectItem>
                            <SelectItem value="first_initial_last">First Initial + Last Name (J. Smith)</SelectItem>
                            <SelectItem value="first_last_initial">First Name + Last Initial (John S.)</SelectItem>
                            <SelectItem value="pseudonym">Custom Pseudonym</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("nameDisplayOverride") === "pseudonym" && (
                  <FormField
                    control={form.control}
                    name="customPseudonym"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Name for This Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="How should this contact see your name?" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Invitation Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiresIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires In (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="365" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Custom Message */}
              <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a personal message that will be shared with the invitation..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={createInviteMutation.isPending}
                className="w-full"
              >
                {createInviteMutation.isPending ? "Creating..." : "Create Invitation with QR Code"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Active Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Active Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading invitations...</div>
          ) : invitations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active invitations. Create one above to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {invitations?.map((invite: any) => (
                <div key={invite.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {invite.inviteeName && (
                          <span className="font-medium">{invite.inviteeName}</span>
                        )}
                        <Badge variant="outline">
                          {getVisibilityLevelInfo(invite.visibilityLevel).label}
                        </Badge>
                        {invite.nameDisplayOverride && (
                          <Badge variant="secondary">
                            Custom Name: {invite.nameDisplayOverride}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invite.inviteeEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {invite.inviteeEmail}
                          </span>
                        )}
                        {invite.inviteePhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {invite.inviteePhone}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={invite.isActive ? "default" : "destructive"}>
                        {invite.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {invite.currentUses}/{invite.maxUses} uses
                      </span>
                    </div>
                  </div>

                  {invite.customMessage && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-sm">{invite.customMessage}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInviteLink(invite.inviteCode)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareInvite(invite)}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInvite(selectedInvite === invite.inviteCode ? null : invite.inviteCode)}
                    >
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Code
                    </Button>

                    {invite.isActive && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateInviteMutation.mutate(invite.id)}
                        disabled={deactivateInviteMutation.isPending}
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        Deactivate
                      </Button>
                    )}
                  </div>

                  {/* QR Code Display */}
                  {selectedInvite === invite.inviteCode && (
                    <div className="bg-white p-4 rounded border-2 border-dashed text-center">
                      <img 
                        src={generateQRCode(invite.inviteCode)} 
                        alt="QR Code"
                        className="mx-auto mb-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code to join as a contact
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Privacy Level: {getVisibilityLevelInfo(invite.visibilityLevel).label}
                      </p>
                    </div>
                  )}

                  {invite.expiresAt && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}