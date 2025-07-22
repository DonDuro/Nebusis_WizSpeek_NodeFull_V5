import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QRContactGenerator } from "./qr-contact-generator";
import { ContactDiscovery } from "./contact-discovery";
import { Users, Plus, Settings, Eye, UserCheck, Building, Heart, User, Shield, QrCode, GraduationCap, Search } from "lucide-react";

// Contact relationship schema
const contactRelationshipSchema = z.object({
  contactId: z.number(),
  relationshipType: z.string(),
  profileVisibility: z.string(),
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
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [viewProfileContact, setViewProfileContact] = useState<Contact | null>(null);

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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  // Form for adding contacts
  const form = useForm<ContactRelationshipData>({
    resolver: zodResolver(contactRelationshipSchema),
    defaultValues: {
      relationshipType: "none",
      profileVisibility: "none",
    },
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (data: ContactRelationshipData) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Added",
        description: "Contact has been successfully added.",
      });
      setShowInviteContact(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add contact.",
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: number; updates: Partial<ContactRelationshipData> }) => {
      const response = await apiRequest("PUT", `/api/contacts/${contactId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Updated",
        description: "Contact relationship has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact.",
        variant: "destructive",
      });
    },
  });

  // Remove contact mutation
  const removeContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest("DELETE", `/api/contacts/${contactId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Removed",
        description: "Contact has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove contact.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactRelationshipData) => {
    console.log("Form submission data:", data);
    addContactMutation.mutate(data);
  };

  // Helper functions for UI
  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'personal': return <Heart className="h-3 w-3" />;
      case 'professional': return <Building className="h-3 w-3" />;
      case 'both': return <UserCheck className="h-3 w-3" />;
      case 'academic': return <GraduationCap className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'both': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'academic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter available users (exclude current user and existing contacts)
  const availableUsers = allUsers.filter((user: any) => 
    user.id !== currentUser?.id && 
    !contacts.some((contact: Contact) => contact.contact.id === user.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading contacts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Contact Management</h1>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showDiscovery} onOpenChange={setShowDiscovery}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Discover Users
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <ContactDiscovery currentUser={currentUser} />
            </DialogContent>
          </Dialog>
          
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
                Add someone to your contact list with specific relationship and privacy settings.
              </p>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user to add" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUsers.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName} (@${user.username})`
                                : user.username
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Categories to Share</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">None</h4>
                              <div className="space-y-1">
                                <label className="flex items-center space-x-2 text-sm">
                                  <input type="checkbox" className="rounded" />
                                  <span>Name and contact only</span>
                                </label>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">General</h4>
                              <div className="space-y-1">
                                <label className="flex items-center space-x-2 text-sm">
                                  <input type="checkbox" className="rounded" />
                                  <span>Include General Information</span>
                                </label>
                                <div className="ml-6 space-y-1">
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="general" value="non-specific" />
                                    <span>Non-specific</span>
                                  </label>
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="general" value="specific" />
                                    <span>Specific</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Personal</h4>
                              <div className="space-y-1">
                                <label className="flex items-center space-x-2 text-sm">
                                  <input type="checkbox" className="rounded" />
                                  <span>Include Personal Information</span>
                                </label>
                                <div className="ml-6 space-y-1">
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="personal" value="non-specific" />
                                    <span>Non-specific</span>
                                  </label>
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="personal" value="specific" />
                                    <span>Specific</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Professional</h4>
                              <div className="space-y-1">
                                <label className="flex items-center space-x-2 text-sm">
                                  <input type="checkbox" className="rounded" />
                                  <span>Include Professional Information</span>
                                </label>
                                <div className="ml-6 space-y-1">
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="professional" value="non-specific" />
                                    <span>Non-specific</span>
                                  </label>
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="professional" value="specific" />
                                    <span>Specific</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Academic</h4>
                              <div className="space-y-1">
                                <label className="flex items-center space-x-2 text-sm">
                                  <input type="checkbox" className="rounded" />
                                  <span>Include Academic Information</span>
                                </label>
                                <div className="ml-6 space-y-1">
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="academic" value="non-specific" />
                                    <span>Non-specific</span>
                                  </label>
                                  <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <input type="radio" name="academic" value="specific" />
                                    <span>Specific</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={addContactMutation.isPending}
                    className="flex-1"
                  >
                    {addContactMutation.isPending ? "Adding..." : "Add Contact"}
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
            </Form>
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

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your network by adding contacts or generating QR codes for others to connect with you.
              </p>
              <Button onClick={() => setShowInviteContact(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact: Contact) => {
            console.log("Rendering contact:", contact);
            return (
              <Card key={contact.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {contact.contact.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {contact.contact.firstName && contact.contact.lastName 
                          ? `${contact.contact.firstName} ${contact.contact.lastName}`
                          : contact.contact.username
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">@{contact.contact.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getRelationshipColor(contact.relationshipType)}>
                      {getRelationshipIcon(contact.relationshipType)}
                      <span className="ml-1 capitalize">{contact.relationshipType}</span>
                    </Badge>
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      {contact.profileVisibility}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewProfileContact(contact)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeContactMutation.mutate(contact.contact.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Contact Settings Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Settings</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Categories to Share</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">None</h4>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span>Name and contact only</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">General</h4>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span>Include General Information</span>
                        </label>
                        <div className="ml-6 space-y-1">
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="general-settings" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="general-settings" value="specific" />
                            <span>Specific</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Personal</h4>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span>Include Personal Information</span>
                        </label>
                        <div className="ml-6 space-y-1">
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="personal-settings" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="personal-settings" value="specific" />
                            <span>Specific</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Professional</h4>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span>Include Professional Information</span>
                        </label>
                        <div className="ml-6 space-y-1">
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="professional-settings" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="professional-settings" value="specific" />
                            <span>Specific</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Academic</h4>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span>Include Academic Information</span>
                        </label>
                        <div className="ml-6 space-y-1">
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="academic-settings" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="academic-settings" value="specific" />
                            <span>Specific</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile View Dialog */}
      <Dialog open={!!viewProfileContact} onOpenChange={() => setViewProfileContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Profile</DialogTitle>
          </DialogHeader>
          {viewProfileContact && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {viewProfileContact.contact.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {viewProfileContact.contact.firstName && viewProfileContact.contact.lastName 
                      ? `${viewProfileContact.contact.firstName} ${viewProfileContact.contact.lastName}`
                      : viewProfileContact.contact.username
                    }
                  </h3>
                  <p className="text-muted-foreground">@{viewProfileContact.contact.username}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRelationshipColor(viewProfileContact.relationshipType)}>
                      {getRelationshipIcon(viewProfileContact.relationshipType)}
                      <span className="ml-1 capitalize">{viewProfileContact.relationshipType}</span>
                    </Badge>
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {viewProfileContact.profileVisibility}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {viewProfileContact.contact.email || "Not provided"}</p>
                  <p><strong>Department:</strong> {viewProfileContact.contact.department || "Not specified"}</p>
                  <p><strong>Member since:</strong> {new Date(viewProfileContact.addedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Visibility Settings</h4>
                <p className="text-sm text-muted-foreground">
                  This contact can see your <strong>{viewProfileContact.profileVisibility}</strong> profile information
                  based on your <strong>{viewProfileContact.relationshipType}</strong> relationship setting.
                </p>
              </div>
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
    </div>
  );
}