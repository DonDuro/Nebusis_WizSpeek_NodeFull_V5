import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Settings, Eye, UserCheck, Building, Heart, User, Shield, QrCode, UserCircle, FileText, Clock, Check, X, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QRContactGenerator } from "./qr-contact-generator";

// Contact relationship schema
const contactRelationshipSchema = z.object({
  contactId: z.number(),
  relationshipType: z.enum(["personal", "professional", "both"]),
  profileVisibility: z.enum(["basic", "full", "custom"]).default("basic"),
});

type ContactRelationshipData = z.infer<typeof contactRelationshipSchema>;

interface ContactManagerProps {
  currentUser: any;
}

interface Contact {
  id: number;
  userId: number;
  contactId: number;
  relationshipType: string;
  profileVisibility: string;
  addedAt: string;
  contact: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export function ContactManager({ currentUser }: ContactManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInviteContact, setShowInviteContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Contact | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  console.log("ContactManager currentUser:", currentUser);

  // Fetch user contacts
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      console.log("Fetching contacts for user:", currentUser);
      const response = await apiRequest("GET", "/api/contacts");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Raw contacts API response:", data);
      console.log("Contacts array length:", data?.length || 0);
      return data;
    },
    enabled: !!currentUser?.id, // Only fetch if we have a current user
  });

  console.log("ContactManager render - currentUser:", currentUser);
  console.log("ContactManager render - contacts:", contacts);
  console.log("ContactManager render - isLoading:", isLoading);
  console.log("ContactManager render - error:", error);

  // Fetch all users for adding contacts
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  // Fetch contact profile data when viewing
  const { data: contactProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/contacts", viewingProfile?.contact.id, "profile"],
    queryFn: async () => {
      if (!viewingProfile) return null;
      const response = await apiRequest("GET", `/api/users/${viewingProfile.contact.id}/profile`);
      return response.json();
    },
    enabled: !!viewingProfile,
  });

  // Fetch sent invitations
  const { data: sentInvitations = [] } = useQuery({
    queryKey: ["/api/contact-invitations", "sent"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact-invitations");
      return response.json();
    },
  });

  // Fetch received invitations
  const { data: receivedInvitations = [] } = useQuery({
    queryKey: ["/api/contact-invitations", "received"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact-invitations/received");
      return response.json();
    },
  });

  const inviteContactForm = useForm<ContactRelationshipData>({
    resolver: zodResolver(contactRelationshipSchema),
    defaultValues: {
      relationshipType: "personal",
      profileVisibility: "basic",
    },
  });

  // Invite contact mutation
  const inviteContactMutation = useMutation({
    mutationFn: (data: ContactRelationshipData) =>
      apiRequest("/api/contacts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowInviteContact(false);
      inviteContactForm.reset();
      toast({
        title: "Invitation Sent",
        description: "Contact invitation has been sent and they will need to accept.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to invite contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: ({ contactId, updates }: { contactId: number; updates: Partial<ContactRelationshipData> }) =>
      apiRequest(`/api/contacts/${contactId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setSelectedContact(null);
      toast({
        title: "Contact updated",
        description: "Contact relationship has been updated.",
      });
    },
  });

  // Remove contact mutation
  const removeContactMutation = useMutation({
    mutationFn: (contactId: number) =>
      apiRequest(`/api/contacts/${contactId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact removed",
        description: "Contact relationship has been removed.",
      });
    },
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: (inviteCode: string) =>
      apiRequest(`/api/contact-invitations/${inviteCode}/accept`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contact-invitations"] });
      toast({
        title: "Invitation accepted",
        description: "You are now connected with this contact.",
      });
    },
  });

  // Decline invitation mutation
  const declineInvitationMutation = useMutation({
    mutationFn: (inviteCode: string) =>
      apiRequest(`/api/contact-invitations/${inviteCode}/decline`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-invitations"] });
      toast({
        title: "Invitation declined",
        description: "The invitation has been declined.",
      });
    },
  });

  const getInvitationStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "accepted":
        return <Check className="h-4 w-4 text-green-600" />;
      case "declined":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Send className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case "personal":
        return <Heart className="h-4 w-4" />;
      case "professional":
        return <Building className="h-4 w-4" />;
      case "both":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "personal":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100";
      case "professional":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "both":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const availableUsers = allUsers.filter(
    (user: any) => 
      user.id !== currentUser.id && 
      !contacts.some((contact: Contact) => contact.contact.id === user.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Contact Management</h1>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showInviteContact} onOpenChange={setShowInviteContact}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Invite New Contact
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Contact</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Send an invitation to connect. The user will need to accept your invitation before they become a contact.
              </p>
            </DialogHeader>
            <form onSubmit={inviteContactForm.handleSubmit((data) => inviteContactMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select onValueChange={(value) => inviteContactForm.setValue("contactId", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to invite as contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {user.firstName && user.lastName ? 
                            `${user.firstName} ${user.lastName} (@${user.username})` : 
                            user.username
                          }
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <Select 
                  defaultValue="personal"
                  onValueChange={(value) => inviteContactForm.setValue("relationshipType", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Personal - See personal information
                      </div>
                    </SelectItem>
                    <SelectItem value="professional">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Professional - See work information
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Both - See all information
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select 
                  defaultValue="basic"
                  onValueChange={(value) => inviteContactForm.setValue("profileVisibility", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Limited information</SelectItem>
                    <SelectItem value="full">Full - All available information</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={inviteContactMutation.isPending}
                  className="flex-1"
                >
                  {inviteContactMutation.isPending ? "Sending Invitation..." : "Send Invitation"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowInviteContact(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={() => setShowQRGenerator(true)}
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Codes
        </Button>
      </div>
      </div>

      <div className="grid gap-4">
        {!currentUser ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Please log in</h3>
              <p className="text-muted-foreground text-center">
                You need to be logged in to view your contacts.
              </p>
            </CardContent>
          </Card>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contacts Yet</h3>
              <p className="text-muted-foreground text-center">
                Invite contacts to control how you share your profile information with different people.
              </p>
              <div className="mt-4 text-xs text-gray-500">
                Logged in as: {currentUser?.username || 'Unknown'} | Contacts found: {contacts.length}
              </div>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact: any) => {
            console.log("Rendering contact:", contact);
            // Handle both old and new API response structures
            const contactUser = contact.contact || contact.users || contact;
            const contactData = {
              id: contact.id,
              relationshipType: contact.relationshipType || contact.relationship_type,
              profileVisibility: contact.profileVisibility || contact.profile_visibility,
              contact: {
                id: contactUser.id || contact.contactId || contact.contact_id,
                username: contactUser.username,
                firstName: contactUser.firstName || contactUser.first_name,
                lastName: contactUser.lastName || contactUser.last_name,
                avatar: contactUser.avatar
              }
            };
            
            return (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {contactData.contact.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {contactData.contact.firstName && contactData.contact.lastName ? 
                          `${contactData.contact.firstName} ${contactData.contact.lastName}` : 
                          contactData.contact.username
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">@{contactData.contact.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getRelationshipColor(contactData.relationshipType)}>
                      {getRelationshipIcon(contactData.relationshipType)}
                      <span className="ml-1 capitalize">{contactData.relationshipType}</span>
                    </Badge>
                    
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      {contactData.profileVisibility}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingProfile(contactData)}
                      title="View Profile"
                    >
                      <UserCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContact(contactData)}
                      title="Edit Relationship"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeContactMutation.mutate(contactData.contact.id)}
                      title="Remove Contact"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Relationship</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Avatar>
                  <AvatarFallback>
                    {selectedContact.contact.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedContact.contact.firstName && selectedContact.contact.lastName ? 
                      `${selectedContact.contact.firstName} ${selectedContact.contact.lastName}` : 
                      selectedContact.contact.username
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">@{selectedContact.contact.username}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <Select 
                  defaultValue={selectedContact.relationshipType}
                  onValueChange={(value) => 
                    updateContactMutation.mutate({
                      contactId: selectedContact.contact.id,
                      updates: { relationshipType: value as any }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select 
                  defaultValue={selectedContact.profileVisibility}
                  onValueChange={(value) => 
                    updateContactMutation.mutate({
                      contactId: selectedContact.contact.id,
                      updates: { profileVisibility: value as any }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Profile Viewer Dialog */}
      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Contact Profile
            </DialogTitle>
          </DialogHeader>
          {viewingProfile && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {viewingProfile.contact.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {viewingProfile.contact.firstName && viewingProfile.contact.lastName ? 
                      `${viewingProfile.contact.firstName} ${viewingProfile.contact.lastName}` : 
                      viewingProfile.contact.username
                    }
                  </h2>
                  <p className="text-muted-foreground">@{viewingProfile.contact.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRelationshipColor(viewingProfile.relationshipType)}>
                      {getRelationshipIcon(viewingProfile.relationshipType)}
                      <span className="ml-1 capitalize">{viewingProfile.relationshipType}</span>
                    </Badge>
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      {viewingProfile.profileVisibility}
                    </Badge>
                  </div>
                </div>
              </div>

              {profileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading profile...</div>
                </div>
              ) : contactProfile ? (
                <div className="space-y-4">
                  {/* Personal Information */}
                  {(viewingProfile.relationshipType === "personal" || viewingProfile.relationshipType === "both") && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Heart className="h-4 w-4" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {contactProfile.age && (
                          <div>
                            <Label className="text-sm font-medium">Age</Label>
                            <p className="text-sm">
                              {contactProfile.ageDisclosure === "specific" ? contactProfile.age : 
                               contactProfile.ageDisclosure === "adult_minor" ? (contactProfile.age >= 18 ? "Adult" : "Minor") : 
                               "Not disclosed"}
                            </p>
                          </div>
                        )}
                        {contactProfile.gender && (
                          <div>
                            <Label className="text-sm font-medium">Gender</Label>
                            <p className="text-sm">{contactProfile.gender}</p>
                          </div>
                        )}
                        {contactProfile.maritalStatus && (
                          <div>
                            <Label className="text-sm font-medium">Relationship Status</Label>
                            <p className="text-sm">{contactProfile.maritalStatus}</p>
                          </div>
                        )}
                        {contactProfile.personalInterests && (
                          <div>
                            <Label className="text-sm font-medium">Interests</Label>
                            <p className="text-sm">{contactProfile.personalInterests}</p>
                          </div>
                        )}
                        {contactProfile.personalBio && (
                          <div>
                            <Label className="text-sm font-medium">Personal Bio</Label>
                            <p className="text-sm">{contactProfile.personalBio}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Professional Information */}
                  {(viewingProfile.relationshipType === "professional" || viewingProfile.relationshipType === "both") && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Building className="h-4 w-4" />
                          Professional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {contactProfile.jobTitle && (
                          <div>
                            <Label className="text-sm font-medium">Job Title</Label>
                            <p className="text-sm">{contactProfile.jobTitle}</p>
                          </div>
                        )}
                        {contactProfile.company && (
                          <div>
                            <Label className="text-sm font-medium">Company</Label>
                            <p className="text-sm">
                              {contactProfile.useGeneralDescriptors ? 
                                "Technology Company" : 
                                contactProfile.company
                              }
                            </p>
                          </div>
                        )}
                        {contactProfile.professionalBio && (
                          <div>
                            <Label className="text-sm font-medium">Professional Bio</Label>
                            <p className="text-sm">{contactProfile.professionalBio}</p>
                          </div>
                        )}
                        {contactProfile.workHistory && contactProfile.workHistory.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Work Experience</Label>
                            <div className="space-y-2">
                              {contactProfile.workHistory.map((work: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="font-medium">{work.role} at {work.company}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {work.startDate} - {work.isCurrent ? "Present" : work.endDate}
                                  </div>
                                  {work.description && (
                                    <p className="text-sm mt-1">{work.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Academic Information */}
                  {contactProfile.showAcademicInfo && contactProfile.academicInstitution && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-4 w-4" />
                          Academic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Institution</Label>
                          <p className="text-sm">{contactProfile.academicInstitution}</p>
                        </div>
                        {contactProfile.showGradeLevel && contactProfile.gradeLevel && (
                          <div>
                            <Label className="text-sm font-medium">Academic Level</Label>
                            <p className="text-sm">{contactProfile.gradeLevel}</p>
                          </div>
                        )}
                        {contactProfile.majorFieldOfStudy && (
                          <div>
                            <Label className="text-sm font-medium">Field of Study</Label>
                            <p className="text-sm">{contactProfile.majorFieldOfStudy}</p>
                          </div>
                        )}
                        {contactProfile.graduationYear && (
                          <div>
                            <Label className="text-sm font-medium">Graduation Year</Label>
                            <p className="text-sm">{contactProfile.graduationYear}</p>
                          </div>
                        )}
                        {contactProfile.showResearchAreas && contactProfile.researchAreas && (
                          <div>
                            <Label className="text-sm font-medium">Research Areas</Label>
                            <p className="text-sm">{contactProfile.researchAreas}</p>
                          </div>
                        )}
                        {contactProfile.showTeachingSubjects && contactProfile.teachingSubjects && (
                          <div>
                            <Label className="text-sm font-medium">Teaching Subjects</Label>
                            <p className="text-sm">{contactProfile.teachingSubjects}</p>
                          </div>
                        )}
                        {contactProfile.academicInterests && (
                          <div>
                            <Label className="text-sm font-medium">Academic Interests</Label>
                            <p className="text-sm">{contactProfile.academicInterests}</p>
                          </div>
                        )}
                        {contactProfile.academicAchievements && (
                          <div>
                            <Label className="text-sm font-medium">Academic Achievements</Label>
                            <p className="text-sm">{contactProfile.academicAchievements}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Shared Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-4 w-4" />
                        General Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {contactProfile.education && (
                        <div>
                          <Label className="text-sm font-medium">Education</Label>
                          <p className="text-sm">{contactProfile.education}</p>
                        </div>
                      )}
                      {contactProfile.skills && (
                        <div>
                          <Label className="text-sm font-medium">Skills</Label>
                          <p className="text-sm">{contactProfile.skills}</p>
                        </div>
                      )}
                      {contactProfile.languages && (
                        <div>
                          <Label className="text-sm font-medium">Languages</Label>
                          <p className="text-sm">{contactProfile.languages}</p>
                        </div>
                      )}
                      {contactProfile.generalLocation && (
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <p className="text-sm">{contactProfile.generalLocation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Privacy Notice */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <Shield className="h-4 w-4 inline mr-1" />
                      You are viewing this profile based on your <strong>{viewingProfile.relationshipType}</strong> relationship 
                      with <strong>{viewingProfile.profileVisibility}</strong> visibility level. 
                      Some information may be hidden based on their privacy preferences.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No profile information available or you don't have permission to view this profile.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Generator Modal */}
      <Dialog open={showQRGenerator} onOpenChange={setShowQRGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <QRContactGenerator 
            currentUser={currentUser} 
            onClose={() => setShowQRGenerator(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invitation Status Tracking */}
      {(sentInvitations.length > 0 || receivedInvitations.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Invitation Status
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your sent and received contact invitations.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sent Invitations */}
            {sentInvitations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Sent Invitations ({sentInvitations.length})
                </h3>
                <div className="space-y-2">
                  {sentInvitations.map((invitation: any) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {invitation.inviteeName ? invitation.inviteeName[0].toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {invitation.inviteeName || invitation.inviteeEmail || "Anonymous Invite"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Visibility: {invitation.visibilityLevel.replace("-", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getInvitationStatusColor(invitation.status || "pending")}>
                          {getInvitationStatusIcon(invitation.status || "pending")}
                          <span className="ml-1 capitalize">{invitation.status || "pending"}</span>
                        </Badge>
                        {invitation.expiresAt && (
                          <span className="text-xs text-muted-foreground">
                            Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Received Invitations */}
            {receivedInvitations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Received Invitations ({receivedInvitations.length})
                </h3>
                <div className="space-y-2">
                  {receivedInvitations.map((invitation: any) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {invitation.inviter?.username?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {invitation.inviter?.firstName && invitation.inviter?.lastName
                              ? `${invitation.inviter.firstName} ${invitation.inviter.lastName}`
                              : invitation.inviter?.username || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Wants to connect with {invitation.visibilityLevel.replace("-", " ")} access
                          </p>
                          {invitation.customMessage && (
                            <p className="text-sm text-blue-600 mt-1">"{invitation.customMessage}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {invitation.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => acceptInvitationMutation.mutate(invitation.inviteCode)}
                              disabled={acceptInvitationMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => declineInvitationMutation.mutate(invitation.inviteCode)}
                              disabled={declineInvitationMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <Badge className={getInvitationStatusColor(invitation.status)}>
                            {getInvitationStatusIcon(invitation.status)}
                            <span className="ml-1 capitalize">{invitation.status}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}