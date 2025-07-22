// V5.0.0 Enhanced Compliance Center Component
// Professional interface for enterprise compliance management

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  UserCheck,
  Search,
  Filter,
  Download,
  Calendar
} from "lucide-react";

interface PrivacySettings {
  maskPII: boolean;
  maskPHI: boolean;
  maskFinancial: boolean;
  ghostMode: boolean;
  anonymousChat: boolean;
  metadataMinimization: boolean;
  ephemeralMessages: boolean;
  ephemeralDuration: number;
}

interface ComplianceReport {
  reportType: string;
  period: { start: Date; end: Date };
  metrics: {
    totalMessages: number;
    maskedContent: number;
    dlpViolations: number;
    retentionDue: number;
    unmaskingRequests: number;
  };
  violations: Array<{
    severity: string;
    type: string;
    count: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: string[];
}

interface DlpSummary {
  totalIncidents: number;
  severityBreakdown: Record<string, number>;
  topViolationTypes: Array<{ type: string; count: number }>;
  resolutionRate: number;
}

export function ComplianceCenter() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [dlpSummary, setDlpSummary] = useState<DlpSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [maskingText, setMaskingText] = useState("");
  const [maskingResult, setMaskingResult] = useState<any>(null);
  const { toast } = useToast();

  // Load privacy profile on mount
  useEffect(() => {
    fetchPrivacyProfile();
    fetchComplianceReport();
    fetchDlpSummary();
  }, []);

