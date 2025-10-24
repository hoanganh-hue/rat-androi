/**
 * Cleanup Old Sessions Script
 * Run this script to clean up old sessions, logs, commands, and files
 */

const path = require('path');
const appPath = path.join(__dirname, '../app');

// Load database modules
const { sequelize, initializeDatabase, Session, Victim } = require(path.join(appPath, '/database/index'));
const CommandLogger = require(path.join(appPath, '/database/CommandLogger'));
const FileManager = require(path.join(appPath, '/database/FileManager'));
const { Op } = require('sequelize');

// Configuration
const DAYS_TO_KEEP = process.argv[2] ? parseInt(process.argv[2]) : 30;

async function cleanup() {
    console.log(`🧹 Cleaning up data older than ${DAYS_TO_KEEP} days...\n`);
    
    try {
        // Initialize database
        await initializeDatabase();
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);
        
        console.log(`📅 Cutoff date: ${cutoffDate.toLocaleDateString()}\n`);
        
        // Clean up old sessions
        console.log('🔍 Finding old sessions...');
        const oldSessions = await Session.findAll({
            where: {
                start_time: {
                    [Op.lt]: cutoffDate
                }
            }
        });
        
        console.log(`   Found ${oldSessions.length} old sessions`);
        
        if (oldSessions.length > 0) {
            // Delete sessions
            const deletedSessions = await Session.destroy({
                where: {
                    start_time: {
                        [Op.lt]: cutoffDate
                    }
                }
            });
            console.log(`   ✓ Deleted ${deletedSessions} sessions`);
        }
        
        // Clean up old commands
        console.log('\n🔍 Cleaning up old commands...');
        const deletedCommands = await CommandLogger.cleanupOldCommands(DAYS_TO_KEEP);
        console.log(`   ✓ Deleted ${deletedCommands} commands`);
        
        // Clean up old logs
        console.log('\n🔍 Cleaning up old logs...');
        const deletedLogs = await CommandLogger.cleanupOldLogs(DAYS_TO_KEEP);
        console.log(`   ✓ Deleted ${deletedLogs} logs`);
        
        // Clean up old files
        console.log('\n🔍 Cleaning up old files...');
        const deletedFiles = await FileManager.cleanupOldFiles(DAYS_TO_KEEP);
        console.log(`   ✓ Deleted ${deletedFiles} files`);
        
        // Calculate storage stats
        console.log('\n📊 Remaining Data:');
        
        const totalVictims = await Victim.count();
        const activeSessions = await Session.count({
            where: {
                status: 'active'
            }
        });
        const closedSessions = await Session.count({
            where: {
                status: 'closed'
            }
        });
        
        console.log(`   - Total victims: ${totalVictims}`);
        console.log(`   - Active sessions: ${activeSessions}`);
        console.log(`   - Closed sessions: ${closedSessions}`);
        
        // Close connection
        await sequelize.close();
        
        console.log('\n✨ Cleanup completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Display usage if help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node cleanup-old-sessions.js [days]');
    console.log('');
    console.log('Arguments:');
    console.log('  days    Number of days to keep (default: 30)');
    console.log('');
    console.log('Example:');
    console.log('  node cleanup-old-sessions.js 60    # Keep last 60 days');
    process.exit(0);
}

// Run cleanup
cleanup();

