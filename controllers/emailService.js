const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'crowdfund000@gmail.com',
        pass: 'ouow iswl etje clet'
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email service configuration error:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode,
            stack: error.stack
        });
    } else {
        console.log('Email service is ready to send emails');
    }
});

// Email service
const emailService = {
    async sendEmail(to, subject, text, html) {
        try {
            console.log('Attempting to send email to:', to);

            const mailOptions = {
                from: 'crowdfund000@gmail.com',
                to,
                subject,
                text,
                html
            };

            console.log('Sending email with options:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject
            });

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', {
                messageId: info.messageId,
                response: info.response
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Detailed email sending error:', {
                message: error.message,
                code: error.code,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode,
                stack: error.stack
            });

            if (error.code === 'EAUTH') {
                throw new Error('Email authentication failed. Please check your email credentials.');
            } else if (error.code === 'ECONNECTION') {
                throw new Error('Could not connect to the email server. Please check your internet connection and try again.');
            } else {
                throw new Error(`Failed to send email: ${error.message}`);
            }
        }
    },

    async sendPaymentDetailsEmail(paymentDetails) {
        try {
            const subject = 'New Payment Received';
            const text = `
                New Payment Details:
                Amount: ${paymentDetails.amount}
                Category: ${paymentDetails.category}
                Donation ID: ${paymentDetails.donationId}
                Email: ${paymentDetails.emailId}
                Time: ${paymentDetails.donationTime}
            `;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4a90e2;">New Payment Received</h2>
                    <div style="margin-top: 20px;">
                        <p><strong>Amount:</strong> ${paymentDetails.amount}</p>
                        <p><strong>Category:</strong> ${paymentDetails.category}</p>
                        <p><strong>Donation ID:</strong> ${paymentDetails.donationId}</p>
                        <p><strong>Email:</strong> ${paymentDetails.emailId}</p>
                        <p><strong>Time:</strong> ${paymentDetails.donationTime}</p>
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
                        <p>Feeding Humanity - Making a difference together</p>
                    </div>
                </div>
            `;

            return await this.sendEmail('crowdfund000@gmail.com', subject, text, html);
        } catch (error) {
            console.error('Error in sendPaymentDetailsEmail:', error);
            throw error;
        }
    },

    async sendPasswordResetEmail(email, resetUrl) {
        try {
            const subject = 'Password Reset Request';
            const text = `You requested a password reset. Click this link to reset your password: ${resetUrl}`;
            const html = `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
            `;

            return await this.sendEmail(email, subject, text, html);
        } catch (error) {
            console.error('Error in sendPasswordResetEmail:', error);
            throw error;
        }
    },

    async sendPasswordChangeConfirmationEmail(email) {
        try {
            const subject = 'Password Changed Successfully';
            const text = 'Your password has been changed successfully.';
            const html = `
                <h1>Password Changed Successfully</h1>
                <p>Your password has been changed successfully.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            `;

            return await this.sendEmail(email, subject, text, html);
        } catch (error) {
            console.error('Error in sendPasswordChangeConfirmationEmail:', error);
            throw error;
        }
    }
};

module.exports = emailService; 