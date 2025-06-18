const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SimpleHash = require('./simple-hash');
require('dotenv').config();

async function testAdminLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feeding-humanity');
        console.log('✅ Connected to MongoDB');
        const admin = await Admin.findOne({ username: 'rakeshmr1309@gmail.com' });
        if (!admin) {
            console.log('❌ Admin not found');
            return;
        }
        console.log('✅ Admin found:', { username: admin.username, fullname: admin.fullname });
        const isValid = await SimpleHash.compare('Rakesh123$', admin.password);
        console.log('Password valid:', isValid);
        if (!isValid) {
            const newHash = await SimpleHash.hash('Rakesh123$', 10);
            admin.password = newHash;
            await admin.save();
            console.log('✅ Admin password reset to Rakesh123$');
        } else {
            console.log('✅ Admin password is already correct');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testAdminLogin(); 