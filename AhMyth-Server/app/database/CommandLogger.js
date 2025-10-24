const { Command, Log } = require('./index');

class CommandLogger {
    /**
     * Log a command to database
     * @param {number} sessionId - Session ID
     * @param {string} cmdType - Command type (e.g., 'SCREEN', 'TOUCH', 'SMS')
     * @param {Object} payload - Command payload
     * @returns {Promise<Object>} Created command record
     */
    static async logCommand(sessionId, cmdType, payload) {
        try {
            const command = await Command.create({
                session_id: sessionId,
                cmd_type: cmdType,
                payload: JSON.stringify(payload),
                sent_at: new Date()
            });
            
            return command;
        } catch (error) {
            console.error('Error logging command:', error);
            throw error;
        }
    }

    /**
     * Update command acknowledgement time
     * @param {number} commandId - Command ID
     * @returns {Promise<boolean>} Success status
     */
    static async acknowledgeCommand(commandId) {
        try {
            await Command.update(
                { ack_at: new Date() },
                { where: { id: commandId } }
            );
            
            return true;
        } catch (error) {
            console.error('Error acknowledging command:', error);
            return false;
        }
    }

    /**
     * Get commands for a session
     * @param {number} sessionId - Session ID
     * @param {number} limit - Max number of commands to return
     * @returns {Promise<Array>} Array of commands
     */
    static async getSessionCommands(sessionId, limit = 100) {
        try {
            const commands = await Command.findAll({
                where: { session_id: sessionId },
                order: [['sent_at', 'DESC']],
                limit: limit
            });
            
            return commands;
        } catch (error) {
            console.error('Error fetching commands:', error);
            return [];
        }
    }

    /**
     * Log an event to the session log
     * @param {number} sessionId - Session ID
     * @param {string} level - Log level (INFO, WARN, ERROR)
     * @param {string} message - Log message
     * @returns {Promise<Object>} Created log record
     */
    static async logEvent(sessionId, level, message) {
        try {
            const log = await Log.create({
                session_id: sessionId,
                level: level,
                message: message,
                timestamp: new Date()
            });
            
            return log;
        } catch (error) {
            console.error('Error logging event:', error);
            throw error;
        }
    }

    /**
     * Get logs for a session
     * @param {number} sessionId - Session ID
     * @param {string} level - Filter by level (optional)
     * @param {number} limit - Max number of logs to return
     * @returns {Promise<Array>} Array of logs
     */
    static async getSessionLogs(sessionId, level = null, limit = 100) {
        try {
            const where = { session_id: sessionId };
            if (level) {
                where.level = level;
            }
            
            const logs = await Log.findAll({
                where: where,
                order: [['timestamp', 'DESC']],
                limit: limit
            });
            
            return logs;
        } catch (error) {
            console.error('Error fetching logs:', error);
            return [];
        }
    }

    /**
     * Delete old commands
     * @param {number} daysOld - Delete commands older than this many days
     * @returns {Promise<number>} Number of deleted records
     */
    static async cleanupOldCommands(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const result = await Command.destroy({
                where: {
                    sent_at: {
                        [require('sequelize').Op.lt]: cutoffDate
                    }
                }
            });
            
            console.log(`Deleted ${result} old command records`);
            return result;
        } catch (error) {
            console.error('Error cleaning up commands:', error);
            return 0;
        }
    }

    /**
     * Delete old logs
     * @param {number} daysOld - Delete logs older than this many days
     * @returns {Promise<number>} Number of deleted records
     */
    static async cleanupOldLogs(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const result = await Log.destroy({
                where: {
                    timestamp: {
                        [require('sequelize').Op.lt]: cutoffDate
                    }
                }
            });
            
            console.log(`Deleted ${result} old log records`);
            return result;
        } catch (error) {
            console.error('Error cleaning up logs:', error);
            return 0;
        }
    }
}

module.exports = CommandLogger;

