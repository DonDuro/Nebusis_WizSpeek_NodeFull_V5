// V5.0.0 Enhanced Privacy Protection Engine
// Implements comprehensive data masking, DLP, and privacy controls

import crypto from 'crypto';
import { db } from './db';
import { 
  contentMaskingLogs, 
  privacyProfiles, 
  organizationalPolicies, 
  dlpIncidents,
  identityVault,
  DataType,
  PolicyType,
  IncidentSeverity,
  DlpAction
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface MaskingResult {
  maskedContent: string;
  detectedTypes: Array<{
    type: string;
    confidence: number;
    originalValue: string;
    maskedValue: string;
    position: { start: number; end: number };
  }>;
  riskScore: number;
}

export interface PrivacySettings {
  maskPII: boolean;
  maskPHI: boolean;
  maskFinancial: boolean;
  ghostMode: boolean;
  anonymousChat: boolean;
  metadataMinimization: boolean;
  ephemeralMessages: boolean;
  ephemeralDuration: number;
}

export class PrivacyProtectionEngine {
  private readonly encryptionKey: string;
  
  constructor() {
    this.encryptionKey = process.env.PRIVACY_ENCRYPTION_KEY || 'default-key-for-dev';
  }

  // Core Data Detection Patterns
  private readonly patterns = {
    [DataType.EMAIL]: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    [DataType.PHONE]: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    [DataType.SSN]: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    [DataType.CREDIT_CARD]: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    [DataType.IP_ADDRESS]: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    [DataType.FINANCIAL]: /\$[\d,]+\.?\d{0,2}|\b\d+\.\d{2}\s*(?:USD|EUR|GBP)\b/g,
  };

  // Enhanced PHI patterns for healthcare compliance
  private readonly phiPatterns = {
    medicalRecord: /\b(?:MRN|Medical Record|Patient ID)[\s:]*\d+\b/gi,
    diagnosis: /\b(?:ICD-10|ICD-9|CPT)[\s:]*[A-Z0-9.-]+\b/gi,
    prescription: /\b(?:Rx|Prescription)[\s:]*[A-Za-z0-9\s]+\b/gi,
  };

  /**
   * Detect and mask sensitive content in text
   */
  async maskContent(
    content: string, 
    userId: number, 
    privacySettings?: PrivacySettings
  ): Promise<MaskingResult> {
    const settings = privacySettings || await this.getUserPrivacySettings(userId);
    const detectedTypes: MaskingResult['detectedTypes'] = [];
    let maskedContent = content;
    let riskScore = 0;

    // Process each data type based on user settings
    for (const [dataType, pattern] of Object.entries(this.patterns)) {
      if (!this.shouldMaskDataType(dataType as keyof typeof DataType, settings)) {
        continue;
      }

      const matches = Array.from(content.matchAll(pattern));
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const originalValue = match[0];
          const maskedValue = this.generateMask(originalValue, dataType);
          const confidence = this.calculateConfidence(originalValue, dataType);
          
          detectedTypes.push({
            type: dataType,
            confidence,
            originalValue,
            maskedValue,
            position: { start: match.index, end: match.index + originalValue.length }
          });

          // Replace in content
          maskedContent = maskedContent.replace(originalValue, maskedValue);
          riskScore += this.calculateRiskScore(dataType, confidence);

          // Log the masking event
          await this.logMaskingEvent(userId, dataType, originalValue, maskedValue, confidence);
        }
      }
    }

    // Process PHI patterns if enabled
    if (settings.maskPHI) {
      for (const [phiType, pattern] of Object.entries(this.phiPatterns)) {
        const matches = Array.from(content.matchAll(pattern));
        
        for (const match of matches) {
          if (match.index !== undefined) {
            const originalValue = match[0];
            const maskedValue = this.generateMask(originalValue, DataType.PHI);
            const confidence = 90; // High confidence for pattern-based PHI
            
            detectedTypes.push({
              type: DataType.PHI,
              confidence,
              originalValue,
              maskedValue,
              position: { start: match.index, end: match.index + originalValue.length }
            });

            maskedContent = maskedContent.replace(originalValue, maskedValue);
            riskScore += this.calculateRiskScore(DataType.PHI, confidence);

            await this.logMaskingEvent(userId, DataType.PHI, originalValue, maskedValue, confidence);
          }
        }
      }
    }

    return {
      maskedContent,
      detectedTypes,
      riskScore: Math.min(riskScore, 100) // Cap at 100
    };
  }

  /**
   * Generate masked version of sensitive data
   */
  private generateMask(originalValue: string, dataType: string): string {
    switch (dataType) {
      case DataType.EMAIL:
        const [local, domain] = originalValue.split('@');
        return `${local.charAt(0)}***@${domain}`;
      
      case DataType.PHONE:
        return originalValue.replace(/\d/g, '*').replace(/\*{4}$/, originalValue.slice(-4));
      
      case DataType.SSN:
        return `***-**-${originalValue.slice(-4)}`;
      
      case DataType.CREDIT_CARD:
        return originalValue.replace(/\d/g, '*').replace(/\*{4}$/, originalValue.slice(-4));
      
      case DataType.IP_ADDRESS:
        const parts = originalValue.split('.');
        return `${parts[0]}.*.*.${parts[3]}`;
      
      case DataType.FINANCIAL:
        return originalValue.replace(/[\d]/g, '*');
      
      default:
        return '*'.repeat(Math.min(originalValue.length, 8));
    }
  }

  /**
   * Calculate detection confidence based on pattern matching
   */
  private calculateConfidence(value: string, dataType: string): number {
    // Enhanced confidence calculation based on pattern complexity
    const baseConfidence = 85;
    
    switch (dataType) {
      case DataType.EMAIL:
        return value.includes('.') && value.split('@').length === 2 ? 95 : baseConfidence;
      case DataType.SSN:
        return value.match(/^\d{3}-\d{2}-\d{4}$/) ? 98 : baseConfidence;
      case DataType.CREDIT_CARD:
        return this.isValidCreditCard(value) ? 97 : baseConfidence;
      default:
        return baseConfidence;
    }
  }

  /**
   * Calculate risk score for detected sensitive data
   */
  private calculateRiskScore(dataType: string, confidence: number): number {
    const riskWeights = {
      [DataType.PHI]: 25,
      [DataType.SSN]: 20,
      [DataType.CREDIT_CARD]: 20,
      [DataType.FINANCIAL]: 15,
      [DataType.PII]: 10,
      [DataType.EMAIL]: 5,
      [DataType.PHONE]: 5,
      [DataType.IP_ADDRESS]: 3,
    };

    const weight = riskWeights[dataType as keyof typeof riskWeights] || 5;
    return (weight * confidence) / 100;
  }

  /**
   * Check if data type should be masked based on user settings
   */
  private shouldMaskDataType(dataType: keyof typeof DataType, settings: PrivacySettings): boolean {
    switch (dataType) {
      case 'PHI':
        return settings.maskPHI;
      case 'PII':
      case 'EMAIL':
      case 'PHONE':
      case 'SSN':
      case 'IP_ADDRESS':
        return settings.maskPII;
      case 'FINANCIAL':
      case 'CREDIT_CARD':
        return settings.maskFinancial;
      default:
        return true;
    }
  }

  /**
   * Get user's privacy settings
   */
  async getUserPrivacySettings(userId: number): Promise<PrivacySettings> {
    const [profile] = await db
      .select()
      .from(privacyProfiles)
      .where(eq(privacyProfiles.userId, userId));

    if (!profile) {
      // Return default strict settings for new users
      return {
        maskPII: true,
        maskPHI: true,
        maskFinancial: true,
        ghostMode: false,
        anonymousChat: false,
        metadataMinimization: true,
        ephemeralMessages: false,
        ephemeralDuration: 24,
      };
    }

    return {
      maskPII: profile.maskPII,
      maskPHI: profile.maskPHI,
      maskFinancial: profile.maskFinancial,
      ghostMode: profile.ghostMode,
      anonymousChat: profile.anonymousChat,
      metadataMinimization: profile.metadataMinimization,
      ephemeralMessages: profile.ephemeralMessages,
      ephemeralDuration: profile.ephemeralDuration,
    };
  }

  /**
   * Create or update user's privacy profile
   */
  async updatePrivacyProfile(userId: number, settings: Partial<PrivacySettings>): Promise<void> {
    const existingProfile = await db
      .select()
      .from(privacyProfiles)
      .where(eq(privacyProfiles.userId, userId));

    if (existingProfile.length > 0) {
      await db
        .update(privacyProfiles)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(privacyProfiles.userId, userId));
    } else {
      await db.insert(privacyProfiles).values({
        userId,
        ...settings,
      });
    }
  }

  /**
   * Log masking events for audit trail
   */
  private async logMaskingEvent(
    userId: number,
    dataType: string,
    originalValue: string,
    maskedValue: string,
    confidence: number
  ): Promise<void> {
    const encryptedOriginal = this.encryptSensitiveData(originalValue);
    
    await db.insert(contentMaskingLogs).values({
      userId,
      detectedDataType: dataType,
      originalValue: encryptedOriginal,
      maskedValue,
      confidence,
      reviewStatus: 'pending',
    });
  }

  /**
   * Create anonymous identity for anonymous chat
   */
  async createAnonymousIdentity(userId: number, sessionId: string): Promise<string> {
    const anonymousId = `anon_${crypto.randomBytes(8).toString('hex')}`;
    const encryptedMapping = this.encryptSensitiveData(JSON.stringify({
      realUserId: userId,
      sessionId,
      createdAt: new Date().toISOString(),
    }));

    await db.insert(identityVault).values({
      anonymousId,
      realUserId: userId,
      sessionId,
      encryptedMapping,
      accessLevel: 'anonymous',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return anonymousId;
  }

  /**
   * Resolve anonymous identity (for legal/compliance purposes)
   */
  async resolveAnonymousIdentity(anonymousId: string): Promise<number | null> {
    const [vault] = await db
      .select()
      .from(identityVault)
      .where(eq(identityVault.anonymousId, anonymousId));

    return vault?.realUserId || null;
  }

  /**
   * Encrypt sensitive data for secure storage
   */
  private encryptSensitiveData(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data (for authorized access)
   */
  decryptSensitiveData(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Basic credit card validation using Luhn algorithm
   */
  private isValidCreditCard(cardNumber: string): boolean {
    const num = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Process DLP violation and create incident
   */
  async processDlpViolation(
    userId: number,
    content: string,
    messageId?: number,
    fileId?: number
  ): Promise<void> {
    const maskingResult = await this.maskContent(content, userId);
    
    if (maskingResult.riskScore > 70) { // High risk threshold
      await db.insert(dlpIncidents).values({
        incidentType: 'sensitive_data_leak',
        severity: maskingResult.riskScore > 90 ? IncidentSeverity.CRITICAL : IncidentSeverity.HIGH,
        userId,
        messageId,
        fileId,
        detectedContent: maskingResult.maskedContent,
        actionTaken: DlpAction.FLAGGED,
        reviewStatus: 'open',
      });
    }
  }
}

// Export singleton instance
export const privacyEngine = new PrivacyProtectionEngine();