# Deployment Guide - Feeding Humanity

## Fixing the "nodemon: Permission denied" Error

### Problem
The deployment fails with the error:
```
sh: 1: nodemon: Permission denied
```

### Solution

#### Option 1: Use Production Start Command (Recommended)
Your deployment platform should use `npm start` instead of `npm run dev` for production.

**For Render:**
1. Go to your service dashboard
2. Navigate to Settings > Build & Deploy
3. Set the **Start Command** to: `npm start`
4. Set the **Build Command** to: `npm install`

**For Heroku:**
- The `Procfile` already specifies `web: npm start`

**For other platforms:**
- Configure the start command to use `npm start` instead of `npm run dev`

#### Option 2: Fix Nodemon Permissions
If you must use `npm run dev`, ensure nodemon has proper permissions:

1. **Add to your build script:**
   ```bash
   chmod +x node_modules/.bin/nodemon
   ```

2. **Or use the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

#### Option 3: Install Nodemon Globally
Add this to your build command:
```bash
npm install -g nodemon
```

## Fixing the "bcrypt ERR_DLOPEN_FAILED" Error

### Problem
The deployment fails with the error:
```
code: 'ERR_DLOPEN_FAILED'
```

This happens because `bcrypt` is a native module that requires compilation.

### Solution

#### ✅ **Fixed: Replaced bcrypt with bcryptjs**
- **bcryptjs** is a pure JavaScript implementation that doesn't require native compilation
- **bcrypt** has been removed from dependencies
- All code has been updated to use `bcryptjs` instead of `bcrypt`

#### Files Updated:
- ✅ `package.json` - Removed `bcrypt`, kept `bcryptjs`
- ✅ `models/Admin.js` - Updated to use `bcryptjs`
- ✅ `controllers/authController.js` - Updated to use `bcryptjs`
- ✅ `routes/passwordReset.js` - Updated to use `bcryptjs`
- ✅ `testAdminLogin.js` - Updated to use `bcryptjs`
- ✅ `resetAdminPassword.js` - Updated to use `bcryptjs`

### Environment Variables
Make sure to set these environment variables in your deployment platform:

- `PORT` - The port your app will run on (usually set automatically)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password
- `NODE_ENV` - Set to "production"
- `NPM_CONFIG_PRODUCTION` - Set to "false" to install all dependencies

### Files Added/Modified
- ✅ `Procfile` - Specifies start command for Heroku
- ✅ `render.yaml` - Configuration for Render deployment
- ✅ `.npmrc` - Ensures proper package installation
- ✅ `deploy.sh` - Deployment script with permission fixes
- ✅ Updated `package.json` with proper scripts and engines
- ✅ **Fixed bcrypt issue** - Replaced with bcryptjs

### Quick Fix Commands
If you're still having issues, run these commands in your deployment environment:

```bash
# Install dependencies
npm install

# Fix permissions
chmod -R 755 node_modules
chmod +x node_modules/.bin/nodemon

# Start the application
npm start
```

### Verification
After deployment, your app should:
1. Start without permission errors
2. Start without bcrypt compilation errors
3. Show "Server is running on port [PORT]" in logs
4. Be accessible via your deployment URL

### Support
If you continue to have issues:
1. Check the deployment platform's logs for specific error messages
2. Ensure all environment variables are set correctly
3. Verify your MongoDB connection string is accessible from the deployment environment
4. Make sure you're using `npm start` instead of `npm run dev` for production 