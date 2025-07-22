import { Phone, Download, Smartphone, Apple, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MobileAppManagerProps {
  currentUser: any;
}

export function MobileAppManager({ currentUser }: MobileAppManagerProps) {
  const { toast } = useToast();

  const handleDownloadiOS = () => {
    toast({
      title: "Coming Soon",
      description: "iOS App Store download will be available at launch. We'll notify you when it's ready!",
    });
  };

  const handleDownloadAndroid = () => {
    toast({
      title: "Coming Soon",
      description: "Google Play Store download will be available at launch. We'll notify you when it's ready!",
    });
  };

  const handleInstallPWA = () => {
    // Check if PWA installation is available
    if ('serviceWorker' in navigator) {
      toast({
        title: "Install Web App",
        description: "Use your browser's 'Add to Home Screen' option to install WizSpeek® as a web app.",
      });
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support Progressive Web App installation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Mobile App Downloads</h2>
        <p className="text-sm text-muted-foreground">
          Get WizSpeek® on your mobile devices for the best experience
        </p>
      </div>

      {/* Main Download Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* iOS App */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Coming Soon
            </Badge>
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <Apple className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">WizSpeek® for iOS</CardTitle>
                <CardDescription>Available on the App Store</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Native iOS security integration</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Optimized for iPhone & iPad</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>Push notifications & background sync</span>
              </div>
            </div>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={handleDownloadiOS}
            >
              <Apple className="h-4 w-4 mr-2" />
              Download for iOS
            </Button>
          </CardContent>
        </Card>

        {/* Android App */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Coming Soon
            </Badge>
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">WizSpeek® for Android</CardTitle>
                <CardDescription>Available on Google Play</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Android keystore security</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Material Design 3 interface</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-green-600" />
                <span>Background processing & widgets</span>
              </div>
            </div>
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={handleDownloadAndroid}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Download for Android
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progressive Web App Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install as Web App (PWA)
          </CardTitle>
          <CardDescription>
            Install WizSpeek® directly from your browser - works offline!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Works offline</li>
                <li>• App-like experience</li>
                <li>• Push notifications</li>
                <li>• Home screen icon</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">How to Install:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chrome: Menu → Install App</li>
                <li>• Safari: Share → Add to Home</li>
                <li>• Edge: Apps → Install this site</li>
              </ul>
            </div>
          </div>
          <Button 
            className="w-full"
            variant="outline"
            onClick={handleInstallPWA}
          >
            <Download className="h-4 w-4 mr-2" />
            Install Web App
          </Button>
        </CardContent>
      </Card>

      {/* App Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile App Features</CardTitle>
          <CardDescription>
            All the power of WizSpeek® optimized for mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">End-to-End Encryption</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Military-grade security on mobile
              </p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Voice & Video Calls</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Crystal clear communication
              </p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">AI Smart Features</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Intelligent replies and insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Release Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Release Timeline</CardTitle>
          <CardDescription>
            Stay updated on mobile app availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div>
                <h4 className="font-medium">Q1 2025 - Beta Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Limited beta testing with selected users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <div>
                <h4 className="font-medium">Q2 2025 - Public Release</h4>
                <p className="text-sm text-muted-foreground">
                  Official launch on App Store and Google Play
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}