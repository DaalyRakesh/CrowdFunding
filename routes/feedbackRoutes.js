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

module.exports = router; 