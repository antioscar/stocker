const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const testDbPath = path.join(__dirname, 'test.db');

process.env.DATABASE_URL = `file:${testDbPath}`;

if (fs.existsSync(testDbPath)) {
  try { fs.unlinkSync(testDbPath); } catch {}
  try { fs.unlinkSync(testDbPath + '-journal'); } catch {}
}

execSync('npx prisma db push --skip-generate --accept-data-loss', {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, DATABASE_URL: `file:${testDbPath}` },
  stdio: 'pipe',
});

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.movimientoStock.deleteMany();
  await prisma.movimientoCaja.deleteMany();
  await prisma.pagoCredito.deleteMany();
  await prisma.compraDetalle.deleteMany();
  await prisma.compraInventario.deleteMany();
  await prisma.ventaDetalle.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.cajaSession.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.configuracion.deleteMany();

  const hash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: { nombre: 'Admin Test', email: 'admin@test.cl', passwordHash: hash, rol: 'ADMIN' },
  });

  await prisma.usuario.create({
    data: { nombre: 'Cajero Test', email: 'cajero@test.cl', passwordHash: hash, rol: 'CAJERO' },
  });

  const cat = await prisma.categoria.create({ data: { nombre: 'Test Categoria' } });

  await prisma.producto.create({
    data: {
      nombre: 'Test Producto', codigoBarras: null, categoriaId: cat.id,
      precioVenta: 1000, precioCosto: 600, stock: 50, stockMinimo: 5, unidad: 'unidad',
    },
  });

  await prisma.producto.create({
    data: {
      nombre: 'Producto con código', codigoBarras: '7800000000017', categoriaId: cat.id,
      precioVenta: 1500, precioCosto: 900, stock: 30, stockMinimo: 3, unidad: 'unidad',
    },
  });

  await prisma.producto.create({
    data: {
      nombre: 'Producto Pesable', codigoBarras: '7800000000024', categoriaId: cat.id,
      precioVenta: 2000, precioCosto: 1200, stock: 20, stockMinimo: 2, unidad: 'kg', esPesable: true,
    },
  });

  await prisma.cliente.create({
    data: { nombre: 'Cliente Fiado', telefono: '912345678', saldoDeuda: 5000 },
  });

  await prisma.cliente.create({
    data: { nombre: 'Cliente Normal', telefono: '987654321', saldoDeuda: 0 },
  });

  await prisma.proveedor.create({
    data: { nombre: 'Proveedor Test', rut: '12345678-9', telefono: '922223333' },
  });

  await prisma.configuracion.upsert({
    where: { key: 'negocio' },
    update: {},
    create: {
      key: 'negocio',
      value: { nombre: 'Test Negocio', rut: '', direccion: '', folioCorrelativo: 0 },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  try { fs.unlinkSync(testDbPath); } catch {}
  try { fs.unlinkSync(testDbPath + '-journal'); } catch {}
});

global.prisma = prisma;
global.testDbPath = testDbPath;
