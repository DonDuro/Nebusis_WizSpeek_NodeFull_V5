import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Eye, EyeOff, Save, Info, Upload, X, Plus, Briefcase, Image as ImageIcon, UserPlus, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ContactPrivacyManager } from "./contact-privacy-manager";


// Profile form schema
const profileSchema = z.object({
  // Privacy settings
  useGeneralDescriptors: z.boolean().default(false),
  
  // Personal information
  personalInterests: z.string().optional(),
  personalBio: z.string().optional(),
  personalWebsite: z.string().optional(),
  
  // Personal demographics
  age: z.number().min(13).max(120).optional(),
  ageDisclosure: z.string().optional(),
  ageCategory: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  
  // Profile Pictures
  personalPictures: z.array(z.string()).max(3).default([]),
  professionalPictures: z.array(z.string()).max(3).default([]),
  primaryPersonalPic: z.number().min(0).max(2).default(0),
  primaryProfessionalPic: z.number().min(0).max(2).default(0),
  
  // Academic Pictures
  academicPictures: z.array(z.string()).max(3).default([]),
  primaryAcademicPic: z.number().min(0).max(2).default(0),
  
  // Main profile picture selection
  mainProfilePic: z.object({
    category: z.enum(["personal", "professional", "academic"]),
    index: z.number().min(0).max(2),
  }).default({ category: "personal", index: 0 }),
  
  // Visibility toggles
  showDemographics: z.boolean().default(true),
  showEducation: z.boolean().default(true),
  showSkills: z.boolean().default(true),
  showLanguages: z.boolean().default(true),
  showCertifications: z.boolean().default(true),
  showAchievements: z.boolean().default(true),
  showLocation: z.boolean().default(true),
  showPersonalInterests: z.boolean().default(true),
  showPersonalBio: z.boolean().default(true),
  showPersonalWebsite: z.boolean().default(true),
  showRelationshipStatus: z.boolean().default(true),
  showPersonalPictures: z.boolean().default(true),
  showJobInfo: z.boolean().default(true),
  showProfessionalBio: z.boolean().default(true),
  showWorkExperience: z.boolean().default(true),
  showProfessionalWebsites: z.boolean().default(true),
  showWorkHistory: z.boolean().default(true),
  showProfessionalPictures: z.boolean().default(true),
  
  // Academic visibility toggles
  showAcademicInfo: z.boolean().default(true),
  showStudentId: z.boolean().default(false),
  showGradeLevel: z.boolean().default(true),
  showAcademicPictures: z.boolean().default(true),
  showResearchAreas: z.boolean().default(true),
  showTeachingSubjects: z.boolean().default(true),
  
  // Contact-specific privacy settings
  contactPrivacySettings: z.record(z.object({
    allowPersonalInfo: z.boolean().optional(),
    allowProfessionalInfo: z.boolean().optional(),
    allowAcademicInfo: z.boolean().optional(),
    hideFields: z.array(z.string()).optional(),
    showFields: z.array(z.string()).optional(),
    customNote: z.string().optional(),
    nameDisplayType: z.enum(["full", "first_initial_last", "first_last_initial", "pseudonym"]).optional(),
    customPseudonym: z.string().optional(),
  })).default({}),
  
  // Default name display settings
  defaultNameDisplay: z.enum(["full", "first_initial_last", "first_last_initial", "pseudonym"]).default("full"),
  defaultPseudonym: z.string().optional(),
  
  // Professional information
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  professionalBio: z.string().optional(),
  workExperience: z.string().optional(),
  professionalWebsite: z.string().optional(),
  linkedInProfile: z.string().optional(),
  
  // Work History
  workHistory: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string(),
    current: z.boolean(),
  })).max(3).default([]),
  
  // Academic information
  academicInstitution: z.string().optional(),
  academicLevel: z.string().optional(),
  studentId: z.string().optional(),
  majorFieldOfStudy: z.string().optional(),
  graduationYear: z.number().optional(),
  gradeLevel: z.string().optional(),
  academicInterests: z.string().optional(),
  academicAchievements: z.string().optional(),
  researchAreas: z.string().optional(),
  teachingSubjects: z.string().optional(),
  
  // Both personal and professional
  education: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
  certifications: z.string().optional(),
  achievements: z.string().optional(),
  generalLocation: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileManagementProps {
  currentUser: any;
}

