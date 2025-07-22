import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  avatar: text("avatar"),
  publicKey: text("public_key"),
  role: text("role").notNull().default("user"), // user, admin, compliance_officer, auditor
  department: text("department"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  isBanned: boolean("is_banned").default(false),
  bannedAt: timestamp("banned_at"),
  bannedBy: integer("banned_by").references(() => users.id),
  banReason: text("ban_reason"),
  // Basic profile fields
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  phone: text("phone"),
  location: text("location"),
  trustScore: integer("trust_score").default(85), // User verification rating (0-100)
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name"),
  type: text("type").notNull().default("direct"), // direct, group
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // text, voice, file, image, emoji
  classification: text("classification"), // Policy_Notification, Audit_Notice, Corrective_Action, General, etc.
  priority: text("priority").default("normal"), // low, normal, high, urgent
  requiresAcknowledgment: boolean("requires_acknowledgment").default(false),
  metadata: json("metadata"), // for file info, voice duration, etc.
  encryptedContent: text("encrypted_content"),
  contentHash: text("content_hash"), // cryptographic hash for immutability
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  readBy: json("read_by").$type<number[]>().default([]),
  reactions: json("reactions").$type<{[emoji: string]: number[]}>().default({}), // emoji -> array of user IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  encryptedKey: text("encrypted_key"),
  fileHash: text("file_hash"), // cryptographic hash for immutability
  iv: text("iv").notNull(), // initialization vector for AES encryption
  category: text("category").notNull().default("other"), // image, video, audio, document, other
  uploadedBy: integer("uploaded_by").references(() => users.id),
  storageUrl: text("storage_url").notNull(), // path to encrypted file on storage
  createdAt: timestamp("created_at").defaultNow(),
});

