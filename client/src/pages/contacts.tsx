import { ContactManager } from "@/components/contact-manager";

interface ContactsPageProps {
  currentUser: any;
}

export function ContactsPage({ currentUser }: ContactsPageProps) {
  return <ContactManager currentUser={currentUser} />;
}