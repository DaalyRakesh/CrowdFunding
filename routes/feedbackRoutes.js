const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Submit a new feedback
router.post('/submit', async (req, res) => {
    try {
        const { fullName, feedbackText, phoneNo, email, rating } = req.body;
        
        // Create a new feedback
        const feedback = new Feedback({
            fullName,
            feedbackText,
            phoneNo,
            email,
            rating
        });
        
        // Save to database
        await feedback.save();
        
        res.status(201).json({ message: 'Feedback submitted successfully', feedbackId: feedback._id });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all feedback (admin only)
router.get('/all', async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
                                       .sort({ createdAt: -1 });
        
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Get all feedbacks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get feedback by user email
router.get('/user/:email', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ email: req.params.email })
                                       .sort({ createdAt: -1 });
        
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Get user feedbacks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get total feedback count for admin dashboard
router.get('/count', async (req, res) => {
    try {
        const count = await Feedback.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error fetching feedback count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent feedback for admin dashboard
router.get('/recent', async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(feedback);
    } catch (error) {
        console.error('Error fetching recent feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        
        res.json({
            id: feedback._id,
            name: feedback.fullName,
            userName: feedback.fullName,
            email: feedback.email,
            feedbackEmail: feedback.email,
            phoneNo: feedback.phoneNo,
            message: feedback.feedbackText,
            type: 'General',
            status: feedback.status || 'new',
            timestamp: feedback.createdAt,
            responses: feedback.responses || []
        });
    } catch (error) {
        console.error('Error fetching feedback by id:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Respond to feedback
router.post('/:id/respond', async (req, res) => {
    try {
        const { message, adminName } = req.body;
        
        // Find the feedback
        const feedback = await Feedback.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        
        // Create a response object
        const response = {
            message,
            adminName,
            timestamp: new Date()
        };
        
        // Initialize responses array if it doesn't exist
        if (!feedback.responses) {
            feedback.responses = [];
        }
        
        // Add the response to the feedback
        feedback.responses.push(response);
        
        // Update the status
        feedback.status = 'in_progress';
        
        // Save the updated feedback
        await feedback.save();
        
        res.status(200).json({ message: 'Response sent successfully' });
    } catch (error) {
        console.error('Error responding to feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 