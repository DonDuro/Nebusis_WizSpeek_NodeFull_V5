import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, CheckCircle, AlertCircle, Shield, Clock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import wizSpeakIcon from "@/assets/wizspeak-icon.svg";

// Registration schema
const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export function InvitePage() {
  const { code } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  // Fetch invitation details
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["/api/contact-invitations", code],
    queryFn: async () => {
      const response = await fetch(`/api/contact-invitations/${code}`);
      if (!response.ok) {
        throw new Error("Invitation not found or expired");
      }
      return response.json();
    },
    enabled: !!code,
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("POST", "/api/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: async (userData) => {
      // Accept the invitation after successful registration
      try {
        await apiRequest("POST", `/api/contact-invitations/${code}/accept`);
        toast({
          title: "Welcome to WizSpeek®!",
          description: "Your account has been created and the invitation accepted.",
        });
        navigate("/chat");
      } catch (error) {
        toast({
          title: "Registration Successful",
          description: "Account created, but couldn't automatically accept invitation. Please try logging in.",
        });
        navigate("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRegistration = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid, expired, or has already been used.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to WizSpeek®
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(invitation.expiresAt);
  const isUsed = invitation.status === 'accepted';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={wizSpeakIcon} alt="WizSpeek®" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              You're Invited to WizSpeek®!
            </h1>
            <p className="text-lg text-muted-foreground">
              Join secure, intelligent messaging
            </p>
          </div>

          {/* Invitation Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invitation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">From: {invitation.inviterName}</p>
                  <p className="text-sm text-muted-foreground">
                    Invited to connect as: {invitation.inviteeName}
                  </p>
                </div>
                <Badge className={
                  isExpired ? "bg-red-100 text-red-700" :
                  isUsed ? "bg-green-100 text-green-700" :
                  "bg-blue-100 text-blue-700"
                }>
                  {isExpired ? "Expired" : isUsed ? "Used" : "Active"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {isExpired ? "Expired" : "Expires"} on {new Date(invitation.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Privacy Level: {invitation.visibilityLevel}</span>
              </div>

              {invitation.customMessage && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded">
                  <p className="text-sm italic">"{invitation.customMessage}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Messages */}
          {isExpired && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                This invitation has expired. Please ask for a new invitation link.
              </AlertDescription>
            </Alert>
          )}

          {isUsed && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                This invitation has already been used. If you already have an account, please log in.
              </AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          {!isExpired && !isUsed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Create Your Account
                </CardTitle>
                <CardDescription>
                  Join WizSpeek® and start secure messaging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleRegistration)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...form.register("firstName")}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        {...form.register("lastName")}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      {...form.register("username")}
                    />
                    {form.formState.errors.username && (
                      <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue={invitation.inviteeEmail || ""}
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      {...form.register("password")}
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Accept Invitation & Join WizSpeek®"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Login Option */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#2E5A87]"
                onClick={() => navigate("/")}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}