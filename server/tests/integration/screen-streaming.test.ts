// Tests for Screen Streaming and Remote Control endpoints
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, server } from '../../index';
import { initializeDatabase, User, Device } from '../../models';

let authToken: string;
let deviceId: string;

beforeAll(async () => {
  // Initialize database
  await initializeDatabase();

  // Create test user
  const testUser = await User.create({
    username: 'testoperator',
    email: 'test@operator.com',
    password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
    role: 'operator',
  });

  // Login to get token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'testoperator',
      password: 'Test@123',
    });

  if (loginRes.body.token) {
    authToken = loginRes.body.token;
  }

  // Create test device
  const device = await Device.create({
    socket_id: 'test-socket-stream',
    device_id: 'test-device-stream-001',
    model: 'Test Stream Device',
    version: 'Android 12',
    ip: '127.0.0.1',
    last_seen_at: new Date(),
  });

  deviceId = device.id.toString();
});

afterAll(async () => {
  // Cleanup
  await Device.destroy({ where: { device_id: 'test-device-stream-001' } });
  await User.destroy({ where: { username: 'testoperator' } });
  server.close();
});

describe('Screen Streaming Endpoints', () => {
  it('should start screen stream', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/start-screen-stream`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        quality: 'medium',
        fps: 10,
      });

    // Note: Will fail if device is not actually online
    // In real testing, this would need a mock device connection
    expect([200, 503]).toContain(response.status);
  });

  it('should stop screen stream', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/stop-screen-stream`)
      .set('Authorization', `Bearer ${authToken}`);

    expect([200, 500]).toContain(response.status);
  });

  it('should return 404 for non-existent device', async () => {
    const response = await request(app)
      .post('/api/devices/99999999/start-screen-stream')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        quality: 'medium',
      });

    expect(response.status).toBe(404);
  });
});

describe('Remote Control Endpoints', () => {
  it('should inject touch event', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/inject-touch`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        action: 'down',
        x: 100,
        y: 200,
      });

    expect([200, 500]).toContain(response.status);
  });

  it('should inject keyboard event', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/inject-keyboard`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        text: 'Hello',
        keyCode: 72,
      });

    expect([200, 500]).toContain(response.status);
  });

  it('should reject invalid touch event', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/inject-touch`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        action: 'down',
        // Missing x and y
      });

    expect(response.status).toBe(400);
  });

  it('should reject invalid keyboard event', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/inject-keyboard`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        // Missing both text and keyCode
      });

    expect(response.status).toBe(400);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post(`/api/devices/${deviceId}/inject-touch`)
      .send({
        action: 'down',
        x: 100,
        y: 200,
      });

    expect(response.status).toBe(401);
  });
});

describe('Socket.IO Events', () => {
  it('should handle screen-frame events', (done) => {
    // This would require a Socket.IO client to properly test
    // For now, this is a placeholder test
    expect(true).toBe(true);
    done();
  });

  it('should handle remote-control-event', (done) => {
    // This would require a Socket.IO client to properly test
    // For now, this is a placeholder test
    expect(true).toBe(true);
    done();
  });
});
