import express from 'express';
import request from 'supertest';
import devicesRoutes from '../../routes/devices.routes';

describe('Devices Routes (auth guard only)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/devices', devicesRoutes);

  it('GET /api/devices without token returns 401', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

