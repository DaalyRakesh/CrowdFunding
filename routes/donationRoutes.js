const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Submit a new donation
router.post('/submit', async (req, res) => {
    try {
        const { donationId, donationDescription, category, name, emailId } = req.body;
        
        // Create a new donation
        const donation = new Donation({
            donationId,
            donationDescription,
            category,
            name,
            emailId
        });
        
        // Save to database
        await donation.save();
        
        res.status(201).json({ message: 'Donation submitted successfully', donationId });
    } catch (error) {
        console.error('Donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donations by email
router.get('/user/:email', async (req, res) => {
    try {
        const donations = await Donation.find({ emailId: req.params.email })
                                        .sort({ createdAt: -1 });
        
        res.status(200).json(donations);
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all donations (admin only)
router.get('/all', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        res.status(200).json(donations);
    } catch (error) {
        console.error('Get all donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donation status (admin only)
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        
        donation.status = status;
        await donation.save();
        
        res.status(200).json({ message: 'Donation status updated successfully' });
    } catch (error) {
        console.error('Update donation status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get total donation count for admin dashboard
router.get('/count', async (req, res) => {
    try {
        const count = await Donation.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error fetching donation count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent donations for admin dashboard
router.get('/recent', async (req, res) => {
    try {
        const donations = await Donation.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(donations);
    } catch (error) {
        console.error('Error fetching recent donations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 