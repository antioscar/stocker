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

  await request(app)
    .post('/api/caja/apertura')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ montoApertura: 50000 });

  const prods = await request(app).get('/api/productos');
  const prod = prods.body[0];

  if (prod.stock >= 2) {
    await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [{ productoId: prod.id, cantidad: 2, precioUnitario: prod.precioVenta }],
        metodoPago: 'efectivo',
      });
  }
});

describe('Reportes', () => {
  it('debe obtener resumen de reportes', async () => {
    const res = await request(app).get('/api/reportes/resumen');

    expect(res.status).toBe(200);
    expect(res.body.resumen).toBeDefined();
    expect(res.body.resumen.totalVentas).toBeGreaterThanOrEqual(0);
    expect(res.body.resumen.totalIngresos).toBeGreaterThanOrEqual(0);
  });

  it('debe listar productos más vendidos', async () => {
    const res = await request(app).get('/api/reportes/productos-mas-vendidos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe listar stock bajo', async () => {
    const res = await request(app).get('/api/reportes/stock-bajo');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe incluir ventas por día en resumen', async () => {
    const res = await request(app).get('/api/reportes/resumen');

    expect(res.status).toBe(200);
    expect(res.body.ventasPorDia).toBeDefined();
    expect(typeof res.body.ventasPorDia).toBe('object');
  });
});

describe('Configuración', () => {
  it('debe obtener configuración', async () => {
    const res = await request(app).get('/api/configuracion');

    expect(res.status).toBe(200);
    expect(res.body.negocio).toBeDefined();
  });

  it('debe actualizar configuración', async () => {
    const res = await request(app)
      .put('/api/configuracion')
      .send({ negocio: { nombre: 'Test Actualizado', direccion: 'Calle Nueva 123' } });

    expect(res.status).toBe(200);
  });

  it('debe reflejar cambios después de actualizar', async () => {
    const res = await request(app).get('/api/configuracion');
    expect(res.body.negocio.nombre).toBe('Test Actualizado');
  });
});