// File sharing and permissions tables
export const fileShares = pgTable("file_shares", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id),
  shareId: uuid("share_id").notNull().unique(),
  createdBy: integer("created_by").references(() => users.id),
  canView: boolean("can_view").default(true),
  canDownload: boolean("can_download").default(true),
  canShare: boolean("can_share").default(false),
  requiresAuth: boolean("requires_auth").default(true),
  maxViews: integer("max_views"),
  currentViews: integer("current_views").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  shareMessage: text("share_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileShareAccess = pgTable("file_share_access", {
  id: serial("id").primaryKey(),
  shareId: integer("share_id").references(() => fileShares.id),
  userId: integer("user_id").references(() => users.id),
  canView: boolean("can_view").default(true),
  canDownload: boolean("can_download").default(true),
  canShare: boolean("can_share").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileAccessLogs = pgTable("file_access_logs", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id),
  shareId: integer("share_id").references(() => fileShares.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // view, download, share
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Compliance tables for ISO 9001 and ISO 27001
export const messageAcknowledgments = pgTable("message_acknowledgments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id),
  userId: integer("user_id").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const retentionPolicies = pgTable("retention_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  messageClassification: text("message_classification"), // which classification this applies to
  retentionPeriodDays: integer("retention_period_days").notNull(),
  departments: json("departments").$type<string[]>().default([]), // departments this applies to
  userRoles: json("user_roles").$type<string[]>().default([]), // user roles this applies to
  isActive: boolean("is_active").default(true),
  requiresConfirmation: boolean("requires_confirmation").default(true), // require admin confirmation before purging
  notifyBeforeExpiry: integer("notify_before_expiry").default(30), // days before expiry to notify
  autoDelete: boolean("auto_delete").default(false), // automatically delete or require manual approval
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
  modifiedBy: integer("modified_by").references(() => users.id),
});

export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // view, download, edit, delete, export
  resourceType: text("resource_type").notNull(), // message, file, conversation
  resourceId: integer("resource_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const auditTrails = pgTable("audit_trails", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // message_sent, message_edited, file_uploaded, user_login, etc.
  userId: integer("user_id").references(() => users.id),
  resourceType: text("resource_type"),
  resourceId: integer("resource_id"),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const complianceReports = pgTable("compliance_reports", {
  id: serial("id").primaryKey(),
  reportType: text("report_type").notNull(), // retention_due, access_summary, audit_trail
  reportData: json("report_data").notNull(),
  generatedBy: integer("generated_by").references(() => users.id),
  generatedAt: timestamp("generated_at").defaultNow(),
  parameters: json("parameters"),
});

// Stories feature tables
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type").notNull(), // image, video, text, audio
  caption: text("caption"),
  backgroundColor: text("background_color").default("#2E5A87"), // for text stories
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours from creation
  visibility: text("visibility").notNull().default("public"), // public, private, hidden
  hiddenFromUsers: json("hidden_from_users").$type<number[]>().default([]), // array of user IDs
});

export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  viewerId: integer("viewer_id").references(() => users.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// User blocking system tables
export const userBlocks = pgTable("user_blocks", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").references(() => users.id).notNull(), // user who blocked
  blockedId: integer("blocked_id").references(() => users.id).notNull(), // user who was blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reason: text("reason"), // optional reason for blocking
});

// User Profile Information Tables
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Privacy Settings
  useGeneralDescriptors: boolean("use_general_descriptors").default(false), // Use vague descriptions instead of specific details
  
  // Personal Information
  personalInterests: text("personal_interests"), // hobbies, personal interests
  personalBio: text("personal_bio"),
  personalWebsite: text("personal_website"),
  personalSocialLinks: json("personal_social_links").$type<string[]>().default([]),
  
  // Personal Demographics (optional)
  age: integer("age"),
  ageDisclosure: text("age_disclosure"), // "specific", "adult_minor", "private"
  ageCategory: text("age_category"), // "minor", "adult" (when ageDisclosure is "adult_minor")
  gender: text("gender"), // Open text field for inclusive gender identity
  maritalStatus: text("marital_status"), // single, married, partnered, divorced, widowed, it's complicated, prefer not to say
  
  // Profile Pictures (up to 3 each category)
  personalPictures: json("personal_pictures").$type<string[]>().default([]), // Array of up to 3 personal image URLs
  professionalPictures: json("professional_pictures").$type<string[]>().default([]), // Array of up to 3 professional image URLs
  primaryPersonalPic: integer("primary_personal_pic").default(0), // Index of primary personal picture (0-2)
  primaryProfessionalPic: integer("primary_professional_pic").default(0), // Index of primary professional picture (0-2)
  
  // Main profile picture selection (can be from any of the 9 pictures)
  mainProfilePic: json("main_profile_pic").$type<{
    category: "personal" | "professional" | "academic";
    index: number;
  }>().default({ category: "personal", index: 0 }),
  
  // Visibility toggles for information categories
  showDemographics: boolean("show_demographics").default(true),
  showEducation: boolean("show_education").default(true),
  showSkills: boolean("show_skills").default(true),
  showLanguages: boolean("show_languages").default(true),
  showCertifications: boolean("show_certifications").default(true),
  showAchievements: boolean("show_achievements").default(true),
  showLocation: boolean("show_location").default(true),
  showPersonalInterests: boolean("show_personal_interests").default(true),
  showPersonalBio: boolean("show_personal_bio").default(true),
  showPersonalWebsite: boolean("show_personal_website").default(true),
  showRelationshipStatus: boolean("show_relationship_status").default(true),
  showPersonalPictures: boolean("show_personal_pictures").default(true),
  showJobInfo: boolean("show_job_info").default(true),
  showProfessionalBio: boolean("show_professional_bio").default(true),
  showWorkExperience: boolean("show_work_experience").default(true),
  showProfessionalWebsites: boolean("show_professional_websites").default(true),
  showWorkHistory: boolean("show_work_history").default(true),
  showProfessionalPictures: boolean("show_professional_pictures").default(true),
  
  // Contact-specific privacy overrides
  contactPrivacySettings: json("contact_privacy_settings").$type<{
    [contactId: string]: {
      // Override category-level settings for specific contacts
      allowPersonalInfo?: boolean;
      allowProfessionalInfo?: boolean;
      allowAcademicInfo?: boolean;
      // Granular field-level overrides
      hideFields?: string[]; // Array of field names to hide from this contact
      showFields?: string[];  // Array of field names to show to this contact (overrides hide)
      customNote?: string;    // Optional note about this contact's access level
      // Name display customization
      nameDisplayType?: "full" | "first_initial_last" | "first_last_initial" | "pseudonym";
      customPseudonym?: string; // Custom name to show this contact
    };
  }>().default({}),
  
  // Default name display preferences
  defaultNameDisplay: text("default_name_display").default("full"), // "full", "first_initial_last", "first_last_initial", "pseudonym"
  defaultPseudonym: text("default_pseudonym"), // Default pseudonym for all contacts
  
  // Professional Information  
  jobTitle: text("job_title"),
  company: text("company"), // e.g., "Large Tech Company" instead of "Google"
  professionalBio: text("professional_bio"),
  workExperience: text("work_experience"),
  professionalWebsite: text("professional_website"),
  linkedInProfile: text("linkedin_profile"),
  
  // Work Experience History (up to 3 positions)
  workHistory: json("work_history").$type<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }[]>().default([]),
  
  // Both Personal and Professional
  education: text("education"), // e.g., "Major University" instead of "Harvard University"
  skills: text("skills"),
  languages: text("languages"),
  certifications: text("certifications"),
  achievements: text("achievements"),
  
  // General location instead of specific
  generalLocation: text("general_location"), // e.g., "West Coast, USA" instead of "San Francisco, CA"
  
  // Academic Information
  academicInstitution: text("academic_institution"), // School/University name
  academicLevel: text("academic_level"), // elementary, middle_school, high_school, undergraduate, graduate, faculty, staff, administrator
  studentId: text("student_id"), // Optional student ID (privacy controlled)
  majorFieldOfStudy: text("major_field_of_study"), // Major/Field of study for higher education
  graduationYear: integer("graduation_year"), // Current or expected graduation year
  gradeLevel: text("grade_level"), // Specific grade (K-12) or year (college)
  academicInterests: text("academic_interests"), // Subject areas of interest
  academicAchievements: text("academic_achievements"), // Academic honors, awards, publications
  researchAreas: text("research_areas"), // For faculty/graduate students
  teachingSubjects: text("teaching_subjects"), // For teachers/faculty
  
  // Academic Pictures (up to 3)
  academicPictures: json("academic_pictures").$type<string[]>().default([]), // Array of up to 3 academic image URLs
  primaryAcademicPic: integer("primary_academic_pic").default(0), // Index of primary academic picture (0-2)
  
  // Academic Privacy Controls
  showAcademicInfo: boolean("show_academic_info").default(true),
  showStudentId: boolean("show_student_id").default(false), // Default private for security
  showGradeLevel: boolean("show_grade_level").default(true),
  showAcademicPictures: boolean("show_academic_pictures").default(true),
  showResearchAreas: boolean("show_research_areas").default(true),
  showTeachingSubjects: boolean("show_teaching_subjects").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Relationship Management
