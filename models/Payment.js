const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true
    },
    donationId: {
        type: String,
        required: true
    },
    donationTime: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Cash', 'Card', 'UPI']
    },
    cardDetails: {
        cardNo: {
            type: String,
            // Only store the last 4 digits for security
            select: false
        },
        expiryDate: {
            type: String,
            select: false
        },
        cvvNo: {
            type: String,
            select: false
        }
    },
    registeredEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Completed', 'Failed']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment; 