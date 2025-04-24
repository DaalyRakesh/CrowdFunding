const mongoose = require('mongoose');

// Define Contact schema
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    website: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'responded'],
        default: 'new'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Contact model
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 