export const contactRelationships = pgTable("contact_relationships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  contactId: integer("contact_id").references(() => users.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(), // personal, professional, academic, personal_academic, professional_academic, all
  profileVisibility: text("profile_visibility").notNull().default("basic"), // basic, full, custom
  
  // Custom visibility settings (JSON object with field-level permissions)
  customVisibilitySettings: json("custom_visibility_settings").$type<{
    personal?: boolean;
    professional?: boolean;
    academic?: boolean;
    specificFields?: string[];
  }>(),
  
  addedAt: timestamp("added_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Invitations System with QR Codes and Privacy Controls
export const contactInvitations = pgTable("contact_invitations", {
  id: serial("id").primaryKey(),
  inviteCode: text("invite_code").unique().notNull(),
  qrCodeData: text("qr_code_data"),
  inviterUserId: integer("inviter_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  inviteeName: text("invitee_name"),
  inviteeEmail: text("invitee_email"),
  inviteePhone: text("invitee_phone"),
  
  // Privacy settings for this specific invite - Default: "general-non-specific"
  visibilityLevel: text("visibility_level").notNull().default("general-non-specific"), 
  // Options: "general-non-specific", "general-specific", "personal-non-specific", "personal-specific", "professional-non-specific", "professional-specific", "academic-non-specific", "academic-specific"
  customMessage: text("custom_message"),
  nameDisplayOverride: text("name_display_override"), // Override name display for this invite: "full", "first_initial_last", "first_last_initial", "pseudonym"
  customPseudonym: text("custom_pseudonym"),
  allowedFields: json("allowed_fields").$type<string[]>().default([]), // Specific fields this invite can see
  
  // Invite settings
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses").default(1),
  currentUses: integer("current_uses").default(0),
  isActive: boolean("is_active").default(true),
  status: text("status").notNull().default("pending"), // pending, accepted, declined
  
  // Trust score sharing option
  includeTrustScore: boolean("include_trust_score").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

// V5.0.0 Enhanced Compliance Features
// Data masking and privacy protection tables
export const privacyProfiles = pgTable("privacy_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  profileName: text("profile_name").notNull().default("custom"), // strict, moderate, lenient, custom
  maskPII: boolean("mask_pii").default(true),
  maskPHI: boolean("mask_phi").default(true),
  maskFinancial: boolean("mask_financial").default(true),
  ghostMode: boolean("ghost_mode").default(false), // hide presence completely
  anonymousChat: boolean("anonymous_chat").default(false),
  metadataMinimization: boolean("metadata_minimization").default(true),
  ephemeralMessages: boolean("ephemeral_messages").default(false),
  ephemeralDuration: integer("ephemeral_duration").default(24), // hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content masking and detection logs
export const contentMaskingLogs = pgTable("content_masking_logs", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id),
  fileId: integer("file_id").references(() => files.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  detectedDataType: text("detected_data_type").notNull(), // pii, phi, financial, credit_card, ssn, etc.
  originalValue: text("original_value"), // encrypted original value for authorized unmasking
  maskedValue: text("masked_value").notNull(),
  maskingRuleId: integer("masking_rule_id").references(() => organizationalPolicies.id),
  confidence: integer("confidence").default(95), // detection confidence percentage
  reviewStatus: text("review_status").default("pending"), // pending, approved, rejected
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Identity vault for anonymous chat traceability
export const identityVault = pgTable("identity_vault", {
  id: serial("id").primaryKey(),
  anonymousId: text("anonymous_id").notNull().unique(), // public anonymous identifier
  realUserId: integer("real_user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").notNull(),
  encryptedMapping: text("encrypted_mapping").notNull(), // encrypted mapping data
  accessLevel: text("access_level").default("anonymous"), // anonymous, pseudonymous, authenticated
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

// Organizational privacy policies and masking rules
export const organizationalPolicies = pgTable("organizational_policies", {
  id: serial("id").primaryKey(),
  policyName: text("policy_name").notNull(),
  policyType: text("policy_type").notNull(), // masking_rule, retention_policy, access_control, dlp_rule
  description: text("description"),
  ruleConfiguration: json("rule_configuration").notNull(), // flexible rule definitions
  departments: json("departments").$type<string[]>().default([]),
  userRoles: json("user_roles").$type<string[]>().default([]),
  severity: text("severity").default("medium"), // low, medium, high, critical
  isActive: boolean("is_active").default(true),
  autoEnforce: boolean("auto_enforce").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
});

// Legal unmasking requests and audit trail
export const unmaskingRequests = pgTable("unmasking_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id),
  targetMessageId: integer("target_message_id").references(() => messages.id),
  targetFileId: integer("target_file_id").references(() => files.id),
  requestType: text("request_type").notNull(), // identity_reveal, content_unmask, metadata_access
  legalJustification: text("legal_justification").notNull(),
  courtOrder: text("court_order"), // reference to legal document
  urgencyLevel: text("urgency_level").default("standard"), // emergency, urgent, standard, routine
  status: text("status").default("pending"), // pending, approved, rejected, fulfilled
  approvedBy: integer("approved_by").references(() => users.id),
  rejectedReason: text("rejected_reason"),
  fulfilledAt: timestamp("fulfilled_at"),
  expiresAt: timestamp("expires_at"),
  auditTrail: json("audit_trail").notNull(), // complete approval chain
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance center monitoring and metrics
export const complianceMetrics = pgTable("compliance_metrics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(), // masking_usage, policy_violations, access_patterns
  metricName: text("metric_name").notNull(),
  value: text("value").notNull(),
  unit: text("unit"), // percentage, count, bytes, etc.
  department: text("department"),
  timeframe: text("timeframe").notNull(), // daily, weekly, monthly, quarterly
  recordedAt: timestamp("recorded_at").defaultNow(),
  metadata: json("metadata"),
});

// DLP (Data Loss Prevention) violations and incidents
export const dlpIncidents = pgTable("dlp_incidents", {
  id: serial("id").primaryKey(),
  incidentType: text("incident_type").notNull(), // sensitive_data_leak, policy_violation, unauthorized_access
  severity: text("severity").notNull(), // low, medium, high, critical
  userId: integer("user_id").references(() => users.id),
  messageId: integer("message_id").references(() => messages.id),
  fileId: integer("file_id").references(() => files.id),
  detectedContent: text("detected_content"), // sanitized version of detected content
  policyViolated: integer("policy_violated").references(() => organizationalPolicies.id),
  actionTaken: text("action_taken").notNull(), // blocked, masked, flagged, allowed_with_warning
  reviewStatus: text("review_status").default("open"), // open, investigating, resolved, false_positive
  assignedTo: integer("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Retention policy expiry notifications
export const retentionNotifications = pgTable("retention_notifications", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").references(() => retentionPolicies.id).notNull(),
  messageId: integer("message_id").references(() => messages.id),
  fileId: integer("file_id").references(() => files.id),
  notificationType: text("notification_type").notNull(), // expiry_warning, expiry_due, deletion_scheduled
  scheduledDeletion: timestamp("scheduled_deletion"),
  notifiedUsers: json("notified_users").$type<number[]>().default([]),
  adminConfirmed: boolean("admin_confirmed").default(false),
  confirmedBy: integer("confirmed_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  status: text("status").default("pending"), // pending, confirmed, executed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// ========== VERIFICATION SYSTEM TABLES ==========
// Main verification requests table - handles all types of verification
export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  requestType: text("request_type").notNull(), // "employment", "education", "guardian_approval", "peer_endorsement"
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "expired"
  
  // Contact information for verification
  verifierEmail: text("verifier_email"), // Email of person who can verify (supervisor, professor, etc.)
  verifierPhone: text("verifier_phone"),
  verifierName: text("verifier_name"),
  verifierTitle: text("verifier_title"), // "Manager", "Professor", "Parent", etc.
  verifierOrganization: text("verifier_organization"), // Company/School name
  
  // What's being verified
  claimTitle: text("claim_title").notNull(), // "Software Engineer at TechCorp", "BS Computer Science", etc.
  claimDescription: text("claim_description"), // Additional details about the claim
  claimStartDate: text("claim_start_date"), // When this position/education started
  claimEndDate: text("claim_end_date"), // When it ended (null for current)
  isCurrent: boolean("is_current").default(false), // Is this a current position/enrollment
  
  // Verification details
  verificationToken: text("verification_token").unique(), // Unique token sent to verifier
  verificationMethod: text("verification_method").default("email"), // "email", "phone", "document"
  verifierResponse: text("verifier_response"), // Verifier's response (yes/no/comments)
  verifierComments: text("verifier_comments"), // Additional verifier feedback
  
  // Timestamps and expiry
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at").notNull(), // Auto-expire after 30 days
  
  // Internal tracking
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  metadata: json("metadata"), // Additional data specific to verification type
});

// Document uploads for verification (diplomas, employment letters, etc.)
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  verificationRequestId: integer("verification_request_id").references(() => verificationRequests.id, { onDelete: "cascade" }).notNull(),
  uploaderId: integer("uploader_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // File details
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storageUrl: text("storage_url").notNull(),
  
  // Document metadata
  documentType: text("document_type").notNull(), // "diploma", "transcript", "employment_letter", "id_document"
  documentTitle: text("document_title"), // "Bachelor's Degree", "Employment Verification Letter"
  issuingOrganization: text("issuing_organization"), // University, Company, Government
  issueDate: text("issue_date"),
  
  // Review status
  reviewStatus: text("review_status").default("pending"), // "pending", "approved", "rejected", "suspicious"
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Peer endorsements - colleagues/classmates vouching for claims
export const peerEndorsements = pgTable("peer_endorsements", {
  id: serial("id").primaryKey(),
  endorserId: integer("endorser_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  endorsedUserId: integer("endorsed_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // What's being endorsed
  endorsementType: text("endorsement_type").notNull(), // "employment", "education", "skill", "character"
  claimId: integer("claim_id").references(() => verificationRequests.id), // Link to specific verification request
  endorsementTitle: text("endorsement_title").notNull(), // "Worked together at TechCorp", "Classmates in CS101"
  endorsementDescription: text("endorsement_description"), // Detailed endorsement
  
  // Relationship context
  relationshipType: text("relationship_type").notNull(), // "colleague", "classmate", "supervisor", "teammate"
  relationshipDuration: text("relationship_duration"), // "2 years", "1 semester"
  confidenceLevel: integer("confidence_level").notNull().default(5), // 1-10 scale
  
  // Status and timestamps
  status: text("status").default("active"), // "active", "withdrawn", "disputed"
  endorsedAt: timestamp("endorsed_at").defaultNow().notNull(),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawnReason: text("withdrawn_reason"),
});

// Guardian/supervisor approval system for minors and supervised accounts
export const guardianApprovals = pgTable("guardian_approvals", {
  id: serial("id").primaryKey(),
  wardId: integer("ward_id").references(() => users.id, { onDelete: "cascade" }).notNull(), // Person being supervised
  guardianId: integer("guardian_id").references(() => users.id, { onDelete: "cascade" }),
  guardianEmail: text("guardian_email").notNull(), // Guardian doesn't need to be a user
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone"),
  
  // Supervision details
  supervisionType: text("supervision_type").notNull(), // "parent", "legal_guardian", "academic_advisor", "manager"
  supervisionScope: text("supervision_scope").notNull(), // "full_profile", "basic_info", "academic_only", "professional_only"
  
  // Approval details
  approvalToken: text("approval_token").unique(), // Token sent to guardian for verification
  approvalStatus: text("approval_status").default("pending"), // "pending", "approved", "rejected", "expired"
  approvedAt: timestamp("approved_at"),
  approvalComments: text("approval_comments"),
  
  // Auto-expiry for minor protection (when they turn 18, graduate, etc.)
  expiresAt: timestamp("expires_at"),
  autoExpiry: boolean("auto_expiry").default(true), // Auto-expire when ward reaches certain age/status
  
  // Timestamps
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  lastContactAt: timestamp("last_contact_at"),
  remindersSent: integer("reminders_sent").default(0),
});

// Community challenges - users can flag suspicious information
export const communityReports = pgTable("community_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reportedUserId: integer("reported_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // What's being challenged
  reportType: text("report_type").notNull(), // "false_employment", "false_education", "false_identity", "suspicious_behavior"
  targetClaimId: integer("target_claim_id").references(() => verificationRequests.id), // Specific claim being challenged
  reportTitle: text("report_title").notNull(), // "Claims to work at company X but..."
  reportDescription: text("report_description").notNull(), // Detailed explanation
  
  // Evidence
  evidenceDescription: text("evidence_description"), // Description of contradictory evidence
  evidenceDocuments: json("evidence_documents").$type<string[]>().default([]), // URLs to uploaded evidence
  
  // Severity and priority
  severityLevel: text("severity_level").default("medium"), // "low", "medium", "high", "critical"
  confidenceLevel: integer("confidence_level").notNull().default(5), // 1-10 scale of reporter confidence
  
  // Investigation tracking
  status: text("status").default("open"), // "open", "investigating", "resolved", "dismissed", "escalated"
  assignedInvestigator: integer("assigned_investigator").references(() => users.id),
  investigationNotes: text("investigation_notes"),
  resolutionAction: text("resolution_action"), // "claim_removed", "user_warned", "no_action", "account_suspended"
  resolvedAt: timestamp("resolved_at"),
  
  // Community voting
  communityVotes: json("community_votes").$type<{
    supportCount: number;
    disputeCount: number;
    voterIds: number[];
  }>().default({ supportCount: 0, disputeCount: 0, voterIds: [] }),
  
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
});

// Verification scores and trust levels
export const userVerificationScores = pgTable("user_verification_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).unique().notNull(),
  
  // Overall scores
  overallTrustScore: integer("overall_trust_score").default(0), // 0-1000 point scale
  verificationLevel: text("verification_level").default("unverified"), // "unverified", "basic", "verified", "highly_verified"
  
  // Component scores
  employmentScore: integer("employment_score").default(0), // Points from employment verifications
  educationScore: integer("education_score").default(0), // Points from education verifications
  endorsementScore: integer("endorsement_score").default(0), // Points from peer endorsements
  documentScore: integer("document_score").default(0), // Points from document uploads
  communityScore: integer("community_score").default(0), // Points from community interactions
  
  // Penalty tracking
  reportedIssues: integer("reported_issues").default(0), // Number of community reports filed
  verifiedIssues: integer("verified_issues").default(0), // Number of reports confirmed
  penaltyPoints: integer("penalty_points").default(0), // Negative points from violations
  
  // Timestamps
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  
  // Score breakdown for transparency
  scoreBreakdown: json("score_breakdown").$type<{
    employment: { verified: number; pending: number; rejected: number };
    education: { verified: number; pending: number; rejected: number };
    endorsements: { received: number; given: number; quality: number };
    documents: { uploaded: number; verified: number; rejected: number };
    community: { reports_filed: number; accuracy_rate: number };
    penalties: { false_claims: number; spam_reports: number; violations: number };
  }>().default({
    employment: { verified: 0, pending: 0, rejected: 0 },
    education: { verified: 0, pending: 0, rejected: 0 },
    endorsements: { received: 0, given: 0, quality: 0 },
    documents: { uploaded: 0, verified: 0, rejected: 0 },
    community: { reports_filed: 0, accuracy_rate: 0 },
    penalties: { false_claims: 0, spam_reports: 0, violations: 0 }
  }),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sentMessages: many(messages),
  participations: many(conversationParticipants),
  acknowledgments: many(messageAcknowledgments),
  accessLogs: many(accessLogs),
  auditTrails: many(auditTrails),
  retentionPolicies: many(retentionPolicies),
  complianceReports: many(complianceReports),
  stories: many(stories),
  storyViews: many(storyViews),
  blockedUsers: many(userBlocks, { relationName: "blocker" }),
  blockedByUsers: many(userBlocks, { relationName: "blocked" }),
  // V5.0.0 Enhanced Compliance Relations
  privacyProfile: one(privacyProfiles),
  contentMaskingLogs: many(contentMaskingLogs),
  identityMappings: many(identityVault),
  createdPolicies: many(organizationalPolicies, { relationName: "creator" }),
  approvedPolicies: many(organizationalPolicies, { relationName: "approver" }),
  unmaskingRequests: many(unmaskingRequests, { relationName: "requester" }),
  approvedUnmaskingRequests: many(unmaskingRequests, { relationName: "approver" }),
  assignedDlpIncidents: many(dlpIncidents),
  // Verification System Relations
  verificationRequests: many(verificationRequests),
  uploadedVerificationDocuments: many(verificationDocuments),
  reviewedVerificationDocuments: many(verificationDocuments, { relationName: "reviewer" }),
  givenEndorsements: many(peerEndorsements, { relationName: "endorser" }),
  receivedEndorsements: many(peerEndorsements, { relationName: "endorsed" }),
  wardApprovals: many(guardianApprovals, { relationName: "ward" }),
  guardianApprovals: many(guardianApprovals, { relationName: "guardian" }),
  reportsFiled: many(communityReports, { relationName: "reporter" }),
  reportsReceived: many(communityReports, { relationName: "reported" }),
  assignedInvestigations: many(communityReports, { relationName: "investigator" }),
  verificationScore: one(userVerificationScores),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
  participants: many(conversationParticipants),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  files: many(files),
  acknowledgments: many(messageAcknowledgments),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  message: one(messages, {
    fields: [files.messageId],
    references: [messages.id],
  }),
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  shares: many(fileShares),
  accessLogs: many(fileAccessLogs),
}));

export const fileSharesRelations = relations(fileShares, ({ one, many }) => ({
  file: one(files, {
    fields: [fileShares.fileId],
    references: [files.id],
  }),
  creator: one(users, {
    fields: [fileShares.createdBy],
    references: [users.id],
  }),
  accessPermissions: many(fileShareAccess),
  accessLogs: many(fileAccessLogs),
}));

export const fileShareAccessRelations = relations(fileShareAccess, ({ one }) => ({
  share: one(fileShares, {
    fields: [fileShareAccess.shareId],
    references: [fileShares.id],
  }),
  user: one(users, {
    fields: [fileShareAccess.userId],
    references: [users.id],
  }),
}));

export const fileAccessLogsRelations = relations(fileAccessLogs, ({ one }) => ({
  file: one(files, {
    fields: [fileAccessLogs.fileId],
    references: [files.id],
  }),
  share: one(fileShares, {
    fields: [fileAccessLogs.shareId],
    references: [fileShares.id],
  }),
  user: one(users, {
    fields: [fileAccessLogs.userId],
    references: [users.id],
  }),
}));

export const messageAcknowledgmentsRelations = relations(messageAcknowledgments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAcknowledgments.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageAcknowledgments.userId],
    references: [users.id],
  }),
}));

export const retentionPoliciesRelations = relations(retentionPolicies, ({ one }) => ({
  creator: one(users, {
    fields: [retentionPolicies.createdBy],
    references: [users.id],
  }),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
}));

export const auditTrailsRelations = relations(auditTrails, ({ one }) => ({
  user: one(users, {
    fields: [auditTrails.userId],
    references: [users.id],
  }),
}));

export const complianceReportsRelations = relations(complianceReports, ({ one }) => ({
  generator: one(users, {
    fields: [complianceReports.generatedBy],
    references: [users.id],
  }),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  views: many(storyViews),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  story: one(stories, {
    fields: [storyViews.storyId],
    references: [stories.id],
  }),
  viewer: one(users, {
    fields: [storyViews.viewerId],
    references: [users.id],
  }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [userBlocks.blockerId],
    references: [users.id],
    relationName: "blocker",
  }),
  blocked: one(users, {
    fields: [userBlocks.blockedId],
    references: [users.id],
    relationName: "blocked",
  }),
}));

// Profile Relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const contactRelationshipsRelations = relations(contactRelationships, ({ one }) => ({
  user: one(users, {
    fields: [contactRelationships.userId],
    references: [users.id],
    relationName: "user",
  }),
  contact: one(users, {
    fields: [contactRelationships.contactId],
    references: [users.id],
    relationName: "contact",
  }),
}));

export const contactInvitationsRelations = relations(contactInvitations, ({ one }) => ({
  inviter: one(users, {
    fields: [contactInvitations.inviterUserId],
    references: [users.id],
  }),
}));

// V5.0.0 Enhanced Compliance Relations
export const privacyProfilesRelations = relations(privacyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [privacyProfiles.userId],
    references: [users.id],
  }),
}));

