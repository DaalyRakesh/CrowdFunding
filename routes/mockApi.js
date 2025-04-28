/**
 * Mock API for testing email-related functionality
 * This file provides endpoints that simulate email sending without requiring
 * real email credentials. It's for development/testing purposes only.
 */

const express = require('express');
const router = express.Router();
const mockEmailService = require('../controllers/mockEmailService');
const Contact = require('../models/Contact');

/**
 * @route   POST /api/mock/contact/respond
 * @desc    Send a simulated response to a contact submission
 * @access  Public (for testing)
 */
router.post('/contact/respond', async (req, res) => {
    try {
        const { contactId, message, email } = req.body;
        
        if (!contactId || !message || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide contactId, message, and email' 
            });
        }
        
        // Use the mock email service
        const result = await mockEmailService.sendContactResponse(email, message);
        
        // Try to update the contact status
        try {
            await Contact.findByIdAndUpdate(contactId, { status: 'responded' });
        } catch (dbError) {
            console.error('Error updating contact status:', dbError);
            // Continue even if database update fails
        }
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Mock response sent successfully',
            mockMessageId: result.messageId
        });
    } catch (error) {
        console.error('Error in mock contact response:', error);
        res.status(500).json({
            success: false,
            message: 'Mock contact response failed: ' + error.message
        });
    }
});

/**
 * @route   GET /api/mock/email/logs
 * @desc    Get the mock email logs
 * @access  Public (for testing)
 */
router.get('/email/logs', (req, res) => {
    try {
        const logs = mockEmailService.getEmailLogs();
        res.status(200).json({
            success: true,
            logs: logs
        });
    } catch (error) {
        console.error('Error getting mock email logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get mock email logs: ' + error.message
        });
    }
});

module.exports = router; 