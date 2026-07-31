// Productos handlers
const prisma = require('../utils/db');

// List products with pagination and search
const list = async (req, res) => {
  try {
    const { search, categoriaId, stockMinimo } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { codigoBarras: { contains: search } },
      ];
    }
    
    if (categoriaId) {
      where.categoriaId = parseInt(categoriaId);
    }
    
    if (stockMinimo) {
      where.stock = {
        lte: parseInt(stockMinimo),
      };
    }
    
    const productos = await prisma.producto.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Get product by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
      },
    });
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Create product
const create = async (req, res) => {
  try {
    const {
      nombre,
      codigoBarras,
      categoriaId,
      precioVenta,
      precioCosto,
      stock,
      stockMinimo,
      unidad,
    } = req.body;
    
    const producto = await prisma.producto.create({
      data: {
        nombre,
        codigoBarras,
        categoriaId: parseInt(categoriaId),
        precioVenta: parseFloat(precioVenta),
        precioCosto: parseFloat(precioCosto),
        stock: stock || 0,
        stockMinimo: stockMinimo || 0,
        unidad,
      },
      include: {
        categoria: true,
      },
    });
    
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Update product
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      codigoBarras,
      categoriaId,
      precioVenta,
      precioCosto,
      stock,
      stockMinimo,
      unidad,
      activo,
    } = req.body;
    
    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        codigoBarras,
        categoriaId: parseInt(categoriaId),
        precioVenta: parseFloat(precioVenta),
        precioCosto: parseFloat(precioCosto),
        stock,
        stockMinimo,
        unidad,
        activo,
      },
      include: {
        categoria: true,
      },
    });
    
    res.json(producto);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.producto.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteProduct,
};
