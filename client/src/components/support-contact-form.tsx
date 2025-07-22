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
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

const supportInquirySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select priority level"),
  description: z.string().min(10, "Please provide more details (minimum 10 characters)"),
  currentPlan: z.string().optional(),
  username: z.string().optional(),
});

type SupportInquiryData = z.infer<typeof supportInquirySchema>;

interface SupportContactFormProps {
  trigger?: React.ReactNode;
}

export function SupportContactForm({ trigger }: SupportContactFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportInquiryData>({
    resolver: zodResolver(supportInquirySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      category: "",
      priority: "",
      description: "",
      currentPlan: "",
      username: "",
    },
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: SupportInquiryData) => {
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

  const handleSubmit = (data: SupportInquiryData) => {
    submitInquiry.mutate(data);
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <HelpCircle className="w-4 h-4 mr-2" />
      Get Support
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
            <HelpCircle className="w-5 h-5 text-[#2E5A87]" />
            Get Support
          </DialogTitle>
          <DialogDescription>
            Describe your issue and our support team will help you resolve it quickly.
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
            <div>
              <Label htmlFor="email">Email Address *</Label>
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
          </div>

          {/* Issue Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Issue Details</h3>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="Brief description of your issue"
                className="mt-1"
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.subject.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="account">Account & Billing</SelectItem>
                    <SelectItem value="security">Security Concern</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="login">Login Problems</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="integration">Integration Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="priority">Priority Level *</Label>
                <Select onValueChange={(value) => form.setValue("priority", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General question</SelectItem>
                    <SelectItem value="medium">Medium - Minor issue</SelectItem>
                    <SelectItem value="high">High - Affecting productivity</SelectItem>
                    <SelectItem value="urgent">Urgent - System down</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.priority && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.priority.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Please provide as much detail as possible about your issue, including steps to reproduce, error messages, and what you expected to happen..."
                className="mt-1 min-h-[120px]"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">WizSpeek® Username (Optional)</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Your account username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currentPlan">Current Plan (Optional)</Label>
                <Select onValueChange={(value) => form.setValue("currentPlan", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Plan</SelectItem>
                    <SelectItem value="personal">Personal Plan</SelectItem>
                    <SelectItem value="professional">Professional Plan</SelectItem>
                    <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="unknown">Not sure</SelectItem>
                  </SelectContent>
                </Select>
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
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}