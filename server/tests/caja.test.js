const request = require('supertest');

let app;
let adminToken;

beforeAll(async () => {
  const mod = await import('../src/index.ts');
  app = mod.default;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.cl', password: 'admin123' });
  adminToken = loginRes.body.token;
});

describe('Caja', () => {
  it('debe verificar que la caja está cerrada inicialmente', async () => {
    const res = await request(app)
      .get('/api/caja/estado')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.abierta).toBe(false);
  });

  it('debe abrir caja con monto de apertura', async () => {
    const res = await request(app)
      .post('/api/caja/apertura')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ montoApertura: 50000 });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('ABIERTA');
    expect(res.body.montoApertura).toBe(50000);
  });

  it('debe rechazar abrir caja si ya está abierta', async () => {
    const res = await request(app)
      .post('/api/caja/apertura')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ montoApertura: 30000 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/abierta/i);
  });

  it('debe mostrar estado de caja abierta', async () => {
    const res = await request(app)
      .get('/api/caja/estado')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.abierta).toBe(true);
    expect(res.body.session).toBeDefined();
  });

  it('debe registrar un movimiento manual de ingreso', async () => {
    const res = await request(app)
      .post('/api/caja/movimientos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tipo: 'INGRESO', monto: 10000, motivo: 'Venta de cajas de cartón' });

    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe('INGRESO');
  });

  it('debe registrar un movimiento manual de egreso', async () => {
    const res = await request(app)
      .post('/api/caja/movimientos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tipo: 'EGRESO', monto: 5000, motivo: 'Pago de flete' });

    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe('EGRESO');
  });

  it('debe rechazar movimiento sin sesión de caja abierta', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cajero@test.cl', password: 'admin123' });
    const cajeroToken = loginRes.body.token;

    const res = await request(app)
      .post('/api/caja/movimientos')
      .set('Authorization', `Bearer ${cajeroToken}`)
      .send({ tipo: 'INGRESO', monto: 5000, motivo: 'test' });

    expect(res.status).toBe(400);
  });

  it('debe cerrar caja correctamente', async () => {
    const res = await request(app)
      .post('/api/caja/cierre')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ montoCierre: 55000, observaciones: 'Cierre de turno mañana' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('CERRADA');
    expect(res.body.diferencia).toBeDefined();
  });

  it('debe rechazar cerrar caja si no está abierta', async () => {
    const res = await request(app)
      .post('/api/caja/cierre')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ montoCierre: 20000 });

    expect(res.status).toBe(400);
  });
});
