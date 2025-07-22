import { 
  users, conversations, conversationParticipants, messages, files, fileShares, fileShareAccess, fileAccessLogs, messageAcknowledgments, retentionPolicies, accessLogs, auditTrails, complianceReports, passwordResetTokens, stories, storyViews, userBlocks, userProfiles, contactRelationships,
  type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type ConversationParticipant,
  type File, type InsertFile, type FileShare, type InsertFileShare, type FileShareAccess, type InsertFileShareAccess, type FileAccessLog, type InsertFileAccessLog,
  type MessageAcknowledgment, type InsertMessageAcknowledgment, type RetentionPolicy, type InsertRetentionPolicy,
  type AccessLog, type InsertAccessLog, type AuditTrail, type InsertAuditTrail, type ComplianceReport, type InsertComplianceReport,
  type PasswordResetToken, type InsertPasswordResetToken,
  type Story, type InsertStory, type StoryView, type InsertStoryView, type UserBlock, type InsertUserBlock,
  type UserProfile, type InsertUserProfile, type ContactRelationship, type InsertContactRelationship,
  type ContactInvitation, type InsertContactInvitation, contactInvitations
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray, or, gt, notInArray } from "drizzle-orm";
import { getDisplayNameForContact } from "./nameDisplayUtils";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  // Admin user management
  banUser(userId: number, bannedBy: number, reason: string): Promise<void>;
  unbanUser(userId: number): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  getAllUsers(limit?: number): Promise<User[]>;
  
  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationWithParticipants(id: number): Promise<(Conversation & { participants: (ConversationParticipant & { user: User })[] }) | undefined>;
  getUserConversations(userId: number): Promise<(Conversation & { participants: (ConversationParticipant & { user: User })[], lastMessage?: Message & { sender: User } })[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  addParticipant(conversationId: number, userId: number): Promise<void>;
  
  // Message operations
  getMessages(conversationId: number, limit?: number): Promise<(Message & { sender: User })[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, content: string): Promise<void>;
  deleteMessage(id: number): Promise<void>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;
  
  // Message reaction operations
  addMessageReaction(messageId: number, userId: number, emoji: string): Promise<void>;
  removeMessageReaction(messageId: number, userId: number, emoji: string): Promise<void>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  getUserFiles(userId: number): Promise<File[]>;
  
  // File sharing operations
  createFileShare(share: InsertFileShare): Promise<FileShare>;
  getFileShare(id: number): Promise<FileShare | undefined>;
  getFileShareByShareId(shareId: string): Promise<FileShare | undefined>;
  getFileShares(fileId: number): Promise<FileShare[]>;
  revokeFileShare(shareId: string): Promise<void>;
  incrementShareViews(shareId: number): Promise<void>;
  
  // File access control
  createFileShareAccess(access: InsertFileShareAccess): Promise<FileShareAccess>;
  getFileShareAccess(shareId: number, userId: number): Promise<FileShareAccess | undefined>;
  
  // File access logging
  createFileAccessLog(log: InsertFileAccessLog): Promise<FileAccessLog>;
  getFileAccessLogs(fileId: number, limit?: number): Promise<(FileAccessLog & { user: User })[]>;
  
  // Compliance operations
  acknowledgeMessage(messageId: number, userId: number, ipAddress?: string, userAgent?: string): Promise<MessageAcknowledgment>;
  getMessageAcknowledgments(messageId: number): Promise<(MessageAcknowledgment & { user: User })[]>;
  
  // Retention policy operations
  createRetentionPolicy(policy: InsertRetentionPolicy): Promise<RetentionPolicy>;
  getRetentionPolicies(): Promise<RetentionPolicy[]>;
  updateRetentionPolicy(id: number, policy: Partial<InsertRetentionPolicy>): Promise<void>;
  
  // Access logging
  logAccess(log: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(resourceId: number, resourceType: string, limit?: number): Promise<(AccessLog & { user: User })[]>;
  
  // Audit trail
  createAuditTrail(audit: InsertAuditTrail): Promise<AuditTrail>;
  getAuditTrail(filters: { userId?: number; resourceType?: string; eventType?: string; dateFrom?: Date; dateTo?: Date }, limit?: number): Promise<(AuditTrail & { user: User })[]>;
  
  // Compliance reports
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;
  getComplianceReports(type?: string, limit?: number): Promise<(ComplianceReport & { generator: User })[]>;
  
  // Stories operations
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getUserStories(userId: number): Promise<Story[]>;
  getStoriesFeed(viewerId: number): Promise<(Story & { user: User; viewCount: number; hasViewed: boolean })[]>;
  deleteStory(id: number): Promise<void>;
  deleteExpiredStories(): Promise<void>;
  
  // Story views operations
  createStoryView(view: InsertStoryView): Promise<StoryView>;
  getStoryViews(storyId: number): Promise<(StoryView & { viewer: User })[]>;
  hasUserViewedStory(storyId: number, viewerId: number): Promise<boolean>;
  
  // User blocking operations
  blockUser(blockerId: number, blockedId: number, reason?: string): Promise<UserBlock>;
  unblockUser(blockerId: number, blockedId: number): Promise<void>;
  isUserBlocked(blockerId: number, blockedId: number): Promise<boolean>;
  getBlockedUsers(userId: number): Promise<(UserBlock & { blocked: User })[]>;
  getUserBlockedBy(userId: number): Promise<(UserBlock & { blocker: User })[]>;

  // Contact invitation operations
  createContactInvitation(invitation: InsertContactInvitation): Promise<ContactInvitation>;
  getContactInvitations(userId: number): Promise<ContactInvitation[]>;
  getContactInvitationByCode(inviteCode: string): Promise<ContactInvitation | undefined>;
  useContactInvitation(inviteCode: string, newContactId: number): Promise<void>;
  deactivateContactInvitation(invitationId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isOnline, lastSeen: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values(token)
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false)
      ));
    return resetToken || undefined;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationWithParticipants(id: number): Promise<(Conversation & { participants: (ConversationParticipant & { user: User })[] }) | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    
    if (!conversation) return undefined;

    const participants = await db
      .select()
      .from(conversationParticipants)
      .innerJoin(users, eq(conversationParticipants.userId, users.id))
      .where(eq(conversationParticipants.conversationId, id));

    return {
      ...conversation,
      participants: participants.map(p => ({
        ...p.conversation_participants,
        user: p.users
      }))
    };
  }

  async getUserConversations(userId: number): Promise<(Conversation & { participants: (ConversationParticipant & { user: User })[], lastMessage?: Message & { sender: User } })[]> {
    const userConversations = await db
      .select()
      .from(conversationParticipants)
      .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    const conversationData = await Promise.all(
      userConversations.map(async (uc) => {
        const participants = await db
          .select()
          .from(conversationParticipants)
          .innerJoin(users, eq(conversationParticipants.userId, users.id))
          .where(eq(conversationParticipants.conversationId, uc.conversations.id));

        const [lastMessage] = await db
          .select()
          .from(messages)
          .innerJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.conversationId, uc.conversations.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...uc.conversations,
          participants: participants.map(p => ({
            ...p.conversation_participants,
            user: p.users
          })),
          lastMessage: lastMessage ? {
            ...lastMessage.messages,
            sender: lastMessage.users
          } : undefined
        };
      })
    );

    return conversationData;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async addParticipant(conversationId: number, userId: number): Promise<void> {
    await db
      .insert(conversationParticipants)
      .values({ conversationId, userId });
  }

  async getMessages(conversationId: number, limit: number = 50): Promise<(Message & { sender: User })[]> {
    const result = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(and(eq(messages.conversationId, conversationId), eq(messages.isDeleted, false)))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return result.map(r => ({
      ...r.messages,
      sender: r.users
    })).reverse();
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async updateMessage(id: number, content: string): Promise<void> {
    await db
      .update(messages)
      .set({ content, isEdited: true, updatedAt: new Date() })
      .where(eq(messages.id, id));
  }

  async deleteMessage(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(messages.id, id));
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (message) {
      const readBy = Array.isArray(message.readBy) ? message.readBy : [];
      if (!readBy.includes(userId)) {
        await db
          .update(messages)
          .set({ readBy: [...readBy, userId] })
          .where(eq(messages.id, messageId));
      }
    }
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);
    
    return message;
  }

  async addMessageReaction(messageId: number, userId: number, emoji: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const currentReactions = message.reactions || {};
    const emojiReactions = currentReactions[emoji] || [];
    
    if (!emojiReactions.includes(userId)) {
      currentReactions[emoji] = [...emojiReactions, userId];
      
      await db
        .update(messages)
        .set({ reactions: currentReactions })
        .where(eq(messages.id, messageId));
    }
  }

  async removeMessageReaction(messageId: number, userId: number, emoji: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const currentReactions = message.reactions || {};
    const emojiReactions = currentReactions[emoji] || [];
    
    const updatedReactions = emojiReactions.filter(id => id !== userId);
    
    if (updatedReactions.length === 0) {
      delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = updatedReactions;
    }
    
    await db
      .update(messages)
      .set({ reactions: currentReactions })
      .where(eq(messages.id, messageId));
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async getUserFiles(userId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.uploadedBy, userId)).orderBy(desc(files.createdAt));
  }

  // File sharing operations
  async createFileShare(share: InsertFileShare): Promise<FileShare> {
    const [newShare] = await db
      .insert(fileShares)
      .values(share)
      .returning();
    return newShare;
  }

  async getFileShare(id: number): Promise<FileShare | undefined> {
    const [share] = await db.select().from(fileShares).where(eq(fileShares.id, id));
    return share || undefined;
  }

  async getFileShareByShareId(shareId: string): Promise<FileShare | undefined> {
    const [share] = await db.select().from(fileShares).where(eq(fileShares.shareId, shareId));
    return share || undefined;
  }

  async getFileShares(fileId: number): Promise<FileShare[]> {
    return await db.select().from(fileShares).where(eq(fileShares.fileId, fileId)).orderBy(desc(fileShares.createdAt));
  }

  async revokeFileShare(shareId: string): Promise<void> {
    await db.update(fileShares)
      .set({ isActive: false })
      .where(eq(fileShares.shareId, shareId));
  }

  async incrementShareViews(shareId: number): Promise<void> {
    const { sql } = await import("drizzle-orm");
    await db.update(fileShares)
      .set({ currentViews: sql`${fileShares.currentViews} + 1` })
      .where(eq(fileShares.id, shareId));
  }

  // File access control
  async createFileShareAccess(access: InsertFileShareAccess): Promise<FileShareAccess> {
    const [newAccess] = await db
      .insert(fileShareAccess)
      .values(access)
      .returning();
    return newAccess;
  }

  async getFileShareAccess(shareId: number, userId: number): Promise<FileShareAccess | undefined> {
    const [access] = await db.select()
      .from(fileShareAccess)
      .where(and(eq(fileShareAccess.shareId, shareId), eq(fileShareAccess.userId, userId)));
    return access || undefined;
  }

  // File access logging
  async createFileAccessLog(log: InsertFileAccessLog): Promise<FileAccessLog> {
    const [newLog] = await db
      .insert(fileAccessLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getFileAccessLogs(fileId: number, limit: number = 50): Promise<(FileAccessLog & { user: User })[]> {
    return await db.select({
      id: fileAccessLogs.id,
      fileId: fileAccessLogs.fileId,
      shareId: fileAccessLogs.shareId,
      userId: fileAccessLogs.userId,
      action: fileAccessLogs.action,
      ipAddress: fileAccessLogs.ipAddress,
      userAgent: fileAccessLogs.userAgent,
      metadata: fileAccessLogs.metadata,
      timestamp: fileAccessLogs.timestamp,
      user: users
    })
    .from(fileAccessLogs)
    .leftJoin(users, eq(fileAccessLogs.userId, users.id))
    .where(eq(fileAccessLogs.fileId, fileId))
    .orderBy(desc(fileAccessLogs.timestamp))
    .limit(limit);
  }

  // Compliance operations
  async acknowledgeMessage(messageId: number, userId: number, ipAddress?: string, userAgent?: string): Promise<MessageAcknowledgment> {
    const [acknowledgment] = await db
      .insert(messageAcknowledgments)
      .values({ messageId, userId, ipAddress, userAgent })
      .returning();
    return acknowledgment;
  }

  async getMessageAcknowledgments(messageId: number): Promise<(MessageAcknowledgment & { user: User })[]> {
    const result = await db
      .select()
      .from(messageAcknowledgments)
      .innerJoin(users, eq(messageAcknowledgments.userId, users.id))
      .where(eq(messageAcknowledgments.messageId, messageId))
      .orderBy(desc(messageAcknowledgments.acknowledgedAt));

    return result.map(r => ({
      ...r.message_acknowledgments,
      user: r.users
    }));
  }

  // Retention policy operations
  async createRetentionPolicy(policy: InsertRetentionPolicy): Promise<RetentionPolicy> {
    const [newPolicy] = await db
      .insert(retentionPolicies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    return await db
      .select()
      .from(retentionPolicies)
      .where(eq(retentionPolicies.isActive, true))
      .orderBy(desc(retentionPolicies.createdAt));
  }

  async updateRetentionPolicy(id: number, policy: Partial<InsertRetentionPolicy>): Promise<void> {
    await db
      .update(retentionPolicies)
      .set(policy)
      .where(eq(retentionPolicies.id, id));
  }

  // Access logging
  async logAccess(log: InsertAccessLog): Promise<AccessLog> {
    const [newLog] = await db
      .insert(accessLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAccessLogs(resourceId: number, resourceType: string, limit: number = 100): Promise<(AccessLog & { user: User })[]> {
    const result = await db
      .select()
      .from(accessLogs)
      .innerJoin(users, eq(accessLogs.userId, users.id))
      .where(and(
        eq(accessLogs.resourceId, resourceId),
        eq(accessLogs.resourceType, resourceType)
      ))
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);

    return result.map(r => ({
      ...r.access_logs,
      user: r.users
    }));
  }

  async getAllAccessLogs(limit: number = 100): Promise<(AccessLog & { user: User })[]> {
    const result = await db
      .select()
      .from(accessLogs)
      .innerJoin(users, eq(accessLogs.userId, users.id))
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);

    return result.map(r => ({
      ...r.access_logs,
      user: r.users
    }));
  }

  async getAllAccessLogs(limit: number = 100): Promise<(AccessLog & { user: User })[]> {
    const result = await db
      .select()
      .from(accessLogs)
      .innerJoin(users, eq(accessLogs.userId, users.id))
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);

    return result.map(r => ({
      ...r.access_logs,
      user: r.users
    }));
  }

  // Audit trail
  async createAuditTrail(audit: InsertAuditTrail): Promise<AuditTrail> {
    const [newAudit] = await db
      .insert(auditTrails)
      .values(audit)
      .returning();
    return newAudit;
  }

  async getAuditTrail(filters: { userId?: number; resourceType?: string; eventType?: string; dateFrom?: Date; dateTo?: Date }, limit: number = 1000): Promise<(AuditTrail & { user: User })[]> {
    const conditions = [];
    
    if (filters.userId) {
      conditions.push(eq(auditTrails.userId, filters.userId));
    }
    if (filters.resourceType) {
      conditions.push(eq(auditTrails.resourceType, filters.resourceType));
    }
    if (filters.eventType) {
      conditions.push(eq(auditTrails.eventType, filters.eventType));
    }
    // Add date range filtering logic here if needed

    const result = await db
      .select()
      .from(auditTrails)
      .innerJoin(users, eq(auditTrails.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditTrails.timestamp))
      .limit(limit);

    return result.map(r => ({
      ...r.audit_trails,
      user: r.users
    }));
  }

  // Compliance reports
  async createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport> {
    const [newReport] = await db
      .insert(complianceReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getComplianceReports(type?: string, limit: number = 50): Promise<(ComplianceReport & { generator: User })[]> {
    const result = await db
      .select()
      .from(complianceReports)
      .innerJoin(users, eq(complianceReports.generatedBy, users.id))
      .where(type ? eq(complianceReports.reportType, type) : undefined)
      .orderBy(desc(complianceReports.generatedAt))
      .limit(limit);

    return result.map(r => ({
      ...r.compliance_reports,
      generator: r.users
    }));
  }

  // Admin user management methods
  async banUser(userId: number, bannedBy: number, reason: string): Promise<void> {
    await db
      .update(users)
      .set({
        isBanned: true,
        bannedAt: new Date(),
        bannedBy,
        banReason: reason,
      })
      .where(eq(users.id, userId));
  }

  async unbanUser(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        isBanned: false,
        bannedAt: null,
        bannedBy: null,
        banReason: null,
      })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getAllUsers(limit: number = 100): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit);
  }

  // Stories methods
  async createStory(story: InsertStory): Promise<Story> {
    // Set expiration to 24 hours from now if not provided
    const expiresAt = story.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const [newStory] = await db
      .insert(stories)
      .values({ ...story, expiresAt })
      .returning();
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story || undefined;
  }

  async getUserStories(userId: number): Promise<Story[]> {
    return db
      .select()
      .from(stories)
      .where(and(eq(stories.userId, userId), gt(stories.expiresAt, new Date())))
      .orderBy(desc(stories.createdAt));
  }

  async getStoriesFeed(viewerId: number): Promise<(Story & { user: User; viewCount: number; hasViewed: boolean })[]> {
    // Get stories from all users except blocked ones, excluding expired stories
    const blockedUserIds = await db
      .select({ blockedId: userBlocks.blockedId })
      .from(userBlocks)
      .where(eq(userBlocks.blockerId, viewerId));
    
    const blockedIds = blockedUserIds.map(b => b.blockedId);
    
    const storiesQuery = db
      .select({
        id: stories.id,
        userId: stories.userId,
        mediaUrl: stories.mediaUrl,
        mediaType: stories.mediaType,
        caption: stories.caption,
        backgroundColor: stories.backgroundColor,
        createdAt: stories.createdAt,
        expiresAt: stories.expiresAt,
        visibility: stories.visibility,
        hiddenFromUsers: stories.hiddenFromUsers,
        user: users,
      })
      .from(stories)
      .leftJoin(users, eq(stories.userId, users.id))
      .where(
        and(
          gt(stories.expiresAt, new Date()),
          or(
            eq(stories.visibility, "public"),
            and(eq(stories.visibility, "private")) // Will add contact filtering later
          ),
          blockedIds.length > 0 ? notInArray(stories.userId, blockedIds) : undefined
        )
      )
      .orderBy(desc(stories.createdAt));

    const storiesWithUsers = await storiesQuery;

    // Get view counts and check if viewer has viewed each story
    const storyIds = storiesWithUsers.map(s => s.id);
    if (storyIds.length === 0) return [];
    
    const viewCounts = await db
      .select({
        storyId: storyViews.storyId,
        count: storyViews.id, // This will be aggregated
      })
      .from(storyViews)
      .where(inArray(storyViews.storyId, storyIds));

    const userViews = await db
      .select({ storyId: storyViews.storyId })
      .from(storyViews)
      .where(and(
        inArray(storyViews.storyId, storyIds),
        eq(storyViews.viewerId, viewerId)
      ));

    const userViewedStoryIds = new Set(userViews.map(v => v.storyId));
    const viewCountMap = new Map<number, number>();
    
    viewCounts.forEach(v => {
      viewCountMap.set(v.storyId, (viewCountMap.get(v.storyId) || 0) + 1);
    });

    return storiesWithUsers
      .filter(s => !s.hiddenFromUsers?.includes(viewerId))
      .map(s => ({
        ...s,
        viewCount: viewCountMap.get(s.id) || 0,
        hasViewed: userViewedStoryIds.has(s.id),
      }));
  }

  async deleteStory(id: number): Promise<void> {
    await db.delete(stories).where(eq(stories.id, id));
  }

  async deleteExpiredStories(): Promise<void> {
    await db.delete(stories).where(and(stories.expiresAt < new Date()));
  }

  // Story views methods
  async createStoryView(view: InsertStoryView): Promise<StoryView> {
    const [storyView] = await db
      .insert(storyViews)
      .values(view)
      .returning();
    return storyView;
  }

  async getStoryViews(storyId: number): Promise<(StoryView & { viewer: User })[]> {
    return db
      .select({
        id: storyViews.id,
        storyId: storyViews.storyId,
        viewerId: storyViews.viewerId,
        viewedAt: storyViews.viewedAt,
        viewer: users,
      })
      .from(storyViews)
      .leftJoin(users, eq(storyViews.viewerId, users.id))
      .where(eq(storyViews.storyId, storyId))
      .orderBy(desc(storyViews.viewedAt));
  }

  async hasUserViewedStory(storyId: number, viewerId: number): Promise<boolean> {
    const [view] = await db
      .select()
      .from(storyViews)
      .where(and(eq(storyViews.storyId, storyId), eq(storyViews.viewerId, viewerId)));
    return !!view;
  }

  // User blocking methods
  async blockUser(blockerId: number, blockedId: number, reason?: string): Promise<UserBlock> {
    const [block] = await db
      .insert(userBlocks)
      .values({ blockerId, blockedId, reason })
      .returning();
    return block;
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await db
      .delete(userBlocks)
      .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)));
  }

  async isUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const [block] = await db
      .select()
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId)));
    return !!block;
  }

  async getBlockedUsers(userId: number): Promise<(UserBlock & { blocked: User })[]> {
    return db
      .select({
        id: userBlocks.id,
        blockerId: userBlocks.blockerId,
        blockedId: userBlocks.blockedId,
        createdAt: userBlocks.createdAt,
        reason: userBlocks.reason,
        blocked: users,
      })
      .from(userBlocks)
      .leftJoin(users, eq(userBlocks.blockedId, users.id))
      .where(eq(userBlocks.blockerId, userId))
      .orderBy(desc(userBlocks.createdAt));
  }

  async getUserBlockedBy(userId: number): Promise<(UserBlock & { blocker: User })[]> {
    return db
      .select({
        id: userBlocks.id,
        blockerId: userBlocks.blockerId,
        blockedId: userBlocks.blockedId,
        createdAt: userBlocks.createdAt,
        reason: userBlocks.reason,
        blocker: users,
      })
      .from(userBlocks)
      .leftJoin(users, eq(userBlocks.blockerId, users.id))
      .where(eq(userBlocks.blockedId, userId))
      .orderBy(desc(userBlocks.createdAt));
  }

  // User Profile Management
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return profile || null;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<void> {
    await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  }

  async getVisibleUserProfile(viewerId: number, targetUserId: number): Promise<Partial<UserProfile> | null> {
    // Get the full profile
    const profile = await this.getUserProfile(targetUserId);
    if (!profile) return null;

    // Get the relationship to determine visibility
    const relationship = await this.getContactRelationship(viewerId, targetUserId);
    
    if (!relationship) {
      // No relationship = only basic info visible
      return {
        userId: profile.userId,
        education: profile.education,
        skills: profile.skills,
        languages: profile.languages,
      };
    }

    // Get contact-specific privacy settings
    const contactSettings = profile.contactPrivacySettings?.[viewerId.toString()] || {};
    
    // Helper function to check if a field should be shown
    const shouldShowField = (fieldName: string, defaultShow: boolean, categoryAllowed: boolean = true) => {
      // If explicitly hidden for this contact, don't show
      if (contactSettings.hideFields?.includes(fieldName)) return false;
      // If explicitly shown for this contact, show (overrides category restrictions)
      if (contactSettings.showFields?.includes(fieldName)) return true;
      // Otherwise follow category permissions and default visibility
      return categoryAllowed && defaultShow;
    };

    // Check category-level overrides
    const personalAllowed = contactSettings.allowPersonalInfo !== false && 
      (relationship.relationshipType === 'personal' || relationship.relationshipType === 'both');
    const professionalAllowed = contactSettings.allowProfessionalInfo !== false && 
      (relationship.relationshipType === 'professional' || relationship.relationshipType === 'both');

    // Filter based on relationship type and visibility settings
    const visibleProfile: any = {
      userId: profile.userId,
      // Add display name based on contact-specific settings
      displayName: getDisplayNameForContact(profile, viewerId),
    };

    // Add general information with visibility checks
    if (shouldShowField('education', profile.showEducation) && profile.education) {
      visibleProfile.education = profile.education;
    }
    if (shouldShowField('skills', profile.showSkills) && profile.skills) {
      visibleProfile.skills = profile.skills;
    }
    if (shouldShowField('languages', profile.showLanguages) && profile.languages) {
      visibleProfile.languages = profile.languages;
    }
    if (shouldShowField('generalLocation', profile.showLocation) && profile.generalLocation) {
      visibleProfile.generalLocation = profile.generalLocation;
    }
    if (shouldShowField('certifications', profile.showCertifications) && profile.certifications) {
      visibleProfile.certifications = profile.certifications;
    }
    if (shouldShowField('achievements', profile.showAchievements) && profile.achievements) {
      visibleProfile.achievements = profile.achievements;
    }

    // Add personal info if relationship and settings allow
    if (personalAllowed) {
      // Only include fields that are enabled for visibility and allowed by contact settings
      if (shouldShowField('personalInterests', profile.showPersonalInterests, true) && profile.personalInterests) {
        visibleProfile.personalInterests = profile.personalInterests;
      }
      if (shouldShowField('personalBio', profile.showPersonalBio, true) && profile.personalBio) {
        visibleProfile.personalBio = profile.personalBio;
      }
      if (shouldShowField('personalWebsite', profile.showPersonalWebsite, true) && profile.personalWebsite) {
        visibleProfile.personalWebsite = profile.personalWebsite;
      }
      if (shouldShowField('maritalStatus', profile.showRelationshipStatus, true) && profile.maritalStatus) {
        visibleProfile.maritalStatus = profile.maritalStatus;
      }
      if (shouldShowField('personalPictures', profile.showPersonalPictures, true) && profile.personalPictures?.length > 0) {
        visibleProfile.personalPictures = profile.personalPictures;
        visibleProfile.primaryPersonalPic = profile.primaryPersonalPic;
      }
      
      // Personal demographics and age info if demographics are enabled
      if (shouldShowField('age', profile.showDemographics, true)) {
        Object.assign(visibleProfile, this.getAgeInfo(profile));
      }
      if (shouldShowField('gender', profile.showDemographics, true) && profile.gender) {
        visibleProfile.gender = profile.gender;
      }
    }

    // Add professional info if relationship and settings allow
    if (professionalAllowed) {
      // Only include fields that are enabled for visibility and allowed by contact settings
      if (shouldShowField('jobTitle', profile.showJobInfo, true) && profile.jobTitle) {
        visibleProfile.jobTitle = profile.jobTitle;
      }
      if (shouldShowField('company', profile.showJobInfo, true) && profile.company) {
        visibleProfile.company = profile.company;
      }
      if (shouldShowField('professionalBio', profile.showProfessionalBio, true) && profile.professionalBio) {
        visibleProfile.professionalBio = profile.professionalBio;
      }
      if (shouldShowField('workExperience', profile.showWorkExperience, true) && profile.workExperience) {
        visibleProfile.workExperience = profile.workExperience;
      }
      if (shouldShowField('professionalWebsite', profile.showProfessionalWebsites, true) && profile.professionalWebsite) {
        visibleProfile.professionalWebsite = profile.professionalWebsite;
      }
      if (shouldShowField('linkedInProfile', profile.showProfessionalWebsites, true) && profile.linkedInProfile) {
        visibleProfile.linkedInProfile = profile.linkedInProfile;
      }
      if (shouldShowField('professionalPictures', profile.showProfessionalPictures, true) && profile.professionalPictures?.length > 0) {
        visibleProfile.professionalPictures = profile.professionalPictures;
        visibleProfile.primaryProfessionalPic = profile.primaryProfessionalPic;
      }
      if (shouldShowField('workHistory', profile.showWorkHistory, true) && profile.workHistory?.length > 0) {
        visibleProfile.workHistory = profile.workHistory;
      }
    }

    return visibleProfile;
  }

  // Contact Relationship Management
  async addContactRelationship(relationship: InsertContactRelationship): Promise<ContactRelationship> {
    const [newRelationship] = await db
      .insert(contactRelationships)
      .values(relationship)
      .returning();
    return newRelationship;
  }

  async getContactRelationship(userId: number, contactId: number): Promise<ContactRelationship | null> {
    const [relationship] = await db
      .select()
      .from(contactRelationships)
      .where(
        and(
          eq(contactRelationships.userId, userId),
          eq(contactRelationships.contactId, contactId)
        )
      )
      .limit(1);
    return relationship || null;
  }

  async updateContactRelationship(userId: number, contactId: number, updates: Partial<InsertContactRelationship>): Promise<void> {
    await db
      .update(contactRelationships)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(contactRelationships.userId, userId),
          eq(contactRelationships.contactId, contactId)
        )
      );
  }

  async getUserContacts(userId: number): Promise<(ContactRelationship & { contact: User })[]> {
    const result = await db
      .select()
      .from(contactRelationships)
      .innerJoin(users, eq(contactRelationships.contactId, users.id))
      .where(eq(contactRelationships.userId, userId));

    return result.map(r => ({
      ...r.contact_relationships,
      contact: r.users
    }));
  }

  async removeContactRelationship(userId: number, contactId: number): Promise<void> {
    await db
      .delete(contactRelationships)
      .where(
        and(
          eq(contactRelationships.userId, userId),
          eq(contactRelationships.contactId, contactId)
        )
      );
  }

  // Contact invitation operations
  async createContactInvitation(invitation: InsertContactInvitation): Promise<ContactInvitation> {
    // Generate unique invite code
    const inviteCode = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Calculate expiration date if expiresAt is provided
    let expiresAt: Date | undefined;
    if (invitation.expiresAt) {
      expiresAt = invitation.expiresAt;
    }

    const { expiresIn, ...inviteWithoutExpiresIn } = invitation as any;
    const inviteData = {
      ...inviteWithoutExpiresIn,
      inviteCode,
      expiresAt,
      // Generate QR code data (URL to join)
      qrCodeData: `${process.env.BASE_URL || 'http://localhost:5000'}/join/${inviteCode}`,
    };

    const [newInvitation] = await db
      .insert(contactInvitations)
      .values(inviteData)
      .returning();
    
    return newInvitation;
  }

  async getContactInvitations(userId: number): Promise<ContactInvitation[]> {
    return await db
      .select()
      .from(contactInvitations)
      .where(eq(contactInvitations.inviterUserId, userId))
      .orderBy(desc(contactInvitations.createdAt));
  }

  async getContactInvitationByCode(inviteCode: string): Promise<ContactInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(contactInvitations)
      .where(
        and(
          eq(contactInvitations.inviteCode, inviteCode),
          eq(contactInvitations.isActive, true)
        )
      );
    return invitation || undefined;
  }

  async useContactInvitation(inviteCode: string, newContactId: number): Promise<void> {
    const invitation = await this.getContactInvitationByCode(inviteCode);
    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Check if invitation has expired
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      throw new Error("Invitation has expired");
    }

    // Check if invitation has been used up
    if (invitation.currentUses >= invitation.maxUses) {
      throw new Error("Invitation has reached maximum uses");
    }

    // Create contact relationship based on invitation privacy settings
    const relationshipType = invitation.visibilityLevel.includes('personal') ? 'personal' : 
                           invitation.visibilityLevel.includes('professional') ? 'professional' : 'both';

    // Add contact relationship from both sides
    await this.addContactRelationship({
      userId: invitation.inviterUserId,
      contactId: newContactId,
      relationshipType: relationshipType,
      profileVisibility: 'custom',
      customVisibilitySettings: {
        allowGeneralInfo: true,
        allowPersonalInfo: invitation.visibilityLevel.includes('personal'),
        allowProfessionalInfo: invitation.visibilityLevel.includes('professional'),
        allowSpecificDetails: invitation.visibilityLevel.includes('specific'),
      }
    });

    await this.addContactRelationship({
      userId: newContactId,
      contactId: invitation.inviterUserId,
      relationshipType: relationshipType,
      profileVisibility: 'basic'
    });

    // Update invitation usage
    await db
      .update(contactInvitations)
      .set({ 
        currentUses: invitation.currentUses + 1,
        usedAt: new Date(),
        // Deactivate if max uses reached
        isActive: invitation.currentUses + 1 < invitation.maxUses
      })
      .where(eq(contactInvitations.id, invitation.id));
  }

  async deactivateContactInvitation(invitationId: number): Promise<void> {
    await db
      .update(contactInvitations)
      .set({ isActive: false })
      .where(eq(contactInvitations.id, invitationId));
  }

  // Helper method to determine what age information to show based on user preferences
  private getAgeInfo(profile: UserProfile): Partial<UserProfile> {
    const ageInfo: any = {};
    
    if (profile.ageDisclosure === 'specific' && profile.age) {
      ageInfo.age = profile.age;
      ageInfo.ageDisclosure = 'specific';
    } else if (profile.ageDisclosure === 'adult_minor' && profile.ageCategory) {
      ageInfo.ageCategory = profile.ageCategory;
      ageInfo.ageDisclosure = 'adult_minor';
    } else {
      // Private or no preference - don't include age info
      ageInfo.ageDisclosure = 'private';
    }
    
    return ageInfo;
  }
}

export const storage = new DatabaseStorage();
