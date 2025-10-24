const { File } = require('./index');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileManager {
    /**
     * Get files directory for a session
     * @param {number} sessionId - Session ID
     * @returns {string} Directory path
     */
    static getSessionFilesDirectory(sessionId) {
        const baseDir = path.join(__dirname, '../../data/files');
        const sessionDir = path.join(baseDir, sessionId.toString());
        
        // Ensure directory exists
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        
        return sessionDir;
    }

    /**
     * Save a file and log to database
     * @param {number} sessionId - Session ID
     * @param {string} fileName - Original file name
     * @param {Buffer} fileData - File data
     * @returns {Promise<Object>} File record
     */
    static async saveFile(sessionId, fileName, fileData) {
        try {
            const sessionDir = this.getSessionFilesDirectory(sessionId);
            
            // Generate unique filename to avoid conflicts
            const timestamp = Date.now();
            const hash = crypto.createHash('md5').update(fileName).digest('hex').substring(0, 8);
            const ext = path.extname(fileName);
            const baseName = path.basename(fileName, ext);
            const uniqueFileName = `${baseName}_${timestamp}_${hash}${ext}`;
            
            const filePath = path.join(sessionDir, uniqueFileName);
            
            // Write file
            fs.writeFileSync(filePath, fileData);
            
            // Log to database
            const fileRecord = await File.create({
                session_id: sessionId,
                file_name: fileName,
                file_path: filePath,
                size_bytes: fileData.length,
                received_at: new Date()
            });
            
            console.log(`File saved: ${fileName} (${fileData.length} bytes)`);
            
            return fileRecord;
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }

    /**
     * Get file record from database
     * @param {number} fileId - File ID
     * @returns {Promise<Object>} File record
     */
    static async getFile(fileId) {
        try {
            const file = await File.findByPk(fileId);
            return file;
        } catch (error) {
            console.error('Error fetching file:', error);
            return null;
        }
    }

    /**
     * Get all files for a session
     * @param {number} sessionId - Session ID
     * @returns {Promise<Array>} Array of file records
     */
    static async getSessionFiles(sessionId) {
        try {
            const files = await File.findAll({
                where: { session_id: sessionId },
                order: [['received_at', 'DESC']]
            });
            
            return files;
        } catch (error) {
            console.error('Error fetching session files:', error);
            return [];
        }
    }

    /**
     * Read file data
     * @param {number} fileId - File ID
     * @returns {Promise<Buffer>} File data
     */
    static async readFile(fileId) {
        try {
            const fileRecord = await this.getFile(fileId);
            
            if (!fileRecord) {
                throw new Error('File not found in database');
            }
            
            if (!fs.existsSync(fileRecord.file_path)) {
                throw new Error('File not found on disk');
            }
            
            const data = fs.readFileSync(fileRecord.file_path);
            return data;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    /**
     * Delete a file
     * @param {number} fileId - File ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteFile(fileId) {
        try {
            const fileRecord = await this.getFile(fileId);
            
            if (!fileRecord) {
                return false;
            }
            
            // Delete physical file
            if (fs.existsSync(fileRecord.file_path)) {
                fs.unlinkSync(fileRecord.file_path);
            }
            
            // Delete database record
            await File.destroy({
                where: { id: fileId }
            });
            
            console.log(`File deleted: ${fileRecord.file_name}`);
            
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Clean up old files
     * @param {number} daysOld - Delete files older than this many days
     * @returns {Promise<number>} Number of deleted files
     */
    static async cleanupOldFiles(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const oldFiles = await File.findAll({
                where: {
                    received_at: {
                        [require('sequelize').Op.lt]: cutoffDate
                    }
                }
            });
            
            let deletedCount = 0;
            
            for (const file of oldFiles) {
                // Delete physical file
                if (fs.existsSync(file.file_path)) {
                    fs.unlinkSync(file.file_path);
                }
                
                // Delete database record
                await file.destroy();
                deletedCount++;
            }
            
            console.log(`Cleaned up ${deletedCount} old files`);
            
            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up old files:', error);
            return 0;
        }
    }

    /**
     * Get total storage used by a session
     * @param {number} sessionId - Session ID
     * @returns {Promise<number>} Total bytes used
     */
    static async getSessionStorageSize(sessionId) {
        try {
            const files = await this.getSessionFiles(sessionId);
            const totalSize = files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
            return totalSize;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }
}

module.exports = FileManager;

