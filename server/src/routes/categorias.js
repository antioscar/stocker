// Categorias handlers
const prisma = require('../utils/db');

// List categories
const list = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
    
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Create category
const create = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    const categoria = await prisma.categoria.create({
      data: { nombre },
    });
    
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

module.exports = {
  list,
  create,
};
