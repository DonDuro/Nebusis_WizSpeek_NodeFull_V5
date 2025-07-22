import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Building, Mail, Users, Phone } from "lucide-react";

const salesInquirySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  industry: z.string().min(1, "Please select your industry"),
  companySize: z.string().min(1, "Please select company size"),
  userCount: z.string().min(1, "Please select expected user count"),
  timeline: z.string().min(1, "Please select implementation timeline"),
  requirements: z.string().min(10, "Please describe your specific needs (minimum 10 characters)"),
  budget: z.string().optional(),
  currentSolution: z.string().optional(),
});

type SalesInquiryData = z.infer<typeof salesInquirySchema>;

interface SalesContactFormProps {
  trigger?: React.ReactNode;
}

export function SalesContactForm({ trigger }: SalesContactFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SalesInquiryData>({
    resolver: zodResolver(salesInquirySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      industry: "",
      companySize: "",
      userCount: "",
      timeline: "",
      requirements: "",
      budget: "",
      currentSolution: "",
    },
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: SalesInquiryData) => {
      const response = await fetch("/api/sales-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully",
        description: "Our sales team will contact you within 24 hours to discuss your needs.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or use the contact form.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: SalesInquiryData) => {
    submitInquiry.mutate(data);
  };

  const defaultTrigger = (
    <Button className="w-full bg-white text-[#2E5A87] hover:bg-gray-100">
      <Building className="w-4 h-4 mr-2" />
      Contact Sales
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#2E5A87]" />
            Enterprise Sales Inquiry
          </DialogTitle>
          <DialogDescription>
            Tell us about your organization's needs and our sales team will provide a customized solution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  className="mt-1"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  className="mt-1"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="mt-1"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                  className="mt-1"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Organization Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  {...form.register("company")}
                  className="mt-1"
                />
                {form.formState.errors.company && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.company.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  {...form.register("jobTitle")}
                  className="mt-1"
                />
                {form.formState.errors.jobTitle && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.jobTitle.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => form.setValue("industry", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.industry && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.industry.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="companySize">Company Size *</Label>
                <Select onValueChange={(value) => form.setValue("companySize", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1,000 employees</SelectItem>
                    <SelectItem value="1001-5000">1,001-5,000 employees</SelectItem>
                    <SelectItem value="5000+">5,000+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.companySize && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.companySize.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Project Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userCount">Expected User Count *</Label>
                <Select onValueChange={(value) => form.setValue("userCount", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select user count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-25">1-25 users</SelectItem>
                    <SelectItem value="26-100">26-100 users</SelectItem>
                    <SelectItem value="101-500">101-500 users</SelectItem>
                    <SelectItem value="501-1000">501-1,000 users</SelectItem>
                    <SelectItem value="1001-5000">1,001-5,000 users</SelectItem>
                    <SelectItem value="5000+">5,000+ users</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.userCount && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.userCount.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="timeline">Implementation Timeline *</Label>
                <Select onValueChange={(value) => form.setValue("timeline", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (within 30 days)</SelectItem>
                    <SelectItem value="1-3months">1-3 months</SelectItem>
                    <SelectItem value="3-6months">3-6 months</SelectItem>
                    <SelectItem value="6-12months">6-12 months</SelectItem>
                    <SelectItem value="12months+">12+ months</SelectItem>
                    <SelectItem value="evaluating">Just evaluating options</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.timeline && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.timeline.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="requirements">Specific Requirements & Use Cases *</Label>
              <Textarea
                id="requirements"
                {...form.register("requirements")}
                placeholder="Please describe your specific communication needs, compliance requirements, integration needs, or any other important details..."
                className="mt-1 min-h-[100px]"
              />
              {form.formState.errors.requirements && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.requirements.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Annual Budget Range (Optional)</Label>
                <Select onValueChange={(value) => form.setValue("budget", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-10k">Under $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="250k+">$250,000+</SelectItem>
                    <SelectItem value="not-disclosed">Prefer not to disclose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currentSolution">Current Communication Solution (Optional)</Label>
                <Input
                  id="currentSolution"
                  {...form.register("currentSolution")}
                  placeholder="e.g., Slack, Microsoft Teams, etc."
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitInquiry.isPending}
              className="flex-1 bg-[#2E5A87] hover:bg-[#1e3a5f]"
            >
              {submitInquiry.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}