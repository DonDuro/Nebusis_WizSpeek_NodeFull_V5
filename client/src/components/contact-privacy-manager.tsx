import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Eye, 
  EyeOff, 
  User, 
  Briefcase, 
  Shield, 
  Save,
  UserCheck,
  UserX
} from "lucide-react";

interface ContactPrivacyManagerProps {
  currentUser: any;
}

const contactPrivacySchema = z.object({
  contactId: z.string(),
  allowPersonalInfo: z.boolean().optional(),
  allowProfessionalInfo: z.boolean().optional(),
  hideFields: z.array(z.string()).optional(),
  showFields: z.array(z.string()).optional(),
  customNote: z.string().optional(),
  nameDisplayType: z.enum(["full", "first_initial_last", "first_last_initial", "pseudonym"]).optional(),
  customPseudonym: z.string().optional(),
});

const AVAILABLE_FIELDS = [
  { id: "personalInterests", label: "Personal Interests", category: "personal" },
  { id: "personalBio", label: "Personal Bio", category: "personal" },
  { id: "personalWebsite", label: "Personal Website", category: "personal" },
  { id: "maritalStatus", label: "Relationship Status", category: "personal" },
  { id: "personalPictures", label: "Personal Pictures", category: "personal" },
  { id: "age", label: "Age Information", category: "personal" },
  { id: "gender", label: "Gender", category: "personal" },
  { id: "jobTitle", label: "Job Title", category: "professional" },
  { id: "company", label: "Company", category: "professional" },
  { id: "professionalBio", label: "Professional Bio", category: "professional" },
  { id: "workExperience", label: "Work Experience", category: "professional" },
  { id: "professionalWebsite", label: "Professional Website", category: "professional" },
  { id: "linkedInProfile", label: "LinkedIn Profile", category: "professional" },
  { id: "professionalPictures", label: "Professional Pictures", category: "professional" },
  { id: "workHistory", label: "Work History", category: "professional" },
  { id: "education", label: "Education", category: "general" },
  { id: "skills", label: "Skills", category: "general" },
  { id: "languages", label: "Languages", category: "general" },
  { id: "generalLocation", label: "Location", category: "general" },
  { id: "certifications", label: "Certifications", category: "general" },
  { id: "achievements", label: "Achievements", category: "general" },
];

