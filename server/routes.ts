import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMessageSchema, 
  insertFileSchema,
  insertFileShareSchema,
  insertFileShareAccessSchema,
  insertFileAccessLogSchema,
  insertMessageAcknowledgmentSchema,
  insertRetentionPolicySchema,
  insertAccessLogSchema,
  insertAuditTrailSchema,
  insertComplianceReportSchema,
  insertStorySchema,
  insertStoryViewSchema,
  insertUserBlockSchema,
  insertUserProfileSchema,
  insertContactRelationshipSchema,
  MessageClassification,
  UserRole,
  AccessAction,
  StoryMediaType,
  StoryVisibility
} from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import crypto from "crypto";
import { emailService, generateResetToken, sendEmail } from "./email";

const JWT_SECRET = process.env.JWT_SECRET || "wizspeak-secure-secret-key-2025";

// File upload configuration
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// WebSocket connection map
const wsConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid token" });
    }
  };

  // Define authMiddleware alias for V5.0.0 compliance routes
  const authMiddleware = authenticateToken;

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          department: user.department,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists with this email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security, always return success message even if user doesn't exist
        return res.json({ 
          message: "If an account exists with this email, you'll receive reset instructions." 
        });
      }

      // Generate a secure reset token
      const resetToken = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store token in database
      await storage.createPasswordResetToken({
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false
      });

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

      // Send password reset email
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);

      if (emailSent) {
        res.json({ 
          message: "If an account exists with this email, you'll receive reset instructions." 
        });
      } else {
        res.status(500).json({ message: "Failed to send reset email. Please try again." });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Get and validate token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token has expired
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // OAuth Routes
  app.get('/api/auth/google', (req, res) => {
    // Google OAuth URL with proper scopes
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
      });
    
    res.redirect(googleAuthUrl);
  });

  app.get('/api/auth/microsoft', (req, res) => {
    // Microsoft OAuth URL with proper scopes
    const microsoftAuthUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' + 
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID || 'demo-client-id',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/microsoft/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        response_mode: 'query',
        state: 'demo-state'
      });
    
    res.redirect(microsoftAuthUrl);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.redirect('/?error=oauth_cancelled');
      }

      // In a real implementation, exchange code for tokens here
      // For demo purposes, create a mock user
      const mockUser = {
        id: Date.now(),
        username: `google_user_${Date.now()}`,
        email: 'google.user@example.com',
        firstName: 'Google',
        lastName: 'User'
      };

      // Create user in database
      const user = await storage.createUser(mockUser);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect with token
      res.redirect(`/?token=${token}&oauth_success=true`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/?error=oauth_failed');
    }
  });

  app.get('/api/auth/microsoft/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.redirect('/?error=oauth_cancelled');
      }

      // In a real implementation, exchange code for tokens here
      // For demo purposes, create a mock user
      const mockUser = {
        id: Date.now(),
        username: `microsoft_user_${Date.now()}`,
        email: 'microsoft.user@example.com',
        firstName: 'Microsoft',
        lastName: 'User'
      };

      // Create user in database
      const user = await storage.createUser(mockUser);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect with token
      res.redirect(`/?token=${token}&oauth_success=true`);
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      res.redirect('/?error=oauth_failed');
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update online status
      await storage.updateUserOnlineStatus(user.id, true);

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          department: user.department,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      await storage.updateUserOnlineStatus(req.user.id, false);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateToken, async (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      department: req.user.department,
      isOnline: req.user.isOnline,
    });
  });

  // Conversation routes
  app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/conversations", authenticateToken, async (req, res) => {
    try {
      const { name, participantIds } = req.body;
      
      const conversation = await storage.createConversation({
        name,
        type: participantIds.length > 1 ? "group" : "direct",
      });

      // Add creator as participant
      await storage.addParticipant(conversation.id, req.user.id);
      
      // Add other participants
      for (const participantId of participantIds) {
        await storage.addParticipant(conversation.id, participantId);
      }

      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/conversations/:id", authenticateToken, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversationWithParticipants(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(p => p.user.id === req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/conversations/:id/participants", authenticateToken, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversationWithParticipants(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(p => p.user.id === req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(conversation.participants);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Message routes
  app.get("/api/conversations/:id/messages", authenticateToken, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getMessages(conversationId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/conversations/:id/messages", authenticateToken, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        senderId: req.user.id,
      });

      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      const messageWithSender = {
        ...message,
        sender: req.user,
      };
      
      broadcastToConversation(conversationId, {
        type: "new_message",
        data: messageWithSender,
      });

      res.status(201).json(messageWithSender);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  app.put("/api/messages/:id", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { content } = req.body;

      await storage.updateMessage(messageId, content);
      
      res.json({ message: "Message updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/messages/:id", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.deleteMessage(messageId);
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Message reaction endpoints
  app.post("/api/messages/:messageId/reactions", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { emoji } = req.body;
      const userId = req.user.id;

      if (!emoji || typeof emoji !== "string") {
        return res.status(400).json({ message: "Invalid emoji" });
      }

      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user is participant in the conversation
      const conversation = await storage.getConversation(message.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const isParticipant = conversation.participants.some(p => p.userId === userId);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not a participant in this conversation" });
      }

      await storage.addMessageReaction(messageId, userId, emoji);
      res.json({ success: true });
    } catch (error) {
      console.error("Add reaction error:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.delete("/api/messages/:messageId/reactions", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { emoji } = req.body;
      const userId = req.user.id;

      if (!emoji || typeof emoji !== "string") {
        return res.status(400).json({ message: "Invalid emoji" });
      }

      await storage.removeMessageReaction(messageId, userId, emoji);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove reaction error:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  // File upload route
  app.post("/api/upload", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExtension = path.extname(req.file.originalname);
      const filename = `${randomUUID()}${fileExtension}`;
      const newPath = path.join("uploads", filename);

      // Move file to permanent location
      fs.renameSync(req.file.path, newPath);

      res.json({
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Get user files
  app.get("/api/files", authenticateToken, async (req, res) => {
    try {
      const files = await storage.getUserFiles(req.user.id);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to get files" });
    }
  });

  // Serve uploaded files
  app.use("/api/files/static", express.static("uploads"));

  // Compliance API routes
  
  // Message acknowledgment routes
  app.post("/api/messages/:id/acknowledge", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.user.id;
      const ipAddress = req.ip;
      const userAgent = req.get("User-Agent");
      
      // Log access
      await storage.logAccess({
        userId,
        action: AccessAction.ACKNOWLEDGE,
        resourceType: "message",
        resourceId: messageId,
        ipAddress,
        userAgent
      });
      
      // Create audit trail
      await storage.createAuditTrail({
        eventType: "message_acknowledged",
        userId,
        resourceType: "message",
        resourceId: messageId,
        newValues: { acknowledgedBy: userId, acknowledgedAt: new Date() },
        ipAddress,
        userAgent
      });
      
      const acknowledgment = await storage.acknowledgeMessage(messageId, userId, ipAddress, userAgent);
      res.json(acknowledgment);
    } catch (error) {
      res.status(500).json({ message: "Failed to acknowledge message" });
    }
  });
  
  app.get("/api/messages/:id/acknowledgments", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const acknowledgments = await storage.getMessageAcknowledgments(messageId);
      res.json(acknowledgments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get acknowledgments" });
    }
  });

  // Retention policy routes
  app.post("/api/compliance/retention-policies", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.COMPLIANCE_OFFICER) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const policyData = insertRetentionPolicySchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const policy = await storage.createRetentionPolicy(policyData);
      
      // Create audit trail
      await storage.createAuditTrail({
        eventType: "retention_policy_created",
        userId: req.user.id,
        resourceType: "retention_policy",
        resourceId: policy.id,
        newValues: policyData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      res.status(201).json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to create retention policy" });
    }
  });
  
  app.get("/api/compliance/retention-policies", authenticateToken, async (req, res) => {
    try {
      const policies = await storage.getRetentionPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to get retention policies" });
    }
  });

  // Access logs routes
  app.get("/api/compliance/access-logs", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.COMPLIANCE_OFFICER && req.user.role !== UserRole.AUDITOR) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { resourceId, resourceType, limit } = req.query;
      
      // If no specific resource is requested, return all recent access logs
      if (!resourceId || !resourceType) {
        const allLogs = await storage.getAllAccessLogs(limit ? parseInt(limit as string) : 100);
        return res.json(allLogs);
      }
      
      const logs = await storage.getAccessLogs(
        parseInt(resourceId as string),
        resourceType as string,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json(logs);
    } catch (error) {
      console.error("Access logs error:", error);
      res.status(500).json({ message: "Failed to get access logs" });
    }
  });

  // Audit trail routes
  app.get("/api/compliance/audit-trail", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.COMPLIANCE_OFFICER && req.user.role !== UserRole.AUDITOR) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { userId, resourceType, eventType, dateFrom, dateTo, limit } = req.query;
      
      const filters = {
        userId: userId ? parseInt(userId as string) : undefined,
        resourceType: resourceType as string,
        eventType: eventType as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };
      
      const auditTrail = await storage.getAuditTrail(filters, limit ? parseInt(limit as string) : undefined);
      res.json(auditTrail);
    } catch (error) {
      res.status(500).json({ message: "Failed to get audit trail" });
    }
  });

  // Compliance reports routes
  app.post("/api/compliance/reports", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.COMPLIANCE_OFFICER) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const reportData = insertComplianceReportSchema.parse({
        ...req.body,
        generatedBy: req.user.id
      });
      
      const report = await storage.createComplianceReport(reportData);
      
      // Create audit trail
      await storage.createAuditTrail({
        eventType: "compliance_report_generated",
        userId: req.user.id,
        resourceType: "compliance_report",
        resourceId: report.id,
        newValues: reportData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to create compliance report" });
    }
  });
  
  app.get("/api/compliance/reports", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.COMPLIANCE_OFFICER && req.user.role !== UserRole.AUDITOR) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const { type, limit } = req.query;
      const reports = await storage.getComplianceReports(type as string, limit ? parseInt(limit as string) : undefined);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to get compliance reports" });
    }
  });

  // Enhanced message creation with compliance features
  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
        contentHash: crypto.createHash('sha256').update(req.body.content).digest('hex')
      });
      
      const message = await storage.createMessage(messageData);
      
      // Create audit trail
      await storage.createAuditTrail({
        eventType: "message_sent",
        userId: req.user.id,
        resourceType: "message",
        resourceId: message.id,
        newValues: messageData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      // Log access
      await storage.logAccess({
        userId: req.user.id,
        action: "create",
        resourceType: "message",
        resourceId: message.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      // Get the message with sender info
      const messageWithSender = await storage.getMessages(message.conversationId, 1);
      const newMessage = messageWithSender.find(m => m.id === message.id);
      
      if (newMessage) {
        // Broadcast to conversation participants
        broadcastToConversation(message.conversationId, {
          type: "new_message",
          data: newMessage,
        });
      }
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // AI-powered endpoints
  app.post("/api/ai/summarize", authenticateToken, async (req, res) => {
    try {
      const { conversationId, messageCount = 10 } = req.body;
      
      // Get recent messages from the conversation
      const messages = await storage.getMessages(conversationId, messageCount);
      
      if (messages.length === 0) {
        return res.json({
          summary: "No messages to summarize",
          keyPoints: [],
          actionItems: [],
          sentiment: "neutral",
          confidenceScore: 1.0
        });
      }
      
      // Generate AI summary (simplified implementation)
      const messageTexts = messages.map(m => m.content).join(" ");
      const wordCount = messageTexts.split(" ").length;
      const hasQuestions = messageTexts.includes("?");
      const hasUrgentWords = /urgent|asap|important|priority/i.test(messageTexts);
      
      // Simple sentiment analysis
      const positiveWords = ["good", "great", "excellent", "thanks", "appreciate"];
      const negativeWords = ["problem", "issue", "error", "wrong", "bad"];
      const positiveCount = positiveWords.filter(word => messageTexts.toLowerCase().includes(word)).length;
      const negativeCount = negativeWords.filter(word => messageTexts.toLowerCase().includes(word)).length;
      
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      if (positiveCount > negativeCount) sentiment = "positive";
      else if (negativeCount > positiveCount) sentiment = "negative";
      
      const summary = {
        summary: wordCount > 50 ? 
          "The conversation covers multiple topics with active participation from both parties." :
          "Brief exchange of messages between participants.",
        keyPoints: hasQuestions ? ["Questions were asked requiring responses"] : ["General discussion"],
        actionItems: hasUrgentWords ? ["Priority items mentioned - follow up required"] : [],
        sentiment,
        confidenceScore: 0.75
      };
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post("/api/ai/smart-replies", authenticateToken, async (req, res) => {
    try {
      const { conversationId, lastMessageId } = req.body;
      
      // Get the last message
      const messages = await storage.getMessages(conversationId, 1);
      if (messages.length === 0) {
        return res.json([]);
      }
      
      const lastMessage = messages[0];
      const content = lastMessage.content.toLowerCase();
      
      // Generate contextual smart replies
      const smartReplies = [];
      
      if (content.includes("?")) {
        smartReplies.push({
          id: "reply_1",
          content: "Let me check on that and get back to you.",
          type: "detailed",
          confidence: 0.9,
          tone: "professional"
        });
        smartReplies.push({
          id: "reply_2",
          content: "Could you provide more details about this?",
          type: "question",
          confidence: 0.8,
          tone: "friendly"
        });
      }
      
      if (content.includes("thank") || content.includes("appreciate")) {
        smartReplies.push({
          id: "reply_3",
          content: "You're welcome! Happy to help.",
          type: "quick",
          confidence: 0.95,
          tone: "friendly"
        });
      }
      
      if (content.includes("urgent") || content.includes("asap")) {
        smartReplies.push({
          id: "reply_4",
          content: "I understand this is urgent. I'll prioritize this right away.",
          type: "confirmation",
          confidence: 0.9,
          tone: "professional"
        });
      }
      
      // Default replies if no specific context
      if (smartReplies.length === 0) {
        smartReplies.push(
          {
            id: "default_1",
            content: "Got it, thanks!",
            type: "quick",
            confidence: 0.7,
            tone: "casual"
          },
          {
            id: "default_2",
            content: "I'll look into this and update you soon.",
            type: "detailed",
            confidence: 0.8,
            tone: "professional"
          }
        );
      }
      
      res.json(smartReplies);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate smart replies" });
    }
  });

  app.get("/api/ai/insights/:conversationId", authenticateToken, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getMessages(conversationId, 50);
      
      if (messages.length === 0) {
        return res.json({
          totalMessages: 0,
          averageResponseTime: 0,
          topicsDiscussed: [],
          communicationPattern: "No activity",
          lastActiveTime: new Date().toISOString()
        });
      }
      
      // Calculate insights
      const totalMessages = messages.length;
      const messageTexts = messages.map(m => m.content).join(" ");
      const words = messageTexts.split(" ");
      
      // Simple topic extraction
      const commonWords = words
        .filter(word => word.length > 4)
        .reduce((acc, word) => {
          acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
      const topicsDiscussed = Object.entries(commonWords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      // Calculate response time (simplified)
      const messageTimes = messages.map(m => new Date(m.createdAt).getTime());
      const timeDiffs = [];
      for (let i = 1; i < messageTimes.length; i++) {
        timeDiffs.push(messageTimes[i] - messageTimes[i-1]);
      }
      const averageResponseTime = timeDiffs.length > 0 ? 
        Math.round(timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length / 60000) : 0;
      
      const insights = {
        totalMessages,
        averageResponseTime,
        topicsDiscussed,
        communicationPattern: totalMessages > 20 ? "Very active" : totalMessages > 10 ? "Active" : "Light activity",
        lastActiveTime: messages[0]?.createdAt || new Date().toISOString()
      };
      
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // File Management Routes
  app.post("/api/files/upload", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const { encryptedKey, iv, category, messageId } = req.body;
      
      if (!encryptedKey || !iv) {
        return res.status(400).json({ message: "Encryption data required" });
      }

      // Generate unique filename for storage
      const fileExtension = path.extname(req.file.originalname);
      const storageFilename = `${randomUUID()}${fileExtension}`;
      const storagePath = path.join("uploads", storageFilename);

      // Move uploaded file to final location
      fs.renameSync(req.file.path, storagePath);

      // Calculate file hash for integrity
      const fileBuffer = fs.readFileSync(storagePath);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Create file record
      const fileData = insertFileSchema.parse({
        messageId: messageId ? parseInt(messageId) : null,
        filename: storageFilename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        encryptedKey,
        fileHash,
        iv,
        category: category || getFileCategory(req.file.mimetype),
        uploadedBy: req.user.id,
        storageUrl: storagePath
      });

      const file = await storage.createFile(fileData);

      res.json({ 
        message: "File uploaded successfully",
        file: {
          id: file.id,
          filename: file.originalName,
          size: file.size,
          mimeType: file.mimeType,
          category: file.category,
          uploadedAt: file.createdAt
        }
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  app.post("/api/files/:fileId/share", authenticateToken, async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const shareData = insertFileShareSchema.parse({
        ...req.body,
        fileId,
        createdBy: req.user.id
      });

      // Generate unique share ID
      const shareId = randomUUID();
      
      const fileShare = await storage.createFileShare({
        ...shareData,
        shareId
      });

      res.json({
        message: "File share created successfully",
        share: {
          shareId: fileShare.shareId,
          shareUrl: `${req.protocol}://${req.get('host')}/share/${fileShare.shareId}`,
          permissions: {
            canView: fileShare.canView,
            canDownload: fileShare.canDownload,
            canShare: fileShare.canShare
          },
          expiresAt: fileShare.expiresAt,
          createdAt: fileShare.createdAt
        }
      });
    } catch (error) {
      console.error("File share creation error:", error);
      res.status(500).json({ message: "Failed to create file share" });
    }
  });

  app.get("/api/files/:fileId/download", authenticateToken, async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const { shareId } = req.query;

      // Get file
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check permissions (simplified for now)
      if (file.uploadedBy !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if file exists on disk
      if (!fs.existsSync(file.storageUrl)) {
        return res.status(404).json({ message: "File not found on storage" });
      }

      // Send encrypted file with headers for client-side decryption
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('X-Encryption-Key', file.encryptedKey);
      res.setHeader('X-Encryption-IV', file.iv);
      
      const fileStream = fs.createReadStream(file.storageUrl);
      fileStream.pipe(res);
    } catch (error) {
      console.error("File download error:", error);
      res.status(500).json({ message: "File download failed" });
    }
  });

  // Helper function to determine file category
  function getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  // Admin routes (for user management)
  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers(100);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.post("/api/admin/users/:id/ban", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Ban reason is required" });
      }
      
      await storage.banUser(userId, req.user.id, reason);
      res.json({ message: "User banned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.post("/api/admin/users/:id/unban", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = parseInt(req.params.id);
      await storage.unbanUser(userId);
      res.json({ message: "User unbanned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  // User blocking routes
  app.post("/api/users/block", authenticateToken, async (req: any, res) => {
    try {
      const { blockedId, reason } = req.body;
      
      if (!blockedId) {
        return res.status(400).json({ message: "User ID to block is required" });
      }
      
      if (blockedId === req.user.id) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }
      
      const block = await storage.blockUser(req.user.id, blockedId, reason);
      res.status(201).json(block);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.delete("/api/users/block/:blockedId", authenticateToken, async (req: any, res) => {
    try {
      const blockedId = parseInt(req.params.blockedId);
      await storage.unblockUser(req.user.id, blockedId);
      res.json({ message: "User unblocked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/users/blocked", authenticateToken, async (req: any, res) => {
    try {
      const blockedUsers = await storage.getBlockedUsers(req.user.id);
      res.json(blockedUsers);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/users/is-blocked/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const isBlocked = await storage.isUserBlocked(req.user.id, userId);
      res.json({ isBlocked });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  // Stories routes
  app.post("/api/stories", upload.single("media"), authenticateToken, async (req: any, res) => {
    try {
      const storyData = {
        userId: req.user.id,
        mediaType: req.body.mediaType,
        caption: req.body.caption || null,
        backgroundColor: req.body.backgroundColor || "#2E5A87",
        visibility: req.body.visibility || "public",
        hiddenFromUsers: req.body.hiddenFromUsers ? JSON.parse(req.body.hiddenFromUsers) : [],
        mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      // Validate media type
      if (!Object.values(StoryMediaType).includes(storyData.mediaType)) {
        return res.status(400).json({ message: "Invalid media type" });
      }

      // Validate visibility
      if (!Object.values(StoryVisibility).includes(storyData.visibility)) {
        return res.status(400).json({ message: "Invalid visibility setting" });
      }

      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/stories/feed", authenticateToken, async (req: any, res) => {
    try {
      const stories = await storage.getStoriesFeed(req.user.id);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/stories/user/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stories = await storage.getUserStories(userId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.post("/api/stories/:id/view", authenticateToken, async (req: any, res) => {
    try {
      const storyId = parseInt(req.params.id);
      
      // Check if user already viewed this story
      const alreadyViewed = await storage.hasUserViewedStory(storyId, req.user.id);
      if (!alreadyViewed) {
        await storage.createStoryView({ storyId, viewerId: req.user.id });
      }
      
      res.json({ message: "Story view recorded" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/stories/:id/views", authenticateToken, async (req: any, res) => {
    try {
      const storyId = parseInt(req.params.id);
      
      // Verify the story belongs to the current user
      const story = await storage.getStory(storyId);
      if (!story || story.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const views = await storage.getStoryViews(storyId);
      res.json(views);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  app.delete("/api/stories/:id", authenticateToken, async (req: any, res) => {
    try {
      const storyId = parseInt(req.params.id);
      
      // Verify the story belongs to the current user or user is admin
      const story = await storage.getStory(storyId);
      if (!story || (story.userId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteStory(storyId);
      res.json({ message: "Story deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let userId: number | null = null;

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "auth") {
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
            wsConnections.set(userId, ws);
            
            // Update user online status
            await storage.updateUserOnlineStatus(userId, true);
            
            ws.send(JSON.stringify({ type: "auth_success" }));
          } catch (error) {
            ws.send(JSON.stringify({ type: "auth_error", message: "Invalid token" }));
          }
        } else if (data.type === "typing") {
          if (userId) {
            broadcastToConversation(data.conversationId, {
              type: "typing",
              data: { userId, isTyping: data.isTyping },
            }, userId);
          }
        } else if (data.type === "call_offer") {
          // WebRTC call offer signaling
          if (userId && data.to) {
            const targetWs = wsConnections.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "call_offer",
                payload: {
                  from: userId,
                  to: data.to,
                  type: data.callType,
                  offer: data.offer
                }
              }));
            }
          }
        } else if (data.type === "call_answer") {
          // WebRTC call answer signaling
          if (userId && data.to) {
            const targetWs = wsConnections.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "call_answer",
                payload: {
                  from: userId,
                  to: data.to,
                  answer: data.answer
                }
              }));
            }
          }
        } else if (data.type === "ice_candidate") {
          // WebRTC ICE candidate signaling
          if (userId && data.to) {
            const targetWs = wsConnections.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "ice_candidate",
                payload: {
                  from: userId,
                  to: data.to,
                  candidate: data.candidate
                }
              }));
            }
          }
        } else if (data.type === "call_ended") {
          // WebRTC call ended signaling
          if (userId && data.to) {
            const targetWs = wsConnections.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "call_ended",
                payload: {
                  from: userId,
                  to: data.to
                }
              }));
            }
          }
        } else if (data.type === "call_rejected") {
          // WebRTC call rejected signaling
          if (userId && data.to) {
            const targetWs = wsConnections.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "call_rejected",
                payload: {
                  from: userId,
                  to: data.to
                }
              }));
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", async () => {
      if (userId) {
        wsConnections.delete(userId);
        await storage.updateUserOnlineStatus(userId, false);
      }
    });
  });

  function broadcastToConversation(conversationId: number, message: any, excludeUserId?: number) {
    // In a real implementation, you'd track which users are in which conversations
    // For now, broadcast to all connected users
    wsConnections.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN && userId !== excludeUserId) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // V5.0.0 Enhanced Compliance API Routes
  
  // Privacy Profile Management
  app.get("/api/privacy/profile", authMiddleware, async (req: any, res) => {
    try {
      const { privacyEngine } = await import('./privacy-engine');
      const settings = await privacyEngine.getUserPrivacySettings(req.user.id);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching privacy profile:", error);
      res.status(500).json({ message: "Failed to fetch privacy profile" });
    }
  });

  app.put("/api/privacy/profile", authMiddleware, async (req: any, res) => {
    try {
      const { privacyEngine } = await import('./privacy-engine');
      await privacyEngine.updatePrivacyProfile(req.user.id, req.body);
      res.json({ message: "Privacy profile updated successfully" });
    } catch (error) {
      console.error("Error updating privacy profile:", error);
      res.status(500).json({ message: "Failed to update privacy profile" });
    }
  });

  // Content Masking API
  app.post("/api/privacy/mask-content", authMiddleware, async (req: any, res) => {
    try {
      const { privacyEngine } = await import('./privacy-engine');
      const { content } = req.body;
      const result = await privacyEngine.maskContent(content, req.user.id);
      res.json(result);
    } catch (error) {
      console.error("Error masking content:", error);
      res.status(500).json({ message: "Failed to mask content" });
    }
  });

  // Anonymous Chat Identity
  app.post("/api/privacy/anonymous-identity", authMiddleware, async (req: any, res) => {
    try {
      const { privacyEngine } = await import('./privacy-engine');
      const { sessionId } = req.body;
      const anonymousId = await privacyEngine.createAnonymousIdentity(req.user.id, sessionId);
      res.json({ anonymousId });
    } catch (error) {
      console.error("Error creating anonymous identity:", error);
      res.status(500).json({ message: "Failed to create anonymous identity" });
    }
  });

  // Compliance Center API Routes
  app.get("/api/compliance/report", authMiddleware, async (req: any, res) => {
    try {
      // Check if user has compliance officer or admin role
      if (!['admin', 'compliance_officer', 'auditor'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient privileges for compliance reporting" });
      }

      const { complianceCenter } = await import('./compliance-center');
      const { startDate, endDate, department } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await complianceCenter.generateComplianceReport(start, end, department as string);
      res.json(report);
    } catch (error) {
      console.error("Error generating compliance report:", error);
      res.status(500).json({ message: "Failed to generate compliance report" });
    }
  });

  app.get("/api/compliance/dlp-summary", authMiddleware, async (req: any, res) => {
    try {
      if (!['admin', 'compliance_officer', 'auditor'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient privileges for DLP reporting" });
      }

      const { complianceCenter } = await import('./compliance-center');
      const { startDate, endDate, department } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const summary = await complianceCenter.getDlpIncidentSummary(start, end, department as string);
      res.json(summary);
    } catch (error) {
      console.error("Error getting DLP summary:", error);
      res.status(500).json({ message: "Failed to get DLP summary" });
    }
  });

  // Legal Unmasking Requests
  app.post("/api/compliance/unmasking-request", authMiddleware, async (req: any, res) => {
    try {
      if (!['admin', 'compliance_officer', 'auditor'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient privileges for unmasking requests" });
      }

      const { complianceCenter } = await import('./compliance-center');
      const { targetMessageId, legalJustification, urgencyLevel } = req.body;
      
      const requestId = await complianceCenter.processUnmaskingRequest(
        req.user.id,
        targetMessageId,
        legalJustification,
        urgencyLevel
      );
      
      res.json({ requestId, message: "Unmasking request submitted successfully" });
    } catch (error) {
      console.error("Error processing unmasking request:", error);
      res.status(500).json({ message: "Failed to process unmasking request" });
    }
  });

  app.put("/api/compliance/unmasking-request/:id/approve", authMiddleware, async (req: any, res) => {
    try {
      if (!['admin', 'compliance_officer'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient privileges to approve unmasking requests" });
      }

      const { complianceCenter } = await import('./compliance-center');
      const { notes } = req.body;
      
      await complianceCenter.approveUnmaskingRequest(
        parseInt(req.params.id),
        req.user.id,
        notes
      );
      
      res.json({ message: "Unmasking request approved successfully" });
    } catch (error) {
      console.error("Error approving unmasking request:", error);
      res.status(500).json({ message: "Failed to approve unmasking request" });
    }
  });

  // Organizational Policy Management
  app.post("/api/compliance/policy", authMiddleware, async (req: any, res) => {
    try {
      if (!['admin', 'compliance_officer'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient privileges to create policies" });
      }

      const { complianceCenter } = await import('./compliance-center');
      const policyId = await complianceCenter.createPolicy(req.user.id, req.body);
      
      res.json({ policyId, message: "Policy created successfully" });
    } catch (error) {
      console.error("Error creating policy:", error);
      res.status(500).json({ message: "Failed to create policy" });
    }
  });

  // Retention Policy Compliance Check (Admin only)
  app.post("/api/compliance/check-retention", authMiddleware, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required for retention checks" });
      }

      const { complianceCenter } = await import('./compliance-center');
      await complianceCenter.checkRetentionCompliance();
      
      res.json({ message: "Retention compliance check completed successfully" });
    } catch (error) {
      console.error("Error checking retention compliance:", error);
      res.status(500).json({ message: "Failed to check retention compliance" });
    }
  });

  // User Profile Routes
  app.post("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const profile = await storage.createUserProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.get("/api/user/profile/:userId?", authenticateToken, async (req, res) => {
    try {
      const targetUserId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
      
      if (targetUserId === req.user.id) {
        // User viewing their own profile - show everything
        const profile = await storage.getUserProfile(req.user.id);
        res.json(profile);
      } else {
        // User viewing someone else's profile - apply visibility rules
        const visibleProfile = await storage.getVisibleUserProfile(req.user.id, targetUserId);
        res.json(visibleProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const updates = insertUserProfileSchema.partial().parse(req.body);
      await storage.updateUserProfile(req.user.id, updates);
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Contact Relationship Routes
  app.post("/api/contacts", authenticateToken, async (req, res) => {
    try {
      const relationshipData = insertContactRelationshipSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const relationship = await storage.addContactRelationship(relationshipData);
      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error adding contact:", error);
      res.status(500).json({ message: "Failed to add contact" });
    }
  });

  app.get("/api/contacts", authenticateToken, async (req, res) => {
    try {
      console.log(`[API] Fetching contacts for user ${req.user.id} (${req.user.username})`);
      const contacts = await storage.getUserContacts(req.user.id);
      console.log(`[API] Found ${contacts.length} contacts:`, contacts);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.put("/api/contacts/:contactId", authenticateToken, async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const updates = insertContactRelationshipSchema.partial().parse(req.body);
      
      await storage.updateContactRelationship(req.user.id, contactId, updates);
      res.json({ message: "Contact relationship updated successfully" });
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:contactId", authenticateToken, async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      await storage.removeContactRelationship(req.user.id, contactId);
      res.json({ message: "Contact removed successfully" });
    } catch (error) {
      console.error("Error removing contact:", error);
      res.status(500).json({ message: "Failed to remove contact" });
    }
  });

  // Get all users for contact selection
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive information like password
      const publicUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      }));
      res.json(publicUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Contact invitation routes
  
  // Create QR contact invitation
  app.post("/api/contact-invitations/qr", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { inviteeName, visibilityLevel, customMessage, expiresAt, maxUses, type, includeTrustScore } = req.body;
      
      console.log('QR invitation request body:', req.body);
      console.log('Request structure check:', typeof req.body, JSON.stringify(req.body, null, 2));
      
      if (!inviteeName || !visibilityLevel) {
        console.log('Missing fields - inviteeName:', inviteeName, 'visibilityLevel:', visibilityLevel);
        return res.status(400).json({ 
          message: "Missing required fields",
          received: { inviteeName, visibilityLevel, customMessage, expiresAt, maxUses, type, includeTrustScore }
        });
      }

      // Generate unique invitation code
      const invitationCode = crypto.randomBytes(16).toString('hex');

      // Build custom message with trust score if included
      let finalCustomMessage = customMessage || `Join me on WizSpeek® for secure messaging`;
      if (includeTrustScore && req.user!.trustScore) {
        const trustScoreText = `Trust Score: ${req.user!.trustScore}/100`;
        if (type === 'default_qr') {
          finalCustomMessage = includeTrustScore ? 
            "Quick connect - name, contact info, and trust score" : 
            "Quick connect - name and contact info only";
        }
        // For custom QR, append trust score to the custom message
        if (includeTrustScore && type !== 'default_qr') {
          finalCustomMessage += ` • ${trustScoreText}`;
        }
      }

      const invitation = await storage.createContactInvitation({
        inviteCode: invitationCode,
        inviterUserId: req.user!.id,
        inviteeName,
        inviteeEmail: '',
        inviteePhone: '',
        visibilityLevel,
        customMessage: finalCustomMessage,
        expiresAt: new Date(expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        isActive: true,
        status: 'pending',
        includeTrustScore: includeTrustScore || false
      });

      res.json({ 
        invitation,
        invitationCode,
        qrUrl: `${req.protocol}://${req.get('host')}/invite/${invitationCode}`,
        includeTrustScore: includeTrustScore || false,
        trustScore: includeTrustScore ? req.user!.trustScore : undefined
      });
    } catch (error) {
      console.error("QR invitation creation error:", error);
      res.status(500).json({ message: "Failed to create QR invitation" });
    }
  });

  app.post("/api/contact-invitations", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const invitationData = req.body;
      
      // Calculate expiration date if expiresIn is provided (in days)
      let expiresAt: Date | undefined;
      if (invitationData.expiresIn) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + invitationData.expiresIn);
      }

      const { inviteeName, inviteeEmail, inviteePhone, invitationMethod, customMessage, visibilityLevel, expiresInDays } = invitationData;
      
      // Generate unique invite code
      const inviteCode = crypto.randomBytes(16).toString('hex');

      const invitation = await storage.createContactInvitation({
        inviteCode,
        inviterUserId: req.user!.id,
        inviteeName,
        inviteeEmail,
        inviteePhone,
        visibilityLevel: visibilityLevel || 'general-non-specific',
        customMessage,
        expiresAt,
        isActive: true,
        status: 'pending'
      });

      // Send invitation via email if requested
      if ((invitationMethod === 'email' || invitationMethod === 'both') && inviteeEmail) {
        const inviteUrl = `${req.protocol}://${req.get('host')}/invite/${inviteCode}`;
        const inviterName = req.user!.firstName && req.user!.lastName 
          ? `${req.user!.firstName} ${req.user!.lastName}`
          : req.user!.username;
        
        console.log(`Sending invitation email to ${inviteeEmail} from ${inviterName}`);
        const emailSent = await emailService.sendContactInvitationEmail(
          inviteeEmail, 
          inviterName, 
          inviteUrl, 
          customMessage
        );
        
        if (!emailSent) {
          console.error('Failed to send invitation email');
        } else {
          console.log('Invitation email sent successfully');
        }
      }

      // Log SMS attempt (SMS service not implemented yet)
      if (invitationMethod === 'sms' || invitationMethod === 'both') {
        console.log(`SMS invitation would be sent to ${inviteePhone} (SMS service not yet implemented)`);
      }
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get("/api/contact-invitations", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const invitations = await storage.getContactInvitations(req.user!.id);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get("/api/contact-invitations/:code", async (req, res) => {
    try {
      const invitation = await storage.getContactInvitationByCode(req.params.code);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      res.json(invitation);
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ message: "Failed to fetch invitation" });
    }
  });

  app.post("/api/contact-invitations/:code/accept", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.useContactInvitation(req.params.code, req.user!.id);
      res.json({ message: "Invitation accepted successfully" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(400).json({ message: error.message || "Failed to accept invitation" });
    }
  });

  app.patch("/api/contact-invitations/:id/deactivate", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deactivateContactInvitation(parseInt(req.params.id));
      res.json({ message: "Invitation deactivated" });
    } catch (error) {
      console.error("Error deactivating invitation:", error);
      res.status(500).json({ message: "Failed to deactivate invitation" });
    }
  });

  // Support inquiry submission
  app.post("/api/support-inquiry", async (req, res) => {
    try {
      const inquiryData = req.body;
      
      // Send email notification to support team
      const emailSent = await sendEmail({
        to: "info@nebusis.com",
        from: "noreply@wizspeak.com",
        subject: `Support Request - ${inquiryData.category.toUpperCase()} - ${inquiryData.priority.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E5A87; border-bottom: 2px solid #2E5A87; padding-bottom: 10px;">
              New Support Request - ${inquiryData.priority.toUpperCase()} Priority
            </h2>
            
            <div style="background: ${inquiryData.priority === 'urgent' ? '#fee2e2' : inquiryData.priority === 'high' ? '#fef3c7' : '#f0f9ff'}; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
              <strong>Priority:</strong> ${inquiryData.priority.toUpperCase()} | 
              <strong>Category:</strong> ${inquiryData.category} | 
              <strong>Subject:</strong> ${inquiryData.subject}
            </div>
            
            <h3 style="color: #333;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 5px; font-weight: bold;">Name:</td><td style="padding: 5px;">${inquiryData.firstName} ${inquiryData.lastName}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Email:</td><td style="padding: 5px;">${inquiryData.email}</td></tr>
              ${inquiryData.username ? `<tr><td style="padding: 5px; font-weight: bold;">Username:</td><td style="padding: 5px;">${inquiryData.username}</td></tr>` : ''}
              ${inquiryData.currentPlan ? `<tr><td style="padding: 5px; font-weight: bold;">Plan:</td><td style="padding: 5px;">${inquiryData.currentPlan}</td></tr>` : ''}
            </table>
            
            <h3 style="color: #333;">Issue Description</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              ${inquiryData.description.replace(/\n/g, '<br>')}
            </div>
            
            <p style="color: #666; font-size: 12px;">
              This support request was submitted through the WizSpeek® support form.
              Priority level: <strong>${inquiryData.priority.toUpperCase()}</strong>
            </p>
          </div>
        `,
        text: `
          Support Request - ${inquiryData.priority.toUpperCase()} Priority
          
          Contact Information:
          Name: ${inquiryData.firstName} ${inquiryData.lastName}
          Email: ${inquiryData.email}
          ${inquiryData.username ? `Username: ${inquiryData.username}` : ''}
          ${inquiryData.currentPlan ? `Plan: ${inquiryData.currentPlan}` : ''}
          
          Issue Details:
          Subject: ${inquiryData.subject}
          Category: ${inquiryData.category}
          Priority: ${inquiryData.priority}
          
          Description:
          ${inquiryData.description}
        `
      });

      if (emailSent) {
        res.json({ 
          success: true, 
          message: "Support request submitted successfully. Our team will contact you within 24 hours." 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit support request. Please try again." 
        });
      }
    } catch (error) {
      console.error("Support inquiry submission error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to submit support request. Please try again." 
      });
    }
  });

  // Sales inquiry submission
  app.post("/api/sales-inquiry", async (req, res) => {
    try {
      const inquiryData = req.body;
      
      // Send email notification to sales team
      const emailSent = await sendEmail({
        to: "info@nebusis.com",
        from: "noreply@wizspeak.com",
        subject: `New Enterprise Sales Inquiry - ${inquiryData.company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E5A87; border-bottom: 2px solid #2E5A87; padding-bottom: 10px;">
              New Enterprise Sales Inquiry
            </h2>
            
            <h3 style="color: #333;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 5px; font-weight: bold;">Name:</td><td style="padding: 5px;">${inquiryData.firstName} ${inquiryData.lastName}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Email:</td><td style="padding: 5px;">${inquiryData.email}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Phone:</td><td style="padding: 5px;">${inquiryData.phone}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Job Title:</td><td style="padding: 5px;">${inquiryData.jobTitle}</td></tr>
            </table>
            
            <h3 style="color: #333;">Organization Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 5px; font-weight: bold;">Company:</td><td style="padding: 5px;">${inquiryData.company}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Industry:</td><td style="padding: 5px;">${inquiryData.industry}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Company Size:</td><td style="padding: 5px;">${inquiryData.companySize}</td></tr>
            </table>
            
            <h3 style="color: #333;">Project Requirements</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 5px; font-weight: bold;">Expected Users:</td><td style="padding: 5px;">${inquiryData.userCount}</td></tr>
              <tr><td style="padding: 5px; font-weight: bold;">Timeline:</td><td style="padding: 5px;">${inquiryData.timeline}</td></tr>
              ${inquiryData.budget ? `<tr><td style="padding: 5px; font-weight: bold;">Budget:</td><td style="padding: 5px;">${inquiryData.budget}</td></tr>` : ''}
              ${inquiryData.currentSolution ? `<tr><td style="padding: 5px; font-weight: bold;">Current Solution:</td><td style="padding: 5px;">${inquiryData.currentSolution}</td></tr>` : ''}
            </table>
            
            <h3 style="color: #333;">Specific Requirements</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              ${inquiryData.requirements.replace(/\n/g, '<br>')}
            </div>
            
            <p style="color: #666; font-size: 12px;">
              This inquiry was submitted through the WizSpeek® enterprise contact form.
              Please respond within 24 hours to maintain our service commitment.
            </p>
          </div>
        `,
        text: `
          New Enterprise Sales Inquiry - ${inquiryData.company}
          
          Contact Information:
          Name: ${inquiryData.firstName} ${inquiryData.lastName}
          Email: ${inquiryData.email}
          Phone: ${inquiryData.phone}
          Job Title: ${inquiryData.jobTitle}
          
          Organization Details:
          Company: ${inquiryData.company}
          Industry: ${inquiryData.industry}
          Company Size: ${inquiryData.companySize}
          
          Project Requirements:
          Expected Users: ${inquiryData.userCount}
          Timeline: ${inquiryData.timeline}
          ${inquiryData.budget ? `Budget: ${inquiryData.budget}` : ''}
          ${inquiryData.currentSolution ? `Current Solution: ${inquiryData.currentSolution}` : ''}
          
          Specific Requirements:
          ${inquiryData.requirements}
        `
      });

      if (emailSent) {
        res.json({ 
          success: true, 
          message: "Sales inquiry submitted successfully. Our team will contact you within 24 hours." 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit inquiry. Please try again." 
        });
      }
    } catch (error) {
      console.error("Sales inquiry submission error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to submit inquiry. Please try again." 
      });
    }
  });

  // Services inquiry endpoint
  app.post("/api/services-inquiry", async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        jobTitle,
        organization, 
        locations,
        employeeCount,
        industry, 
        interestedServices, 
        specificNeeds,
        currentChallenges,
        timeline, 
        budget,
        additionalInfo 
      } = req.body;
      
      const servicesList = interestedServices.map((service: string) => {
        const serviceNames: Record<string, string> = {
          "compliance-core": "Nebusis® ComplianceCore",
          "engage": "Nebusis® Engage", 
          "wizspeak": "Nebusis® WizSpeek",
          "legalflow": "Nebusis® LegalFlow",
          "smartbooks": "Nebusis® SmartBooks",
          "environmental": "Nebusis® Environmental & ESG",
          "cyberwatch": "Nebusis® CyberWatch",
          "selfcertify": "Nebusis® SelfCertify",
          "digital-training": "Nebusis® Digital Training Solutions",
          "digital-transformation": "Nebusis® Digital Transformation",
          "project-management": "Nebusis® Project Management Solutions"
        };
        return serviceNames[service] || service;
      }).join(", ");

      const success = await sendEmail({
        to: "info@nebusis.com",
        from: "no-reply@wizspeak.com",
        subject: `Nebusis® Services Inquiry - ${organization}`,
        html: `
          <h2>Services Information Request</h2>
          
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Job Title:</strong> ${jobTitle}</p>
          <p><strong>Email:</strong> ${email}</p>
          
          <h3>Organization Details</h3>
          <p><strong>Organization:</strong> ${organization}</p>
          <p><strong>Location(s):</strong> ${locations}</p>
          <p><strong>Employee Count:</strong> ${employeeCount}</p>
          <p><strong>Industry:</strong> ${industry}</p>
          
          <h3>Project Requirements</h3>
          <p><strong>Interested Services:</strong> ${servicesList}</p>
          <p><strong>Specific Needs:</strong> ${specificNeeds}</p>
          ${currentChallenges ? `<p><strong>Current Challenges:</strong> ${currentChallenges}</p>` : ''}
          <p><strong>Timeline:</strong> ${timeline}</p>
          ${budget ? `<p><strong>Budget Range:</strong> ${budget}</p>` : ''}
          
          ${additionalInfo ? `
          <h3>Additional Information</h3>
          <p>${additionalInfo}</p>
          ` : ''}
          
          <hr>
          <p><em>This request was submitted through the WizSpeek® About section services inquiry form.</em></p>
        `,
        text: `Services Information Request

Contact Information:
Name: ${firstName} ${lastName}
Job Title: ${jobTitle}
Email: ${email}

Organization Details:
Organization: ${organization}
Location(s): ${locations}
Employee Count: ${employeeCount}
Industry: ${industry}

Project Requirements:
Interested Services: ${servicesList}
Specific Needs: ${specificNeeds}
${currentChallenges ? `Current Challenges: ${currentChallenges}` : ''}
Timeline: ${timeline}
${budget ? `Budget Range: ${budget}` : ''}

${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}`
      });

      if (success) {
        res.json({ message: "Services inquiry sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send services inquiry" });
      }
    } catch (error) {
      console.error("Services inquiry error:", error);
      res.status(500).json({ message: "Failed to send services inquiry" });
    }
  });

  return httpServer;
}