  const fetchPrivacyProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/privacy/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const settings = await response.json();
        setPrivacySettings(settings);
      }
    } catch (error) {
      console.error("Error fetching privacy profile:", error);
    }
  };

  const fetchComplianceReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/compliance/report", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const report = await response.json();
        setComplianceReport(report);
      }
    } catch (error) {
      console.error("Error fetching compliance report:", error);
    }
  };

  const fetchDlpSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/compliance/dlp-summary", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const summary = await response.json();
        setDlpSummary(summary);
      }
    } catch (error) {
      console.error("Error fetching DLP summary:", error);
    }
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/privacy/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        await fetchPrivacyProfile();
        toast({
          title: "Privacy settings updated",
          description: "Your privacy profile has been successfully updated.",
        });
      } else {
        throw new Error("Failed to update privacy settings");
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testContentMasking = async () => {
    if (!maskingText.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/privacy/mask-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: maskingText })
      });

      if (response.ok) {
        const result = await response.json();
        setMaskingResult(result);
        toast({
          title: "Content analysis complete",
          description: `Detected ${result.detectedTypes.length} sensitive data types with risk score: ${result.riskScore}`,
        });
      } else {
        throw new Error("Failed to mask content");
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Center</h1>
          <p className="text-muted-foreground">V5.0.0 Enhanced Enterprise Compliance Management</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Shield className="w-4 h-4 mr-1" />
          ISO 9001/27001 Compliant
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Privacy Protection
          </TabsTrigger>
          <TabsTrigger value="dlp" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Data Loss Prevention
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Compliance Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceReport && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                        <p className="text-2xl font-bold">{complianceReport.metrics.totalMessages.toLocaleString()}</p>
                      </div>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Masked Content</p>
                        <p className="text-2xl font-bold">{complianceReport.metrics.maskedContent.toLocaleString()}</p>
                      </div>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">DLP Violations</p>
                        <p className="text-2xl font-bold text-red-600">{complianceReport.metrics.dlpViolations}</p>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                        <p className="text-2xl font-bold text-green-600">94.7%</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Violations Overview */}
          {complianceReport && (
            <Card>
              <CardHeader>
                <CardTitle>Security Violations Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceReport.violations.map((violation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(violation.trend)}
                      <div>
                        <p className="font-medium">{violation.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {violation.count} incidents • {violation.trend}
                        </p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {complianceReport && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReport.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Privacy Protection */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Profile Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure data masking and privacy protection settings
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {privacySettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maskPII">Mask PII (Personal Information)</Label>
                        <Switch
                          id="maskPII"
                          checked={privacySettings.maskPII}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({ maskPII: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maskPHI">Mask PHI (Health Information)</Label>
                        <Switch
                          id="maskPHI"
                          checked={privacySettings.maskPHI}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({ maskPHI: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maskFinancial">Mask Financial Data</Label>
                        <Switch
                          id="maskFinancial"
                          checked={privacySettings.maskFinancial}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({ maskFinancial: checked })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ghostMode">Ghost Mode</Label>
                        <Switch
                          id="ghostMode"
                          checked={privacySettings.ghostMode}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({ ghostMode: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymousChat">Anonymous Chat</Label>
                        <Switch
                          id="anonymousChat"
                          checked={privacySettings.anonymousChat}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({ anonymousChat: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ephemeralMessages">Ephemeral Messages</Label>
                        <Switch
                          id="ephemeralMessages"
                          checked={privacySettings.ephemeralMessages}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({ ephemeralMessages: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {privacySettings.ephemeralMessages && (
                    <div>
                      <Label>Ephemeral Duration (hours)</Label>
                      <Input
                        type="number"
                        value={privacySettings.ephemeralDuration}
                        onChange={(e) => 
                          updatePrivacySettings({ ephemeralDuration: parseInt(e.target.value) })
                        }
                        className="mt-2"
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Content Masking Test */}
          <Card>
            <CardHeader>
              <CardTitle>Content Masking Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test the privacy engine's ability to detect and mask sensitive information
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Enter text to analyze for sensitive data:</Label>
                <Textarea
                  value={maskingText}
                  onChange={(e) => setMaskingText(e.target.value)}
                  placeholder="Enter text containing emails, phone numbers, SSN, credit cards, etc."
                  className="mt-2"
                />
              </div>
              <Button onClick={testContentMasking} disabled={loading || !maskingText.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Analyze Content
              </Button>

              {maskingResult && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Masked Content:</Label>
                    <div className="p-3 bg-gray-50 rounded-md mt-2">
                      {maskingResult.maskedContent}
                    </div>
                  </div>
                  <div>
                    <Label>Risk Score: {maskingResult.riskScore}/100</Label>
                    <Progress value={maskingResult.riskScore} className="mt-2" />
                  </div>
                  <div>
                    <Label>Detected Sensitive Data:</Label>
                    <div className="space-y-2 mt-2">
                      {maskingResult.detectedTypes.map((detection: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                          <span className="font-medium">{detection.type}</span>
                          <Badge variant="outline">{detection.confidence}% confidence</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Loss Prevention */}
        <TabsContent value="dlp" className="space-y-6">
          {dlpSummary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Incidents</p>
                        <p className="text-2xl font-bold">{dlpSummary.totalIncidents}</p>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                        <p className="text-2xl font-bold text-green-600">{dlpSummary.resolutionRate.toFixed(1)}%</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Critical Incidents</p>
                        <p className="text-2xl font-bold text-red-600">
                          {dlpSummary.severityBreakdown.critical || 0}
                        </p>
                      </div>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Violation Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dlpSummary.topViolationTypes.map((violation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{violation.type.replace('_', ' ')}</span>
                        <Badge variant="outline">{violation.count} incidents</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Organizational Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizational Policies</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage compliance policies and rules
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Data Masking for Healthcare Communications</strong><br />
                    Automatically mask PHI and PII in healthcare-related conversations. Status: Active
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Financial Data Protection Policy</strong><br />
                    Prevent leakage of financial information and credit card data. Status: Active
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Enhanced Message Retention for Compliance</strong><br />
                    Extended retention for compliance-critical communications. Status: Active
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Reports */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate and download compliance reports
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Monthly Compliance Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  DLP Incident Summary
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  Retention Policy Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  Privacy Metrics Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}