// Seed script to create initial admin user
import bcrypt from 'bcrypt';
import { sequelize, User, UserRole, initializeDatabase } from '../models';
import logger from '../utils/logger';

/**
 * Create initial admin user if no users exist
 */
async function seedAdminUser(): Promise<void> {
  try {
    // Initialize database first
    await initializeDatabase();

    // Check if any users exist
    const userCount = await User.count();

    if (userCount > 0) {
      logger.info('Users already exist. Skipping admin seed.');
      console.log('✅ Users already exist. Skipping admin seed.');
      return;
    }

    // Get admin credentials from environment or use defaults
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@dogerat.local';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      username,
      email,
      password_hash,
      role: UserRole.ADMIN,
    });

    logger.info(`Admin user created: ${admin.username}`);
    console.log(`
✅ Admin user created successfully!

Credentials:
  Username: ${username}
  Email: ${email}
  Password: ${password}
  Role: ${UserRole.ADMIN}

⚠️  IMPORTANT: Change the admin password immediately after first login!
`);
  } catch (error) {
    logger.error('Error seeding admin user:', error);
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedAdminUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedAdminUser;

