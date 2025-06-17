const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');

// Submit a new requirement
router.post('/submit', async (req, res) => {
    try {
        const { 
            orgName,
            address,
            mobileNo,
            emailId,
            contactPerson,
            requirementType,
            donationId,
            donationTime,
            amount,
            category,
            cardDetails,
            registeredEmail
        } = req.body;
        
        // Create a new requirement
        const requirement = new Requirement({
            orgName,
            address,
            mobileNo,
            emailId,
            contactPerson,
            requirementType,
            donationId,
            donationTime,
            amount,
            category,
            registeredEmail
        });
        
        // Only add card details if payment by card
        if (category === 'Card' && cardDetails) {
            // For security, only store last 4 digits
            requirement.cardDetails = {
                cardNo: cardDetails.cardNo ? `xxxx-xxxx-xxxx-${cardDetails.cardNo.slice(-4)}` : undefined,
                expiryDate: cardDetails.expiryDate,
                // Never store full CVV
                cvvNo: undefined
            };
        }
        
        // Save to database
        await requirement.save();
        
        res.status(201).json({ message: 'Requirement submitted successfully', requirementId: requirement._id });
    } catch (error) {
        console.error('Requirement error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get requirements by email
router.get('/user/:email', async (req, res) => {
    try {
        const requirements = await Requirement.find({ emailId: req.params.email })
                                             .sort({ createdAt: -1 });
        
        res.status(200).json(requirements);
    } catch (error) {
        console.error('Get requirements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all requirements (admin only)
router.get('/all', async (req, res) => {
    try {
        const requirements = await Requirement.find().sort({ createdAt: -1 });
        res.status(200).json(requirements);
    } catch (error) {
        console.error('Get all requirements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update requirement status (admin only)
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const requirement = await Requirement.findById(req.params.id);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }
        
        requirement.status = status;
        await requirement.save();
        
        res.status(200).json({ message: 'Requirement status updated successfully' });
    } catch (error) {
        console.error('Update requirement status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get total requirement count for admin dashboard
router.get('/count', async (req, res) => {
    try {
        const count = await Requirement.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error fetching requirement count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent requirements for admin dashboard
router.get('/recent', async (req, res) => {
    try {
        const requirements = await Requirement.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(requirements);
    } catch (error) {
        console.error('Error fetching recent requirements:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 