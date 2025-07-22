import { ProfileManagement } from "@/components/profile-management";

interface ProfilePageProps {
  currentUser: any;
}

export function ProfilePage({ currentUser }: ProfilePageProps) {
  return <ProfileManagement currentUser={currentUser} />;
}