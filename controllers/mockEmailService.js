/**
 * Mock Email Service
 * This is a test implementation that simulates email sending for development environments
 * without requiring actual SMTP credentials.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MockEmailService {
    constructor() {
        this.emailLogsDir = path.join(__dirname, '..', 'logs', 'emails');
        
        // Create email logs directory if it doesn't exist
        if (!fs.existsSync(this.emailLogsDir)) {
            fs.mkdirSync(this.emailLogsDir, { recursive: true });
        }
        
        console.log('Mock Email Service initialized - emails will be saved to logs/emails/');
    }
    
    // Simulate sending a password reset email
    async sendPasswordResetEmail(userEmail, resetLink) {
        const messageId = uuidv4();
        const emailContent = this.getPasswordResetTemplate(resetLink);
        
        this.logEmail({
            id: messageId,
            to: userEmail,
            subject: 'Password Reset - Feeding Humanity',
            content: emailContent,
            timestamp: new Date().toISOString()
        });
        
        console.log(`[MOCK] Password reset email sent to ${userEmail}. Message ID: ${messageId}`);
        
        return {
            success: true,
            messageId: messageId
        };
    }
    
    // Simulate sending a password change confirmation email
    async sendPasswordChangeConfirmationEmail(userEmail) {
        const messageId = uuidv4();
        const emailContent = this.getPasswordChangeConfirmationTemplate(userEmail);
        
        this.logEmail({
            id: messageId,
            to: userEmail,
            subject: 'Password Changed - Feeding Humanity',
            content: emailContent,
            timestamp: new Date().toISOString()
        });
        
        console.log(`[MOCK] Password change confirmation email sent to ${userEmail}. Message ID: ${messageId}`);
        
        return {
            success: true,
            messageId: messageId
        };
    }
    
    // Simulate sending a contact response email
    async sendContactResponse(userEmail, responseMessage) {
        const messageId = uuidv4();
        const emailContent = this.getContactResponseTemplate(responseMessage);
        
        this.logEmail({
            id: messageId,
            to: userEmail,
            subject: 'Response to Your Contact Submission - Feeding Humanity',
            content: emailContent,
            timestamp: new Date().toISOString()
        });
        
        console.log(`[MOCK] Contact response email sent to ${userEmail}. Message ID: ${messageId}`);
        
        return {
            success: true,
            messageId: messageId
        };
    }
    
    // Log email to file system instead of sending
    logEmail(emailData) {
        const filePath = path.join(this.emailLogsDir, `${emailData.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(emailData, null, 2));
    }
    
    // Get email logs for debugging
    getEmailLogs() {
        try {
            const logFiles = fs.readdirSync(this.emailLogsDir);
            const logs = [];
            
            for (const file of logFiles) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.emailLogsDir, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    try {
                        logs.push(JSON.parse(data));
                    } catch (e) {
                        console.error(`Error parsing log file ${file}:`, e);
                    }
                }
            }
            
            // Sort by timestamp, most recent first
            return logs.sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
        } catch (error) {
            console.error('Error retrieving email logs:', error);
            return [];
        }
    }
    
    // Password reset email template
    getPasswordResetTemplate(resetLink) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4a90e2;">Feeding Humanity</h2>
                    <h3 style="color: #333;">Password Reset Request</h3>
                </div>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Feeding Humanity account. If you didn't make this request, you can ignore this email.</p>
                <p>To reset your password, please click the button below:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${resetLink}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">${resetLink}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you're having trouble, please contact our support team.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
                    <p>Feeding Humanity - Making a difference together</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        `;
    }
    
    // Password change confirmation email template
    getPasswordChangeConfirmationTemplate(userEmail) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4a90e2;">Feeding Humanity</h2>
                    <h3 style="color: #333;">Password Changed Successfully</h3>
                </div>
                <p>Hello,</p>
                <p>Your password for Feeding Humanity account (${userEmail}) has been successfully changed.</p>
                <p>If you did not request this change, please contact our support team immediately.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
                    <p>Feeding Humanity - Making a difference together</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        `;
    }
    
    // Contact response email template
    getContactResponseTemplate(message) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4a90e2;">Feeding Humanity</h2>
                    <h3 style="color: #333;">Response to Your Contact Submission</h3>
                </div>
                <p>Thank you for reaching out to Feeding Humanity. Here is our response to your inquiry:</p>
                <p style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4a90e2;">${message}</p>
                <p>If you have any further questions, please don't hesitate to contact us again.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>Feeding Humanity Team</strong></p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
                    <p>Feeding Humanity - Making a difference together</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        `;
    }
    
    // Simulate email transporter methods for compatibility
    get transporter() {
        return {
            sendMail: async (options) => {
                const messageId = uuidv4();
                
                this.logEmail({
                    id: messageId,
                    to: options.to,
                    subject: options.subject,
                    content: options.html,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`[MOCK] Email sent to ${options.to}. Message ID: ${messageId}`);
                
                return { messageId };
            },
            verify: (callback) => {
                callback(null, true);
            }
        };
    }
}

// Create and export a singleton instance
const mockEmailService = new MockEmailService();
module.exports = mockEmailService; 