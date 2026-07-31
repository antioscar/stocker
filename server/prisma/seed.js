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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
