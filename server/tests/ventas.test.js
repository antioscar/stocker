const request = require('supertest');

let app;
let adminToken;
let cajeroToken;
let adminUserId;
let cajeroUserId;
let productoConCodigo;
let productoSinCodigo;
let clienteId;
let ventaId;

async function ensureCajaAbierta(token) {
  const estado = await request(app)
    .get('/api/caja/estado')
    .set('Authorization', `Bearer ${token}`);
  if (!estado.body.abierta) {
    await request(app)
      .post('/api/caja/apertura')
      .set('Authorization', `Bearer ${token}`)
      .send({ montoApertura: 50000 });
  }
}

beforeAll(async () => {
  const mod = await import('../src/index.ts');
  app = mod.default;

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.cl', password: 'admin123' });
  adminToken = adminLogin.body.token;
  adminUserId = adminLogin.body.usuario.id;

  const cajeroLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cajero@test.cl', password: 'admin123' });
  cajeroToken = cajeroLogin.body.token;
  cajeroUserId = cajeroLogin.body.usuario.id;

  const products = await request(app).get('/api/productos');
  productoConCodigo = products.body.find((p) => p.codigoBarras === '7800000000017');
  productoSinCodigo = products.body.find((p) => !p.codigoBarras);

  const clientes = await request(app).get('/api/clientes');
  clienteId = clientes.body[0].id;

  await ensureCajaAbierta(adminToken);
});

describe('Ventas', () => {
  it('debe crear una venta con éxito', async () => {
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productoId: productoConCodigo.id, cantidad: 2, precioUnitario: productoConCodigo.precioVenta },
        ],
        metodoPago: 'efectivo',
      });

    expect(res.status).toBe(201);
    expect(res.body.folio).toMatch(/^BOL-\d{4}$/);
    expect(res.body.total).toBe(productoConCodigo.precioVenta * 2);
    ventaId = res.body.id;
  });

  it('debe descontar stock al crear una venta', async () => {
    const antes = await request(app).get(`/api/productos/${productoConCodigo.id}`);
    const stockAntes = antes.body.stock;

    await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productoId: productoConCodigo.id, cantidad: 3, precioUnitario: productoConCodigo.precioVenta },
        ],
        metodoPago: 'efectivo',
      });

    const despues = await request(app).get(`/api/productos/${productoConCodigo.id}`);
    expect(despues.body.stock).toBe(stockAntes - 3);
  });

  it('debe rechazar venta con stock insuficiente', async () => {
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productoId: productoConCodigo.id, cantidad: 99999, precioUnitario: 1000 },
        ],
        metodoPago: 'efectivo',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });

  it('debe crear una venta con descuento', async () => {
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productoId: productoSinCodigo.id, cantidad: 1, precioUnitario: productoSinCodigo.precioVenta },
        ],
        metodoPago: 'efectivo',
        descuento: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(productoSinCodigo.precioVenta * 0.9);
  });

  it('debe listar ventas', async () => {
    const res = await request(app)
      .get('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debe obtener venta por ID', async () => {
    const res = await request(app)
      .get(`/api/ventas/${ventaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ventaId);
    expect(res.body.ventaDetalle).toBeDefined();
  });

  it('debe anular una venta y devolver stock', async () => {
    const prod = await request(app).get(`/api/productos/${productoSinCodigo.id}`);
    const stockAntes = prod.body.stock;

    const venta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productoId: productoSinCodigo.id, cantidad: 2, precioUnitario: productoSinCodigo.precioVenta },
        ],
        metodoPago: 'efectivo',
      });

    expect(venta.status).toBe(201);

    const res = await request(app)
      .post(`/api/ventas/${venta.body.id}/anular`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ motivo: 'prueba' });

    expect(res.status).toBe(200);

    const prodDespues = await request(app).get(`/api/productos/${productoSinCodigo.id}`);
    expect(prodDespues.body.stock).toBe(stockAntes);
  });

  it('debe crear venta al fiado', async () => {
    const clienteRes = await request(app).get(`/api/clientes/${clienteId}`);
    const deudaPrevia = clienteRes.body.saldoDeuda;

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clienteId,
        items: [
          { productoId: productoSinCodigo.id, cantidad: 1, precioUnitario: productoSinCodigo.precioVenta },
        ],
        metodoPago: 'fiado',
      });

    expect(res.status).toBe(201);
    expect(res.body.metodoPago).toBe('fiado');

    const clientePost = await request(app).get(`/api/clientes/${clienteId}`);
    expect(clientePost.body.saldoDeuda).toBe(deudaPrevia + productoSinCodigo.precioVenta);
  });
});
