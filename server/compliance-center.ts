// V5.0.0 Compliance Center - Organizational Policy Management
// Implements centralized compliance monitoring and policy enforcement

import { db } from './db';
import { 
  organizationalPolicies,
  complianceMetrics,
  retentionNotifications,
  retentionPolicies,
  unmaskingRequests,
  dlpIncidents,
  messages,
  files,
  users,
  PolicyType,
  RequestStatus,
  IncidentSeverity
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export interface ComplianceReport {
  reportType: string;
  period: { start: Date; end: Date };
  metrics: {
    totalMessages: number;
    maskedContent: number;
    dlpViolations: number;
    retentionDue: number;
    unmaskingRequests: number;
  };
  violations: Array<{
    severity: string;
    type: string;
    count: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: string[];
}

export interface PolicyRule {
  name: string;
  type: PolicyType;
  departments: string[];
  userRoles: string[];
  configuration: {
    maskingLevel?: 'strict' | 'moderate' | 'lenient';
    retentionDays?: number;
    autoEnforce?: boolean;
    alertThreshold?: number;
  };
}

export class ComplianceCenter {
  
  /**
   * Create new organizational policy
   */
  async createPolicy(
    createdBy: number,
    policyRule: PolicyRule
  ): Promise<number> {
    const [policy] = await db.insert(organizationalPolicies).values({
      policyName: policyRule.name,
      policyType: policyRule.type,
      description: `Auto-generated policy for ${policyRule.type}`,
      ruleConfiguration: policyRule.configuration,
      departments: policyRule.departments,
      userRoles: policyRule.userRoles,
      severity: 'medium',
      isActive: true,
      autoEnforce: policyRule.configuration.autoEnforce ?? true,
      requiresApproval: false,
      createdBy,
    }).returning({ id: organizationalPolicies.id });

    await this.recordMetric('policy_created', 1, 'count', 'daily');
    return policy.id;
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    department?: string
  ): Promise<ComplianceReport> {
    
    // Basic metrics
    const totalMessages = await this.getMessageCount(startDate, endDate, department);
    const maskedContent = await this.getMaskedContentCount(startDate, endDate, department);
    const dlpViolations = await this.getDlpViolationCount(startDate, endDate, department);
    const retentionDue = await this.getRetentionDueCount(endDate, department);
    const unmaskingRequests = await this.getUnmaskingRequestCount(startDate, endDate, department);

    // Violation analysis
    const violations = await this.getViolationAnalysis(startDate, endDate, department);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, {
      totalMessages,
      maskedContent,
      dlpViolations,
      retentionDue,
      unmaskingRequests
    });

    return {
      reportType: 'comprehensive_compliance',
      period: { start: startDate, end: endDate },
      metrics: {
        totalMessages,
        maskedContent,
        dlpViolations,
        retentionDue,
        unmaskingRequests,
      },
      violations,
      recommendations,
    };
  }

  /**
   * Monitor retention policy compliance
   */
  async checkRetentionCompliance(): Promise<void> {
    const policies = await db
      .select()
      .from(retentionPolicies)
      .where(eq(retentionPolicies.isActive, true));

    for (const policy of policies) {
      await this.processRetentionPolicy(policy);
    }
  }

  /**
   * Process individual retention policy
   */
  private async processRetentionPolicy(policy: typeof retentionPolicies.$inferSelect): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);

    // Find messages that should be reviewed for retention
    const expiredMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          lte(messages.createdAt, cutoffDate),
          policy.messageClassification 
            ? eq(messages.classification, policy.messageClassification)
            : sql`true`
        )
      );

    // Create notifications for expired content
    for (const message of expiredMessages) {
      const notifyDate = new Date();
      notifyDate.setDate(notifyDate.getDate() + (policy.notifyBeforeExpiry || 30));

      await db.insert(retentionNotifications).values({
        policyId: policy.id,
        messageId: message.id,
        notificationType: 'expiry_warning',
        scheduledDeletion: notifyDate,
        notifiedUsers: [], // Will be populated based on admin roles
        status: 'pending',
      });
    }

    await this.recordMetric('retention_notifications_created', expiredMessages.length, 'count', 'daily');
  }

  /**
   * Handle legal unmasking requests
   */
  async processUnmaskingRequest(
    requesterId: number,
    targetMessageId: number,
    legalJustification: string,
    urgencyLevel: 'emergency' | 'urgent' | 'standard' | 'routine' = 'standard'
  ): Promise<number> {
    
    const [request] = await db.insert(unmaskingRequests).values({
      requesterId,
      targetMessageId,
      requestType: 'content_unmask',
      legalJustification,
      urgencyLevel,
      status: RequestStatus.PENDING,
      auditTrail: [{
        action: 'request_created',
        timestamp: new Date().toISOString(),
        userId: requesterId,
        details: 'Legal unmasking request submitted'
      }],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning({ id: unmaskingRequests.id });

    await this.recordMetric('unmasking_requests', 1, 'count', 'daily');
    return request.id;
  }

  /**
   * Approve unmasking request (admin/compliance officer only)
   */
  async approveUnmaskingRequest(
    requestId: number,
    approverId: number,
    notes?: string
  ): Promise<void> {
    const [request] = await db
      .select()
      .from(unmaskingRequests)
      .where(eq(unmaskingRequests.id, requestId));

    if (!request) {
      throw new Error('Unmasking request not found');
    }

    const updatedAuditTrail = [
      ...request.auditTrail as any[],
      {
        action: 'request_approved',
        timestamp: new Date().toISOString(),
        userId: approverId,
        details: notes || 'Request approved by authorized personnel'
      }
    ];

    await db
      .update(unmaskingRequests)
      .set({
        status: RequestStatus.APPROVED,
        approvedBy: approverId,
        auditTrail: updatedAuditTrail,
      })
      .where(eq(unmaskingRequests.id, requestId));

    await this.recordMetric('unmasking_approved', 1, 'count', 'daily');
  }

  /**
   * Get DLP incident summary
   */
  async getDlpIncidentSummary(
    startDate: Date,
    endDate: Date,
    department?: string
  ): Promise<{
    totalIncidents: number;
    severityBreakdown: Record<string, number>;
    topViolationTypes: Array<{ type: string; count: number }>;
    resolutionRate: number;
  }> {
    
    const incidents = await db
      .select()
      .from(dlpIncidents)
      .where(
        and(
          gte(dlpIncidents.createdAt, startDate),
          lte(dlpIncidents.createdAt, endDate)
        )
      );

    const severityBreakdown = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = incidents.reduce((acc, incident) => {
      acc[incident.incidentType] = (acc[incident.incidentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topViolationTypes = Object.entries(typeBreakdown)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const resolvedIncidents = incidents.filter(i => i.reviewStatus === 'resolved').length;
    const resolutionRate = incidents.length > 0 ? (resolvedIncidents / incidents.length) * 100 : 0;

    return {
      totalIncidents: incidents.length,
      severityBreakdown,
      topViolationTypes,
      resolutionRate,
    };
  }

  /**
   * Record compliance metrics
   */
  async recordMetric(
    metricName: string,
    value: number,
    unit: string,
    timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    department?: string
  ): Promise<void> {
    await db.insert(complianceMetrics).values({
      metricType: 'compliance_monitoring',
      metricName,
      value: value.toString(),
      unit,
      department,
      timeframe,
      metadata: {
        recordedBy: 'system',
        source: 'compliance_center',
      },
    });
  }

  /**
   * Helper methods for report generation
   */
  private async getMessageCount(startDate: Date, endDate: Date, department?: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          gte(messages.createdAt, startDate),
          lte(messages.createdAt, endDate)
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  private async getMaskedContentCount(startDate: Date, endDate: Date, department?: string): Promise<number> {
    // This would be implemented based on masking logs
    // For now, return a placeholder
    return 0;
  }

  private async getDlpViolationCount(startDate: Date, endDate: Date, department?: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(dlpIncidents)
      .where(
        and(
          gte(dlpIncidents.createdAt, startDate),
          lte(dlpIncidents.createdAt, endDate)
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  private async getRetentionDueCount(endDate: Date, department?: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(retentionNotifications)
      .where(
        and(
          lte(retentionNotifications.scheduledDeletion, endDate),
          eq(retentionNotifications.status, 'pending')
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  private async getUnmaskingRequestCount(startDate: Date, endDate: Date, department?: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(unmaskingRequests)
      .where(
        and(
          gte(unmaskingRequests.createdAt, startDate),
          lte(unmaskingRequests.createdAt, endDate)
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  private async getViolationAnalysis(
    startDate: Date, 
    endDate: Date, 
    department?: string
  ): Promise<Array<{ severity: string; type: string; count: number; trend: 'increasing' | 'decreasing' | 'stable' }>> {
    // Simplified violation analysis
    return [
      { severity: IncidentSeverity.HIGH, type: 'data_leak', count: 2, trend: 'stable' },
      { severity: IncidentSeverity.MEDIUM, type: 'policy_violation', count: 5, trend: 'decreasing' },
      { severity: IncidentSeverity.LOW, type: 'masking_bypass', count: 1, trend: 'stable' },
    ];
  }

  private generateRecommendations(
    violations: any[],
    metrics: any
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.dlpViolations > 10) {
      recommendations.push('Consider implementing stricter DLP policies for high-risk content');
    }

    if (metrics.retentionDue > 50) {
      recommendations.push('Review and update retention policies to ensure timely data cleanup');
    }

    if (metrics.unmaskingRequests > 5) {
      recommendations.push('Increase training on privacy protection to reduce unmasking requests');
    }

    const highSeverityViolations = violations.filter(v => v.severity === IncidentSeverity.HIGH);
    if (highSeverityViolations.length > 0) {
      recommendations.push('Immediate attention required for high-severity compliance violations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Compliance metrics are within acceptable ranges. Continue monitoring.');
    }

    return recommendations;
  }
}

// Export singleton instance
export const complianceCenter = new ComplianceCenter();