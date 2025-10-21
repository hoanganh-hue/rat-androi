import express from 'express';
import request from 'supertest';
import usersRoutes from '../../routes/users.routes';

describe('Users Routes (auth guard only)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/users', usersRoutes);

  it('GET /api/users without token returns 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

