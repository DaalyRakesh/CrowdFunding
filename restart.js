/**
 * Server restart utility
 * This script is used to restart the server with updated configurations.
 * It ensures that the email service is properly reinitialized.
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Preparing to restart server...');

// Check if the .env file exists and has EMAIL_USER and EMAIL_PASS
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (!envContent.includes('EMAIL_USER=') || !envContent.includes('EMAIL_PASS=')) {
        console.error('ERROR: Email configuration is missing in .env file');
        console.log('Please ensure EMAIL_USER and EMAIL_PASS are properly configured.');
        process.exit(1);
    }
    
    console.log('Email configuration found in .env file');
}

// Clean up any cached modules
Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
});

console.log('Cache cleared, restarting server...');

// Restart the server
const server = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error restarting server: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Server error: ${stderr}`);
        return;
    }
    console.log(`Server output: ${stdout}`);
});

// Forward output to console
server.stdout.on('data', (data) => {
    console.log(`${data}`);
});

server.stderr.on('data', (data) => {
    console.error(`${data}`);
});

console.log('Server restart initiated. Check logs for status.'); 