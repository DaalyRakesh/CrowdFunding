const crypto = require('crypto');

// Simple hashing utility to replace bcrypt
class SimpleHash {
    static async hash(password, saltRounds = 10) {
        return new Promise((resolve, reject) => {
            try {
                // Generate a random salt
                const salt = crypto.randomBytes(16).toString('hex');
                // Hash the password with the salt
                const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
                // Return salt + hash
                resolve(salt + ':' + hash);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async compare(password, hashedPassword) {
        return new Promise((resolve, reject) => {
            try {
                // Split salt and hash
                const [salt, hash] = hashedPassword.split(':');
                // Hash the provided password with the same salt
                const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
                // Compare hashes
                resolve(hash === newHash);
            } catch (error) {
                reject(error);
            }
        });
    }

    static hashSync(password, saltRounds = 10) {
        // Generate a random salt
        const salt = crypto.randomBytes(16).toString('hex');
        // Hash the password with the salt
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        // Return salt + hash
        return salt + ':' + hash;
    }

    static compareSync(password, hashedPassword) {
        // Split salt and hash
        const [salt, hash] = hashedPassword.split(':');
        // Hash the provided password with the same salt
        const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        // Compare hashes
        return hash === newHash;
    }
}

module.exports = SimpleHash; 