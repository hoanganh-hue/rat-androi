// Database migration script
// Since we're using Sequelize-TypeScript with sync(), this script ensures the database is properly set up

import { sequelize, initializeDatabase } from '../models';
import logger from '../utils/logger';

/**
 * Run database migrations
 * This will create or update all tables based on the models
 */
async function migrate(): Promise<void> {
  try {
    console.log('🔄 Starting database migration...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Get current environment
    const env = process.env.NODE_ENV || 'development';
    const forceSync = process.argv.includes('--force');
    const alterSync = process.argv.includes('--alter') || env === 'development';

    console.log(`Environment: ${env}`);
    console.log(`Force sync: ${forceSync}`);
    console.log(`Alter sync: ${alterSync}\n`);

    if (forceSync) {
      console.warn('⚠️  WARNING: Force sync will DROP all existing tables and recreate them!');
      console.warn('⚠️  All data will be lost! Press Ctrl+C within 5 seconds to cancel...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Sync all models
    await sequelize.sync({ 
      force: forceSync,
      alter: alterSync && !forceSync,
    });

    console.log('✅ Database migration completed successfully!\n');

    // Show created tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Database tables:');
    tables.forEach(table => console.log(`   - ${table}`));
    console.log('');

    logger.info('Database migration completed');
  } catch (error) {
    logger.error('Database migration failed:', error);
    console.error('❌ Database migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✨ Migration script finished successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

export default migrate;

