import { UserProfile } from "../shared/schema";

export function getDisplayNameForContact(
  profile: UserProfile,
  contactId: number,
  defaultDisplay?: string,
  defaultPseudonym?: string
): string {
  const fullName = profile.fullName || profile.username || "User";
  const contactSettings = profile.contactPrivacySettings?.[contactId.toString()];
  
  // Use contact-specific setting if available, otherwise use profile default, otherwise use "full"
  const displayType = contactSettings?.nameDisplayType || 
                     profile.defaultNameDisplay || 
                     defaultDisplay || 
                     "full";

  switch (displayType) {
    case "full":
      return fullName;
      
    case "first_initial_last": {
      const parts = fullName.split(" ");
      if (parts.length < 2) return fullName;
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName.charAt(0)}. ${lastName}`;
    }
    
    case "first_last_initial": {
      const parts = fullName.split(" ");
      if (parts.length < 2) return fullName;
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName} ${lastName.charAt(0)}.`;
    }
    
    case "pseudonym": {
      const pseudonym = contactSettings?.customPseudonym || 
                       profile.defaultPseudonym || 
                       defaultPseudonym;
      return pseudonym || fullName; // Fallback to full name if no pseudonym set
    }
    
    default:
      return fullName;
  }
}

export function getDisplayNamePreview(
  fullName: string,
  displayType: string,
  pseudonym?: string
): string {
  if (!fullName) return "Preview Name";

  switch (displayType) {
    case "full":
      return fullName;
      
    case "first_initial_last": {
      const parts = fullName.split(" ");
      if (parts.length < 2) return fullName;
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName.charAt(0)}. ${lastName}`;
    }
    
    case "first_last_initial": {
      const parts = fullName.split(" ");
      if (parts.length < 2) return fullName;
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName} ${lastName.charAt(0)}.`;
    }
    
    case "pseudonym":
      return pseudonym || "Custom Name";
    
    default:
      return fullName;
  }
}