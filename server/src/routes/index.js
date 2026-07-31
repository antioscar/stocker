// Express router setup
const express = require('express');
const router = express.Router();

const { authenticateToken, login, getCurrentUser } = require('../middleware/auth');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getCurrentUser);

// Product routes
router.get('/productos', require('./productos').list);
router.get('/productos/:id', require('./productos').getById);
router.post('/productos', require('./productos').create);
router.put('/productos/:id', require('./productos').update);
router.delete('/productos/:id', require('./productos').delete);

// Category routes
router.get('/categorias', require('./categorias').list);
router.post('/categorias', require('./categorias').create);

// Customer routes
router.get('/clientes', require('./clientes').list);
router.get('/clientes/:id', require('./clientes').getById);
router.post('/clientes', require('./clientes').create);
router.put('/clientes/:id', require('./clientes').update);
router.delete('/clientes/:id', require('./clientes').delete);

// User routes (admin only)
router.get('/usuarios', require('./usuarios').list);
router.get('/usuarios/:id', require('./usuarios').getById);
router.post('/usuarios', require('./usuarios').create);
router.put('/usuarios/:id', require('./usuarios').update);
router.delete('/usuarios/:id', require('./usuarios').delete);

// Sale routes
router.post('/ventas', require('./ventas').create);
router.get('/ventas', require('./ventas').list);
router.get('/ventas/:id', require('./ventas').getById);
router.post('/ventas/:id/anular', require('./ventas').anular);

// Report routes
router.get('/reportes/resumen', require('./reportes').resumen);
router.get('/reportes/productos-mas-vendidos', require('./reportes').productosMasVendidos);
router.get('/reportes/stock-bajo', require('./reportes').stockBajo);

// Configuration routes
router.get('/configuracion', require('./configuracion').getAll);
router.put('/configuracion', require('./configuracion').update);

// Backup routes
router.get('/backup', require('./backup').download);

module.exports = router;
