// Load .env early and compute DATABASE_URL before modules load
const fs = require('fs');
const path = require('path');

function load(file) {
  try {
    const abs = path.resolve(process.cwd(), file);
    if (!fs.existsSync(abs)) return;
    const txt = fs.readFileSync(abs, 'utf8');
    txt.split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith('#')) return;
      const i = line.indexOf('=');
      if (i < 0) return;
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    });
  } catch {}
}

load('.env.test');
load('.env');

process.env.NODE_ENV = 'test';

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

