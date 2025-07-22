import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  MessageCircle, 
  BookOpen, 
  Shield, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Users,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { removeAuthToken } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { SettingsModal } from "@/components/settings-modal";
import { useTranslation, getCurrentLanguage } from "@/lib/translations";
import wizSpeakIcon from "@/assets/wizspeak-icon.svg";

interface MainLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  department: string | null;
}

export default function MainLayout({ children, onLogout }: MainLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(getCurrentLanguage());

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/profile"],
  });

  const handleLogout = () => {
    removeAuthToken();
    onLogout();
  };

  const navigation = [
    { name: t('messages'), href: "/chat", icon: MessageCircle },
    { name: t('stories'), href: "/stories", icon: BookOpen },
    { name: t('contacts'), href: "/contacts", icon: Users },
    { name: t('verification'), href: "/verification", icon: CheckCircle },
    ...(user?.role === "admin" ? [{ name: t('admin'), href: "/admin", icon: Shield }] : []),
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img src={wizSpeakIcon} alt="WizSpeek®" className="w-8 h-8" />
          <span className="font-semibold text-lg">WizSpeek®</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && user && (
        <SettingsModal 
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentUser={user}
        />
      )}

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-[#2E5A87] text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.username}</p>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {user.role}
                </Badge>
                {user.department && (
                  <span className="text-xs text-muted-foreground">{user.department}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/chat");
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Always Visible Sidebar */}
      <div className="flex w-64 flex-col fixed inset-y-0 bg-white dark:bg-gray-900 border-r z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900 border-r">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 pl-64">
        {/* Mobile Header - Hidden when sidebar is always visible */}
        <div className="hidden flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={wizSpeakIcon} alt="WizSpeek®" className="w-6 h-6" />
            <span className="font-semibold">WizSpeek®</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}