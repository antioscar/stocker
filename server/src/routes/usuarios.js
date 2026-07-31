// Usuarios handlers
const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');

// List users (admin only)
const list = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Get user by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Create user
const create = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        rol,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });
    
    res.status(201).json(usuario);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Update user
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;
    
    const data = {
      nombre,
      email,
      rol,
      activo,
    };
    
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });
    
    res.json(usuario);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso' });
    }
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteUser,
};
