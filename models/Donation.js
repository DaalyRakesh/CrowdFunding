const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donationId: {
        type: String,
        required: true,
        unique: true
    },
    donationDescription: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Clothes', 'Education', 'Other']
    },
    name: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Completed', 'Cancelled']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Donation = mongoose.model('Donation', DonationSchema);

module.exports = Donation; 