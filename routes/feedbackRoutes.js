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

module.exports = router; 