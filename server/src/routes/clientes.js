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

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteCustomer,
};