export function ProfileManagement({ currentUser }: ProfileManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/user/profile`],
    queryFn: () => apiRequest(`/api/user/profile`),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      useGeneralDescriptors: false,
      personalInterests: "",
      personalBio: "",
      personalWebsite: "",
      age: undefined,
      ageDisclosure: "private",
      ageCategory: "",
      gender: "",
      maritalStatus: "",
      personalPictures: [],
      professionalPictures: [],
      academicPictures: [],
      primaryPersonalPic: 0,
      primaryProfessionalPic: 0,
      primaryAcademicPic: 0,
      mainProfilePic: { category: "personal", index: 0 },
      
      // Visibility toggles
      showDemographics: true,
      showEducation: true,
      showSkills: true,
      showLanguages: true,
      showCertifications: true,
      showAchievements: true,
      showLocation: true,
      showPersonalInterests: true,
      showPersonalBio: true,
      showPersonalWebsite: true,
      showRelationshipStatus: true,
      showPersonalPictures: true,
      showJobInfo: true,
      showProfessionalBio: true,
      showWorkExperience: true,
      showProfessionalWebsites: true,
      showWorkHistory: true,
      showProfessionalPictures: true,
      
      // Academic visibility toggles
      showAcademicInfo: true,
      showStudentId: false,
      showGradeLevel: true,
      showAcademicPictures: true,
      showResearchAreas: true,
      showTeachingSubjects: true,
      
      // Contact-specific privacy settings
      contactPrivacySettings: {},
      
      // Default name display settings
      defaultNameDisplay: "full",
      defaultPseudonym: "",
      jobTitle: "",
      company: "",
      professionalBio: "",
      workExperience: "",
      professionalWebsite: "",
      linkedInProfile: "",
      workHistory: [],
      
      // Academic defaults
      academicInstitution: "",
      academicLevel: "",
      studentId: "",
      majorFieldOfStudy: "",
      graduationYear: undefined,
      gradeLevel: "",
      academicInterests: "",
      academicAchievements: "",
      researchAreas: "",
      teachingSubjects: "",
      
      education: "",
      skills: "",
      languages: "",
      certifications: "",
      achievements: "",
      generalLocation: "",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => {
      if (profile) {
        return apiRequest(`/api/user/profile`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest(`/api/user/profile`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/profile`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const privacyMode = form.watch("useGeneralDescriptors");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Profile Management</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* 1. Name Display Settings - MOST IMPORTANT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Name Display Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Control how your name appears to contacts by default. You can customize this for individual contacts below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Name Display</Label>
              <Select 
                value={form.watch("defaultNameDisplay") || "full"}
                onValueChange={(value) => form.setValue("defaultNameDisplay", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose how contacts see your name..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Name (John Smith)</SelectItem>
                  <SelectItem value="first_initial_last">First Initial + Last Name (J. Smith)</SelectItem>
                  <SelectItem value="first_last_initial">First Name + Last Initial (John S.)</SelectItem>
                  <SelectItem value="pseudonym">Custom Pseudonym</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.watch("defaultNameDisplay") === "pseudonym" && (
              <div className="space-y-2">
                <Label>Default Pseudonym</Label>
                <Input
                  placeholder="Enter a custom name for contacts to see..."
                  {...form.register("defaultPseudonym")}
                />
                <p className="text-xs text-muted-foreground">
                  This pseudonym will be shown to all contacts unless you customize it for specific individuals.
                </p>
              </div>
            )}

            {/* Name Preview */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
              <p className="text-sm mt-1">
                {(() => {
                  const fullName = currentUser?.fullName || "John Smith";
                  const displayType = form.watch("defaultNameDisplay") || "full";
                  const pseudonym = form.watch("defaultPseudonym") || "Custom Name";

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

            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
              <Info className="h-3 w-3 inline mr-1" />
              You can override this setting for individual contacts using the Advanced Privacy Controls below.
            </div>
          </CardContent>
        </Card>

        {/* 2. Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Use General Descriptors</Label>
                <p className="text-sm text-muted-foreground">
                  Hide specific details like exact school names, company names, and locations.
                  Use general terms instead (e.g., "Major University" instead of "Harvard").
                </p>
              </div>
              <Switch
                checked={privacyMode}
                onCheckedChange={(checked) => form.setValue("useGeneralDescriptors", checked)}
              />
            </div>
            
            {privacyMode && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-300">Privacy Mode Active</p>
                    <p className="text-blue-600 dark:text-blue-400">
                      Your profile will show general descriptions instead of specific details.
                      Examples: "Tech Company" instead of company name, "West Coast" instead of city.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>



        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="personal">Personal Only</TabsTrigger>
            <TabsTrigger value="professional">Professional Only</TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="main-picture">Main Picture</TabsTrigger>
          </TabsList>

          {/* General Information Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>This information is visible to all your contacts, regardless of relationship type.</p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility:</p>
                    <div className="text-xs space-y-1">
                      <p>• <strong>All contacts</strong> can see this information</p>
                      <p>• Includes basic demographics, education, and core skills</p>
                      <p>• Information useful for both personal and professional contexts</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Age and Demographics Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">Demographics</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showDemographics")}
                        onCheckedChange={(checked) => form.setValue("showDemographics", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show to contacts</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age Disclosure</Label>
                      <Select 
                        value={form.watch("ageDisclosure") || "private"} 
                        onValueChange={(value) => form.setValue("ageDisclosure", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age disclosure preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Keep age private</SelectItem>
                          <SelectItem value="adult_minor">Show adult/minor status only</SelectItem>
                          <SelectItem value="specific">Show specific age</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.watch("ageDisclosure") === "specific" && (
                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input
                          type="number"
                          min="13"
                          max="120"
                          value={form.watch("age") || ""}
                          onChange={(e) => form.setValue("age", parseInt(e.target.value))}
                          placeholder="Enter your age"
                        />
                      </div>
                    )}

                    {form.watch("ageDisclosure") === "adult_minor" && (
                      <div className="space-y-2">
                        <Label>Age Category</Label>
                        <Select 
                          value={form.watch("ageCategory") || ""} 
                          onValueChange={(value) => form.setValue("ageCategory", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minor">Minor (under 18)</SelectItem>
                            <SelectItem value="adult">Adult (18+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gender Identity</Label>
                      <Select 
                        value={form.watch("gender") || ""} 
                        onValueChange={(value) => {
                          if (value === "custom") {
                            form.setValue("gender", "");
                          } else {
                            form.setValue("gender", value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select or enter gender identity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="genderfluid">Genderfluid</SelectItem>
                          <SelectItem value="agender">Agender</SelectItem>
                          <SelectItem value="bigender">Bigender</SelectItem>
                          <SelectItem value="demigender">Demigender</SelectItem>
                          <SelectItem value="genderqueer">Genderqueer</SelectItem>
                          <SelectItem value="two-spirit">Two-Spirit</SelectItem>
                          <SelectItem value="questioning">Questioning</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          <SelectItem value="custom">Other (specify below)</SelectItem>
                        </SelectContent>
                      </Select>
                      {(!form.watch("gender") || !["female", "male", "non-binary", "genderfluid", "agender", "bigender", "demigender", "genderqueer", "two-spirit", "questioning", "prefer_not_to_say"].includes(form.watch("gender"))) && (
                        <Input
                          placeholder="Specify your gender identity"
                          value={form.watch("gender") || ""}
                          onChange={(e) => form.setValue("gender", e.target.value)}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>General Location</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={form.watch("showLocation")}
                            onCheckedChange={(checked) => form.setValue("showLocation", checked)}
                          />
                          <Label className="text-xs text-muted-foreground">Show</Label>
                        </div>
                      </div>
                      <Input
                        placeholder={privacyMode ? "West Coast, USA" : "San Francisco, CA"}
                        {...form.register("generalLocation")}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Education and Skills Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Education & Skills</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Education</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch("showEducation")}
                          onCheckedChange={(checked) => form.setValue("showEducation", checked)}
                        />
                        <Label className="text-xs text-muted-foreground">Show</Label>
                      </div>
                    </div>
                    <Input
                      placeholder={privacyMode ? "Major University, Computer Science" : "Stanford University, MS Computer Science"}
                      {...form.register("education")}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Core Skills</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch("showSkills")}
                          onCheckedChange={(checked) => form.setValue("showSkills", checked)}
                        />
                        <Label className="text-xs text-muted-foreground">Show</Label>
                      </div>
                    </div>
                    <Textarea
                      placeholder="JavaScript, React, Python, Communication, Problem Solving..."
                      {...form.register("skills")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <Input
                      placeholder="English (Native), Spanish (Fluent), French (Conversational)"
                      {...form.register("languages")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Certifications</Label>
                    <Textarea
                      placeholder="Professional certifications, courses, etc."
                      {...form.register("certifications")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notable Achievements</Label>
                    <Textarea
                      placeholder="Awards, recognitions, major accomplishments..."
                      {...form.register("achievements")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Only Information</CardTitle>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>This information is only visible to contacts marked as "personal" or "both".</p>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Who Can See This:</p>
                    <div className="text-xs space-y-1">
                      <p>• <strong>Personal contacts:</strong> Can see this + general info</p>
                      <p>• <strong>Professional contacts:</strong> Cannot see this</p>
                      <p>• <strong>Both types of contacts (Personal + Professional):</strong> Can see everything</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personalInterests">Interests & Hobbies</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showPersonalInterests")}
                        onCheckedChange={(checked) => form.setValue("showPersonalInterests", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show</Label>
                    </div>
                  </div>
                  <Textarea
                    id="personalInterests"
                    placeholder={privacyMode ? "Creative pursuits, outdoor activities, etc." : "Photography, hiking, cooking, reading sci-fi..."}
                    {...form.register("personalInterests")}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personalBio">Personal Bio</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showPersonalBio")}
                        onCheckedChange={(checked) => form.setValue("showPersonalBio", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show</Label>
                    </div>
                  </div>
                  <Textarea
                    id="personalBio"
                    placeholder={privacyMode ? "Brief personal description..." : "Tell others about yourself personally..."}
                    {...form.register("personalBio")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalWebsite">Personal Website</Label>
                  <Input
                    id="personalWebsite"
                    placeholder="https://your-personal-site.com"
                    {...form.register("personalWebsite")}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Personal Demographics (Optional)</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Age Information</Label>
                      <Select 
                        value={form.watch("ageDisclosure") || "private"}
                        onValueChange={(value) => {
                          form.setValue("ageDisclosure", value);
                          if (value !== "specific") {
                            form.setValue("age", undefined);
                          }
                          if (value !== "adult_minor") {
                            form.setValue("ageCategory", "");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose age disclosure preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Keep age private</SelectItem>
                          <SelectItem value="adult_minor">Show adult/minor status only</SelectItem>
                          <SelectItem value="specific">Show specific age</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.watch("ageDisclosure") === "specific" && (
                      <div className="space-y-2">
                        <Label htmlFor="age">Specific Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min="13"
                          max="120"
                          placeholder="25"
                          {...form.register("age", { valueAsNumber: true })}
                        />
                      </div>
                    )}

                    {form.watch("ageDisclosure") === "adult_minor" && (
                      <div className="space-y-2">
                        <Label>Age Category</Label>
                        <Select 
                          value={form.watch("ageCategory") || ""}
                          onValueChange={(value) => form.setValue("ageCategory", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minor">Minor (under 18)</SelectItem>
                            <SelectItem value="adult">Adult (18+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="space-y-2">
                      <Label>Gender Identity</Label>
                      <Select 
                        value={form.watch("gender") === "custom" ? "custom" : form.watch("gender") || ""}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            form.setValue("gender", "custom");
                          } else {
                            form.setValue("gender", value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select or specify gender identity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="genderfluid">Genderfluid</SelectItem>
                          <SelectItem value="agender">Agender</SelectItem>
                          <SelectItem value="bigender">Bigender</SelectItem>
                          <SelectItem value="demigender">Demigender</SelectItem>
                          <SelectItem value="genderqueer">Genderqueer</SelectItem>
                          <SelectItem value="two-spirit">Two-Spirit</SelectItem>
                          <SelectItem value="questioning">Questioning</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          <SelectItem value="custom">Other (specify below)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {(form.watch("gender") === "custom" || (form.watch("gender") && !["female", "male", "non-binary", "genderfluid", "agender", "bigender", "demigender", "genderqueer", "two-spirit", "questioning", "prefer_not_to_say"].includes(form.watch("gender")))) && (
                        <div className="space-y-2">
                          <Label htmlFor="customGender">Specify your gender identity</Label>
                          <Input
                            id="customGender"
                            placeholder="Enter your gender identity"
                            value={form.watch("gender") === "custom" ? "" : form.watch("gender") || ""}
                            onChange={(e) => form.setValue("gender", e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Relationship Status</Label>
                      <Select 
                        value={form.watch("maritalStatus") || ""}
                        onValueChange={(value) => form.setValue("maritalStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="in_relationship">In a relationship</SelectItem>
                          <SelectItem value="engaged">Engaged</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="civil_union">Civil union</SelectItem>
                          <SelectItem value="domestic_partnership">Domestic partnership</SelectItem>
                          <SelectItem value="separated">Separated</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                          <SelectItem value="its_complicated">It's complicated</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      <Info className="h-3 w-3 inline mr-1" />
                      These fields are completely optional and only visible to contacts marked as "personal" or "both".
                    </div>
                    <div className="ml-4">
                      • <strong>Private:</strong> Age information is completely hidden
                    </div>
                    <div className="ml-4">
                      • <strong>Adult/Minor:</strong> Only shows whether you're under 18 or an adult
                    </div>
                    <div className="ml-4">
                      • <strong>Specific:</strong> Shows your exact age
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">Personal Pictures (Up to 3)</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showPersonalPictures")}
                        onCheckedChange={(checked) => form.setValue("showPersonalPictures", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show</Label>
                    </div>
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="space-y-2">
                          <div className="relative">
                            <div 
                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-gray-400"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    const pics = [...(form.watch("personalPictures") || [])];
                                    pics[index] = url;
                                    form.setValue("personalPictures", pics);
                                  }
                                };
                                input.click();
                              }}
                            >
                              {form.watch("personalPictures")?.[index] ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={form.watch("personalPictures")[index]} 
                                    alt={`Personal ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const pics = [...(form.watch("personalPictures") || [])];
                                      pics.splice(index, 1);
                                      form.setValue("personalPictures", pics);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  {form.watch("primaryPersonalPic") === index && (
                                    <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-500">Personal Photo {index + 1}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {form.watch("personalPictures")?.[index] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => form.setValue("primaryPersonalPic", index)}
                              className={`w-full text-xs ${form.watch("primaryPersonalPic") === index ? "bg-primary text-primary-foreground" : ""}`}
                            >
                              {form.watch("primaryPersonalPic") === index ? "Primary" : "Set Primary"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Info className="h-3 w-3 inline mr-1" />
                      Personal pictures are only visible to contacts marked as "personal" or "both". Choose one as your primary personal picture.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Professional Only Information</CardTitle>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>This information is only visible to contacts marked as "professional" or "both".</p>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <p className="font-medium text-green-700 dark:text-green-300 mb-1">Who Can See This:</p>
                    <div className="text-xs space-y-1">
                      <p>• <strong>Professional contacts:</strong> Can see this + general info</p>
                      <p>• <strong>Personal contacts:</strong> Cannot see this</p>
                      <p>• <strong>Both types of contacts (Personal + Professional):</strong> Can see everything</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder={privacyMode ? "Software Developer" : "Senior Software Engineer"}
                      {...form.register("jobTitle")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder={privacyMode ? "Large Tech Company" : "Google, Microsoft, etc."}
                      {...form.register("company")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalBio">Professional Bio</Label>
                  <Textarea
                    id="professionalBio"
                    placeholder="Brief professional summary..."
                    {...form.register("professionalBio")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workExperience">Work Experience</Label>
                  <Textarea
                    id="workExperience"
                    placeholder={privacyMode ? "Years of experience in various roles..." : "5 years at Company A, 3 years at Company B..."}
                    {...form.register("workExperience")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="professionalWebsite">Professional Website</Label>
                    <Input
                      id="professionalWebsite"
                      placeholder="https://your-portfolio.com"
                      {...form.register("professionalWebsite")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedInProfile">LinkedIn Profile</Label>
                    <Input
                      id="linkedInProfile"
                      placeholder="https://linkedin.com/in/username"
                      {...form.register("linkedInProfile")}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">Professional Pictures (Up to 3)</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showProfessionalPictures")}
                        onCheckedChange={(checked) => form.setValue("showProfessionalPictures", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative">
                          <div 
                            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-gray-400"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  const pics = [...(form.watch("professionalPictures") || [])];
                                  pics[index] = url;
                                  form.setValue("professionalPictures", pics);
                                }
                              };
                              input.click();
                            }}
                          >
                            {form.watch("professionalPictures")?.[index] ? (
                              <div className="relative w-full h-full">
                                <img 
                                  src={form.watch("professionalPictures")[index]} 
                                  alt={`Professional ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const pics = [...(form.watch("professionalPictures") || [])];
                                    pics.splice(index, 1);
                                    form.setValue("professionalPictures", pics);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                {form.watch("primaryProfessionalPic") === index && (
                                  <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                                )}
                              </div>
                            ) : (
                              <div className="text-center">
                                <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Professional Photo {index + 1}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {form.watch("professionalPictures")?.[index] && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue("primaryProfessionalPic", index)}
                            className={`w-full text-xs ${form.watch("primaryProfessionalPic") === index ? "bg-primary text-primary-foreground" : ""}`}
                          >
                            {form.watch("primaryProfessionalPic") === index ? "Primary" : "Set Primary"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1" />
                    Professional pictures are visible to contacts marked as "professional" or "both". Choose one as your primary professional picture.
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-muted-foreground">Work Experience History (Up to 3)</h4>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch("showWorkHistory")}
                          onCheckedChange={(checked) => form.setValue("showWorkHistory", checked)}
                        />
                        <Label className="text-xs text-muted-foreground">Show</Label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const history = form.watch("workHistory") || [];
                        if (history.length < 3) {
                          form.setValue("workHistory", [...history, {
                            company: "",
                            position: "",
                            startDate: "",
                            endDate: "",
                            description: "",
                            current: false
                          }]);
                        }
                      }}
                      disabled={(form.watch("workHistory") || []).length >= 3}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience
                    </Button>
                  </div>

                  {(form.watch("workHistory") || []).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">Experience {index + 1}</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const history = [...(form.watch("workHistory") || [])];
                            history.splice(index, 1);
                            form.setValue("workHistory", history);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input
                            placeholder="Company name"
                            value={form.watch("workHistory")?.[index]?.company || ""}
                            onChange={(e) => {
                              const history = [...(form.watch("workHistory") || [])];
                              history[index] = { ...history[index], company: e.target.value };
                              form.setValue("workHistory", history);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Input
                            placeholder="Job title"
                            value={form.watch("workHistory")?.[index]?.position || ""}
                            onChange={(e) => {
                              const history = [...(form.watch("workHistory") || [])];
                              history[index] = { ...history[index], position: e.target.value };
                              form.setValue("workHistory", history);
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={form.watch("workHistory")?.[index]?.startDate || ""}
                            onChange={(e) => {
                              const history = [...(form.watch("workHistory") || [])];
                              history[index] = { ...history[index], startDate: e.target.value };
                              form.setValue("workHistory", history);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            disabled={form.watch("workHistory")?.[index]?.current}
                            value={form.watch("workHistory")?.[index]?.endDate || ""}
                            onChange={(e) => {
                              const history = [...(form.watch("workHistory") || [])];
                              history[index] = { ...history[index], endDate: e.target.value };
                              form.setValue("workHistory", history);
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={form.watch("workHistory")?.[index]?.current || false}
                            onCheckedChange={(checked) => {
                              const history = [...(form.watch("workHistory") || [])];
                              history[index] = { ...history[index], current: checked };
                              if (checked) {
                                history[index].endDate = "";
                              }
                              form.setValue("workHistory", history);
                            }}
                          />
                          <Label className="text-sm">Current Role</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your responsibilities and achievements..."
                          value={form.watch("workHistory")?.[index]?.description || ""}
                          onChange={(e) => {
                            const history = [...(form.watch("workHistory") || [])];
                            history[index] = { ...history[index], description: e.target.value };
                            form.setValue("workHistory", history);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {(form.watch("workHistory") || []).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No work experience added yet</p>
                      <p className="text-sm">Click "Add Experience" to get started</p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <Info className="h-3 w-3 inline mr-1" />
                  Professional information is visible to contacts marked as "professional" or "both".
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Information Tab */}
          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>This information is only visible to contacts marked as academic relationships.</p>
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">Visibility:</p>
                    <div className="text-xs space-y-1">
                      <p>• <strong>Academic contacts</strong> (students, teachers, faculty, administrators)</p>
                      <p>• Includes educational institution, academic level, research areas</p>
                      <p>• Student ID remains private by default for security</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Academic Pictures Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">Academic Pictures</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showAcademicPictures")}
                        onCheckedChange={(checked) => form.setValue("showAcademicPictures", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show to academic contacts</Label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Academic Pictures (up to 3)</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map((index) => {
                        const pictures = form.watch("academicPictures") || [];
                        const picture = pictures[index];
                        const isPrimary = form.watch("primaryAcademicPic") === index;

                        return (
                          <div key={index} className="space-y-2">
                            <div 
                              className={`relative w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer ${
                                picture ? 'border-green-300 bg-green-50 dark:bg-green-950' : 'border-gray-300 bg-gray-50 dark:bg-gray-900 hover:border-gray-400'
                              }`}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    const pics = [...(form.watch("academicPictures") || [])];
                                    pics[index] = url;
                                    form.setValue("academicPictures", pics);
                                  }
                                };
                                input.click();
                              }}
                            >
                              {picture ? (
                                <>
                                  <img src={picture} alt={`Academic ${index + 1}`} className="w-full h-full object-cover rounded" />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updatedPictures = [...(form.watch("academicPictures") || [])];
                                      updatedPictures[index] = "";
                                      // Clean up empty slots
                                      const cleanedPictures = updatedPictures.filter(pic => pic !== "");
                                      form.setValue("academicPictures", cleanedPictures);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  {isPrimary && (
                                    <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">Primary</Badge>
                                  )}
                                </>
                              ) : (
                                <div className="text-center">
                                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                                  <p className="text-xs text-gray-500">Upload Academic Picture {index + 1}</p>
                                </div>
                              )}
                            </div>

                            {picture && (
                              <Button
                                size="sm"
                                variant={isPrimary ? "default" : "outline"}
                                className="w-full text-xs"
                                onClick={() => form.setValue("primaryAcademicPic", index)}
                              >
                                {isPrimary ? "Primary" : "Set as Primary"}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Academic Information Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">Academic Details</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("showAcademicInfo")}
                        onCheckedChange={(checked) => form.setValue("showAcademicInfo", checked)}
                      />
                      <Label className="text-xs text-muted-foreground">Show to academic contacts</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institution/School</Label>
                      <Input
                        {...form.register("academicInstitution")}
                        placeholder="Harvard University, Lincoln High School, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Academic Level</Label>
                      <Select 
                        value={form.watch("academicLevel") || ""} 
                        onValueChange={(value) => form.setValue("academicLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elementary">Elementary School</SelectItem>
                          <SelectItem value="middle_school">Middle School</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="postdoc">Postdoctoral</SelectItem>
                          <SelectItem value="faculty">Faculty/Professor</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grade Level/Year</Label>
                      <Input
                        {...form.register("gradeLevel")}
                        placeholder="12th Grade, Junior, 3rd Year, etc."
                      />
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Switch
                          checked={form.watch("showGradeLevel")}
                          onCheckedChange={(checked) => form.setValue("showGradeLevel", checked)}
                        />
                        <Label>Show grade level to academic contacts</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Graduation Year</Label>
                      <Input
                        type="number"
                        min="1950"
                        max="2050"
                        value={form.watch("graduationYear") || ""}
                        onChange={(e) => form.setValue("graduationYear", parseInt(e.target.value))}
                        placeholder="2025"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Major/Field of Study</Label>
                      <Input
                        {...form.register("majorFieldOfStudy")}
                        placeholder="Computer Science, English Literature, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <Input
                        {...form.register("studentId")}
                        placeholder="Student ID number"
                      />
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Switch
                          checked={form.watch("showStudentId")}
                          onCheckedChange={(checked) => form.setValue("showStudentId", checked)}
                        />
                        <Label>Show student ID (not recommended for privacy)</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Interests</Label>
                    <Textarea
                      {...form.register("academicInterests")}
                      placeholder="Research interests, favorite subjects, academic goals..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Achievements</Label>
                    <Textarea
                      {...form.register("academicAchievements")}
                      placeholder="Awards, honors, publications, recognitions..."
                      rows={3}
                    />
                  </div>

                  {/* Faculty/Graduate specific fields */}
                  {(form.watch("academicLevel") === "faculty" || form.watch("academicLevel") === "graduate" || form.watch("academicLevel") === "postdoc") && (
                    <>
                      <div className="space-y-2">
                        <Label>Research Areas</Label>
                        <Textarea
                          {...form.register("researchAreas")}
                          placeholder="Research fields, current projects, areas of expertise..."
                          rows={3}
                        />
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Switch
                            checked={form.watch("showResearchAreas")}
                            onCheckedChange={(checked) => form.setValue("showResearchAreas", checked)}
                          />
                          <Label>Show research areas to academic contacts</Label>
                        </div>
                      </div>
                    </>
                  )}

                  {(form.watch("academicLevel") === "faculty" || form.watch("academicLevel") === "staff") && (
                    <>
                      <div className="space-y-2">
                        <Label>Teaching Subjects</Label>
                        <Textarea
                          {...form.register("teachingSubjects")}
                          placeholder="Courses taught, subjects, teaching areas..."
                          rows={3}
                        />
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Switch
                            checked={form.watch("showTeachingSubjects")}
                            onCheckedChange={(checked) => form.setValue("showTeachingSubjects", checked)}
                          />
                          <Label>Show teaching subjects to academic contacts</Label>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950 p-3 rounded">
                  <Info className="h-3 w-3 inline mr-1" />
                  Academic information is visible to contacts marked as "academic" relationships. Student ID is private by default for security.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Main Profile Picture Selector Tab */}
          <TabsContent value="main-picture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Choose Your Main Profile Picture
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const personalPics = form.watch("personalPictures") || [];
                    const professionalPics = form.watch("professionalPictures") || [];
                    const academicPics = form.watch("academicPictures") || [];
                    const allPictures = personalPics.length + professionalPics.length + academicPics.length;
                    
                    if (allPictures === 0) {
                      return "Upload pictures in the Personal, Professional, or Academic tabs to select your main profile picture.";
                    }
                    return `Select your main profile picture from your ${allPictures} uploaded photo${allPictures === 1 ? '' : 's'}. Your main picture is visible to all contacts.`;
                  })()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const personalPics = form.watch("personalPictures") || [];
                  const professionalPics = form.watch("professionalPictures") || [];
                  const academicPics = form.watch("academicPictures") || [];
                  const allPictures = [
                    ...personalPics.map((pic, index) => ({ pic, category: "personal", index })),
                    ...professionalPics.map((pic, index) => ({ pic, category: "professional", index })),
                    ...academicPics.map((pic, index) => ({ pic, category: "academic", index }))
                  ];

                  if (allPictures.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No pictures uploaded yet</p>
                        <p className="text-sm">Upload pictures in the Personal, Professional, or Academic tabs to select a main profile picture.</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {allPictures.map(({ pic, category, index }) => {
                          const isMainProfile = form.watch("mainProfilePic")?.category === category && form.watch("mainProfilePic")?.index === index;
                          return (
                            <div key={`${category}-${index}`} className="space-y-2">
                              <div 
                                className={`relative w-full h-24 border-2 rounded-lg cursor-pointer transition-all ${
                                  isMainProfile ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={() => {
                                  form.setValue("mainProfilePic", { category, index });
                                }}
                              >
                                <img 
                                  src={pic} 
                                  alt={`${category} ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                {isMainProfile && (
                                  <Badge className="absolute top-1 left-1 text-xs bg-blue-600">Main</Badge>
                                )}
                              </div>
                              <p className="text-xs text-center text-muted-foreground capitalize">
                                {category} {index + 1}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <Info className="h-4 w-4 inline mr-2 text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          Your main profile picture is visible to all contacts and appears throughout the app.
                        </span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}