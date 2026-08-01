const prisma = require('../utils/db');

// List suppliers
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
    const proveedores = await prisma.proveedor.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// Get supplier by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: parseInt(id) },
    });
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

// Create supplier
const create = async (req, res) => {
  try {
    const { nombre, rut, telefono, email, direccion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const proveedor = await prisma.proveedor.create({
      data: { nombre, rut, telefono, email, direccion },
    });
    res.status(201).json(proveedor);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El RUT del proveedor ya existe' });
    }
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

// Update supplier
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rut, telefono, email, direccion, activo } = req.body;
    const proveedor = await prisma.proveedor.update({
      where: { id: parseInt(id) },
      data: { nombre, rut, telefono, email, direccion, activo },
    });
    res.json(proveedor);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El RUT del proveedor ya existe' });
    }
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

// Delete supplier
const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.proveedor.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteProveedor,
};
