import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Mail, Bot, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import nebusisLogo from "@assets/nebusis-logo.png";
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

type ServicesData = z.infer<typeof servicesSchema>;

export function ServicesInfoPage() {
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
          title: "Request Sent Successfully",
          description: "We'll send you detailed information about our services soon.",
        });
        servicesForm.reset();
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={nebusisLogo} alt="Nebusis Logo" className="h-20 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Request Service Information
          </h1>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-600 hover:text-[#2E5A87]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <form onSubmit={servicesForm.handleSubmit(onServicesSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    {...servicesForm.register("firstName")} 
                    className="mt-1"
                  />
                  {servicesForm.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    {...servicesForm.register("lastName")} 
                    className="mt-1"
                  />
                  {servicesForm.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    {...servicesForm.register("email")} 
                    className="mt-1"
                  />
                  {servicesForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle"
                    {...servicesForm.register("jobTitle")} 
                    className="mt-1"
                    placeholder="e.g., CEO, IT Director, Operations Manager"
                  />
                  {servicesForm.formState.errors.jobTitle && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.jobTitle.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organization Name</Label>
                  <Input 
                    id="organization"
                    {...servicesForm.register("organization")} 
                    className="mt-1"
                  />
                  {servicesForm.formState.errors.organization && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.organization.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="locations">Location(s)</Label>
                  <Input 
                    id="locations"
                    {...servicesForm.register("locations")} 
                    className="mt-1"
                    placeholder="e.g., New York, NY; London, UK"
                  />
                  {servicesForm.formState.errors.locations && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.locations.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <select 
                    id="employeeCount"
                    {...servicesForm.register("employeeCount")} 
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
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
                  <Label htmlFor="industry">Industry</Label>
                  <select 
                    id="industry"
                    {...servicesForm.register("industry")} 
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
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
            </div>

            {/* Services & Needs */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Services & Requirements</h3>
              
              <div className="mb-6">
                <Label className="text-base font-medium">Interested Services/Solutions (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {[
                    { value: "compliance-core", label: "Nebusis® ComplianceCore (ISO, HIPAA)" },
                    { value: "engage", label: "Nebusis® Engage (Digital Marketing)" },
                    { value: "wizspeak", label: "Nebusis® WizSpeek (Secure Communications)" },
                    { value: "legalflow", label: "Nebusis® LegalFlow (Legal Workflow)" },
                    { value: "smartbooks", label: "Nebusis® SmartBooks (Financial Control)" },
                    { value: "environmental", label: "Nebusis® Environmental & ESG Solutions" },
                    { value: "cyberwatch", label: "Nebusis® CyberWatch (Cybersecurity)" },
                    { value: "selfcertify", label: "Nebusis® SelfCertify (Self-Assessment)" },
                    { value: "digital-training", label: "Nebusis® Digital Training Solutions" },
                    { value: "digital-transformation", label: "Nebusis® Digital Transformation" },
                    { value: "project-management", label: "Nebusis® Project Management Solutions" },
                  ].map((service) => (
                    <label key={service.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        value={service.value}
                        {...servicesForm.register("interestedServices")}
                        className="mt-1 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">{service.label}</span>
                    </label>
                  ))}
                </div>
                {servicesForm.formState.errors.interestedServices && (
                  <p className="text-red-500 text-sm mt-2">{servicesForm.formState.errors.interestedServices.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="specificNeeds">Specific Needs & Requirements</Label>
                  <textarea 
                    id="specificNeeds"
                    {...servicesForm.register("specificNeeds")} 
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    placeholder="Describe your specific business needs, compliance requirements, or objectives..."
                  />
                  {servicesForm.formState.errors.specificNeeds && (
                    <p className="text-red-500 text-sm mt-1">{servicesForm.formState.errors.specificNeeds.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentChallenges">Current Challenges (Optional)</Label>
                  <textarea 
                    id="currentChallenges"
                    {...servicesForm.register("currentChallenges")} 
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    placeholder="What challenges is your organization currently facing?"
                  />
                </div>
              </div>
            </div>

            {/* Timeline & Budget */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Implementation Timeline</Label>
                  <select 
                    id="timeline"
                    {...servicesForm.register("timeline")} 
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
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
                  <Label htmlFor="budget">Budget Range (Optional)</Label>
                  <select 
                    id="budget"
                    {...servicesForm.register("budget")} 
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
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

              <div className="mt-4">
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <textarea 
                  id="additionalInfo"
                  {...servicesForm.register("additionalInfo")} 
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="Any other relevant information or special requirements..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f] text-white py-3 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Bot className="w-5 h-5 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Request Detailed Information
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