export const contentMaskingLogsRelations = relations(contentMaskingLogs, ({ one }) => ({
  message: one(messages, {
    fields: [contentMaskingLogs.messageId],
    references: [messages.id],
  }),
  file: one(files, {
    fields: [contentMaskingLogs.fileId],
    references: [files.id],
  }),
  user: one(users, {
    fields: [contentMaskingLogs.userId],
    references: [users.id],
  }),
  maskingRule: one(organizationalPolicies, {
    fields: [contentMaskingLogs.maskingRuleId],
    references: [organizationalPolicies.id],
  }),
  reviewer: one(users, {
    fields: [contentMaskingLogs.reviewedBy],
    references: [users.id],
  }),
}));

export const identityVaultRelations = relations(identityVault, ({ one }) => ({
  realUser: one(users, {
    fields: [identityVault.realUserId],
    references: [users.id],
  }),
}));

export const organizationalPoliciesRelations = relations(organizationalPolicies, ({ one, many }) => ({
  creator: one(users, {
    fields: [organizationalPolicies.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
  approver: one(users, {
    fields: [organizationalPolicies.approvedBy],
    references: [users.id],
    relationName: "approver",
  }),
  maskingLogs: many(contentMaskingLogs),
  dlpIncidents: many(dlpIncidents),
}));

export const unmaskingRequestsRelations = relations(unmaskingRequests, ({ one }) => ({
  requester: one(users, {
    fields: [unmaskingRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  approver: one(users, {
    fields: [unmaskingRequests.approvedBy],
    references: [users.id],
    relationName: "approver",
  }),
  targetUser: one(users, {
    fields: [unmaskingRequests.targetUserId],
    references: [users.id],
  }),
  targetMessage: one(messages, {
    fields: [unmaskingRequests.targetMessageId],
    references: [messages.id],
  }),
  targetFile: one(files, {
    fields: [unmaskingRequests.targetFileId],
    references: [files.id],
  }),
}));

export const dlpIncidentsRelations = relations(dlpIncidents, ({ one }) => ({
  user: one(users, {
    fields: [dlpIncidents.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [dlpIncidents.messageId],
    references: [messages.id],
  }),
  file: one(files, {
    fields: [dlpIncidents.fileId],
    references: [files.id],
  }),
  violatedPolicy: one(organizationalPolicies, {
    fields: [dlpIncidents.policyViolated],
    references: [organizationalPolicies.id],
  }),
  assignee: one(users, {
    fields: [dlpIncidents.assignedTo],
    references: [users.id],
  }),
}));

export const retentionNotificationsRelations = relations(retentionNotifications, ({ one }) => ({
  policy: one(retentionPolicies, {
    fields: [retentionNotifications.policyId],
    references: [retentionPolicies.id],
  }),
  message: one(messages, {
    fields: [retentionNotifications.messageId],
    references: [messages.id],
  }),
  file: one(files, {
    fields: [retentionNotifications.fileId],
    references: [files.id],
  }),
  confirmer: one(users, {
    fields: [retentionNotifications.confirmedBy],
    references: [users.id],
  }),
}));

// ========== VERIFICATION SYSTEM RELATIONS ==========
export const verificationRequestsRelations = relations(verificationRequests, ({ one, many }) => ({
  requester: one(users, {
    fields: [verificationRequests.requesterId],
    references: [users.id],
  }),
  documents: many(verificationDocuments),
  endorsements: many(peerEndorsements),
  reports: many(communityReports),
}));

export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  verificationRequest: one(verificationRequests, {
    fields: [verificationDocuments.verificationRequestId],
    references: [verificationRequests.id],
  }),
  uploader: one(users, {
    fields: [verificationDocuments.uploaderId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [verificationDocuments.reviewedBy],
    references: [users.id],
  }),
}));

export const peerEndorsementsRelations = relations(peerEndorsements, ({ one }) => ({
  endorser: one(users, {
    fields: [peerEndorsements.endorserId],
    references: [users.id],
    relationName: "endorser",
  }),
  endorsedUser: one(users, {
    fields: [peerEndorsements.endorsedUserId],
    references: [users.id],
    relationName: "endorsed",
  }),
  claim: one(verificationRequests, {
    fields: [peerEndorsements.claimId],
    references: [verificationRequests.id],
  }),
}));

export const guardianApprovalsRelations = relations(guardianApprovals, ({ one }) => ({
  ward: one(users, {
    fields: [guardianApprovals.wardId],
    references: [users.id],
    relationName: "ward",
  }),
  guardian: one(users, {
    fields: [guardianApprovals.guardianId],
    references: [users.id],
    relationName: "guardian",
  }),
}));

export const communityReportsRelations = relations(communityReports, ({ one }) => ({
  reporter: one(users, {
    fields: [communityReports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reportedUser: one(users, {
    fields: [communityReports.reportedUserId],
    references: [users.id],
    relationName: "reported",
  }),
  investigator: one(users, {
    fields: [communityReports.assignedInvestigator],
    references: [users.id],
    relationName: "investigator",
  }),
  targetClaim: one(verificationRequests, {
    fields: [communityReports.targetClaimId],
    references: [verificationRequests.id],
  }),
}));

export const userVerificationScoresRelations = relations(userVerificationScores, ({ one }) => ({
  user: one(users, {
    fields: [userVerificationScores.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isOnline: true,
  lastSeen: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isEdited: true,
  isDeleted: true,
  readBy: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
});

export const insertFileShareSchema = createInsertSchema(fileShares).omit({
  id: true,
  shareId: true,
  currentViews: true,
  createdAt: true,
});

export const insertFileShareAccessSchema = createInsertSchema(fileShareAccess).omit({
  id: true,
  createdAt: true,
});

export const insertFileAccessLogSchema = createInsertSchema(fileAccessLogs).omit({
  id: true,
  timestamp: true,
});

export const insertMessageAcknowledgmentSchema = createInsertSchema(messageAcknowledgments).omit({
  id: true,
  acknowledgedAt: true,
});

export const insertRetentionPolicySchema = createInsertSchema(retentionPolicies).omit({
  id: true,
  createdAt: true,
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAuditTrailSchema = createInsertSchema(auditTrails).omit({
  id: true,
  timestamp: true,
});

export const insertComplianceReportSchema = createInsertSchema(complianceReports).omit({
  id: true,
  generatedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertStoryViewSchema = createInsertSchema(storyViews).omit({
  id: true,
  viewedAt: true,
});

export const insertUserBlockSchema = createInsertSchema(userBlocks).omit({
  id: true,
  createdAt: true,
});

// Profile Schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactRelationshipSchema = createInsertSchema(contactRelationships).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
});

export const insertContactInvitationSchema = createInsertSchema(contactInvitations).omit({
  id: true,
  createdAt: true,
  usedAt: true,
  currentUses: true,
});

// V5.0.0 Enhanced Compliance Schemas
export const insertPrivacyProfileSchema = createInsertSchema(privacyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentMaskingLogSchema = createInsertSchema(contentMaskingLogs).omit({
  id: true,
  createdAt: true,
});

export const insertIdentityVaultSchema = createInsertSchema(identityVault).omit({
  id: true,
  createdAt: true,
  lastAccessed: true,
});

export const insertOrganizationalPolicySchema = createInsertSchema(organizationalPolicies).omit({
  id: true,
  createdAt: true,
  lastModified: true,
});

export const insertUnmaskingRequestSchema = createInsertSchema(unmaskingRequests).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceMetricsSchema = createInsertSchema(complianceMetrics).omit({
  id: true,
  recordedAt: true,
});

export const insertDlpIncidentSchema = createInsertSchema(dlpIncidents).omit({
  id: true,
  createdAt: true,
});

export const insertRetentionNotificationSchema = createInsertSchema(retentionNotifications).omit({
  id: true,
  createdAt: true,
});

// Verification System Schemas
export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertPeerEndorsementSchema = createInsertSchema(peerEndorsements).omit({
  id: true,
  createdAt: true,
});

export const insertGuardianApprovalSchema = createInsertSchema(guardianApprovals).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityReportSchema = createInsertSchema(communityReports).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertUserVerificationScoreSchema = createInsertSchema(userVerificationScores).omit({
  id: true,
  lastCalculated: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type FileShare = typeof fileShares.$inferSelect;
export type InsertFileShare = z.infer<typeof insertFileShareSchema>;

export type FileShareAccess = typeof fileShareAccess.$inferSelect;
export type InsertFileShareAccess = z.infer<typeof insertFileShareAccessSchema>;

export type FileAccessLog = typeof fileAccessLogs.$inferSelect;
export type InsertFileAccessLog = z.infer<typeof insertFileAccessLogSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type MessageAcknowledgment = typeof messageAcknowledgments.$inferSelect;
export type InsertMessageAcknowledgment = z.infer<typeof insertMessageAcknowledgmentSchema>;
export type RetentionPolicy = typeof retentionPolicies.$inferSelect;
export type InsertRetentionPolicy = z.infer<typeof insertRetentionPolicySchema>;
export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AuditTrail = typeof auditTrails.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type ComplianceReport = typeof complianceReports.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = z.infer<typeof insertStoryViewSchema>;
export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;

// Profile Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type ContactRelationship = typeof contactRelationships.$inferSelect;
export type InsertContactRelationship = z.infer<typeof insertContactRelationshipSchema>;

export type ContactInvitation = typeof contactInvitations.$inferSelect;
export type InsertContactInvitation = z.infer<typeof insertContactInvitationSchema>;

// V5.0.0 Enhanced Compliance Types
export type PrivacyProfile = typeof privacyProfiles.$inferSelect;
export type InsertPrivacyProfile = z.infer<typeof insertPrivacyProfileSchema>;
export type ContentMaskingLog = typeof contentMaskingLogs.$inferSelect;
export type InsertContentMaskingLog = z.infer<typeof insertContentMaskingLogSchema>;
export type IdentityVault = typeof identityVault.$inferSelect;
export type InsertIdentityVault = z.infer<typeof insertIdentityVaultSchema>;
export type OrganizationalPolicy = typeof organizationalPolicies.$inferSelect;
export type InsertOrganizationalPolicy = z.infer<typeof insertOrganizationalPolicySchema>;
export type UnmaskingRequest = typeof unmaskingRequests.$inferSelect;
export type InsertUnmaskingRequest = z.infer<typeof insertUnmaskingRequestSchema>;
export type ComplianceMetrics = typeof complianceMetrics.$inferSelect;
export type InsertComplianceMetrics = z.infer<typeof insertComplianceMetricsSchema>;
export type DlpIncident = typeof dlpIncidents.$inferSelect;
export type InsertDlpIncident = z.infer<typeof insertDlpIncidentSchema>;
export type RetentionNotification = typeof retentionNotifications.$inferSelect;
export type InsertRetentionNotification = z.infer<typeof insertRetentionNotificationSchema>;

// Verification System Types
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type PeerEndorsement = typeof peerEndorsements.$inferSelect;
export type InsertPeerEndorsement = z.infer<typeof insertPeerEndorsementSchema>;
export type GuardianApproval = typeof guardianApprovals.$inferSelect;
export type InsertGuardianApproval = z.infer<typeof insertGuardianApprovalSchema>;
export type CommunityReport = typeof communityReports.$inferSelect;
export type InsertCommunityReport = z.infer<typeof insertCommunityReportSchema>;
export type UserVerificationScore = typeof userVerificationScores.$inferSelect;
export type InsertUserVerificationScore = z.infer<typeof insertUserVerificationScoreSchema>;

// Enums for consistent values
export const MessageClassification = {
  POLICY_NOTIFICATION: "Policy_Notification",
  AUDIT_NOTICE: "Audit_Notice",
  CORRECTIVE_ACTION: "Corrective_Action",
  SECURITY_ALERT: "Security_Alert",
  COMPLIANCE_REQUIREMENT: "Compliance_Requirement",
  GENERAL: "General",
} as const;

export const UserRole = {
  USER: "user",
  ADMIN: "admin",
  COMPLIANCE_OFFICER: "compliance_officer",
  AUDITOR: "auditor",
} as const;

export const AccessAction = {
  VIEW: "view",
  DOWNLOAD: "download",
  EDIT: "edit",
  DELETE: "delete",
  EXPORT: "export",
  ACKNOWLEDGE: "acknowledge",
} as const;

export const StoryMediaType = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
  AUDIO: "audio",
} as const;

export const StoryVisibility = {
  PUBLIC: "public",
  PRIVATE: "private",
  HIDDEN: "hidden",
} as const;

// V5.0.0 Enhanced Compliance Enums
export const PrivacyProfileType = {
  STRICT: "strict",
  MODERATE: "moderate", 
  LENIENT: "lenient",
  CUSTOM: "custom",
} as const;

export const DataType = {
  PII: "pii",
  PHI: "phi",
  FINANCIAL: "financial",
  CREDIT_CARD: "credit_card",
  SSN: "ssn",
  EMAIL: "email",
  PHONE: "phone",
  IP_ADDRESS: "ip_address",
} as const;

export const PolicyType = {
  MASKING_RULE: "masking_rule",
  RETENTION_POLICY: "retention_policy",
  ACCESS_CONTROL: "access_control",
  DLP_RULE: "dlp_rule",
} as const;

export const IncidentSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const RequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FULFILLED: "fulfilled",
} as const;

export const DlpAction = {
  BLOCKED: "blocked",
  MASKED: "masked",
  FLAGGED: "flagged",
  ALLOWED_WITH_WARNING: "allowed_with_warning",
} as const;
