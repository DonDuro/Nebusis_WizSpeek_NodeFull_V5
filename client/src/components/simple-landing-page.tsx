import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Shield, Bot, Lock, X, Mail, Phone, MapPin, Building, FileText, DollarSign, Leaf, CheckCircle, Users, Zap, Globe, Star, ArrowRight, Download } from "lucide-react";
import { SalesContactForm } from "@/components/sales-contact-form";

import { RegisterForm } from "./register-form";
import wizSpeakIcon from "@/assets/wizspeak-icon.svg";
import nebusisLogo from "@assets/logo-nebusis.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { authApi, setAuthToken } from "@/lib/auth";
import { Link } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type ServicesData = z.infer<typeof servicesSchema>;

const supportSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Please provide more details (minimum 10 characters)"),
});

const servicesSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  organization: z.string().min(1, "Organization name is required"),
  locations: z.string().min(1, "Organization location(s) required"),
  employeeCount: z.string().min(1, "Please select employee count"),
  industry: z.string().min(1, "Please select an industry"),
  interestedServices: z.array(z.string()).min(1, "Please select at least one service"),
  specificNeeds: z.string().min(1, "Please describe your specific needs"),
  currentChallenges: z.string().optional(),
  timeline: z.string().min(1, "Please select a timeline"),
  budget: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type SupportData = z.infer<typeof supportSchema>;

interface LandingPageProps {
  onLogin: (user: any) => void;
}

