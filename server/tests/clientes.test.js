const request = require('supertest');

let app;
let adminToken;
let clienteId;

beforeAll(async () => {
  const mod = await import('../src/index.ts');
  app = mod.default;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.cl', password: 'admin123' });
  adminToken = loginRes.body.token;

  const list = await request(app).get('/api/clientes');
  clienteId = list.body[0].id;
});

describe('Clientes', () => {
  it('debe listar clientes', async () => {
    const res = await request(app).get('/api/clientes');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debe crear un nuevo cliente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({
        nombre: 'Nuevo Cliente Test',
        telefono: '955556666',
        email: 'nuevo@test.cl',
        direccion: 'Calle Test 123',
      });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Nuevo Cliente Test');
    expect(res.body.saldoDeuda).toBe(0);
  });

  it('debe obtener cliente por ID', async () => {
    const res = await request(app).get(`/api/clientes/${clienteId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(clienteId);
  });

  it('debe actualizar un cliente', async () => {
    const res = await request(app)
      .put(`/api/clientes/${clienteId}`)
      .send({ nombre: 'Cliente Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Cliente Actualizado');
  });

  it('debe registrar un abono', async () => {
    const cliente = await request(app).get(`/api/clientes/${clienteId}`);
    const deudaAntes = cliente.body.saldoDeuda;
    expect(deudaAntes).toBeGreaterThan(0);

    const res = await request(app)
      .post(`/api/clientes/${clienteId}/abonos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ monto: 2000 });

    expect(res.status).toBe(201);

    const clientePost = await request(app).get(`/api/clientes/${clienteId}`);
    expect(clientePost.body.saldoDeuda).toBe(deudaAntes - 2000);
  });

  it('debe obtener historial de cuenta', async () => {
    const res = await request(app)
      .get(`/api/clientes/${clienteId}/historial-cuenta`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.cliente).toBeDefined();
    expect(res.body.historial).toBeDefined();
    expect(Array.isArray(res.body.historial)).toBe(true);
  });

  it('debe retornar 404 para cliente inexistente', async () => {
    const res = await request(app).get('/api/clientes/99999');
    expect(res.status).toBe(404);
  });

  it('debe eliminar un cliente', async () => {
    const createRes = await request(app)
      .post('/api/clientes')
      .send({ nombre: 'Cliente a Eliminar' });
    const newId = createRes.body.id;

    const res = await request(app).delete(`/api/clientes/${newId}`);
    expect(res.status).toBe(204);
  });
});
