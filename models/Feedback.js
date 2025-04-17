const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    feedbackText: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback; 