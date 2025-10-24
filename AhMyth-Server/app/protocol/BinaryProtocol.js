/**
 * Binary Protocol Handler for Remote Control
 * Defines frame types and encoding/decoding methods
 */

class BinaryProtocol {
    // Frame types
    static FRAME_VIDEO = 0x20;      // Video frame (H.264)
    static FRAME_TOUCH = 0x21;      // Touch event
    static FRAME_KEYEVENT = 0x22;   // Keyboard event
    static FRAME_COMMAND = 0x23;    // Generic command
    
    // Touch actions (matching Android MotionEvent)
    static ACTION_DOWN = 0;
    static ACTION_UP = 1;
    static ACTION_MOVE = 2;
    
    /**
     * Encode a frame with type-length-value format
     * Format: [1 byte type][4 bytes length][data]
     * @param {number} type - Frame type
     * @param {Buffer} data - Frame data
     * @returns {Buffer} Encoded frame
     */
    static encodeFrame(type, data) {
        if (!Buffer.isBuffer(data)) {
            data = Buffer.from(data);
        }
        
        const buffer = Buffer.allocUnsafe(5 + data.length);
        
        // Write type (1 byte)
        buffer.writeUInt8(type, 0);
        
        // Write length (4 bytes, big-endian)
        buffer.writeUInt32BE(data.length, 1);
        
        // Write data
        data.copy(buffer, 5);
        
        return buffer;
    }
    
    /**
     * Decode a frame
     * @param {Buffer} buffer - Encoded frame
     * @returns {Object} Decoded frame {type, length, data}
     */
    static decodeFrame(buffer) {
        if (!Buffer.isBuffer(buffer) || buffer.length < 5) {
            throw new Error('Invalid frame buffer');
        }
        
        // Read type (1 byte)
        const type = buffer.readUInt8(0);
        
        // Read length (4 bytes, big-endian)
        const length = buffer.readUInt32BE(1);
        
        // Extract data
        const data = buffer.slice(5, 5 + length);
        
        return { type, length, data };
    }
    
    /**
     * Encode a video frame
     * @param {Buffer} videoData - H.264 encoded video data
     * @returns {Buffer} Encoded frame
     */
    static encodeVideoFrame(videoData) {
        return this.encodeFrame(this.FRAME_VIDEO, videoData);
    }
    
    /**
     * Encode a touch event
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} action - Touch action (DOWN/UP/MOVE)
     * @returns {Buffer} Encoded frame
     */
    static encodeTouchEvent(x, y, action) {
        const buffer = Buffer.allocUnsafe(12);
        buffer.writeInt32BE(x, 0);
        buffer.writeInt32BE(y, 4);
        buffer.writeInt32BE(action, 8);
        
        return this.encodeFrame(this.FRAME_TOUCH, buffer);
    }
    
    /**
     * Decode a touch event
     * @param {Buffer} data - Touch event data
     * @returns {Object} Touch event {x, y, action}
     */
    static decodeTouchEvent(data) {
        if (data.length < 12) {
            throw new Error('Invalid touch event data');
        }
        
        return {
            x: data.readInt32BE(0),
            y: data.readInt32BE(4),
            action: data.readInt32BE(8)
        };
    }
    
    /**
     * Encode a command
     * @param {string} command - Command string
     * @param {Object} params - Command parameters
     * @returns {Buffer} Encoded frame
     */
    static encodeCommand(command, params = {}) {
        const json = JSON.stringify({ command, params });
        const data = Buffer.from(json, 'utf8');
        
        return this.encodeFrame(this.FRAME_COMMAND, data);
    }
    
    /**
     * Decode a command
     * @param {Buffer} data - Command data
     * @returns {Object} Command {command, params}
     */
    static decodeCommand(data) {
        const json = data.toString('utf8');
        return JSON.parse(json);
    }
    
    /**
     * Get frame type name
     * @param {number} type - Frame type
     * @returns {string} Type name
     */
    static getFrameTypeName(type) {
        switch (type) {
            case this.FRAME_VIDEO: return 'VIDEO';
            case this.FRAME_TOUCH: return 'TOUCH';
            case this.FRAME_KEYEVENT: return 'KEYEVENT';
            case this.FRAME_COMMAND: return 'COMMAND';
            default: return 'UNKNOWN';
        }
    }
    
    /**
     * Get action name
     * @param {number} action - Touch action
     * @returns {string} Action name
     */
    static getActionName(action) {
        switch (action) {
            case this.ACTION_DOWN: return 'DOWN';
            case this.ACTION_UP: return 'UP';
            case this.ACTION_MOVE: return 'MOVE';
            default: return 'UNKNOWN';
        }
    }
}

module.exports = BinaryProtocol;

