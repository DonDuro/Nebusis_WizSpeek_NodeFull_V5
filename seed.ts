import { db } from "./server/db";
import { eq } from "drizzle-orm";
import { 
  users, 
  conversations, 
  conversationParticipants, 
  messages,
  stories,
  storyViews,
  userBlocks,
  files,
  fileShares,
  fileShareAccess,
  fileAccessLogs,
  messageAcknowledgments,
  retentionPolicies,
  accessLogs,
  auditTrails,
  complianceReports,
  passwordResetTokens,
  // V5.0.0 Enhanced Compliance Tables
  privacyProfiles,
  contentMaskingLogs,
  identityVault,
  organizationalPolicies,
  unmaskingRequests,
  complianceMetrics,
  dlpIncidents,
  retentionNotifications,
  // Profile Management Tables
  userProfiles,
  contactRelationships
} from "./shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting seed process...");

  try {
    // Clear existing data in proper order to avoid foreign key constraints
    await db.delete(passwordResetTokens);
    // V5.0.0 Enhanced Compliance Tables
    await db.delete(retentionNotifications);
    await db.delete(dlpIncidents);
    await db.delete(complianceMetrics);
    await db.delete(unmaskingRequests);
    await db.delete(contentMaskingLogs);
    await db.delete(identityVault);
    await db.delete(organizationalPolicies);
    await db.delete(privacyProfiles);
    // Existing tables
    await db.delete(complianceReports);
    await db.delete(auditTrails);
    await db.delete(accessLogs);
    await db.delete(retentionPolicies);
    await db.delete(messageAcknowledgments);
    await db.delete(fileAccessLogs);
    await db.delete(fileShareAccess);
    await db.delete(fileShares);
    await db.delete(files);
    await db.delete(storyViews);
    await db.delete(stories);
    await db.delete(userBlocks);
    await db.delete(messages);
    await db.delete(conversationParticipants);
    await db.delete(conversations);
    await db.delete(users);
    
    console.log("🗑️  Cleared existing data");

    // Create users
    const hashedPassword = await bcrypt.hash("password", 10);
    const adminPassword = await bcrypt.hash("NewSecurePassword2025!", 10);

    const seedUsers = [
      {
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        role: "user" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
        department: "Development"
      },
      {
        username: "calvarado",
        email: "calvarado@nebusis.com", 
        password: adminPassword,
        role: "admin" as const,
        avatar: "/attached_assets/Celso Professional_1752971797358.jpg",
        department: "Executive Leadership"
      },
      {
        username: "dzambrano",
        email: "dzambrano@nebusis.com",
        password: adminPassword,
        role: "admin" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dzambrano", 
        department: "Executive Leadership"
      },
      {
        username: "alice",
        email: "alice@example.com",
        password: hashedPassword,
        role: "user" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        department: "Marketing"
      },
      {
        username: "bob",
        email: "bob@example.com",
        password: hashedPassword,
        role: "user" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        department: "Sales"
      },
      {
        username: "charlie",
        email: "charlie@example.com",
        password: hashedPassword,
        role: "user" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
        department: "Engineering"
      },
      {
        username: "blockeduser",
        email: "blocked@example.com",
        password: hashedPassword,
        role: "user" as const,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockeduser",
        department: "Support"
      }
    ];

    const insertedUsers = await db.insert(users).values(seedUsers).returning();
    console.log(`👥 Created ${insertedUsers.length} users`);

    // Ban the test user to demonstrate admin functionality
    await db.update(users)
      .set({
        isBanned: true,
        bannedAt: new Date(),
        bannedBy: insertedUsers[1].id, // calvarado (admin)
        banReason: "Violation of community guidelines - demo ban"
      })
      .where(eq(users.username, "blockeduser"));
    
    console.log("🔨 Banned test user for demo purposes");

    // Create stories
    const storyData = [
      {
        userId: insertedUsers[0].id, // testuser
        mediaType: "text" as const,
        caption: "Welcome to WizSpeek! Check out our new Stories feature 🎉",
        backgroundColor: "#2E5A87",
        visibility: "public" as const,
        hiddenFromUsers: [],
        mediaUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        userId: insertedUsers[3].id, // alice
        mediaType: "text" as const,
        caption: "Just launched our new marketing campaign! So excited to see the results.",
        backgroundColor: "#E74C3C",
        visibility: "public" as const,
        hiddenFromUsers: [],
        mediaUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        userId: insertedUsers[4].id, // bob
        mediaType: "text" as const,
        caption: "Closed 3 deals today! Team work makes the dream work 💪",
        backgroundColor: "#27AE60",
        visibility: "public" as const,
        hiddenFromUsers: [],
        mediaUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        userId: insertedUsers[5].id, // charlie
        mediaType: "text" as const,
        caption: "Working on some exciting new features. Stay tuned! 🚀",
        backgroundColor: "#8E44AD",
        visibility: "public" as const,
        hiddenFromUsers: [],
        mediaUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        userId: insertedUsers[1].id, // calvarado (admin)
        mediaType: "text" as const,
        caption: "Admin announcement: New compliance features now live! 📋",
        backgroundColor: "#F39C12",
        visibility: "public" as const,
        hiddenFromUsers: [],
        mediaUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];

    const insertedStories = await db.insert(stories).values(storyData).returning();
    console.log(`📖 Created ${insertedStories.length} stories`);

    // Create story views (simulating "seen by" functionality)
    const storyViewData = [
      // testuser's story viewed by alice, bob, charlie
      { storyId: insertedStories[0].id, viewerId: insertedUsers[3].id },
      { storyId: insertedStories[0].id, viewerId: insertedUsers[4].id },
      { storyId: insertedStories[0].id, viewerId: insertedUsers[5].id },
      
      // alice's story viewed by testuser, bob
      { storyId: insertedStories[1].id, viewerId: insertedUsers[0].id },
      { storyId: insertedStories[1].id, viewerId: insertedUsers[4].id },
      
      // bob's story viewed by alice, charlie
      { storyId: insertedStories[2].id, viewerId: insertedUsers[3].id },
      { storyId: insertedStories[2].id, viewerId: insertedUsers[5].id },
      
      // charlie's story viewed by testuser
      { storyId: insertedStories[3].id, viewerId: insertedUsers[0].id },
      
      // admin story viewed by everyone
      { storyId: insertedStories[4].id, viewerId: insertedUsers[0].id },
      { storyId: insertedStories[4].id, viewerId: insertedUsers[3].id },
      { storyId: insertedStories[4].id, viewerId: insertedUsers[4].id },
      { storyId: insertedStories[4].id, viewerId: insertedUsers[5].id }
    ];

    const insertedStoryViews = await db.insert(storyViews).values(storyViewData).returning();
    console.log(`👁️  Created ${insertedStoryViews.length} story views`);

    // Create user blocks (Instagram-style blocking)
    const blockData = [
      {
        blockerId: insertedUsers[0].id, // testuser blocks blockeduser
        blockedId: insertedUsers[6].id,
        reason: "Inappropriate messages"
      },
      {
        blockerId: insertedUsers[3].id, // alice blocks charlie
        blockedId: insertedUsers[5].id,
        reason: "Personal conflict"
      }
    ];

    const insertedBlocks = await db.insert(userBlocks).values(blockData).returning();
    console.log(`🚫 Created ${insertedBlocks.length} user blocks`);

    // Create conversations
    const conversationData = [
      {
        name: "General Discussion",
        type: "group" as const,
        createdBy: insertedUsers[0].id,
        isEncrypted: true
      },
      {
        name: "Admin Team",
        type: "group" as const,
        createdBy: insertedUsers[1].id,
        isEncrypted: true
      },
      {
        name: "Stories Feature Demo",
        type: "group" as const,
        createdBy: insertedUsers[0].id,
        isEncrypted: true
      },
      {
        name: null, // Direct message between calvarado and testuser
        type: "direct" as const,
        createdBy: insertedUsers[1].id, // calvarado
        isEncrypted: true
      },
      {
        name: null, // Direct message between calvarado and alice
        type: "direct" as const,
        createdBy: insertedUsers[1].id, // calvarado
        isEncrypted: true
      }
    ];

    const insertedConversations = await db.insert(conversations).values(conversationData).returning();
    console.log(`💬 Created ${insertedConversations.length} conversations`);

    // Create participants
    const participantData = [
      // General Discussion participants
      { conversationId: insertedConversations[0].id, userId: insertedUsers[0].id, role: "admin" as const },
      { conversationId: insertedConversations[0].id, userId: insertedUsers[3].id, role: "member" as const },
      { conversationId: insertedConversations[0].id, userId: insertedUsers[4].id, role: "member" as const },
      { conversationId: insertedConversations[0].id, userId: insertedUsers[5].id, role: "member" as const },
      
      // Admin Team participants
      { conversationId: insertedConversations[1].id, userId: insertedUsers[1].id, role: "admin" as const },
      { conversationId: insertedConversations[1].id, userId: insertedUsers[2].id, role: "admin" as const },
      
      // Stories Feature Demo participants
      { conversationId: insertedConversations[2].id, userId: insertedUsers[0].id, role: "admin" as const },
      { conversationId: insertedConversations[2].id, userId: insertedUsers[1].id, role: "member" as const },
      { conversationId: insertedConversations[2].id, userId: insertedUsers[3].id, role: "member" as const },
      
      // Direct message: calvarado and testuser
      { conversationId: insertedConversations[3].id, userId: insertedUsers[1].id, role: "member" as const }, // calvarado
      { conversationId: insertedConversations[3].id, userId: insertedUsers[0].id, role: "member" as const }, // testuser
      
      // Direct message: calvarado and alice
      { conversationId: insertedConversations[4].id, userId: insertedUsers[1].id, role: "member" as const }, // calvarado
      { conversationId: insertedConversations[4].id, userId: insertedUsers[3].id, role: "member" as const }, // alice
    ];

    const insertedParticipants = await db.insert(conversationParticipants).values(participantData).returning();
    console.log(`👥 Created ${insertedParticipants.length} participants`);

    // Create messages
    const messageData = [
      {
        conversationId: insertedConversations[2].id,
        senderId: insertedUsers[0].id,
        content: "Hey everyone! 👋 Welcome to the new Stories feature demo! This is where we'll test the mandatory 'seen by' functionality.",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[2].id,
        senderId: insertedUsers[1].id,
        content: "Great work on implementing Stories! The 'seen by' tracking is working perfectly. Users can now see who viewed their stories.",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[2].id,
        senderId: insertedUsers[3].id,
        content: "I love how it shows the view count and individual viewers! Very similar to Instagram Stories but with our WizSpeek branding 😊",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[1].id,
        senderId: insertedUsers[1].id,
        content: "Admin notice: New user management features are live. We can now ban/unban users and see detailed user analytics.",
        messageType: "text" as const,
        classification: "policy_notification" as const,
        priority: "high" as const,
        requiresAcknowledgment: true
      },
      {
        conversationId: insertedConversations[1].id,
        senderId: insertedUsers[2].id,
        content: "Perfect! The user blocking system is also working great. Users can block each other Instagram-style with reasons.",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[3].id, // Direct message: calvarado -> testuser
        senderId: insertedUsers[1].id, // calvarado
        content: "Hi! Thanks for all the great testing work on WizSpeek®. The new features are looking fantastic.",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[3].id, // Direct message: testuser -> calvarado
        senderId: insertedUsers[0].id, // testuser
        content: "Thank you! I'm excited about the Stories feature and the admin controls. Everything feels very professional.",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[4].id, // Direct message: calvarado -> alice
        senderId: insertedUsers[1].id, // calvarado
        content: "Alice, could you help review the marketing materials for our WizSpeek® launch?",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      },
      {
        conversationId: insertedConversations[4].id, // Direct message: alice -> calvarado
        senderId: insertedUsers[3].id, // alice
        content: "Absolutely! I'll review them this afternoon and send you my feedback.",
        messageType: "text" as const,
        classification: "general" as const,
        priority: "normal" as const
      }
    ];

    const insertedMessages = await db.insert(messages).values(messageData).returning();
    const seedMessages = insertedMessages; // Store for V5.0.0 compliance data
    console.log(`📨 Created ${insertedMessages.length} messages`);

    // V5.0.0 Enhanced Compliance Seed Data
    
    // Privacy Profiles for Demo Users
    const privacyProfilesData = [
      {
        userId: insertedUsers[1].id, // calvarado
        profileName: "strict",
        maskPII: true,
        maskPHI: true,
        maskFinancial: true,
        ghostMode: false,
        anonymousChat: false,
        metadataMinimization: true,
        ephemeralMessages: false,
        ephemeralDuration: 24,
      },
      {
        userId: insertedUsers[2].id, // dzambrano
        profileName: "moderate",
        maskPII: true,
        maskPHI: true,
        maskFinancial: false,
        ghostMode: false,
        anonymousChat: false,
        metadataMinimization: true,
        ephemeralMessages: false,
        ephemeralDuration: 48,
      },
      {
        userId: insertedUsers[0].id, // testuser
        profileName: "custom",
        maskPII: false,
        maskPHI: true,
        maskFinancial: true,
        ghostMode: false,
        anonymousChat: true,
        metadataMinimization: false,
        ephemeralMessages: true,
        ephemeralDuration: 12,
      }
    ];

    const seedPrivacyProfiles = await db.insert(privacyProfiles).values(privacyProfilesData).returning();
    console.log(`📊 Created ${seedPrivacyProfiles.length} privacy profiles`);

    // Organizational Policies
    const organizationalPoliciesData = [
      {
        policyName: "Data Masking for Healthcare Communications",
        policyType: "masking_rule",
        description: "Automatically mask PHI and PII in healthcare-related conversations",
        ruleConfiguration: {
          maskingLevel: "strict",
          autoEnforce: true,
          alertThreshold: 3,
          dataTypes: ["phi", "pii", "ssn"]
        },
        departments: ["Healthcare", "Medical"],
        userRoles: ["user", "admin"],
        severity: "high",
        isActive: true,
        autoEnforce: true,
        requiresApproval: false,
        createdBy: insertedUsers[1].id,
        approvedBy: insertedUsers[1].id,
      },
      {
        policyName: "Financial Data Protection Policy",
        policyType: "dlp_rule",
        description: "Prevent leakage of financial information and credit card data",
        ruleConfiguration: {
          maskingLevel: "strict",
          autoEnforce: true,
          alertThreshold: 1,
          dataTypes: ["financial", "credit_card"]
        },
        departments: ["Finance", "Accounting"],
        userRoles: ["user", "admin", "compliance_officer"],
        severity: "critical",
        isActive: true,
        autoEnforce: true,
        requiresApproval: true,
        createdBy: insertedUsers[2].id,
        approvedBy: insertedUsers[1].id,
      },
      {
        policyName: "Enhanced Message Retention for Compliance",
        policyType: "retention_policy",
        description: "Extended retention for compliance-critical communications",
        ruleConfiguration: {
          retentionDays: 2555, // 7 years
          autoDelete: false,
          requiresConfirmation: true
        },
        departments: ["Legal", "Compliance"],
        userRoles: ["compliance_officer", "auditor", "admin"],
        severity: "medium",
        isActive: true,
        autoEnforce: false,
        requiresApproval: true,
        createdBy: insertedUsers[1].id,
        approvedBy: insertedUsers[2].id,
      }
    ];

    const seedPolicies = await db.insert(organizationalPolicies).values(organizationalPoliciesData).returning();
    console.log(`🏛️ Created ${seedPolicies.length} organizational policies`);

    // Compliance Metrics
    const complianceMetricsData = [
      {
        metricType: "masking_usage",
        metricName: "PHI_masked_daily",
        value: "247",
        unit: "count",
        department: "Healthcare",
        timeframe: "daily",
        metadata: { source: "privacy_engine", automated: true }
      },
      {
        metricType: "policy_violations",
        metricName: "DLP_violations_weekly",
        value: "3",
        unit: "count",
        timeframe: "weekly",
        metadata: { severity: "medium", trend: "decreasing" }
      },
      {
        metricType: "access_patterns",
        metricName: "unmasking_requests_monthly",
        value: "12",
        unit: "count",
        timeframe: "monthly",
        metadata: { approved: 8, rejected: 4 }
      },
      {
        metricType: "compliance_monitoring",
        metricName: "retention_compliance_rate",
        value: "94.7",
        unit: "percentage",
        timeframe: "quarterly",
        metadata: { target: 95.0, status: "approaching_target" }
      }
    ];

    const seedMetrics = await db.insert(complianceMetrics).values(complianceMetricsData).returning();
    console.log(`📈 Created ${seedMetrics.length} compliance metrics`);

    // Sample DLP Incidents
    const dlpIncidentsData = [
      {
        incidentType: "sensitive_data_leak",
        severity: "medium",
        userId: insertedUsers[0].id,
        messageId: seedMessages[2].id, // Link to a demo message
        detectedContent: "Message contained masked credit card information: ****-****-****-1234",
        actionTaken: "masked",
        reviewStatus: "resolved",
        assignedTo: insertedUsers[1].id,
        resolution: "Content automatically masked by privacy engine. User educated on data handling policies.",
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        incidentType: "policy_violation",
        severity: "low",
        userId: insertedUsers[3].id,
        detectedContent: "Attempted to share PHI without proper authorization level",
        policyViolated: seedPolicies[0].id,
        actionTaken: "flagged",
        reviewStatus: "investigating",
        assignedTo: insertedUsers[2].id,
      }
    ];

    const seedIncidents = await db.insert(dlpIncidents).values(dlpIncidentsData).returning();
    console.log(`🚨 Created ${seedIncidents.length} DLP incidents`);

    // Sample Content Masking Logs
    const maskingLogsData = [
      {
        userId: insertedUsers[0].id,
        messageId: seedMessages[0].id,
        detectedDataType: "email",
        originalValue: "encrypted_email_placeholder", // Would be encrypted in real scenario
        maskedValue: "u***@example.com",
        maskingRuleId: seedPolicies[0].id,
        confidence: 95,
        reviewStatus: "approved",
        reviewedBy: insertedUsers[1].id,
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: insertedUsers[3].id,
        messageId: seedMessages[1].id,
        detectedDataType: "phone",
        originalValue: "encrypted_phone_placeholder",
        maskedValue: "(***) ***-1234",
        maskingRuleId: seedPolicies[0].id,
        confidence: 92,
        reviewStatus: "pending",
      }
    ];

    const seedMaskingLogs = await db.insert(contentMaskingLogs).values(maskingLogsData).returning();
    console.log(`🎭 Created ${seedMaskingLogs.length} content masking logs`);

    // User Profile Information with Privacy Controls
    const userProfilesData = [
      {
        userId: insertedUsers[1].id, // calvarado (admin)
        useGeneralDescriptors: false, // Admin uses specific details
        personalInterests: "Technology innovation, cybersecurity, team leadership, hiking",
        personalBio: "Passionate about building secure communication platforms. Love outdoor adventures and mentoring tech teams.",
        personalWebsite: "https://carlos-alvarado.dev",
        age: 42,
        ageDisclosure: "specific",
        gender: "male",
        maritalStatus: "married",
        personalPictures: [],
        professionalPictures: [],
        primaryPersonalPic: 0,
        primaryProfessionalPic: 0,
        mainProfilePic: { category: "personal", index: 0 },
        workHistory: [
          {
            company: "Nebusis Inc",
            position: "CEO & Founder",
            startDate: "2020-01",
            endDate: "",
            description: "Founded and leading a secure communication platform startup. Built team from 0 to 25 employees, raised $5M Series A.",
            current: true
          },
          {
            company: "TechSecure Solutions",
            position: "CTO",
            startDate: "2017-06",
            endDate: "2019-12",
            description: "Led technical architecture for enterprise security solutions. Managed team of 15 engineers, implemented zero-trust security model.",
            current: false
          }
        ],
        jobTitle: "CEO & Founder",
        company: "Nebusis Corporation",
        professionalBio: "Leading enterprise security solutions with 15+ years in cybersecurity and product development.",
        workExperience: "Former CTO at TechSecure Inc, Senior Security Architect at DataShield",
        professionalWebsite: "https://nebusis.com",
        linkedInProfile: "https://linkedin.com/in/carlos-alvarado-ceo",
        education: "Stanford University, MS Computer Science; MIT, BS Computer Engineering",
        skills: "Enterprise Security, Product Management, Team Leadership, React/Node.js",
        languages: "English (Native), Spanish (Native), Portuguese (Conversational)",
        certifications: "CISSP, AWS Solutions Architect, Certified Ethical Hacker",
        achievements: "Founded 3 successful startups, 50+ cybersecurity patents",
        generalLocation: "San Francisco Bay Area, California"
      },
      {
        userId: insertedUsers[0].id, // testuser
        useGeneralDescriptors: true, // Uses privacy mode
        personalInterests: "Creative writing, photography, urban exploration",
        personalBio: "Explorer of digital creativity and visual storytelling.",
        ageDisclosure: "adult_minor",
        ageCategory: "adult",
        gender: "non-binary",
        maritalStatus: "single",
        personalPictures: [],
        professionalPictures: [],
        primaryPersonalPic: 0,
        primaryProfessionalPic: 0,
        mainProfilePic: { category: "professional", index: 0 },
        workHistory: [
          {
            company: "Tech Startup",
            position: "Software Developer",
            startDate: "2022-03",
            endDate: "",
            description: "Full-stack development using React, Node.js, and PostgreSQL. Built user interfaces and APIs for web applications.",
            current: true
          }
        ],
        jobTitle: "Software Developer",
        company: "Tech Startup", // General descriptor instead of specific company
        professionalBio: "Full-stack developer passionate about user experience and clean code.",
        workExperience: "3+ years in web development and user interface design",
        education: "Major University, Computer Science", // General descriptor
        skills: "JavaScript, React, Python, UI/UX Design, Photography",
        languages: "English (Native), French (Intermediate)",
        generalLocation: "West Coast, USA" // General location instead of specific city
      },
      {
        userId: insertedUsers[3].id, // alice
        useGeneralDescriptors: false,
        personalInterests: "Marketing strategy, content creation, social media trends, yoga",
        personalBio: "Marketing enthusiast who loves creating engaging content that connects with people.",
        personalWebsite: "https://alice-marketing.com",
        ageDisclosure: "private",
        gender: "genderfluid",
        maritalStatus: "in_relationship",
        jobTitle: "Senior Marketing Manager",
        company: "Digital Marketing Solutions Inc",
        professionalBio: "Driving brand growth through innovative digital marketing strategies and data-driven campaigns.",
        workExperience: "8 years in digital marketing, specializing in B2B SaaS companies",
        professionalWebsite: "https://alice-marketing.com/portfolio",
        linkedInProfile: "https://linkedin.com/in/alice-marketing",
        education: "UC Berkeley, MBA Marketing; UCLA, BA Communications",
        skills: "Digital Marketing, Content Strategy, SEO/SEM, Analytics, Brand Management",
        languages: "English (Native), Spanish (Fluent)",
        certifications: "Google Analytics Certified, HubSpot Content Marketing",
        achievements: "Increased lead generation by 300% for previous company, Award-winning campaign designer",
        generalLocation: "Los Angeles, California",
        personalPictures: [],
        professionalPictures: [],
        primaryPersonalPic: 0,
        primaryProfessionalPic: 0,
        mainProfilePic: { category: "professional", index: 0 },
        workHistory: []
      }
    ];

    const seedProfiles = await db.insert(userProfiles).values(userProfilesData).returning();
    console.log(`👤 Created ${seedProfiles.length} user profiles`);

    // Contact Relationships demonstrating privacy controls
    const contactRelationshipsData = [
      {
        userId: insertedUsers[1].id, // calvarado
        contactId: insertedUsers[0].id, // testuser
        relationshipType: "both", // Can see both personal and professional info
        profileVisibility: "full"
      },
      {
        userId: insertedUsers[0].id, // testuser 
        contactId: insertedUsers[1].id, // calvarado
        relationshipType: "professional", // Only sees professional info
        profileVisibility: "basic"
      },
      {
        userId: insertedUsers[1].id, // calvarado
        contactId: insertedUsers[3].id, // alice
        relationshipType: "professional", // Professional relationship
        profileVisibility: "full"
      },
      {
        userId: insertedUsers[3].id, // alice
        contactId: insertedUsers[1].id, // calvarado
        relationshipType: "both", // Mutual professional + personal trust
        profileVisibility: "full"
      },
      {
        userId: insertedUsers[0].id, // testuser
        contactId: insertedUsers[3].id, // alice
        relationshipType: "personal", // Personal connection
        profileVisibility: "basic"
      }
    ];

    const seedRelationships = await db.insert(contactRelationships).values(contactRelationshipsData).returning();
    console.log(`🤝 Created ${seedRelationships.length} contact relationships`);

    console.log("✅ V5.0.0 Enhanced Compliance + Profile Management seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${insertedUsers.length} (including 1 banned user)`);
    console.log(`   Stories: ${insertedStories.length} (with mandatory view tracking)`);
    console.log(`   Story Views: ${insertedStoryViews.length} ("seen by" records)`);
    console.log(`   User Blocks: ${insertedBlocks.length} (Instagram-style blocking)`);
    console.log(`   Conversations: ${insertedConversations.length} (3 groups + 2 direct messages)`);
    console.log(`   Messages: ${insertedMessages.length}`);
    console.log(`   Privacy Profiles: ${seedPrivacyProfiles.length} (V5.0.0 compliance)`);
    console.log(`   Organizational Policies: ${seedPolicies.length} (V5.0.0 compliance)`);
    console.log(`   Compliance Metrics: ${seedMetrics.length} (V5.0.0 compliance)`);
    console.log(`   DLP Incidents: ${seedIncidents.length} (V5.0.0 compliance)`);
    console.log(`   Masking Logs: ${seedMaskingLogs.length} (V5.0.0 compliance)`);
    console.log(`   User Profiles: ${seedProfiles.length} (with privacy controls)`);
    console.log(`   Contact Relationships: ${seedRelationships.length} (with visibility controls)`);
    
    console.log("\n🔑 Login credentials:");
    console.log("   Admin: calvarado / NewSecurePassword2025!");
    console.log("   Admin: dzambrano / NewSecurePassword2025!");
    console.log("   User: testuser / password");
    console.log("   User: alice / password");
    console.log("   User: bob / password");
    console.log("   User: charlie / password");
    console.log("   Banned: blockeduser / password");

  } catch (error) {
    console.error("❌ V5.0.0 Enhanced Compliance seed process failed:", error);
    throw error;
  }
}

seed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});