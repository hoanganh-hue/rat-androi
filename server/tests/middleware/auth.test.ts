// Auth Middleware Tests (no mocks): exercise real middleware
import { describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { authenticate, generateToken } from '../../middleware/auth';

describe('Auth Middleware (real)', () => {
  const app = express();
  app.get('/protected', authenticate, (_req, res) => {
    res.json({ ok: true });
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'NotBearer token');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('allows access with a valid token', async () => {
    const token = generateToken({ id: 1, username: 'test', role: 'admin' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
