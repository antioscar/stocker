// Backup handlers
const fs = require('fs');
const path = require('path');

// Descargar copia de seguridad de la base de datos SQLite
const download = async (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), 'dev.db');
    
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Base de datos no encontrada' });
    }
    
    // Leer archivo como buffer
    const dbBuffer = fs.readFileSync(dbPath);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="stockcaja.db"');
    
    // Enviar buffer como descarga
    res.send(dbBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Error al descargar copia de seguridad' });
  }
};

module.exports = {
  download,
};
