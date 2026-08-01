// Clientes handlers
const prisma = require('../utils/db');

// List customers with search
const list = async (req, res) => {
  try {
    const { search } = req.query;
    
    const where = {};
    
    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: {
        nombre: 'asc',
      },
    });
    
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Get customer by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Create customer
const create = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;
    
    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        email,
        direccion,
      },
    });
    
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// Update customer
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion } = req.body;
    
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        telefono,
        email,
        direccion,
      },
    });
    
    res.json(cliente);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.cliente.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

const registrarAbono = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto } = req.body;
    const activeUser = req.user.id;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'El monto del abono debe ser mayor a cero' });
    }

    const clienteId = parseInt(id);

    const abono = await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      const nuevoAbono = await tx.pagoCredito.create({
        data: {
          clienteId,
          monto,
          usuarioId: activeUser,
        },
      });

      await tx.cliente.update({
        where: { id: clienteId },
        data: {
          saldoDeuda: { decrement: monto },
        },
      });

      return nuevoAbono;
    });

    res.status(201).json(abono);
  } catch (error) {
    console.error('Error al registrar abono:', error);
    if (error.message === 'Cliente no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al registrar abono' });
  }
};

const getHistorialCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const ventasFiadas = await prisma.venta.findMany({
      where: {
        clienteId,
        metodoPago: 'fiado',
        anulada: false,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        folio: true,
        total: true,
        createdAt: true,
      },
    });

    const abonos = await prisma.pagoCredito.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: { nombre: true },
        },
      },
    });

    const historial = [
      ...ventasFiadas.map(v => ({
        tipo: 'COMPRA',
        id: v.id,
        detalle: `Compra con folio ${v.folio}`,
        monto: v.total,
        createdAt: v.createdAt,
      })),
      ...abonos.map(a => ({
        tipo: 'ABONO',
        id: a.id,
        detalle: `Abono registrado por ${a.usuario.nombre}`,
        monto: a.monto,
        createdAt: a.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      cliente,
      historial,
    });
  } catch (error) {
    console.error('Error al obtener historial de cuenta:', error);
    res.status(500).json({ error: 'Error al obtener historial de cuenta' });
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteCustomer,
  registrarAbono,
  getHistorialCuenta,
};
