const request = require('supertest');

let app;
let adminToken;
let categoriaId;
let productoId;

beforeAll(async () => {
  const mod = await import('../src/index.ts');
  app = mod.default;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.cl', password: 'admin123' });
  adminToken = loginRes.body.token;
});

describe('Productos', () => {
  it('debe listar productos', async () => {
    const res = await request(app)
      .get('/api/productos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debe filtrar productos por búsqueda', async () => {
    const res = await request(app)
      .get('/api/productos?search=Producto+con');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].nombre).toBe('Producto con código');
  });

  it('debe crear un nuevo producto', async () => {
    const cats = await request(app).get('/api/categorias');
    const catId = cats.body[0].id;
    categoriaId = catId;

    const res = await request(app)
      .post('/api/productos')
      .send({
        nombre: 'Nuevo Producto Test',
        codigoBarras: '7801111111115',
        categoriaId: catId,
        precioVenta: 2500,
        precioCosto: 1500,
        stock: 10,
        stockMinimo: 2,
        unidad: 'unidad',
      });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Nuevo Producto Test');
    expect(res.body.precioVenta).toBe(2500);
    productoId = res.body.id;
  });

  it('debe obtener un producto por ID', async () => {
    const res = await request(app)
      .get(`/api/productos/${productoId}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nuevo Producto Test');
  });

  it('debe actualizar un producto', async () => {
    const res = await request(app)
      .put(`/api/productos/${productoId}`)
      .send({
        nombre: 'Producto Actualizado',
        precioVenta: 3000,
        precioCosto: 1500,
        stock: 10,
        stockMinimo: 2,
        categoriaId,
        unidad: 'unidad',
      });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Producto Actualizado');
  });

  it('debe retornar 404 para producto inexistente', async () => {
    const res = await request(app)
      .get('/api/productos/99999');

    expect(res.status).toBe(404);
  });

  it('debe eliminar un producto', async () => {
    const res = await request(app)
      .delete(`/api/productos/${productoId}`);

    expect(res.status).toBe(204);
  });

  it('debe generar código de barras para producto sin código', async () => {
    const list = await request(app).get('/api/productos');
    const sinCodigo = list.body.find((p) => !p.codigoBarras);
    expect(sinCodigo).toBeDefined();

    const res = await request(app)
      .post(`/api/productos/${sinCodigo.id}/generar-codigo`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.codigoBarras).toBeDefined();
    expect(res.body.codigoBarras).toMatch(/^20\d{11}$/);
  });

  it('debe rechazar generar código si ya tiene uno', async () => {
    const list = await request(app).get('/api/productos');
    const conCodigo = list.body.find((p) => p.codigoBarras === '7800000000017');
    expect(conCodigo).toBeDefined();

    const res = await request(app)
      .post(`/api/productos/${conCodigo.id}/generar-codigo`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
