// Jest setup: load real env and initialize DB once per worker
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Lazy import to avoid ESM init ordering issues
let initialized = false;

function loadEnvFile(filePath: string) {
  try {
    const abs = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(abs)) return;
    const content = fs.readFileSync(abs, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.substring(0, eq).trim();
      let value = line.substring(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (e) {
    // Non-fatal: tests can still run if env is provided via OS
  }
}

async function ensureDatabaseReady() {
  if (initialized) return;
  initialized = true;

  // Prefer .env.test, then .env
  loadEnvFile('.env.test');
  loadEnvFile('.env');

  // Ensure NODE_ENV=test
  process.env.NODE_ENV = 'test';

  // Derive DATABASE_URL if missing and DB_* provided
  if (!process.env.DATABASE_URL) {
    const name = process.env.DB_NAME || 'dogerat';
    const user = process.env.DB_USER || 'dogerat';
    const pass = process.env.DB_PASSWORD || 'changeme';
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const type = (process.env.DB_TYPE || 'postgres').toLowerCase();
    if (type === 'postgres' || type === 'postgresql') {
      process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}`;
    } else if (type === 'mysql') {
      process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${name}`;
    }
  }

  // Initialize Sequelize models & DB
  const { initializeDatabase, User } = await import('./server/models');
  await initializeDatabase();

  // Seed a production-like admin only if database is empty
  const existing = await User.count();
  if (existing === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@dogerat.local';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const password_hash = await bcrypt.hash(password, 10);
    await User.create({ username, email, password_hash, role: 'admin' as any });
  }
}

// Jest will execute this file per test environment; kick off DB readiness synchronously
beforeAll(async () => {
  await ensureDatabaseReady();
});

