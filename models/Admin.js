const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Pre-save hook to hash password
AdminSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) return next();
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed in pre-save hook');
        next();
    } catch (error) {
        console.error('Error in pre-save hook:', error);
        next(error);
    }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing passwords in comparePassword method');
        const result = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison result:', result);
        return result;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

// Create a static function to create the default admin if none exists
AdminSchema.statics.createDefaultAdmin = async function() {
    try {
        const adminCount = await this.countDocuments();
        
        // If no admins exist, create the default admin
        if (adminCount === 0) {
            const defaultAdmin = new this({
                username: 'rakeshmr1309@gmail.com',
                password: 'Rakesh123$',
                fullname: 'Admin User'
            });
            
            await defaultAdmin.save();
            console.log('Default admin account created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin; 