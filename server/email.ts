import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailConfig {
  service?: 'gmail' | 'outlook' | 'smtp' | 'console' | 'builtin';
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from: string;
}

export class EmailService {
  private transporter: any;
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      service: 'builtin', // Default to built-in SMTP for development
      from: 'noreply@wizspeak.com',
      ...config
    };

    this.setupTransporter();
  }

  private setupTransporter() {
    if (this.config.service === 'console') {
      // Console-only transporter for development/testing
      this.transporter = {
        sendMail: (options: any) => {
          console.log('\n=== EMAIL SENT (CONSOLE MODE) ===');
          console.log('To:', options.to);
          console.log('Subject:', options.subject);
          console.log('Content:', options.html || options.text);
          console.log('=====================================\n');
          return Promise.resolve({ messageId: 'console-' + Date.now() });
        }
      };
    } else if (this.config.service === 'builtin') {
      // Built-in test SMTP server using nodemailer's test account
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    } else if (this.config.service === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: this.config.auth
      });
    } else if (this.config.service === 'outlook') {
      this.transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: this.config.auth
      });
    } else if (this.config.service === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port || 587,
        secure: this.config.secure || false,
        auth: this.config.auth
      });
    }
  }

  async sendContactInvitationEmail(to: string, inviterName: string, inviteUrl: string, customMessage?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.config.from,
        to: to,
        subject: `${inviterName} invited you to join WizSpeek®`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2E5A87; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #2E5A87; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer { color: #666; font-size: 12px; margin-top: 20px; text-align: center; }
              .custom-message { background: #e8f4f8; padding: 15px; border-left: 4px solid #2E5A87; margin: 20px 0; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 You're Invited to WizSpeek®!</h1>
              </div>
              <div class="content">
                <h2>Join ${inviterName} on WizSpeek®</h2>
                <p><strong>${inviterName}</strong> has invited you to join WizSpeek®, the secure and intelligent messaging platform for smart conversations.</p>
                
                ${customMessage ? `<div class="custom-message">"${customMessage}"</div>` : ''}
                
                <p>🔒 <strong>Why WizSpeek®?</strong></p>
                <ul>
                  <li>End-to-end encryption for secure messaging</li>
                  <li>AI-powered smart replies and conversation insights</li>
                  <li>Professional and personal contact management</li>
                  <li>Advanced privacy controls</li>
                  <li>Cross-platform availability</li>
                </ul>
                
                <p>Click the button below to accept the invitation and create your account:</p>
                <a href="${inviteUrl}" class="button">Accept Invitation & Join WizSpeek®</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2E5A87;">${inviteUrl}</p>
                
                <div class="footer">
                  <p>WizSpeek® by Nebusis® - Talk Smart. Stay Secure.</p>
                  <p>This invitation link is secure and personalized for you.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
You're Invited to WizSpeek®!

${inviterName} has invited you to join WizSpeek®, the secure and intelligent messaging platform.

${customMessage ? `Personal message: "${customMessage}"` : ''}

Accept your invitation: ${inviteUrl}

WizSpeek® features:
- End-to-end encryption for secure messaging
- AI-powered smart replies and insights
- Professional and personal contact management
- Advanced privacy controls
- Cross-platform availability

WizSpeek® by Nebusis® - Talk Smart. Stay Secure.
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Contact invitation email error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, resetUrl: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.config.from,
        to: to,
        subject: 'WizSpeek® - Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2E5A87; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #2E5A87; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer { color: #666; font-size: 12px; margin-top: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>WizSpeek® Password Reset</h1>
              </div>
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>You've requested to reset your WizSpeek® password. Click the button below to set a new password:</p>
                
                <a href="${resetUrl}" class="button">Reset My Password</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2E5A87;">${resetUrl}</p>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This link expires in 1 hour for security</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
                
                <div class="footer">
                  <p>WizSpeek® by Nebusis® - Secure Enterprise Communication</p>
                  <p>This is an automated message. Please do not reply.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
WizSpeek® Password Reset

You've requested to reset your WizSpeek® password.

Reset your password: ${resetUrl}

This link expires in 1 hour for security.

If you didn't request this reset, please ignore this email.

WizSpeek® by Nebusis® - Secure Enterprise Communication
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Method to upgrade to real email service later
  updateConfig(newConfig: Partial<EmailConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.setupTransporter();
  }
}

// Helper function to generate secure reset tokens
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Default email service instance - using console mode for development
export const emailService = new EmailService({
  service: 'console',
  from: 'noreply@wizspeak.com'
});

// Standalone sendEmail function for general email sending
export async function sendEmail(options: {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<boolean> {
  try {
    // Use console mode for development - will log email details
    const tempService = new EmailService({ service: 'console' });
    
    const mailOptions = {
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    await tempService.transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}