// Services Information Form Component
function ServicesInfoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const servicesForm = useForm<ServicesData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      organization: "",
      locations: "",
      employeeCount: "",
      industry: "",
      interestedServices: [],
      specificNeeds: "",
      currentChallenges: "",
      timeline: "",
      budget: "",
      additionalInfo: "",
    },
  });

  const onServicesSubmit = async (data: ServicesData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/services-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        toast({
          title: "Information Request Sent",
          description: "Thank you for your interest! We'll send you detailed information about our services.",
        });
        servicesForm.reset();
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send information request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={servicesForm.handleSubmit(onServicesSubmit)} className="space-y-4">
      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="services-firstName">First Name</Label>
          <Input 
            id="services-firstName"
            {...servicesForm.register("firstName")} 
            className="mt-1"
          />
          {servicesForm.formState.errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="services-lastName">Last Name</Label>
          <Input 
            id="services-lastName"
            {...servicesForm.register("lastName")} 
            className="mt-1"
          />
          {servicesForm.formState.errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="services-email">Email</Label>
          <Input 
            id="services-email"
            type="email"
            {...servicesForm.register("email")} 
            className="mt-1"
          />
          {servicesForm.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="services-jobTitle">Job Title</Label>
          <Input 
            id="services-jobTitle"
            {...servicesForm.register("jobTitle")} 
            className="mt-1"
            placeholder="e.g., CEO, IT Director, Operations Manager"
          />
          {servicesForm.formState.errors.jobTitle && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.jobTitle.message}</p>
          )}
        </div>
      </div>

      {/* Organization Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="services-organization">Organization Name</Label>
          <Input 
            id="services-organization"
            {...servicesForm.register("organization")} 
            className="mt-1"
          />
          {servicesForm.formState.errors.organization && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.organization.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="services-locations">Location(s)</Label>
          <Input 
            id="services-locations"
            {...servicesForm.register("locations")} 
            className="mt-1"
            placeholder="e.g., New York, NY; London, UK"
          />
          {servicesForm.formState.errors.locations && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.locations.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="services-employeeCount">Number of Employees</Label>
          <select 
            id="services-employeeCount"
            {...servicesForm.register("employeeCount")} 
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Employee Count</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1,000 employees</option>
            <option value="1001-5000">1,001-5,000 employees</option>
            <option value="5000+">5,000+ employees</option>
          </select>
          {servicesForm.formState.errors.employeeCount && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.employeeCount.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="services-industry">Industry</Label>
          <select 
            id="services-industry"
            {...servicesForm.register("industry")} 
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Industry</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Financial Services</option>
            <option value="government">Government</option>
            <option value="education">Education</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="technology">Technology</option>
            <option value="legal">Legal Services</option>
            <option value="consulting">Consulting</option>
            <option value="nonprofit">Non-Profit</option>
            <option value="other">Other</option>
          </select>
          {servicesForm.formState.errors.industry && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.industry.message}</p>
          )}
        </div>
      </div>

      {/* Services & Needs */}
      <div>
        <Label>Interested Services/Solutions (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: "compliance-core", label: "ComplianceCore (ISO, HIPAA)" },
            { value: "engage", label: "Engage (Digital Marketing)" },
            { value: "wizspeak", label: "WizSpeek (Secure Communications)" },
            { value: "legalflow", label: "LegalFlow (Legal Workflow)" },
            { value: "smartbooks", label: "SmartBooks (Financial Control)" },
            { value: "environmental", label: "Environmental & ESG Solutions" },
            { value: "cyberwatch", label: "CyberWatch (Cybersecurity)" },
            { value: "selfcertify", label: "SelfCertify (Self-Assessment)" },
          ].map((service) => (
            <label key={service.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={service.value}
                {...servicesForm.register("interestedServices")}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{service.label}</span>
            </label>
          ))}
        </div>
        {servicesForm.formState.errors.interestedServices && (
          <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.interestedServices.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="services-specificNeeds">Specific Needs & Requirements</Label>
        <textarea 
          id="services-specificNeeds"
          {...servicesForm.register("specificNeeds")} 
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your specific business needs, compliance requirements, or objectives..."
        />
        {servicesForm.formState.errors.specificNeeds && (
          <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.specificNeeds.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="services-currentChallenges">Current Challenges (Optional)</Label>
        <textarea 
          id="services-currentChallenges"
          {...servicesForm.register("currentChallenges")} 
          rows={2}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What challenges is your organization currently facing?"
        />
      </div>

      {/* Timeline & Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="services-timeline">Implementation Timeline</Label>
          <select 
            id="services-timeline"
            {...servicesForm.register("timeline")} 
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Timeline</option>
            <option value="immediate">Immediate (Within 1 month)</option>
            <option value="short-term">Short-term (1-3 months)</option>
            <option value="medium-term">Medium-term (3-6 months)</option>
            <option value="long-term">Long-term (6+ months)</option>
            <option value="planning">Planning Phase</option>
          </select>
          {servicesForm.formState.errors.timeline && (
            <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.timeline.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="services-budget">Budget Range (Optional)</Label>
          <select 
            id="services-budget"
            {...servicesForm.register("budget")} 
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Budget Range</option>
            <option value="under-10k">Under $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k-250k">$100,000 - $250,000</option>
            <option value="250k+">$250,000+</option>
            <option value="discuss">Prefer to discuss</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="services-additionalInfo">Additional Information (Optional)</Label>
        <textarea 
          id="services-additionalInfo"
          {...servicesForm.register("additionalInfo")} 
          rows={2}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any other relevant information or special requirements..."
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]"
      >
        {isSubmitting ? (
          <>
            <Bot className="w-4 h-4 mr-2 animate-spin" />
            Sending Request...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Request Information
          </>
        )}
      </Button>
    </form>
  );
}

function SupportForm() {
  const { toast } = useToast();
  
  const supportForm = useForm<SupportData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      category: "",
      description: "",
    },
  });

  const submitSupport = useMutation({
    mutationFn: async (data: SupportData) => {
      const response = await fetch("/api/support-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit support request");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Request Submitted",
        description: "Our support team will contact you within 24 hours to help resolve your issue.",
      });
      supportForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or use the contact form.",
        variant: "destructive",
      });
    },
  });

  const handleSupportSubmit = (data: SupportData) => {
    submitSupport.mutate(data);
  };



  return (
    <form onSubmit={supportForm.handleSubmit(handleSupportSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="support-firstName">First Name *</Label>
          <Input
            id="support-firstName"
            {...supportForm.register("firstName")}
            className="mt-1"
          />
          {supportForm.formState.errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{supportForm.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="support-lastName">Last Name *</Label>
          <Input
            id="support-lastName"
            {...supportForm.register("lastName")}
            className="mt-1"
          />
          {supportForm.formState.errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{supportForm.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="support-email">Email Address *</Label>
        <Input
          id="support-email"
          type="email"
          {...supportForm.register("email")}
          className="mt-1"
        />
        {supportForm.formState.errors.email && (
          <p className="text-sm text-red-600 mt-1">{supportForm.formState.errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="support-subject">Subject *</Label>
        <Input
          id="support-subject"
          {...supportForm.register("subject")}
          placeholder="Brief description of your issue"
          className="mt-1"
        />
        {supportForm.formState.errors.subject && (
          <p className="text-sm text-red-600 mt-1">{supportForm.formState.errors.subject.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="support-category">Category *</Label>
        <select
          {...supportForm.register("category")}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E5A87] focus:border-transparent"
        >
          <option value="">Select category</option>
          <option value="privacy">Privacy & Data Protection</option>
          <option value="legal">Legal & Terms</option>
          <option value="account">Account Issues</option>
          <option value="technical">Technical Support</option>
          <option value="billing">Billing & Subscriptions</option>
          <option value="other">Other</option>
        </select>
        {supportForm.formState.errors.category && (
          <p className="text-sm text-red-600 mt-1">{supportForm.formState.errors.category.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="support-description">Description *</Label>
        <textarea
          id="support-description"
          {...supportForm.register("description")}
          placeholder="Please provide detailed information about your inquiry or issue..."
          rows={4}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E5A87] focus:border-transparent"
        />
        {supportForm.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">{supportForm.formState.errors.description.message}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]"
        disabled={submitSupport.isPending}
      >
        {submitSupport.isPending ? "Submitting..." : "Submit Support Request"}
      </Button>
    </form>
  );
}

export function SimpleLandingPage({ onLogin }: LandingPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      setAuthToken(response.token);
      onLogin(response.user);
      toast({
        title: "Welcome to WizSpeek®",
        description: `Signed in successfully as ${response.user.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };



  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const oauthSuccess = urlParams.get('oauth_success');
    const error = urlParams.get('error');

    if (token && oauthSuccess) {
      setAuthToken(token);
      toast({
        title: "Welcome to WizSpeek®",
        description: "Successfully signed in with OAuth provider",
      });
      // Clean URL and redirect to app
      window.history.replaceState({}, document.title, "/");
      window.location.reload();
    } else if (error) {
      let errorMessage = "OAuth authentication failed";
      if (error === 'oauth_cancelled') {
        errorMessage = "OAuth authentication was cancelled";
      }
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={wizSpeakIcon} alt="WizSpeek®" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-[#2E5A87]">WizSpeek®</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-[#2E5A87]">Features</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">WizSpeek® Features</DialogTitle>
                    <DialogDescription>Discover what makes WizSpeek® the most secure messaging platform</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-semibold">End-to-End Encryption</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">Military-grade AES-256 encryption ensures your conversations remain private and secure.</p>
                      </div>
                      
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold">AI Smart Replies</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">Intelligent conversation assistance with automated responses and message summarization.</p>
                      </div>
                      
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Privacy Controls</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">Granular privacy settings with contact-specific visibility controls and pseudonym options.</p>
                      </div>
                      
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Video & Voice Calls</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">High-quality WebRTC-powered audio and video calls with secure peer-to-peer connections.</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-[#2E5A87]">Security</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Enterprise Security</DialogTitle>
                    <DialogDescription>Industry-leading security standards for your peace of mind</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold text-green-800 dark:text-green-200">AES-256 Encryption</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">All messages and files encrypted with military-grade encryption standards.</p>
                      </div>
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Zero-Knowledge Architecture</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">We can't read your messages even if we wanted to. Your privacy is guaranteed.</p>
                      </div>
                      <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">ISO 27001 Compliance</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Certified information security management system with comprehensive audit trails.</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-[#2E5A87]">Pricing</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Simple, Transparent Pricing</DialogTitle>
                    <DialogDescription>Choose the plan that works best for you</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">Personal</CardTitle>
                          <CardDescription>For individuals and small teams</CardDescription>
                          <div className="text-3xl font-bold text-green-600">Free</div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Unlimited messaging</li>
                            <li>✓ End-to-end encryption</li>
                            <li>✓ Voice & video calls</li>
                            <li>✓ Basic file sharing</li>
                            <li>✓ Mobile & desktop apps</li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-[#2E5A87]">
                        <CardHeader>
                          <CardTitle className="text-xl">Enterprise</CardTitle>
                          <CardDescription>For organizations requiring advanced features</CardDescription>
                          <div className="text-3xl font-bold text-[#2E5A87]">Contact Sales</div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Everything in Personal</li>
                            <li>✓ ISO 27001 compliance</li>
                            <li>✓ Advanced admin controls</li>
                            <li>✓ Custom integrations</li>
                            <li>✓ Priority support</li>
                            <li>✓ Custom deployment options</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-[#2E5A87]">About</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="text-center">
                    <div className="flex justify-center mb-6">
                      <img src={nebusisLogo} alt="Nebusis Logo" className="h-16 w-auto" />
                    </div>
                    <DialogTitle className="text-3xl text-center font-bold">WizSpeek®</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Our Mission</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Nebusis® WizSpeek® is a secure, next-generation communication platform developed by Nebusis Cloud Services, LLC, designed for individuals and organizations that prioritize confidentiality, control, and compliance. Built on a privacy-by-design foundation, WizSpeek® combines state-of-the-art encryption, customizable identity masking, and AI-powered content protection features. Our goal is to enable secure, seamless, and sovereign digital communication—empowering users to exchange sensitive information with full confidence in their privacy and security.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About Nebusis®</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Nebusis Cloud Services, LLC, based in Reston, Virginia, is a U.S.-based software development company specializing in secure, compliance-driven cloud applications. With over 8 years of experience in delivering intelligent digital solutions, Nebusis® focuses on integrating cutting-edge technologies such as AI, blockchain, and cloud-native architecture into platforms that solve real-world business and regulatory challenges.
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Our platforms are designed to meet the strict demands of regulated industries, government agencies, and international enterprises. We also develop digital training tools and manage comprehensive digital transformation projects, having worked with multinational companies like PepsiCo and Google, as well as several government institutions internationally.
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        From ISO-based management systems to internal audits, stakeholder engagement, and cyber-risk reduction—our solutions are engineered to deliver value, assurance, and agility across diverse organizational structures and regulatory environments.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Nebusis® Business Suite</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">A comprehensive collection of enterprise-grade software applications designed to streamline business operations and ensure regulatory compliance:</p>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">Compliance Management (Nebusis® ComplianceCore)</div>
                              <div className="text-slate-600 dark:text-slate-400">Including Nebusis® ISO 9001 Quality Management Wizard, Nebusis® ISO 27001 Information Management Wizard, Nebusis® HIPAA Wizard, and others that simplify compliance and certification processes</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Building className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Digital Marketing and CRM (Nebusis® Engage)</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Secure Communications (Nebusis® WizSpeek)</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Legal Workflow Automation (Nebusis® LegalFlow)</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <DollarSign className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Financial Control (Nebusis® SmartBooks)</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Leaf className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Environmental & ESG Tracking (Nebusis® Greenhouse Wizard & Nebusis® ESG GreenCore)</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Cybersecurity Oversight (Nebusis® CyberWatch)</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[#2E5A87] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">Self-Assessment & Conformance Tools (Nebusis® SelfCertify)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>



                    <div>
                      <h3 className="text-lg font-semibold mb-3">Headquarters</h3>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400">Reston, Virginia, USA</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Request More Information</h3>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Interested in learning more about our services and solutions? Fill out our comprehensive form and we'll send you detailed information tailored to your organization's needs.</p>
                        <Button 
                          className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]"
                          onClick={() => window.location.href = '/services-info'}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Request Service Information
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-[#2E5A87]">Support</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Get Support</DialogTitle>
                    <DialogDescription>We're here to help you get the most out of WizSpeek®</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h4 className="font-semibold mb-2">Get Support</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Submit a support request with details about your issue</p>
                        <SupportForm />
                      </div>
                      
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h4 className="font-semibold mb-2">Enterprise Support</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Priority support for enterprise customers</p>
                        <SalesContactForm 
                          trigger={
                            <Button className="bg-[#2E5A87] hover:bg-[#1e3a5f]">
                              <Building className="w-4 h-4 mr-2" />
                              Contact Sales
                            </Button>
                          }
                        />
                      </div>
                      
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h4 className="font-semibold mb-2">Learn More About Our Services</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Get detailed information about our digital transformation, training, and compliance solutions</p>
                        <Button className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]">
                          <Mail className="w-4 h-4 mr-2" />
                          Request Service Information
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>

            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-[#2E5A87]">Join now</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Join WizSpeek®</DialogTitle>
                    <DialogDescription>Create your free account today</DialogDescription>
                  </DialogHeader>
                  <RegisterForm onSuccess={onLogin} onCancel={() => setShowRegisterDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Simple Login Focus */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Mobile Title Section */}
        <div className="lg:hidden text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to your<br />
            <span className="text-[#2E5A87]">secure communication</span> platform
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
            Talk Smart. Stay Secure.
          </p>
        </div>

        {/* Mobile Hero Visual */}
        <div className="lg:hidden mb-8">
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-[#2E5A87] to-[#1e3a5f] rounded-2xl flex items-center justify-center overflow-hidden max-w-sm mx-auto">
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
              <div className="relative z-10 text-center text-white p-8">
                <img src={wizSpeakIcon} alt="WizSpeek®" className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Secure Communication</h3>
                <p className="text-blue-100">Professional messaging redefined</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Sign In Form */}
          <div className="space-y-6 md:space-y-8">
            {/* Desktop Title Section */}
            <div className="hidden lg:block">
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-left">
                Welcome to your<br />
                <span className="text-[#2E5A87]">secure communication</span> platform
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium text-left">
                Talk Smart. Stay Secure.
              </p>
            </div>

            <Card className="w-full max-w-md mx-auto lg:mx-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>
                  Enter your credentials to access WizSpeek®
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      {...form.register("username")}
                    />
                    {form.formState.errors.username && (
                      <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pr-10"
                        {...form.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <TooltipProvider>
                  <div className="grid grid-cols-2 gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => window.location.href = '/api/auth/google'}
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming Soon</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => window.location.href = '/api/auth/microsoft'}
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352z"/>
                          </svg>
                          Microsoft
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming Soon</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>


              </CardContent>
            </Card>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Badge variant="outline" className="text-[#2E5A87] border-[#2E5A87]">
                <Shield className="w-3 h-3 mr-1" />
                Enterprise Security
              </Badge>
              <Badge variant="outline" className="text-[#2E5A87] border-[#2E5A87]">
                <Bot className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="text-[#2E5A87] border-[#2E5A87]">
                <Lock className="w-3 h-3 mr-1" />
                Privacy-First
              </Badge>
            </div>
          </div>

          {/* Right Side - Hero Visual (Desktop Only) */}
          <div className="hidden lg:block space-y-6 md:space-y-8">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#2E5A87] to-[#1e3a5f] rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
                <div className="relative z-10 text-center text-white p-8">
                  <img src={wizSpeakIcon} alt="WizSpeek®" className="w-16 h-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">Secure Communication</h3>
                  <p className="text-blue-100">Professional messaging redefined</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span>© 2025 WizSpeek®.</span>
              <a 
                href="https://www.nebusis.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#2E5A87] hover:underline font-medium"
              >
                Powered by Nebusis®
              </a>
            </div>
            
            <div className="flex gap-6 text-sm">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-slate-600 hover:text-[#2E5A87]">Download Mobile App</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Get WizSpeek® Mobile
                    </DialogTitle>
                    <DialogDescription>Download our mobile app for the best experience on iOS and Android</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-center text-slate-700 dark:text-slate-300">
                        Direct Downloads (No Store Required)
                      </div>
                      <div className="grid gap-3">
                        <Button 
                          className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 h-12"
                          onClick={() => {
                            // Create a temporary download link
                            const link = document.createElement('a');
                            link.href = '/downloads/wizspeak-ios.ipa'; // This would be the actual iOS app file
                            link.download = 'WizSpeek-iOS.ipa';
                            toast({
                              title: "Download Starting",
                              description: "WizSpeek® iOS app is downloading. Install via TestFlight or enterprise deployment.",
                            });
                            // Uncomment when actual file is available: link.click();
                            toast({
                              title: "Coming Soon",
                              description: "Direct iOS download will be available at launch. Install via enterprise deployment.",
                            });
                          }}
                        >
                          <Phone className="h-5 w-5" />
                          <div className="text-left">
                            <div className="text-sm font-medium">Direct Download</div>
                            <div className="text-lg font-bold">iOS (.ipa)</div>
                          </div>
                        </Button>
                        <Button 
                          className="bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 h-12"
                          onClick={() => {
                            // Create a temporary download link
                            const link = document.createElement('a');
                            link.href = '/downloads/wizspeak-android.apk'; // This would be the actual Android APK
                            link.download = 'WizSpeek-Android.apk';
                            toast({
                              title: "Download Starting",
                              description: "WizSpeek® Android APK is downloading. Enable 'Unknown Sources' to install.",
                            });
                            // Uncomment when actual file is available: link.click();
                            toast({
                              title: "Coming Soon",
                              description: "Direct Android APK download will be available at launch. No Google Play required.",
                            });
                          }}
                        >
                          <Phone className="h-5 w-5" />
                          <div className="text-left">
                            <div className="text-sm font-medium">Direct Download</div>
                            <div className="text-lg font-bold">Android (.apk)</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-3">
                        Alternative: App Store Downloads
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline"
                          className="h-10"
                          onClick={() => {
                            toast({
                              title: "Coming Soon",
                              description: "iOS App Store version will be available as an alternative option.",
                            });
                          }}
                        >
                          <div className="text-xs">
                            <div>App Store</div>
                            <div className="font-bold">iOS</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline"
                          className="h-10"
                          onClick={() => {
                            toast({
                              title: "Coming Soon",
                              description: "Google Play Store version will be available as an alternative option.",
                            });
                          }}
                        >
                          <div className="text-xs">
                            <div>Play Store</div>
                            <div className="font-bold">Android</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-muted-foreground border-t pt-4">
                      <p className="font-medium">No Download Needed?</p>
                      <p>Use the web app directly in your browser - works seamlessly across all devices!</p>
                      <p className="mt-1 text-slate-500">Progressive Web App technology provides native-like experience.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-slate-600 hover:text-[#2E5A87]">Privacy Policy</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                    <DialogDescription>How we protect and handle your data</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 text-xs leading-relaxed">
                    <p className="text-sm"><strong>Effective Date:</strong> January 1, 2025</p>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">1. Information We Collect</h4>
                      <div className="space-y-2">
                        <p><strong>Account Information:</strong> Username, email address (optional), profile information, and authentication credentials necessary for account creation and management.</p>
                        <p><strong>Communication Data:</strong> Messages, files, media content, and metadata associated with your communications through our platform. All content is encrypted end-to-end.</p>
                        <p><strong>Technical Data:</strong> Device information, IP addresses, browser type, operating system, and usage analytics to improve service performance and security.</p>
                        <p><strong>Usage Information:</strong> Interaction patterns, feature usage statistics, and performance metrics used for service optimization and security monitoring.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">2. How We Use Your Information</h4>
                      <div className="space-y-2">
                        <p><strong>Service Provision:</strong> To provide, maintain, and improve WizSpeek® messaging services, including real-time communication, file sharing, and enterprise compliance features.</p>
                        <p><strong>Security & Compliance:</strong> To implement security measures, detect fraudulent activity, comply with legal obligations, and maintain ISO 27001 and SOC 2 compliance standards.</p>
                        <p><strong>Communication:</strong> To send service-related notifications, security alerts, and important updates regarding your account or our services.</p>
                        <p><strong>Analytics:</strong> To analyze usage patterns, improve user experience, and develop new features while maintaining data privacy and anonymization.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">3. Data Protection & Security</h4>
                      <div className="space-y-2">
                        <p><strong>Encryption:</strong> All data is protected using military-grade AES-256 encryption both in transit and at rest. End-to-end encryption ensures only intended recipients can access message content.</p>
                        <p><strong>Access Controls:</strong> Strict access controls, multi-factor authentication, and role-based permissions limit data access to authorized personnel only.</p>
                        <p><strong>Data Minimization:</strong> We collect and retain only the minimum data necessary for service operation and delete unnecessary data according to our retention policies.</p>
                        <p><strong>Compliance:</strong> We maintain ISO 27001, SOC 2 Type II, and GDPR compliance with regular third-party security audits and penetration testing.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">4. Data Sharing & Disclosure</h4>
                      <div className="space-y-2">
                        <p><strong>No Third-Party Sales:</strong> We never sell, rent, or trade your personal information to third parties for marketing purposes.</p>
                        <p><strong>Service Providers:</strong> Limited sharing with trusted service providers who assist in service delivery, subject to strict confidentiality agreements and data protection standards.</p>
                        <p><strong>Legal Requirements:</strong> Disclosure may occur when required by law, court order, or to protect rights, property, or safety of users and the public.</p>
                        <p><strong>Business Transfers:</strong> In the event of merger, acquisition, or asset transfer, user data may be transferred subject to equivalent privacy protections.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">5. Your Rights & Choices</h4>
                      <div className="space-y-2">
                        <p><strong>Access & Portability:</strong> Request access to your personal data and obtain copies in a structured, machine-readable format.</p>
                        <p><strong>Correction & Updates:</strong> Update, correct, or modify your personal information through account settings or by contacting support.</p>
                        <p><strong>Deletion:</strong> Request deletion of your account and associated data, subject to legal retention requirements and ongoing service needs.</p>
                        <p><strong>Privacy Controls:</strong> Granular privacy settings allow you to control data sharing, visibility, and communication preferences.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">6. Data Retention</h4>
                      <p>We retain personal information only as long as necessary for service provision, legal compliance, and legitimate business purposes. Messages may be retained according to enterprise retention policies. Deleted data is permanently removed from our systems within 30 days unless legally required to be retained longer.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">7. International Transfers</h4>
                      <p>Data may be processed in countries outside your residence jurisdiction. We ensure adequate protection through appropriate safeguards, including standard contractual clauses, adequacy decisions, and certification mechanisms where applicable.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">8. Contact Information</h4>
                      <p>For privacy concerns, data protection questions, or to exercise your rights, please <Dialog><DialogTrigger asChild><Button variant="link" className="p-0 text-[#2E5A87] underline">contact our support team</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Get Support</DialogTitle><DialogDescription>We're here to help with your privacy and data protection questions</DialogDescription></DialogHeader><SupportForm /></DialogContent></Dialog> through our secure contact form.</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-slate-600"><strong>Last Updated:</strong> January 1, 2025. We may update this Privacy Policy periodically. Significant changes will be communicated through service notifications.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-slate-600 hover:text-[#2E5A87]">Terms of Service</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                    <DialogDescription>Terms and conditions for using WizSpeek®</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 text-xs leading-relaxed">
                    <p className="text-sm"><strong>Effective Date:</strong> January 1, 2025</p>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">1. Acceptance of Terms</h4>
                      <p>By accessing or using WizSpeek® services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services. These terms constitute a legally binding agreement between you and Nebusis®.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">2. Service Description</h4>
                      <div className="space-y-2">
                        <p><strong>Platform:</strong> WizSpeek® is an enterprise-grade messaging platform providing secure communication, file sharing, compliance tools, and collaboration features.</p>
                        <p><strong>Availability:</strong> Services are provided "as is" with enterprise-grade security standards. We strive for 99.9% uptime but do not guarantee uninterrupted service availability.</p>
                        <p><strong>Updates:</strong> We may modify, update, or discontinue features with reasonable notice to users and administrators.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">3. User Accounts & Responsibilities</h4>
                      <div className="space-y-2">
                        <p><strong>Account Creation:</strong> You must provide accurate information when creating an account and maintain the security of your credentials.</p>
                        <p><strong>Age Requirements:</strong> Users must be at least 13 years old, or the minimum age required by local laws in their jurisdiction.</p>
                        <p><strong>Account Security:</strong> You are responsible for all activities under your account and must notify us immediately of unauthorized access.</p>
                        <p><strong>Professional Use:</strong> Enterprise accounts must comply with additional organizational policies and administrative controls.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">4. Acceptable Use Policy</h4>
                      <div className="space-y-2">
                        <p><strong>Prohibited Activities:</strong> Spam, harassment, hate speech, illegal content distribution, malware transmission, unauthorized access attempts, or violation of others' intellectual property rights.</p>
                        <p><strong>Compliance:</strong> Users must comply with all applicable local, state, national, and international laws and regulations.</p>
                        <p><strong>Content Standards:</strong> All user-generated content must be appropriate for a professional communication environment.</p>
                        <p><strong>Reporting:</strong> Users should report violations through our support channels for prompt investigation and resolution.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">5. Intellectual Property</h4>
                      <div className="space-y-2">
                        <p><strong>Platform Rights:</strong> WizSpeek®, Nebusis®, and associated trademarks, logos, and proprietary technology remain our exclusive property.</p>
                        <p><strong>User Content:</strong> You retain ownership of content you create but grant us necessary licenses to provide services effectively.</p>
                        <p><strong>Respect for Rights:</strong> Users must respect intellectual property rights of others and not infringe copyrights, trademarks, or trade secrets.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">6. Privacy & Data Protection</h4>
                      <p>Your privacy is important to us. Our comprehensive Privacy Policy details how we collect, use, protect, and share your information. By using our services, you acknowledge and agree to our privacy practices as outlined in our Privacy Policy.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">7. Service Modifications & Termination</h4>
                      <div className="space-y-2">
                        <p><strong>Modifications:</strong> We reserve the right to modify these terms with 30 days notice for material changes. Continued use constitutes acceptance.</p>
                        <p><strong>Account Termination:</strong> Either party may terminate the agreement. We may suspend or terminate accounts for violations of these terms.</p>
                        <p><strong>Data Retention:</strong> Upon termination, account data will be deleted according to our retention policies and legal requirements.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">8. Disclaimers & Limitations</h4>
                      <div className="space-y-2">
                        <p><strong>Service Disclaimer:</strong> Services are provided "as is" without warranties of any kind, express or implied, including but not limited to merchantability, fitness for purpose, or non-infringement.</p>
                        <p><strong>Limitation of Liability:</strong> Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages.</p>
                        <p><strong>Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our reasonable control.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">9. Dispute Resolution</h4>
                      <p>Disputes will be resolved through binding arbitration in accordance with commercial arbitration rules. Class action lawsuits are waived to the extent permitted by law. These terms are governed by the laws of the jurisdiction where Nebusis® is incorporated.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">10. Contact Information</h4>
                      <p>For legal inquiries, terms clarification, or dispute resolution, please <Dialog><DialogTrigger asChild><Button variant="link" className="p-0 text-[#2E5A87] underline">contact our legal team</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Legal Support</DialogTitle><DialogDescription>Contact our legal team for terms clarification and dispute resolution</DialogDescription></DialogHeader><SupportForm /></DialogContent></Dialog> through our secure contact form.</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-slate-600"><strong>Last Updated:</strong> January 1, 2025. These terms supersede all previous agreements and constitute the entire agreement between parties.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
