// User Model Tests (real data)
import { describe, it, expect } from '@jest/globals';
import bcrypt from 'bcrypt';
import { User } from '../../models';

describe('User Model (real database)', () => {
  it('database contains at least one user', async () => {
    const count = await User.count();
    expect(count).toBeGreaterThan(0);
  });

  it('admin credentials from env match stored hash', async () => {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const user = await User.findOne({ where: { username } as any });
    // If DB is not seeded, this will be null; setup seeds when empty
    expect(user).not.toBeNull();
    if (!user) return; // Type guard for TS
    const ok = await bcrypt.compare(password, user.password_hash);
    expect(ok).toBe(true);
  });
});