export function ContactPrivacyManager({ currentUser }: ContactPrivacyManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch user's contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Fetch user relationships to get contact list
  const { data: relationships = [] } = useQuery({
    queryKey: ["/api/user/relationships"],
  });

  // Fetch current profile to get privacy settings
  const { data: profile } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const form = useForm({
    resolver: zodResolver(contactPrivacySchema),
    defaultValues: {
      contactId: "",
      allowPersonalInfo: undefined,
      allowProfessionalInfo: undefined,
      hideFields: [],
      showFields: [],
      customNote: "",
      nameDisplayType: undefined,
      customPseudonym: "",
    },
  });

  // Update contact privacy settings
  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/user/profile", {
        method: "PATCH",
        body: {
          contactPrivacySettings: {
            ...profile?.contactPrivacySettings,
            [data.contactId]: {
              allowPersonalInfo: data.allowPersonalInfo,
              allowProfessionalInfo: data.allowProfessionalInfo,
              hideFields: data.hideFields,
              showFields: data.showFields,
              customNote: data.customNote,
              nameDisplayType: data.nameDisplayType,
              customPseudonym: data.customPseudonym,
            }
          }
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Privacy Settings Updated",
        description: "Contact-specific privacy settings have been saved.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings.",
        variant: "destructive",
      });
    },
  });

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    const contact = contacts.find((c: any) => c.id.toString() === contactId);
    const existingSettings = profile?.contactPrivacySettings?.[contactId] || {};
    
    form.reset({
      contactId,
      allowPersonalInfo: existingSettings.allowPersonalInfo,
      allowProfessionalInfo: existingSettings.allowProfessionalInfo,
      hideFields: existingSettings.hideFields || [],
      showFields: existingSettings.showFields || [],
      customNote: existingSettings.customNote || "",
      nameDisplayType: existingSettings.nameDisplayType,
      customPseudonym: existingSettings.customPseudonym || "",
    });
  };

  const onSubmit = (data: any) => {
    updatePrivacyMutation.mutate(data);
  };

  const selectedContactData = contacts.find((c: any) => c.id.toString() === selectedContact);
  const currentSettings = profile?.contactPrivacySettings?.[selectedContact] || {};

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Manage Contact-Specific Privacy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contact-Specific Privacy Controls
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedContact} onValueChange={handleContactSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contact to customize privacy settings..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{contact.username}</span>
                        <Badge variant="secondary" className="text-xs">
                          {contact.relationshipType || "both"}
                        </Badge>
                        {currentSettings && Object.keys(currentSettings).length > 0 && (
                          <Shield className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedContact && selectedContactData && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact: {selectedContactData.username}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Default relationship type: 
                      <Badge variant="outline" className="ml-2">
                        {selectedContactData.relationshipType || "both"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Overrides */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Category Access Overrides</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Personal Information</span>
                          </div>
                          <FormField
                            control={form.control}
                            name="allowPersonalInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={field.value === true}
                                      onCheckedChange={(checked) => 
                                        field.onChange(checked ? true : undefined)
                                      }
                                    />
                                    {field.value === true && <UserCheck className="h-4 w-4 text-green-500" />}
                                    {field.value === false && <UserX className="h-4 w-4 text-red-500" />}
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Professional Information</span>
                          </div>
                          <FormField
                            control={form.control}
                            name="allowProfessionalInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={field.value === true}
                                      onCheckedChange={(checked) => 
                                        field.onChange(checked ? true : undefined)
                                      }
                                    />
                                    {field.value === true && <UserCheck className="h-4 w-4 text-green-500" />}
                                    {field.value === false && <UserX className="h-4 w-4 text-red-500" />}
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Field-Level Controls */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Granular Field Controls</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {["general", "personal", "professional"].map((category) => {
                          const categoryFields = AVAILABLE_FIELDS.filter(f => f.category === category);
                          return (
                            <div key={category} className="space-y-2">
                              <h5 className="text-sm font-medium text-muted-foreground capitalize">
                                {category} Fields
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {categoryFields.map((field) => {
                                  const isHidden = form.watch("hideFields")?.includes(field.id);
                                  const isForced = form.watch("showFields")?.includes(field.id);
                                  
                                  return (
                                    <div key={field.id} className="flex items-center justify-between p-2 border rounded text-sm">
                                      <span>{field.label}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          type="button"
                                          variant={isHidden ? "destructive" : "ghost"}
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const current = form.watch("hideFields") || [];
                                            const updated = isHidden 
                                              ? current.filter(f => f !== field.id)
                                              : [...current, field.id];
                                            form.setValue("hideFields", updated);
                                            // Remove from show fields if hiding
                                            if (!isHidden) {
                                              const showFields = form.watch("showFields") || [];
                                              form.setValue("showFields", showFields.filter(f => f !== field.id));
                                            }
                                          }}
                                        >
                                          <EyeOff className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant={isForced ? "default" : "ghost"}
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const current = form.watch("showFields") || [];
                                            const updated = isForced 
                                              ? current.filter(f => f !== field.id)
                                              : [...current, field.id];
                                            form.setValue("showFields", updated);
                                            // Remove from hide fields if forcing show
                                            if (!isForced) {
                                              const hideFields = form.watch("hideFields") || [];
                                              form.setValue("hideFields", hideFields.filter(f => f !== field.id));
                                            }
                                          }}
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Name Display Customization */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Name Display Override</h4>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="nameDisplayType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How should this contact see your name?</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value || ""}
                                  onValueChange={(value) => field.onChange(value || undefined)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Use default setting" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Use default setting</SelectItem>
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

                        {form.watch("nameDisplayType") === "pseudonym" && (
                          <FormField
                            control={form.control}
                            name="customPseudonym"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Name for This Contact</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter how this contact should see your name..."
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Name Preview */}
                        {form.watch("nameDisplayType") && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <Label className="text-xs font-medium text-muted-foreground">
                              This contact will see your name as:
                            </Label>
                            <p className="text-sm mt-1 font-medium">
                              {(() => {
                                const fullName = currentUser?.fullName || "John Smith";
                                const displayType = form.watch("nameDisplayType");
                                const pseudonym = form.watch("customPseudonym") || "Custom Name";

                                switch (displayType) {
                                  case "full":
                                    return fullName;
                                  case "first_initial_last": {
                                    const parts = fullName.split(" ");
                                    if (parts.length < 2) return fullName;
                                    return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
                                  }
                                  case "first_last_initial": {
                                    const parts = fullName.split(" ");
                                    if (parts.length < 2) return fullName;
                                    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
                                  }
                                  case "pseudonym":
                                    return pseudonym;
                                  default:
                                    return fullName;
                                }
                              })()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Custom Note */}
                    <FormField
                      control={form.control}
                      name="customNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a note about this contact's privacy settings..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePrivacyMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePrivacyMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}