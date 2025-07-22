import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Shield, Bot, Lock, Smartphone, Building, Phone, MessageSquare, Users, CheckCircle, Globe, Zap } from "lucide-react";
import { SalesContactForm } from "@/components/sales-contact-form";
import wizSpeakIcon from "@/assets/wizspeak-icon.svg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { authApi, setAuthToken } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

interface LandingPageProps {
  onLogin: (user: any) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
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

  const handleDemoLogin = (username: string, password: string) => {
    form.setValue("username", username);
    form.setValue("password", password);
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center py-4 space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <img src={wizSpeakIcon} alt="WizSpeek®" className="w-8 h-8" />
                <h1 className="text-xl font-bold text-[#2E5A87]">WizSpeek®</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-[#2E5A87] text-sm px-3" onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}>Join now</Button>
                <Button className="bg-[#2E5A87] hover:bg-[#1e3a5f] text-sm px-3">Sign in</Button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={wizSpeakIcon} alt="WizSpeek®" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-[#2E5A87]">WizSpeek®</h1>
            </div>
            
            <nav className="flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>Features</a>
              <a href="#security" className="text-slate-600 hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
              }}>Security</a>
              <a href="#enterprise" className="text-slate-600 hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('enterprise')?.scrollIntoView({ behavior: 'smooth' });
              }}>Enterprise</a>
              <a href="#about" className="text-slate-600 hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}>About</a>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-[#2E5A87]" onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}>Join now</Button>
              <Button className="bg-[#2E5A87] hover:bg-[#1e3a5f]">Sign in</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Sign In Form */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-center md:text-left">
                Welcome to your<br />
                <span className="text-[#2E5A87]">secure communication</span> platform
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium text-center md:text-left">
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
                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" type="button">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <Button variant="outline" className="w-full" type="button">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#00BCF2" d="M13 1h10v10H13z"/>
                      <path fill="#00BCF2" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                    Continue with Microsoft
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">or</span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username or Email</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      {...form.register("username")}
                      className="w-full"
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
                        {...form.register("password")}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
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

                <div className="text-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                    className="text-[#2E5A87]"
                  >
                    Show demo credentials
                  </Button>
                </div>

                {showDemoCredentials && (
                  <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Demo Accounts:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-800 dark:text-blue-200">john.doe / user123</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDemoLogin("john.doe", "user123")}
                          className="h-7 text-xs"
                        >
                          Use
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-800 dark:text-blue-200">jane.smith / user123</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDemoLogin("jane.smith", "user123")}
                          className="h-7 text-xs"
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                New to WizSpeek®?{" "}
                <Button 
                  variant="link" 
                  className="p-0 text-[#2E5A87] font-semibold"
                  onClick={() => {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join now
                </Button>
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-2">
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

          {/* Right Side - Features & Visual */}
          <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">End-to-End Encryption</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">All conversations protected with military-grade encryption</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">AI Smart Replies</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Intelligent conversation assistance and summarization</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Granular Privacy</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Control what each contact sees with precision</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Cross-Platform PWA</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Works seamlessly on any device or platform</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Enterprise Ready</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">ISO 27001/9001 compliance and audit trails</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Video Calling</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Integrated WebRTC voice and video calls</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-emerald-600 dark:bg-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">85</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Trust Score Verification</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Transparent ratings for informed connections</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Trusted by professionals worldwide</span>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline">Healthcare</Badge>
                <Badge variant="outline">Education</Badge>
                <Badge variant="outline">Legal</Badge>
                <Badge variant="outline">Finance</Badge>
                <Badge variant="outline">Technology</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24 scroll-mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Professional Communication
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              WizSpeek® combines cutting-edge technology with intuitive design to deliver the most secure and intelligent messaging platform available.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">End-to-End Encryption</h3>
              <p className="text-slate-600 dark:text-slate-400">Military-grade AES-256 encryption ensures your conversations remain private and secure from unauthorized access.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">AI Smart Replies</h3>
              <p className="text-slate-600 dark:text-slate-400">Intelligent conversation assistance with contextual suggestions and automatic summarization to boost productivity.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Granular Privacy Controls</h3>
              <p className="text-slate-600 dark:text-slate-400">Control exactly what information each contact can see with unprecedented precision and flexibility.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">WebRTC Video Calls</h3>
              <p className="text-slate-600 dark:text-slate-400">High-quality audio and video calling with secure peer-to-peer connections and call recording capabilities.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Cross-Platform PWA</h3>
              <p className="text-slate-600 dark:text-slate-400">Works seamlessly on any device with native app-like experience and offline capabilities.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">85</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Trust Score Verification</h3>
              <p className="text-slate-600 dark:text-slate-400">Transparent trust ratings help users make informed connection decisions with optional verification sharing.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">File Security</h3>
              <p className="text-slate-600 dark:text-slate-400">Encrypted file sharing with access controls, expiration dates, and comprehensive audit trails.</p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mt-24 scroll-mt-16">
          <div className="bg-gradient-to-br from-[#2E5A87] to-[#1e3a5f] rounded-2xl p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Security</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Built with security-first architecture to protect your most sensitive communications
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Zero-Knowledge Architecture</h3>
                    <p className="text-blue-100">Your data is encrypted before it leaves your device. Even we can't read your messages.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">SOC 2 Type II Compliant</h3>
                    <p className="text-blue-100">Independently audited security controls and processes for enterprise trust.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Advanced Threat Protection</h3>
                    <p className="text-blue-100">Real-time scanning for malware, phishing attempts, and suspicious activities.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Multi-Factor Authentication</h3>
                    <p className="text-blue-100">Biometric, hardware keys, and app-based 2FA for maximum account security.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Secure Key Management</h3>
                    <p className="text-blue-100">Hardware security modules (HSMs) protect encryption keys at rest and in transit.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Compliance Ready</h3>
                    <p className="text-blue-100">GDPR, HIPAA, and FERPA compliant with built-in data governance tools.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section id="enterprise" className="mt-24 scroll-mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Built for Enterprise Scale
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Comprehensive features designed for organizations that need security, compliance, and control
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Advanced Administration</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Centralized user management, policy enforcement, and detailed analytics for IT administrators.
                  </p>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Single Sign-On (SSO) integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Active Directory sync
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Role-based access controls
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Compliance & Audit</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Comprehensive audit trails, data retention policies, and compliance reporting tools.
                  </p>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Immutable audit logs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Data loss prevention (DLP)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Legal hold capabilities
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Enterprise Solutions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Unlimited users</span>
                  <span className="text-slate-900 dark:text-white font-medium">Included</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Advanced security features</span>
                  <span className="text-slate-900 dark:text-white font-medium">Included</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">24/7 priority support</span>
                  <span className="text-slate-900 dark:text-white font-medium">Included</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Custom deployment</span>
                  <span className="text-slate-900 dark:text-white font-medium">Available</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-[#2E5A87] hover:bg-[#1e3a5f]"
                onClick={() => {
                  window.location.href = 'mailto:sales@wizspeak.com?subject=Enterprise Demo Request';
                }}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mt-24 scroll-mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              About WizSpeek®
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Developed by Nebusis Cloud Services, LLC - A Member of the QSI Global Ventures Group
            </p>
          </div>
          
          <div className="space-y-16">
            {/* Our Mission */}
            <div className="bg-gradient-to-br from-[#2E5A87] to-[#1e3a5f] rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
              <p className="text-lg text-blue-100">
                WizSpeek® is a secure, next-generation communication platform designed for individuals and organizations that prioritize confidentiality, control, and compliance. Built on a privacy-by-design foundation, WizSpeek® combines state-of-the-art encryption, customizable identity masking, and AI-powered content protection features. Our goal is to enable secure, seamless, and sovereign digital communication—empowering users to exchange sensitive information with full confidence in their privacy and security.
              </p>
            </div>

            {/* About Nebusis */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">About Nebusis®</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Nebusis Cloud Services, LLC, based in Reston, Virginia, is a U.S.-based software development company specializing in secure, compliance-driven cloud applications. With over 8 years of experience in delivering intelligent digital solutions, Nebusis® focuses on integrating cutting-edge technologies such as AI, blockchain, and cloud-native architecture into platforms that solve real-world business and regulatory challenges.
                </p>
                
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Our platforms are designed to meet the strict demands of regulated industries, government agencies, and international enterprises. From ISO-based management systems to internal audits, stakeholder engagement, and cyber-risk reduction—our solutions are engineered to deliver value, assurance, and agility.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Nebusis® Business Suite</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">A collection of enterprise-grade software applications:</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Compliance Management (ComplianceCore)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Digital Engagement (Engage)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Secure Communications (WizSpeek)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Legal Workflow Automation (LegalFlow)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Financial Control (SmartBooks)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Environmental & ESG Tracking (Greenhouse Wizard & ESG GreenCore)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Cybersecurity Oversight (CyberWatch)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-[#2E5A87] flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">Self-Assessment & Conformance Tools (SelfCertify)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QSI Global Ventures */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Part of the QSI Global Ventures Ecosystem</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Nebusis® operates as the technology and digital transformation division of QSI Global Ventures, a multinational group with over 30 years of experience delivering audit, certification, training, inspection, and advisory services across more than 50 countries.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Through this affiliation, Nebusis® applications are enriched by decades of subject-matter expertise in compliance, quality, environmental protection, information security, and public sector modernization.
              </p>
            </div>

            {/* Headquarters */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Headquarters</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400">Reston, Virginia, USA</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mt-24 scroll-mt-16 bg-slate-50 dark:bg-slate-900 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Free for personal use, custom solutions for enterprise needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Personal Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Personal</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Perfect for friends and colleagues</p>
                <div className="text-4xl font-bold text-[#2E5A87] mb-2">Free</div>
                <p className="text-slate-500">Forever</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">End-to-end encryption</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">Unlimited messages</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">Voice & video calls</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">File sharing</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">Privacy controls</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">Trust score verification</span>
                </li>
              </ul>
              
              <Button className="w-full bg-[#2E5A87] hover:bg-[#1e3a5f]">
                Get Started Free
              </Button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-[#2E5A87] to-[#1e3a5f] rounded-xl p-8 text-white relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-white text-[#2E5A87]">Most Popular</Badge>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-blue-100 mb-4">Advanced features for organizations</p>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <p className="text-blue-200">Contact for pricing</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">Everything in Personal</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">Unlimited users</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">Advanced admin controls</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">Compliance features</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">24/7 priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">Custom deployment</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">Enterprise trust verification</span>
                </li>
              </ul>
              
              <SalesContactForm />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Start Secure Conversations Today
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who trust WizSpeek® for their most important communications. 
            Experience the perfect balance of intelligence, security, and simplicity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#2E5A87] hover:bg-[#1e3a5f]"
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Get Started Free
            </Button>
            <SalesContactForm 
              trigger={
                <Button size="lg" variant="outline">
                  <Building className="w-4 h-4 mr-2" />
                  Enterprise Demo
                </Button>
              }
            />
          </div>
        </div>
      </main>

      {/* Privacy Policy Section */}
      <section id="privacy" className="mt-24 scroll-mt-16 bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              At WizSpeek®, your privacy is our top priority. We are committed to protecting your personal information and being transparent about how we collect, use, and share your data.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Data Collection</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We collect only the minimum data necessary to provide our services: account information, communication metadata, and usage analytics to improve our platform.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Encryption & Security</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  All messages are encrypted end-to-end using AES-256 encryption. We cannot read your messages, and they are automatically deleted from our servers after delivery.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Data Sharing</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We never sell your personal data. We only share information when legally required or with your explicit consent. Enterprise customers have full control over their organizational data.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <em>This privacy policy is a summary. Complete policy documentation will be available upon product launch.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service Section */}
      <section id="terms" className="mt-24 scroll-mt-16 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Terms of Service</h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              By using WizSpeek®, you agree to these terms. Please read them carefully.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Acceptable Use</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  WizSpeek® is designed for legitimate communication purposes. Users must not engage in harassment, spam, illegal activities, or attempts to compromise platform security.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Service Availability</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We strive for 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be announced in advance.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Account Responsibility</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <em>These terms of service are preliminary. Complete terms will be available upon product launch.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="mt-24 scroll-mt-16 bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Support & Contact</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Get Help</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-[#2E5A87]" />
                  <span className="text-slate-600 dark:text-slate-400">Live Chat Support (24/7 for Enterprise)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#2E5A87]" />
                  <span className="text-slate-600 dark:text-slate-400">Knowledge Base & Documentation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#2E5A87]" />
                  <span className="text-slate-600 dark:text-slate-400">Community Forums</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">General Support</h4>
                  <p className="text-slate-600 dark:text-slate-400">support@wizspeak.com</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Enterprise Sales</h4>
                  <p className="text-slate-600 dark:text-slate-400">sales@wizspeak.com</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Security Issues</h4>
                  <p className="text-slate-600 dark:text-slate-400">security@wizspeak.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src={wizSpeakIcon} alt="WizSpeek®" className="w-6 h-6" />
              <span className="font-bold text-[#2E5A87]">WizSpeek®</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-600 text-sm">Talk Smart. Stay Secure.</span>
              <span className="text-slate-500">|</span>
              <a 
                href="https://www.nebusis.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 text-xs hover:text-[#2E5A87] transition-colors cursor-pointer"
              >
                Powered by Nebusis®
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#privacy" className="hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' });
              }}>Privacy Policy</a>
              <a href="#terms" className="hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('terms')?.scrollIntoView({ behavior: 'smooth' });
              }}>Terms of Service</a>
              <a href="#security" className="hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
              }}>Security</a>
              <a href="#support" className="hover:text-[#2E5A87] transition-colors" onClick={(e) => {
                e.preventDefault();
                document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
              }}>Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}