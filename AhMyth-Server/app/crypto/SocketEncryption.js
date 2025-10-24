const crypto = require('crypto');

class SocketEncryption {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32; // 256 bits
        this.ivLength = 16;  // 128 bits
        this.tagLength = 16; // 128 bits
    }

    /**
     * Generate a random encryption key
     * @returns {Buffer} 32-byte encryption key
     */
    generateKey() {
        return crypto.randomBytes(this.keyLength);
    }

    /**
     * Encrypt data using AES-256-GCM
     * @param {string|Buffer} data - Data to encrypt
     * @param {Buffer} key - 32-byte encryption key
     * @returns {string} Base64 encoded encrypted data (iv + tag + ciphertext)
     */
    encrypt(data, key) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);
            
            let encrypted = cipher.update(
                typeof data === 'string' ? data : data.toString(),
                'utf8',
                'hex'
            );
            encrypted += cipher.final('hex');
            
            const tag = cipher.getAuthTag();
            
            // Combine iv + tag + encrypted data
            const combined = Buffer.concat([
                iv,
                tag,
                Buffer.from(encrypted, 'hex')
            ]);
            
            return combined.toString('base64');
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    }

    /**
     * Decrypt data using AES-256-GCM
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @param {Buffer} key - 32-byte encryption key
     * @returns {string} Decrypted data
     */
    decrypt(encryptedData, key) {
        try {
            const combined = Buffer.from(encryptedData, 'base64');
            
            // Extract iv, tag, and encrypted data
            const iv = combined.slice(0, this.ivLength);
            const tag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
            const encrypted = combined.slice(this.ivLength + this.tagLength);
            
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(tag);
            
            let decrypted = decipher.update(encrypted, undefined, 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }

    /**
     * Create a wrapper for socket.emit with encryption
     * @param {Socket} socket - Socket.IO socket instance
     * @param {Buffer} key - Encryption key
     * @returns {Function} Wrapped emit function
     */
    createEncryptedEmit(socket, key) {
        const originalEmit = socket.emit.bind(socket);
        const self = this;
        
        return function(event, data, ...args) {
            // Don't encrypt handshake and connection events
            if (event === 'handshake' || event === 'error' || event === 'disconnect') {
                return originalEmit(event, data, ...args);
            }
            
            try {
                const encrypted = self.encrypt(JSON.stringify(data), key);
                return originalEmit(event, { encrypted: true, data: encrypted }, ...args);
            } catch (error) {
                console.error('Failed to encrypt message:', error);
                return originalEmit(event, data, ...args);
            }
        };
    }

    /**
     * Create a wrapper for socket.on with decryption
     * @param {Socket} socket - Socket.IO socket instance
     * @param {Buffer} key - Encryption key
     * @returns {Function} Wrapped on function
     */
    createEncryptedOn(socket, key) {
        const originalOn = socket.on.bind(socket);
        const self = this;
        
        return function(event, callback) {
            return originalOn(event, function(data, ...args) {
                // Don't decrypt handshake and connection events
                if (event === 'handshake' || event === 'error' || event === 'disconnect') {
                    return callback(data, ...args);
                }
                
                try {
                    if (data && data.encrypted) {
                        const decrypted = self.decrypt(data.data, key);
                        const parsed = JSON.parse(decrypted);
                        return callback(parsed, ...args);
                    }
                } catch (error) {
                    console.error('Failed to decrypt message:', error);
                }
                
                return callback(data, ...args);
            });
        };
    }
}

module.exports = new SocketEncryption();

