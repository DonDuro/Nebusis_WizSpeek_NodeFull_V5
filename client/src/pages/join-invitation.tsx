import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { QrCode, UserPlus, Clock, Mail, Phone, MessageSquare, Check, X, Shield, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const visibilityLevelDescriptions: Record<string, string> = {
  "general-non-specific": "Basic info with general descriptors (e.g., 'Tech Company' instead of specific name)",
  "general-specific": "Basic info with specific details (company names, locations, etc.)",
  "personal-non-specific": "Personal info with general descriptors only",
  "personal-specific": "Personal info with specific details",
  "professional-non-specific": "Professional info with general descriptors only",
  "professional-specific": "Professional info with specific details",
};

export function JoinInvitationPage() {
  const [match, params] = useRoute("/join/:code");
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["/api/contact-invitations", params?.code],
    queryFn: () => apiRequest(`/api/contact-invitations/${params?.code}`),
    enabled: !!params?.code,
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: () => apiRequest(`/api/contact-invitations/${params?.code}/accept`, {
      method: "POST",
    }),
    onSuccess: () => {
      toast({
        title: "Invitation Accepted!",
        description: "You are now connected with this contact.",
      });
      // Redirect to chat or contacts page
      window.location.href = "/chat";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    },
  });

  const handleAcceptInvitation = () => {
    setIsAccepting(true);
    acceptInvitationMutation.mutate();
  };

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
              <p className="text-muted-foreground mb-4">
                This invitation link is not valid or has been removed.
              </p>
              <Button onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invitation Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This invitation may have expired, been deactivated, or reached its maximum uses.
              </p>
              <Button onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = invitation.expiresAt && new Date() > new Date(invitation.expiresAt);
  const isMaxUsesReached = invitation.currentUses >= invitation.maxUses;
  const canAccept = invitation.isActive && !isExpired && !isMaxUsesReached;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
            <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Contact Invitation</CardTitle>
          <p className="text-muted-foreground">
            You've been invited to connect on WizSpeek®
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="space-y-4">
            {invitation.inviteeName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">From: {invitation.inviteeName}</span>
              </div>
            )}

            {invitation.inviteeEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{invitation.inviteeEmail}</span>
              </div>
            )}

            {invitation.inviteePhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{invitation.inviteePhone}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Privacy Level */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium">Privacy Level</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {invitation.visibilityLevel.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {visibilityLevelDescriptions[invitation.visibilityLevel]}
            </p>
          </div>

          {/* Custom Message */}
          {invitation.customMessage && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Personal Message</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm">{invitation.customMessage}</p>
                </div>
              </div>
            </>
          )}

          {/* Name Display Override */}
          {invitation.nameDisplayOverride && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="font-medium text-sm">Custom Name Display</span>
                <p className="text-sm text-muted-foreground">
                  {invitation.nameDisplayOverride === "pseudonym" && invitation.customPseudonym
                    ? `You'll see them as: "${invitation.customPseudonym}"`
                    : `Name format: ${invitation.nameDisplayOverride.replace(/_/g, ' ')}`}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Invitation Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uses:</span>
              <span>{invitation.currentUses}/{invitation.maxUses}</span>
            </div>
            
            {invitation.expiresAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires:</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={canAccept ? "default" : "destructive"}>
                {!invitation.isActive ? "Deactivated" :
                 isExpired ? "Expired" :
                 isMaxUsesReached ? "Max Uses Reached" : "Active"}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {canAccept ? (
              <>
                <Button 
                  onClick={handleAcceptInvitation}
                  disabled={isAccepting || acceptInvitationMutation.isPending}
                  className="flex-1"
                >
                  {isAccepting || acceptInvitationMutation.isPending ? (
                    "Accepting..."
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/login"}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => window.location.href = "/login"}
                className="w-full"
                variant="outline"
              >
                Go to Login
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 This invitation is secured with privacy controls. Only the specified information will be shared according to the privacy level set by the inviter.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}