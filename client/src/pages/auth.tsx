import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { isAuthenticated } from "@/lib/auth";

interface AuthPageProps {
  onSuccess: (user: any) => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Quick auth check - if already authenticated, call onSuccess immediately
    if (isAuthenticated()) {
      // For existing auth, we don't have user data, so pass null
      onSuccess(null);
      return;
    }
    
    // Show modal after mount to prevent loading flash
    setShowModal(true);
  }, [onSuccess]);

  // Show loading state while checking auth
  if (!showModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary-blue/20 rounded-full mx-auto mb-4"></div>
          <div className="w-48 h-4 bg-gray-300 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AuthModal onSuccess={onSuccess} />
    </div>
  );
}
