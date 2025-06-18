#!/bin/bash

# Deployment script for Feeding Humanity
echo "🚀 Starting deployment process..."

# Set environment variables
export NPM_CONFIG_PRODUCTION=false
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set proper permissions for node_modules
echo "🔧 Setting permissions..."
chmod -R 755 node_modules

# Check if nodemon exists and has proper permissions
if [ -f "node_modules/.bin/nodemon" ]; then
    echo "✅ Nodemon found, setting execute permissions..."
    chmod +x node_modules/.bin/nodemon
else
    echo "⚠️  Nodemon not found in node_modules/.bin/"
fi

# Verify bcryptjs installation
echo "🔍 Verifying bcryptjs installation..."
if [ -d "node_modules/bcryptjs" ]; then
    echo "✅ bcryptjs installed successfully"
else
    echo "❌ bcryptjs not found, installing..."
    npm install bcryptjs
fi

# Start the application
echo "🌟 Starting application..."
npm start 