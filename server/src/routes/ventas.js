// Ventas handlers
const prisma = require('../utils/db');

// Create sale (transaccional)
const create = async (req, res) => {
  try {
    const { clienteId, items, metodoPago, descuento = 0 } = req.body;
    const activeUser = req.user.id;
    
    // Verificar si el usuario tiene una sesión de caja abierta
    const cajaSession = await prisma.cajaSession.findFirst({
      where: {
        usuarioId: activeUser,
        estado: 'ABIERTA',
      },
    });
    
    if (!cajaSession) {
      return res.status(400).json({ error: 'Debe abrir caja antes de realizar una venta' });
    }
    
    // Calcular totales
    let subtotal = 0;
    const ventaItems = items.map(item => {
      const productSubtotal = item.cantidad * item.precioUnitario;
      subtotal += productSubtotal;
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: productSubtotal,
      };
    });
    
    const descuentoAmount = subtotal * (descuento / 100);
    const total = subtotal - descuentoAmount;
    
    // Transacción de la venta
    const venta = await prisma.$transaction(async (tx) => {
      // Generar folio correlativo único (BOL-####)
      const ultimaVenta = await tx.venta.findFirst({
        orderBy: { id: 'desc' },
      });
      const correlativo = ultimaVenta ? ultimaVenta.id + 1 : 1;
      const folio = `BOL-${String(correlativo).padStart(4, '0')}`;
      
      // Crear la venta
      const nuevaVenta = await tx.venta.create({
        data: {
          folio,
          clienteId,
          usuarioId: activeUser,
          cajaSessionId: cajaSession.id,
          subtotal: subtotal,
          descuento: descuentoAmount,
          total: total,
          metodoPago,
        },
      });

      // Si el método de pago es fiado, actualizar la deuda del cliente
      if (metodoPago === 'fiado') {
        if (!clienteId) {
          throw new Error('Debe seleccionar un cliente para realizar una venta al fiado');
        }
        await tx.cliente.update({
          where: { id: clienteId },
          data: {
            saldoDeuda: { increment: total },
          },
        });
      }
      
      // Descontar stock y crear detalles
      for (const item of items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
        });
        
        if (!producto || producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para el producto: ${producto?.nombre}`);
        }
        
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: { decrement: item.cantidad },
          },
        });
        
        await tx.ventaDetalle.create({
          data: {
            ventaId: nuevaVenta.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          },
        });
        
        // Crear movimiento de stock (salida)
        await tx.movimientoStock.create({
          data: {
            productoId: item.productoId,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            motivo: 'venta',
            usuarioId: activeUser,
          },
        });
      }
      
      return nuevaVenta;
    });
    
    // Retornar venta con detalles
    const ventaConDetalles = await prisma.venta.findUnique({
      where: { id: venta.id },
      include: {
        cliente: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        ventaDetalle: {
          include: {
            producto: true,
          },
        },
      },
    });
    
    res.status(201).json(ventaConDetalles);
  } catch (error) {
    console.error('Error al crear venta:', error);
    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al crear venta' });
  }
};

// List sales
const list = async (req, res) => {
  try {
    const { desde, hasta, clienteId } = req.query;
    
    const where = {};
    if (desde && hasta) {
      where.createdAt = {
        gte: new Date(desde),
        lte: new Date(hasta),
      };
    }
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }
    
    const ventas = await prisma.venta.findMany({
      where,
      include: {
        cliente: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        ventaDetalle: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

// Get sale by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        ventaDetalle: {
          include: {
            producto: true,
          },
        },
      },
    });
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener venta' });
  }
};

// Anular venta
const anular = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        ventaDetalle: true,
      },
    });
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    if (venta.anulada) {
      return res.status(400).json({ error: 'La venta ya ha sido anulada' });
    }
    
    await prisma.$transaction(async (tx) => {
      // Marcar como anulada
      await tx.venta.update({
        where: { id: parseInt(id) },
        data: { anulada: true },
      });
      
      // Devolver stock y crear entradas
      for (const detalle of venta.ventaDetalle) {
        await tx.producto.update({
          where: { id: detalle.productoId },
          data: {
            stock: { increment: detalle.cantidad },
          },
        });
        
        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'ENTRADA',
            cantidad: detalle.cantidad,
            motivo: motivo || 'anulación',
            usuarioId: venta.usuarioId,
          },
        });
      }
    });
    
    res.json({ message: 'Venta anulada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al anular venta' });
  }
};

module.exports = {
  create,
  list,
  getById,
  anular,
};
