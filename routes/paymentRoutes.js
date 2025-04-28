const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const emailService = require('../controllers/emailService');

// Submit a new payment
router.post('/submit', async (req, res) => {
    try {
        const { 
            emailId, 
            donationId, 
            donationTime, 
            amount, 
            category, 
            cardDetails,
            registeredEmail 
        } = req.body;
        
        // Create a new payment
        const payment = new Payment({
            emailId,
            donationId,
            donationTime,
            amount,
            category,
            registeredEmail
        });
        
        // Only add card details if payment by card
        if (category === 'Card' && cardDetails) {
            // For security, only store last 4 digits
            payment.cardDetails = {
                cardNo: cardDetails.cardNo ? `xxxx-xxxx-xxxx-${cardDetails.cardNo.slice(-4)}` : undefined,
                expiryDate: cardDetails.expiryDate,
                // Never store full CVV
                cvvNo: undefined
            };
        }
        
        // Save to database
        await payment.save();
        
        // Send payment details email
        try {
            await emailService.sendPaymentDetailsEmail({
                emailId,
                donationId,
                donationTime,
                amount,
                category
            });
            console.log('Payment details email sent successfully');
        } catch (emailError) {
            console.error('Error sending payment details email:', emailError);
            // Continue even if email fails
        }
        
        res.status(201).json({ message: 'Payment submitted successfully', paymentId: payment._id });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get payments by email
router.get('/user/:email', async (req, res) => {
    try {
        const payments = await Payment.find({ emailId: req.params.email })
                                      .sort({ createdAt: -1 });
        
        res.status(200).json(payments);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all payments (admin only)
router.get('/all', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update payment status (admin only)
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        
        payment.status = status;
        await payment.save();
        
        res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get total payment amount for admin dashboard
router.get('/total', async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const total = result.length > 0 ? result[0].total : 0;
        res.json({ total });
    } catch (error) {
        console.error('Error fetching payment total:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent payments for admin dashboard
router.get('/recent', async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(payments);
    } catch (error) {
        console.error('Error fetching recent payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 