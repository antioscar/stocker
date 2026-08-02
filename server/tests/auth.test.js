const request = require('supertest');

let app;
let adminToken;
let cajeroToken;

beforeAll(async () => {
  const mod = await import('../src/index.ts');
  app = mod.default;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.cl', password: 'admin123' });
  adminToken = loginRes.body.token;

  const cajeroRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cajero@test.cl', password: 'admin123' });
  cajeroToken = cajeroRes.body.token;
});

describe('Auth', () => {
  it('debe hacer login exitoso con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.cl', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe('admin@test.cl');
    expect(res.body.usuario.rol).toBe('ADMIN');
  });

  it('debe rechazar login con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.cl', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('debe rechazar login con email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.cl', password: 'admin123' });

    expect(res.status).toBe(401);
  });

  it('debe retornar datos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@test.cl');
    expect(res.body.rol).toBe('ADMIN');
  });

  it('debe rechazar /auth/me sin token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('debe rechazar /auth/me con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido');

    expect(res.status).toBe(403);
  });

  it('debe hacer login como cajero y tener rol CAJERO', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${cajeroToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rol).toBe('CAJERO');
  });
});
