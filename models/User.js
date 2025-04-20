const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // Add other user fields as needed (e.g., username, etc.)
}, { timestamps: true });

// Pre-save validation (if needed)
UserSchema.pre('save', function(next) {
    // You can add additional validation or modifications here
    next();
});

// Method to check if email already exists
UserSchema.statics.emailExists = async function(email) {
    if (!email) return false;
    
    try {
        const user = await this.findOne({ email });
        return !!user;
    } catch (error) {
        console.error('Error checking email existence:', error);
        return false;
    }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;