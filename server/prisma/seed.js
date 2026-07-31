const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminExiste = await prisma.usuario.findUnique({
    where: { email: 'admin@stockcaja.cl' },
  });

  if (!adminExiste) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        email: 'admin@stockcaja.cl',
        passwordHash,
        rol: 'ADMIN',
      },
    });
    console.log('Usuario administrador creado: admin@stockcaja.cl / admin123');
  } else {
    console.log('El usuario administrador ya existe');
  }

  const configNegocio = await prisma.configuracion.findUnique({
    where: { key: 'negocio' },
  });

  if (!configNegocio) {
    await prisma.configuracion.create({
      data: {
        key: 'negocio',
        value: {
          nombre: 'Mi Negocio',
          rut: '',
          direccion: '',
          telefono: '',
          folioCorrelativo: 0,
        },
      },
    });
    console.log('Configuración del negocio creada');
  }

  // Seeding Categories
  console.log('Creando categorías de prueba...');
  const catBebidas = await prisma.categoria.create({ data: { nombre: 'Bebidas' } });
  const catAbarrotes = await prisma.categoria.create({ data: { nombre: 'Abarrotes' } });
  const catLacteos = await prisma.categoria.create({ data: { nombre: 'Lácteos' } });

  // Seeding Products
  console.log('Creando productos de prueba...');
  const productosTest = [
    {
      nombre: 'Coca-Cola Original 1.5L',
      codigoBarras: '7801610001013',
      categoriaId: catBebidas.id,
      precioVenta: 1800,
      precioCosto: 1200,
      stock: 50,
      stockMinimo: 5,
      unidad: 'unidad',
    },
    {
      nombre: 'Agua Mineral Cachantun 500ml',
      codigoBarras: '7801610002027',
      categoriaId: catBebidas.id,
      precioVenta: 800,
      precioCosto: 400,
      stock: 100,
      stockMinimo: 10,
      unidad: 'unidad',
    },
    {
      nombre: 'Tallarines Lucchetti N°5 400g',
      codigoBarras: '7802225000115',
      categoriaId: catAbarrotes.id,
      precioVenta: 1200,
      precioCosto: 850,
      stock: 30,
      stockMinimo: 6,
      unidad: 'unidad',
    },
    {
      nombre: 'Arroz Tucapel Grado 1 1kg',
      codigoBarras: '7802225000221',
      categoriaId: catAbarrotes.id,
      precioVenta: 1500,
      precioCosto: 1100,
      stock: 40,
      stockMinimo: 8,
      unidad: 'unidad',
    },
    {
      nombre: 'Leche Soprole Entera 1L',
      codigoBarras: '7803336000113',
      categoriaId: catLacteos.id,
      precioVenta: 1100,
      precioCosto: 750,
      stock: 25,
      stockMinimo: 5,
      unidad: 'unidad',
    },
    {
      nombre: 'Mantequilla Colun con Sal 250g',
      codigoBarras: '7803336000229',
      categoriaId: catLacteos.id,
      precioVenta: 2200,
      precioCosto: 1550,
      stock: 15,
      stockMinimo: 3,
      unidad: 'unidad',
    },
  ];

  for (const prod of productosTest) {
    const existe = await prisma.producto.findFirst({
      where: { codigoBarras: prod.codigoBarras },
    });
    if (!existe) {
      await prisma.producto.create({ data: prod });
      console.log(`Producto creado: ${prod.nombre} (Código: ${prod.codigoBarras})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
