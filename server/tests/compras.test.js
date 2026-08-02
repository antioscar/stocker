const request = require('supertest');

let app;
let adminToken;
let proveedorId;
let productoId;

beforeAll(async () => {
  const mod = await import('../src/index.ts');
  app = mod.default;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.cl', password: 'admin123' });
  adminToken = loginRes.body.token;

  const provs = await request(app).get('/api/proveedores');
  proveedorId = provs.body[0].id;

  const prods = await request(app).get('/api/productos');
  productoId = prods.body[0].id;
});

describe('Compras', () => {
  it('debe registrar una compra y aumentar stock', async () => {
    const prodAntes = await request(app).get(`/api/productos/${productoId}`);
    const stockAntes = prodAntes.body.stock;
    const costoAntes = prodAntes.body.precioCosto;

    const res = await request(app)
      .post('/api/compras')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        proveedorId,
        documentoTipo: 'FACTURA',
        documentoFolio: 'F-001',
        items: [
          { productoId, cantidad: 10, precioCostoUnitario: 550, precioVentaSugerido: 1200 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(550 * 10);

    const prodDespues = await request(app).get(`/api/productos/${productoId}`);
    expect(prodDespues.body.stock).toBe(stockAntes + 10);
    expect(prodDespues.body.precioCosto).toBe(550);
    expect(prodDespues.body.precioVenta).toBe(1200);
  });

  it('debe listar compras', async () => {
    const res = await request(app)
      .get('/api/compras')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debe filtrar compras por proveedor', async () => {
    const res = await request(app)
      .get(`/api/compras?proveedorId=${proveedorId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debe rechazar compra sin proveedor', async () => {
    const res = await request(app)
      .post('/api/compras')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        proveedorId: 99999,
        documentoTipo: 'FACTURA',
        documentoFolio: 'F-002',
        items: [{ productoId, cantidad: 5, precioCostoUnitario: 600 }],
      });

    expect(res.status).toBe(404);
  });

  it('debe rechazar compra sin items', async () => {
    const res = await request(app)
      .post('/api/compras')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        proveedorId,
        documentoTipo: 'FACTURA',
        documentoFolio: 'F-003',
        items: [],
      });

    expect(res.status).toBe(400);
  });
});

describe('Proveedores', () => {
  let newProvId;

  it('debe listar proveedores', async () => {
    const res = await request(app).get('/api/proveedores');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe crear un proveedor', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .send({
        nombre: 'Nuevo Proveedor Test',
        rut: '98765432-1',
        telefono: '988887777',
        direccion: 'Av. Test 456',
      });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Nuevo Proveedor Test');
    newProvId = res.body.id;
  });

  it('debe obtener proveedor por ID', async () => {
    const res = await request(app).get(`/api/proveedores/${newProvId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(newProvId);
  });

  it('debe actualizar un proveedor', async () => {
    const res = await request(app)
      .put(`/api/proveedores/${newProvId}`)
      .send({ nombre: 'Proveedor Actualizado', telefono: '911112222' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Proveedor Actualizado');
  });

  it('debe eliminar un proveedor', async () => {
    const res = await request(app).delete(`/api/proveedores/${newProvId}`);
    expect(res.status).toBe(204);
  });
});
