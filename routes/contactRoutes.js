const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Contact = require('../models/Contact');
require('dotenv').config();

// Setting up email transporter
let transporter;
try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} catch (error) {
    console.error('Error setting up email transporter:', error);
}

// Helper function to log contact form submissions to a file
const logContactSubmission = (data) => {
    const logsDir = path.join(__dirname, '..', 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, 'contact_submissions.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(data)}\n`;
    
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Error writing to contact submissions log:', err);
        }
    });
};

/**
 * @route   POST /api/contact/submit
 * @desc    Submit contact form data, send email to admin, and save to database
 * @access  Public
 */
router.post('/submit', async (req, res) => {
    try {
        const { name, email, phone, address, message, adminEmail } = req.body;
        
        // Log the form submission
        console.log('Contact form submission received:');
        console.log({ name, email, phone, address, message });
        
        // Validate required fields
        if (!name || !email || !phone || !address || !message) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, phone, address and message' });
        }
        
        // Store the submission data for logging
        const submissionData = {
            name,
            email,
            phone,
            address,
            message,
            timestamp: new Date().toISOString()
        };
        
        // Log to file (this works even if DB or email fails)
        logContactSubmission(submissionData);
        
        // Save to database
        try {
            const newContact = new Contact({
                name,
                email,
                phone,
                address,
                message
            });
            
            const savedContact = await newContact.save();
            console.log('Contact saved to database with ID:', savedContact._id);
        } catch (dbError) {
            console.error('Error saving contact to database:', dbError);
            // Continue even if database save fails
        }
        
        // Try to send email if transporter is configured
        if (transporter && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
            // Compose email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail || process.env.ADMIN_EMAIL,
                subject: `New Contact Form Submission from ${name}`,
                html: `
                    <h3>New Contact Form Submission</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                `
            };
            
            // Send email
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully to admin');
        } else {
            console.log('Email not sent: Email configuration not complete. Form data logged to file instead.');
        }
        
        // Return success either way
        res.status(200).json({ 
            success: true, 
            message: 'Contact form submitted successfully'
        });
        
    } catch (error) {
        console.error('Error submitting contact form:', error);
        
        // Still return success to the user, since we've logged the message
        res.status(200).json({ 
            success: true, 
            message: 'Contact form submitted successfully'
        });
    }
});

/**
 * @route   POST /api/contact/respond
 * @desc    Send a response email to a contact submission
 * @access  Private (admin only)
 */
router.post('/respond', async (req, res) => {
    try {
        const { contactId, message, email } = req.body;
        
        // Validate required fields
        if (!contactId || !message || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide contactId, message, and email' 
            });
        }
        
        // Try to send email if transporter is configured
        if (transporter && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
            // Compose email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Response to Your Contact Submission - Feeding Humanity',
                html: `
                    <h3>Response to Your Contact Submission</h3>
                    <p>Thank you for reaching out to Feeding Humanity. Here is our response to your inquiry:</p>
                    <p style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4a90e2;">${message}</p>
                    <p>If you have any further questions, please don't hesitate to contact us again.</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>Feeding Humanity Team</strong></p>
                `
            };
            
            // Send email
            await transporter.sendMail(mailOptions);
            console.log('Response email sent successfully to:', email);
            
            // Try to update the contact in the database
            try {
                await Contact.findByIdAndUpdate(contactId, { status: 'responded' });
            } catch (dbError) {
                console.error('Error updating contact status in database:', dbError);
                // Continue even if database update fails
            }
            
            res.status(200).json({ 
                success: true, 
                message: 'Response sent successfully'
            });
        } else {
            throw new Error('Email configuration not complete');
        }
    } catch (error) {
        console.error('Error sending response email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send response email' 
        });
    }
});

/**
 * @route   GET /api/contact/all
 * @desc    Get all contact form submissions
 * @access  Private (admin only)
 */
router.get('/all', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching contacts' });
    }
});

/**
 * @route   GET /api/contact/:id
 * @desc    Get a single contact form submission by ID
 * @access  Private (admin only)
 */
router.get('/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        
        // Update status to 'read' if it was 'new'
        if (contact.status === 'new') {
            contact.status = 'read';
            await contact.save();
        }
        
        res.status(200).json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching contact' });
    }
});

/**
 * @route   PUT /api/contact/:id/status
 * @desc    Update contact status
 * @access  Private (admin only)
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['new', 'read', 'responded'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Valid status required' });
        }
        
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        
        res.status(200).json(contact);
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({ success: false, message: 'Server error while updating contact status' });
    }
});

module.exports = router; 