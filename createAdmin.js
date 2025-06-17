const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crowdfunding')
.then(() => {
    console.log('Connected to MongoDB');
    return Admin.deleteMany({}); // Clear existing admin accounts
})
.then(() => {
    console.log('Cleared existing admin accounts');
    // Create new admin with all required fields
    const admin = new Admin({
        username: 'rakeshmr1309@gmail.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        fullname: 'Admin User',
        resetPasswordToken: null,
        resetPasswordExpires: null
    });
    return admin.save();
})
.then((admin) => {
    console.log('Admin created successfully:', {
        username: admin.username,
        fullname: admin.fullname,
        hasPassword: !!admin.password
    });
    return mongoose.disconnect();
})
.then(() => {
    console.log('Disconnected from MongoDB');
})
.catch((err) => {
    console.error('Error:', err);
    process.exit(1);
}); 