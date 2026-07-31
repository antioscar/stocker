// Configuración handlers
const prisma = require('../utils/db');

// Obtener toda la configuración
const getAll = async (req, res) => {
  try {
    const configuracion = await prisma.configuracion.findMany();
    
    // Convertir a objeto plano
    const configObject = {};
    configuracion.forEach(item => {
      configObject[item.key] = item.value;
    });
    
    res.json(configObject);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

// Actualizar configuración
const update = async (req, res) => {
  try {
    const configData = req.body;
    
    // Actualizar cada ítem
    for (const [key, value] of Object.entries(configData)) {
      await prisma.configuracion.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    
    res.json({ message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

module.exports = {
  getAll,
  update,
};
