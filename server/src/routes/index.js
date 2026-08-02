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

// Caja routes
const caja = require('./caja');
router.get('/caja/estado', authenticateToken, caja.getEstado);
router.post('/caja/apertura', authenticateToken, caja.apertura);
router.post('/caja/cierre', authenticateToken, caja.cierre);
router.post('/caja/movimientos', authenticateToken, caja.crearMovimiento);

// Product routes
router.get('/productos', require('./productos').list);
router.get('/productos/:id', require('./productos').getById);
router.post('/productos', require('./productos').create);
router.put('/productos/:id', require('./productos').update);
router.delete('/productos/:id', require('./productos').delete);
router.post('/productos/:id/generar-codigo', authenticateToken, require('./productos').generarCodigo);

// Category routes
router.get('/categorias', require('./categorias').list);
router.post('/categorias', require('./categorias').create);

// Customer routes
router.get('/clientes', require('./clientes').list);
router.get('/clientes/:id', require('./clientes').getById);
router.post('/clientes', require('./clientes').create);
router.put('/clientes/:id', require('./clientes').update);
router.delete('/clientes/:id', require('./clientes').delete);
router.post('/clientes/:id/abonos', authenticateToken, require('./clientes').registrarAbono);
router.get('/clientes/:id/historial-cuenta', authenticateToken, require('./clientes').getHistorialCuenta);

// Supplier routes
router.get('/proveedores', require('./proveedores').list);
router.get('/proveedores/:id', require('./proveedores').getById);
router.post('/proveedores', require('./proveedores').create);
router.put('/proveedores/:id', require('./proveedores').update);
router.delete('/proveedores/:id', require('./proveedores').delete);

// Purchase routes
router.post('/compras', authenticateToken, require('./compras').create);
router.get('/compras', authenticateToken, require('./compras').list);

// User routes (admin only)
router.get('/usuarios', require('./usuarios').list);
router.get('/usuarios/:id', require('./usuarios').getById);
router.post('/usuarios', require('./usuarios').create);
router.put('/usuarios/:id', require('./usuarios').update);
router.delete('/usuarios/:id', require('./usuarios').delete);

// Sale routes
router.post('/ventas', authenticateToken, require('./ventas').create);
router.get('/ventas', authenticateToken, require('./ventas').list);
router.get('/ventas/:id', authenticateToken, require('./ventas').getById);
router.post('/ventas/:id/anular', authenticateToken, require('./ventas').anular);

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
