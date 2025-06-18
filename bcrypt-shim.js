// bcrypt shim - redirects to bcryptjs
// This file ensures that any require('bcrypt') calls use bcryptjs instead

const bcryptjs = require('bcryptjs');

// Export all bcryptjs methods as bcrypt methods
module.exports = bcryptjs;

// Also export individual methods for compatibility
module.exports.genSalt = bcryptjs.genSalt;
module.exports.hash = bcryptjs.hash;
module.exports.compare = bcryptjs.compare;
module.exports.getRounds = bcryptjs.getRounds;
module.exports.hashSync = bcryptjs.hashSync;
module.exports.compareSync = bcryptjs.compareSync;
module.exports.genSaltSync = bcryptjs.genSaltSync; 