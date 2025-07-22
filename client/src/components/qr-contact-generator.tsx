import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { QrCode, Share2, Copy, Download, User, Building, Heart, Eye, Clock, Users, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QRContactGeneratorProps {
  currentUser: any;
  onClose: () => void;
}

export function QRContactGenerator({ currentUser, onClose }: QRContactGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrMode, setQrMode] = useState<'default' | 'custom'>('default');
  const [profileType, setProfileType] = useState("none");
  const [customName, setCustomName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [expirationDays, setExpirationDays] = useState("30");
  const [maxUses, setMaxUses] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showManualShare, setShowManualShare] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [defaultQrDataUrl, setDefaultQrDataUrl] = useState<string | null>(null);
  const [defaultGeneratedCode, setDefaultGeneratedCode] = useState<string | null>(null);
  const [includeTrustScore, setIncludeTrustScore] = useState(false);
  const [defaultIncludeTrustScore, setDefaultIncludeTrustScore] = useState(false);

  // Generate default QR (name and contact only)
  const generateDefaultQRMutation = useMutation({
    mutationFn: async () => {
      const defaultData = {
        inviteeName: `${currentUser?.firstName || currentUser?.username}`,
        visibilityLevel: "none", // Only name and contact info
        customMessage: defaultIncludeTrustScore ? 
          "Quick connect - name, contact info, and trust score" : 
          "Quick connect - name and contact info only",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: null,
        type: 'default_qr',
        includeTrustScore: defaultIncludeTrustScore
      };
      const response = await apiRequest("POST", "/api/contact-invitations/qr", defaultData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Default QR generation success:', data);
      setDefaultGeneratedCode(data.invitationCode);
      generateDefaultQRImage(data.invitationCode);
      toast({
        title: "Default QR Code Generated",
        description: "Quick connect QR code ready for sharing!",
      });
    },
    onError: (error) => {
      console.error('Default QR generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate default QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate custom QR invitation
  const generateQRMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contact-invitations/qr", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Custom QR generation success:', data);
      setGeneratedCode(data.invitationCode);
      generateQRImage(data.invitationCode);
      toast({
        title: "Custom QR Contact Code Generated",
        description: "Your customized QR code is ready!",
      });
    },
    onError: (error) => {
      console.error('Custom QR generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateDefaultQRImage = async (code: string) => {
    try {
      const inviteUrl = `${window.location.origin}/invite/${code}`;
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setDefaultQrDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Default QR generation error:', error);
      setDefaultQrDataUrl('/placeholder-qr.png');
    }
  };

  const generateQRImage = async (code: string) => {
    try {
      // Create QR code URL for the invitation page
      const inviteUrl = `${window.location.origin}/invite/${code}`;
      
      // Import QR code library dynamically
      const QRCode = await import('qrcode');
      
      // Generate actual QR code
      const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrDataUrl(qrDataUrl);
    } catch (error) {
      console.error('QR generation error:', error);
      // Fallback to placeholder if QR library fails
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', 100, 100);
        ctx.fillText('Placeholder', 100, 120);
        setQrDataUrl(canvas.toDataURL());
      }
    }
  };

  const handleGenerate = () => {
    // Map the UI profile types to the backend expected format
    const backendVisibilityLevel = profileType === 'general' ? 'general-non-specific' : 
                                  profileType === 'personal' ? 'personal-non-specific' : 
                                  profileType === 'professional' ? 'professional-non-specific' :
                                  profileType === 'academic' ? 'academic-non-specific' :
                                  'general-non-specific';

    const invitationData = {
      inviteeName: customName || getDefaultName(),
      visibilityLevel: backendVisibilityLevel,
      customMessage: customMessage || getDefaultMessage(),
      expiresAt: new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: maxUses ? parseInt(maxUses) : null,
      type: 'qr_code',
      includeTrustScore: includeTrustScore
    };

    console.log('Generating QR with data:', invitationData);
    generateQRMutation.mutate(invitationData);
  };

  const getDefaultName = () => {
    switch (profileType) {
      case 'professional':
        return `${currentUser?.firstName || currentUser?.username} (Professional)`;
      case 'personal':
        return `${currentUser?.firstName || currentUser?.username} (Personal)`;
      case 'academic':
        return `${currentUser?.firstName || currentUser?.username} (Academic)`;
      default:
        return currentUser?.firstName || currentUser?.username || 'WizSpeek® User';
    }
  };

  const getDefaultMessage = () => {
    switch (profileType) {
      case 'professional':
        return "Let's connect professionally on WizSpeek®";
      case 'personal':
        return "Let's stay in touch on WizSpeek®";
      case 'academic':
        return "Let's connect for academic collaboration on WizSpeek®";
      default:
        return "Join me on WizSpeek® for secure messaging";
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      const inviteUrl = `${window.location.origin}/invite/${generatedCode}`;
      navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link Copied",
        description: "Invitation link copied to clipboard",
      });
    }
  };

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `wizspeak-contact-${profileType}-${Date.now()}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const handleShareDefault = async () => {
    if (!defaultGeneratedCode) return;
    
    const shareUrl = `${window.location.origin}/invite/${defaultGeneratedCode}`;
    const shareTitle = "Connect with me on WizSpeek®";
    const shareText = "Quick connect - name and contact info only";
    
    if (navigator.share && navigator.canShare && navigator.canShare({ 
      title: shareTitle, 
      text: shareText, 
      url: shareUrl 
    })) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        console.log('Native sharing cancelled or failed:', error);
      }
    }
    
    setShowManualShare(true);
  };

  const handleCopyDefault = () => {
    if (!defaultGeneratedCode) return;
    
    const shareUrl = `${window.location.origin}/invite/${defaultGeneratedCode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Default QR invitation link copied to clipboard",
      });
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/invite/${generatedCode}`;
    const shareText = customMessage || getDefaultMessage();
    const shareTitle = 'Connect with me on WizSpeek®';
    
    // Check if Web Share API is available and supported
    if (navigator.share && navigator.canShare && navigator.canShare({ 
      title: shareTitle, 
      text: shareText, 
      url: shareUrl 
    })) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // User cancelled or sharing failed, continue to manual options
        console.log('Native sharing cancelled or failed:', error);
      }
    }
    
    // Show manual sharing options
    setShowManualShare(true);
  };

  const handleManualShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/invite/${generatedCode}`;
    const shareText = encodeURIComponent(customMessage || getDefaultMessage());
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let targetUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        targetUrl = `https://wa.me/?text=${shareText}%20${encodedUrl}`;
        break;
      case 'telegram':
        targetUrl = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
        break;
      case 'facebook':
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        targetUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        targetUrl = `mailto:?subject=Connect with me on WizSpeek®&body=${shareText}%20${encodedUrl}`;
        break;
      case 'sms':
        targetUrl = `sms:?body=${shareText}%20${encodedUrl}`;
        break;
      case 'copy':
        handleCopyCode();
        setShowManualShare(false);
        return;
    }
    
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setShowManualShare(false);
    }
  };

  const profileTypes = [
    {
      id: 'none',
      name: 'None',
      description: 'Name and contact information only',
      icon: User,
      color: 'text-gray-600'
    },
    {
      id: 'general',
      name: 'General Information',
      description: 'Share basic, non-specific profile information',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 'professional', 
      name: 'Professional Profile',
      description: 'Share work-related information and credentials',
      icon: Building,
      color: 'text-green-600'
    },
    {
      id: 'personal',
      name: 'Personal Profile', 
      description: 'Share personal interests and close friend info',
      icon: Heart,
      color: 'text-purple-600'
    },
    {
      id: 'academic',
      name: 'Academic Profile',
      description: 'Share educational background and research interests',
      icon: GraduationCap,
      color: 'text-orange-600'
    }
  ];

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Generate Contact QR Code
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          Create a QR code that others can scan to connect with you and see your chosen profile level
        </p>
      </DialogHeader>

        <div className="space-y-6">
          {/* QR Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">QR Code Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-colors ${qrMode === 'default' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                onClick={() => setQrMode('default')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Default QR</h3>
                      <p className="text-xs text-muted-foreground">Quick connect - name and contact only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${qrMode === 'custom' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                onClick={() => setQrMode('custom')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Custom QR</h3>
                      <p className="text-xs text-muted-foreground">Choose what profile info to share</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {qrMode === 'default' ? (
            /* Default QR Section */
            <div className="space-y-4">
              {!defaultGeneratedCode ? (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Default Quick Connect</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Shares only your name and contact information for fast, simple connections.
                      Perfect for networking events and quick introductions.
                    </p>
                    
                    {/* Trust Score Option */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                              {currentUser?.trustScore || 85}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Include Trust Score</p>
                          <p className="text-xs text-muted-foreground">Share your verification rating</p>
                        </div>
                      </div>
                      <Switch 
                        checked={defaultIncludeTrustScore} 
                        onCheckedChange={setDefaultIncludeTrustScore}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => generateDefaultQRMutation.mutate()}
                    disabled={generateDefaultQRMutation.isPending}
                    className="w-full"
                  >
                    {generateDefaultQRMutation.isPending ? "Generating..." : "Generate Default QR Code"}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <h3 className="font-medium text-green-700 dark:text-green-300 mb-2">Default QR Code Ready!</h3>
                    {defaultQrDataUrl && (
                      <div className="flex justify-center">
                        <img src={defaultQrDataUrl} alt="Default QR Code" className="border rounded" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleShareDefault()} className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button onClick={() => handleCopyDefault()} variant="outline" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom QR Section */
            <div className="space-y-6">
              {!generatedCode ? (
            <>
              {/* Profile Categories to Share */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Profile Categories to Share</Label>
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
                            <input type="radio" name="qr-general" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="qr-general" value="specific" />
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
                            <input type="radio" name="qr-personal" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="qr-personal" value="specific" />
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
                            <input type="radio" name="qr-professional" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="qr-professional" value="specific" />
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
                            <input type="radio" name="qr-academic" value="non-specific" />
                            <span>Non-specific</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <input type="radio" name="qr-academic" value="specific" />
                            <span>Specific</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Name */}
              <div className="space-y-2">
                <Label>Display Name (Optional)</Label>
                <Input
                  placeholder={getDefaultName()}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  How your name will appear to the person scanning this code
                </p>
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <Label>Welcome Message (Optional)</Label>
                <Textarea
                  placeholder={getDefaultMessage()}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Trust Score Option for Custom QR */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Additional Information</Label>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {currentUser?.trustScore || 85}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Trust Score</h4>
                      <p className="text-sm text-muted-foreground">Share your verification rating ({currentUser?.trustScore || 85}/100)</p>
                    </div>
                  </div>
                  <Switch 
                    checked={includeTrustScore} 
                    onCheckedChange={setIncludeTrustScore}
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Advanced Options</Label>
                  <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                </div>

                {showAdvanced && (
                  <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expires In</Label>
                        <Select value={expirationDays} onValueChange={setExpirationDays}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="7">1 Week</SelectItem>
                            <SelectItem value="30">1 Month</SelectItem>
                            <SelectItem value="90">3 Months</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Maximum Uses</Label>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          value={maxUses}
                          onChange={(e) => setMaxUses(e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={generateQRMutation.isPending}
                className="w-full"
                size="lg"
              >
                {generateQRMutation.isPending ? "Generating..." : "Generate QR Contact Code"}
              </Button>
            </>
          ) : (
            <>
              {/* Generated QR Code Display */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Your {profileTypes.find(t => t.id === profileType)?.name} QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Anyone who scans this code will be able to connect with you and see your {profileType} profile information
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" onClick={handleDownloadQR}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Manual Sharing Options */}
                {showManualShare && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Choose Sharing Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('whatsapp')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                          WhatsApp
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('telegram')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                          Telegram
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('sms')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
                          SMS
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('email')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                          Email
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('facebook')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                          Facebook
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('twitter')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-black rounded-sm"></div>
                          Twitter
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManualShare('copy')}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowManualShare(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Code Details */}
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profile Type:</span>
                      <Badge>{profileTypes.find(t => t.id === profileType)?.name}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                    </div>
                    {maxUses && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Max Uses:</span>
                        <span>{maxUses}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generate Another Button */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedCode(null);
                    setQrDataUrl(null);
                  }}
                  className="w-full"
                >
                  Generate Another Code
                </Button>
              </div>
            </>
              )}
            </div>
          )}
        </div>

        {/* Manual Share Dialog */}
        <Dialog open={showManualShare} onOpenChange={setShowManualShare}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share QR Code</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleManualShare('whatsapp')} variant="outline" className="justify-start">
                <span>📱 WhatsApp</span>
              </Button>
              <Button onClick={() => handleManualShare('telegram')} variant="outline" className="justify-start">
                <span>✈️ Telegram</span>
              </Button>
              <Button onClick={() => handleManualShare('sms')} variant="outline" className="justify-start">
                <span>💬 SMS</span>
              </Button>
              <Button onClick={() => handleManualShare('email')} variant="outline" className="justify-start">
                <span>📧 Email</span>
              </Button>
              <Button onClick={() => handleManualShare('copy')} variant="outline" className="justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}