import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { InstallBanner } from "@/components/install-button";
import { authApi, setAuthToken, getAuthToken, removeAuthToken } from "@/lib/auth";
import AuthPage from "@/pages/auth";
import { SimpleLandingPage } from "@/components/simple-landing-page";
import ChatPage from "@/pages/chat";
import BackendPreview from "@/pages/backend-preview";
import Demo from "@/pages/demo";
import { ResetPasswordPage } from "@/pages/reset-password";
import { Stories } from "@/pages/stories";
import { Admin } from "@/pages/admin";
import { ProfilePage } from "@/pages/profile";
import { ContactsPage } from "@/pages/contacts";
import { JoinInvitationPage } from "@/pages/join-invitation";
import { InvitePage } from "@/pages/invite";
import { VerificationPage } from "@/pages/verification";
import { ServicesInfoPage } from "@/pages/services-info";
import MainLayout from "@/components/main-layout";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for special modes first - before any other logic
  const urlParams = new URLSearchParams(window.location.search);
  const showBackend = urlParams.get('backend') === 'true';
  const showDemo = urlParams.get('demo') === 'true';
  const isResetPassword = window.location.pathname === '/reset-password';

  // Return special modes immediately
  if (showBackend) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <BackendPreview />
          </div>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  if (showDemo) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Demo />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  if (isResetPassword) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ResetPasswordPage />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if we already have a valid token
        const existingToken = getAuthToken();
        if (existingToken) {
          setAuthToken(existingToken);
          try {
            const profile = await authApi.getProfile();
            setCurrentUser(profile);
            setIsAuth(true);
            setIsLoading(false);
            return;
          } catch (error) {
            // Token is invalid, remove it
            removeAuthToken();
          }
        }
        
        // No valid token, show landing page
        setIsAuth(false);
      } catch (error) {
        removeAuthToken();
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuth(true);
  };

  const handleLogout = () => {
    setIsAuth(false);
  };



  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Starting WizSpeek®...</p>
            </div>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-background">
            {isAuth ? (
              <MainLayout onLogout={handleLogout}>
                <Route path="/" component={() => <ChatPage onLogout={handleLogout} />} />
                <Route path="/chat" component={() => <ChatPage onLogout={handleLogout} />} />
                <Route path="/stories" component={Stories} />
                <Route path="/admin" component={Admin} />

                <Route path="/contacts" component={() => <ContactsPage currentUser={currentUser} />} />
                <Route path="/verification" component={VerificationPage} />
              </MainLayout>
            ) : (
              <>
                <Route path="/reset-password" component={ResetPasswordPage} />
                <Route path="/join/:code" component={JoinInvitationPage} />
                <Route path="/invite/:code" component={InvitePage} />
                <Route path="/services-info" component={ServicesInfoPage} />
                <Route path="/auth" component={() => <AuthPage onSuccess={handleAuthSuccess} />} />
                <Route component={() => <SimpleLandingPage onLogin={handleAuthSuccess} />} />
              </>
            )}
          </div>
          <InstallBanner />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;