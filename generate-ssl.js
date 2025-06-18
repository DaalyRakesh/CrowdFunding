const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating self-signed SSL certificates for development...');

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
    console.log('✅ Created ssl directory');
}

try {
    // Generate private key and certificate
    const command = `openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ SSL certificates generated successfully!');
    console.log('📁 Files created:');
    console.log('   - ssl/private.key');
    console.log('   - ssl/certificate.crt');
    console.log('');
    console.log('🚀 Now restart your server to enable HTTPS:');
    console.log('   npm start');
    console.log('');
    console.log('⚠️  Note: Self-signed certificates will show a security warning in browsers.');
    console.log('   This is normal for development. Click "Advanced" and "Proceed" to continue.');
    console.log('');
    console.log('🌐 Your app will be available at:');
    console.log('   HTTP:  http://localhost:5000');
    console.log('   HTTPS: https://localhost:443');
    
} catch (error) {
    console.error('❌ Error generating SSL certificates:', error.message);
    console.log('');
    console.log('💡 Make sure OpenSSL is installed on your system:');
    console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
    console.log('   macOS: brew install openssl');
    console.log('   Linux: sudo apt-get install openssl');
} 