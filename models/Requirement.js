const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
    orgName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    requirementType: {
        type: String,
        required: true,
        enum: ['Food', 'Clothes', 'Education', 'Medical', 'Other']
    },
    donationId: {
        type: String,
        required: true,
        unique: true
    },
    donationTime: {
        type: Date,
        default: Date.now
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
        enum: ['Pending', 'In Progress', 'Fulfilled']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Requirement = mongoose.model('Requirement', RequirementSchema);

module.exports = Requirement; 