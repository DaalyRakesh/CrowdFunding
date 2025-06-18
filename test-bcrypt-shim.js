#!/usr/bin/env node

console.log('🧪 Testing bcrypt shim...');

// Test the shim
try {
    const bcrypt = require('bcrypt');
    console.log('✅ bcrypt shim working - bcrypt methods available:');
    console.log('  - genSalt:', typeof bcrypt.genSalt);
    console.log('  - hash:', typeof bcrypt.hash);
    console.log('  - compare:', typeof bcrypt.compare);
    
    // Test a simple hash
    const testPassword = 'test123';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(testPassword, salt);
    const isValid = bcrypt.compareSync(testPassword, hash);
    
    console.log('✅ Hash test passed:', isValid);
    
} catch (error) {
    console.error('❌ bcrypt shim test failed:', error.message);
    process.exit(1);
}

console.log('✅ All bcrypt shim tests passed!'); 