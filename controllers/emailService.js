const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a dedicated email service for the application
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com', 
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Only for development
            }
        });
        
        // Verify connection configuration
        this.verifyConnection();
    }
    
    // Verify the connection
    verifyConnection() {
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Email service error:', error);
                console.log('Gmail troubleshooting:');
                console.log('1. Make sure 2-Step Verification is enabled in your Google Account');
                console.log('2. Generate an App Password at https://myaccount.google.com/apppasswords');
                console.log('3. Use the App Password in your .env file as EMAIL_PASS');
                console.log('4. Make sure the sending email account has "Less secure app access" turned off');
            } else {
                console.log('Email server is ready to send messages');
            }
        });
    }
    
    // Send a password reset email
    async sendPasswordResetEmail(userEmail, resetLink) {
        try {
            // Create email options
            const mailOptions = {
                from: `"Feeding Humanity" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: 'Password Reset - Feeding Humanity',
                html: this.getPasswordResetTemplate(resetLink)
            };
            
            // Send the email
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Password reset email sent to ${userEmail}. Message ID: ${info.messageId}`);
            
            // For development - get test URL
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Send a password change confirmation email
    async sendPasswordChangeConfirmationEmail(userEmail) {
        try {
            // Create email options
            const mailOptions = {
                from: `"Feeding Humanity" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: 'Password Changed - Feeding Humanity',
                html: this.getPasswordChangeConfirmationTemplate(userEmail)
            };
            
            // Send the email
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Password change confirmation email sent to ${userEmail}. Message ID: ${info.messageId}`);
            
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Error sending password change confirmation email:', error);
            return {
                success: false,
                error: error.message
            };
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
}

// Create and export a singleton instance
const emailService = new EmailService();
module.exports = emailService; 