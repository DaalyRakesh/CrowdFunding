#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying no bcrypt usage...');

// Check if bcrypt is installed
try {
    require('bcrypt');
    console.error('❌ ERROR: bcrypt is still installed!');
    process.exit(1);
} catch (error) {
    console.log('✅ bcrypt is not installed');
}

// Check if bcryptjs is installed
try {
    require('bcryptjs');
    console.log('✅ bcryptjs is installed');
} catch (error) {
    console.error('❌ ERROR: bcryptjs is not installed!');
    process.exit(1);
}

// Check package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.dependencies && packageJson.dependencies.bcrypt) {
    console.error('❌ ERROR: bcrypt found in package.json dependencies!');
    process.exit(1);
}

if (packageJson.dependencies && packageJson.dependencies.bcryptjs) {
    console.log('✅ bcryptjs found in package.json dependencies');
} else {
    console.error('❌ ERROR: bcryptjs not found in package.json dependencies!');
    process.exit(1);
}

console.log('✅ All checks passed - no bcrypt found!'); 