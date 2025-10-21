// Seed script to create demo data for development/testing
import bcrypt from 'bcrypt';
import { sequelize, User, UserRole, Device, DeviceLog, LogType, Command, CommandStatus, initializeDatabase } from '../models';
import logger from '../utils/logger';

/**
 * Create demo users with different roles
 */
async function seedDemoUsers(): Promise<void> {
  const users = [
    {
      username: 'manager',
      email: 'manager@dogerat.local',
      password: 'Manager@123',
      role: UserRole.MANAGER,
    },
    {
      username: 'operator',
      email: 'operator@dogerat.local',
      password: 'Operator@123',
      role: UserRole.OPERATOR,
    },
    {
      username: 'viewer',
      email: 'viewer@dogerat.local',
      password: 'Viewer@123',
      role: UserRole.VIEWER,
    },
  ];

  for (const userData of users) {
    const password_hash = await bcrypt.hash(userData.password, 10);
    await User.create({
      ...userData,
      password_hash,
    });
    console.log(`   ✅ Created user: ${userData.username} (${userData.role})`);
  }
}

/**
 * Create demo devices
 */
async function seedDemoDevices(): Promise<void> {
  const devices = [
    {
      socket_id: 'demo-socket-1',
      device_id: 'Samsung-Galaxy-S21',
      model: 'Samsung Galaxy S21',
      version: 'Android 12',
      ip: '192.168.1.101',
      user_agent: 'DogeRat/1.0 (Android 12)',
      last_seen_at: new Date(),
    },
    {
      socket_id: 'demo-socket-2',
      device_id: 'Google-Pixel-6',
      model: 'Google Pixel 6',
      version: 'Android 13',
      ip: '192.168.1.102',
      user_agent: 'DogeRat/1.0 (Android 13)',
      last_seen_at: new Date(Date.now() - 300000), // 5 minutes ago (offline)
    },
    {
      socket_id: 'demo-socket-3',
      device_id: 'Xiaomi-Mi-11',
      model: 'Xiaomi Mi 11',
      version: 'Android 11',
      ip: '192.168.1.103',
      user_agent: 'DogeRat/1.0 (Android 11)',
      last_seen_at: new Date(),
    },
  ];

  for (const deviceData of devices) {
    await Device.create(deviceData);
    console.log(`   ✅ Created device: ${deviceData.model}`);
  }

  return;
}

/**
 * Create demo device logs
 */
async function seedDemoLogs(): Promise<void> {
  const devices = await Device.findAll();
  
  if (devices.length === 0) {
    console.log('   ⚠️  No devices found. Skipping log seeding.');
    return;
  }

  const logTypes: LogType[] = [LogType.CONTACTS, LogType.SMS, LogType.LOCATION, LogType.SCREENSHOT];
  
  for (const device of devices) {
    for (const type of logTypes) {
      await DeviceLog.create({
        device_id: device.id,
        type,
        payload: {
          timestamp: new Date().toISOString(),
          data: `Demo ${type} data from ${device.model}`,
        },
      });
    }
    console.log(`   ✅ Created logs for device: ${device.model}`);
  }
}

/**
 * Create demo commands
 */
async function seedDemoCommands(): Promise<void> {
  const devices = await Device.findAll();
  const admin = await User.findOne({ where: { role: UserRole.ADMIN } });

  if (!admin || devices.length === 0) {
    console.log('   ⚠️  No admin user or devices found. Skipping command seeding.');
    return;
  }

  const commands = ['contacts', 'sms', 'toast', 'screenshot'];

  for (const device of devices.slice(0, 2)) { // Only first 2 devices
    for (const command of commands) {
      await Command.create({
        device_id: device.id,
        command: command as any,
        params: command === 'toast' ? { message: 'Demo toast message' } : {},
        status: CommandStatus.OK,
        created_by: admin.id,
        executed_at: new Date(),
      });
    }
    console.log(`   ✅ Created commands for device: ${device.model}`);
  }
}

/**
 * Main seed function
 */
async function seedDemoData(): Promise<void> {
  try {
    console.log('🌱 Seeding demo data...\n');

    // Initialize database
    await initializeDatabase();

    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 1) {
      console.log('⚠️  Demo data already exists. Skipping seed.');
      console.log('   Run with --force to delete and recreate all data.\n');
      return;
    }

    console.log('👤 Creating demo users...');
    await seedDemoUsers();

    console.log('\n📱 Creating demo devices...');
    await seedDemoDevices();

    console.log('\n📄 Creating demo device logs...');
    await seedDemoLogs();

    console.log('\n⚡ Creating demo commands...');
    await seedDemoCommands();

    console.log('\n✅ Demo data seeding completed!\n');
    console.log('Demo User Credentials:');
    console.log('  Manager   - username: manager, password: Manager@123');
    console.log('  Operator  - username: operator, password: Operator@123');
    console.log('  Viewer    - username: viewer, password: Viewer@123\n');

    logger.info('Demo data seeded successfully');
  } catch (error) {
    logger.error('Error seeding demo data:', error);
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDemoData;

