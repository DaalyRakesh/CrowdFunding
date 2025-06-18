#!/usr/bin/env node

// BCRYPT INTERCEPTION - Must be loaded before any other modules
console.log('🚀 Starting with bcrypt interception...');

// Intercept require calls before anything else
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    if (id === 'bcrypt') {
        console.log('🔄 Intercepting bcrypt require, redirecting to bcryptjs');
        return require('bcryptjs');
    }
    return originalRequire.apply(this, arguments);
};

// Also intercept any dynamic requires
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
    if (request === 'bcrypt') {
        console.log('🔄 Intercepting bcrypt resolve, redirecting to bcryptjs');
        return originalResolveFilename('bcryptjs', parent, isMain, options);
    }
    return originalResolveFilename(request, parent, isMain, options);
};

console.log('✅ Bcrypt interception setup complete');

// Now load the actual server
require('./server.js'); 