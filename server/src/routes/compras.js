const prisma = require('../utils/db');

// Register a purchase (transaccional)
const create = async (req, res) => {
  try {
    const { proveedorId, documentoTipo, documentoFolio, items } = req.body;
    const activeUser = req.user.id;

    if (!proveedorId || !documentoTipo || !documentoFolio || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos de compra incompletos o inválidos' });
    }

    // Transacción de la compra
    const compra = await prisma.$transaction(async (tx) => {
      // 1. Validar que el proveedor existe
      const proveedor = await tx.proveedor.findUnique({
        where: { id: parseInt(proveedorId) },
      });
      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      // 2. Calcular total de la compra
      let total = 0;
      const compraItems = items.map(item => {
        const itemTotal = item.cantidad * item.precioCostoUnitario;
        total += itemTotal;
        return {
          productoId: parseInt(item.productoId),
          cantidad: parseFloat(item.cantidad),
          precioCostoUnitario: parseFloat(item.precioCostoUnitario),
          precioVentaSugerido: item.precioVentaSugerido ? parseFloat(item.precioVentaSugerido) : undefined,
        };
      });

      // 3. Crear el registro de CompraInventario
      const nuevaCompra = await tx.compraInventario.create({
        data: {
          proveedorId: parseInt(proveedorId),
          usuarioId: activeUser,
          documentoTipo,
          documentoFolio,
          total,
        },
      });

      // 4. Procesar cada producto: stock, costo/venta, detalles, movimientos de stock
      for (const item of compraItems) {
        const productUpdateData = {
          stock: { increment: item.cantidad },
          precioCosto: item.precioCostoUnitario,
        };
        // Si se provee precio de venta sugerido, actualizarlo también
        if (item.precioVentaSugerido) {
          productUpdateData.precioVenta = item.precioVentaSugerido;
        }

        await tx.producto.update({
          where: { id: item.productoId },
          data: productUpdateData,
        });

        // Crear CompraDetalle
        await tx.compraDetalle.create({
          data: {
            compraId: nuevaCompra.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioCostoUnitario: item.precioCostoUnitario,
          },
        });

        // Crear Movimiento de Stock (ENTRADA)
        await tx.movimientoStock.create({
          data: {
            productoId: item.productoId,
            tipo: 'ENTRADA',
            cantidad: item.cantidad,
            motivo: 'compra',
            usuarioId: activeUser,
          },
        });
      }

      return nuevaCompra;
    });

    // Retornar la compra con detalles
    const compraConDetalles = await prisma.compraInventario.findUnique({
      where: { id: compra.id },
      include: {
        proveedor: true,
        usuario: {
          select: { nombre: true },
        },
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    res.status(201).json(compraConDetalles);
  } catch (error) {
    console.error('Error al registrar compra:', error);
    if (error.message === 'Proveedor no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al registrar compra' });
  }
};

// List purchases
const list = async (req, res) => {
  try {
    const { proveedorId } = req.query;
    const where = {};
    if (proveedorId) {
      where.proveedorId = parseInt(proveedorId);
    }
    const compras = await prisma.compraInventario.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        proveedor: true,
        usuario: { select: { nombre: true } },
      },
    });
    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

module.exports = {
  create,
  list,
};
