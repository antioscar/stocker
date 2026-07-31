// Reportes handlers
const prisma = require('../utils/db');

// Obtener resumen de reportes (ventas de hoy, semana, mes, tickets, totales)
const resumen = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const where = {};
    if (desde && hasta) {
      where.createdAt = {
        gte: new Date(desde),
        lte: new Date(hasta),
      };
    }
    
    // Estadísticas de ventas
    const ventas = await prisma.venta.findMany({
      where,
      select: {
        id: true,
        folio: true,
        total: true,
        metodoPago: true,
        createdAt: true,
        anulada: true,
        ventaDetalle: {
          select: {
            cantidad: true,
            producto: {
              select: {
                precioCosto: true,
              },
            },
          },
        },
      },
    });
    
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => v.anulada ? sum : sum + v.total, 0);
    const totalAnuladas = ventas.filter(v => v.anulada).length;
    
    // Calcular costo total
    const totalCosto = ventas.reduce((sum, v) => {
      if (v.anulada) return sum;
      const saleCosto = v.ventaDetalle.reduce((dSum, d) => dSum + (d.cantidad * (d.producto?.precioCosto || 0)), 0);
      return sum + saleCosto;
    }, 0);
    
    const utilidadBruta = totalIngresos - totalCosto;
    
    // Productos más vendidos
    const productosVendidos = await prisma.ventaDetalle.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: 10,
    });
    
    // Obtener detalles de productos
    const productosConDetalles = await Promise.all(
      productosVendidos.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
          select: {
            id: true,
            nombre: true,
            codigoBarras: true,
          },
        });
        return {
          ...item,
          producto,
        };
      })
    );
    
    // Stock bajo
    const stockBajo = await prisma.producto.findMany({
      where: {
        stock: {
          lte: 10,
        },
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        codigoBarras: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });
    
    res.json({
      resumen: {
        totalVentas,
        totalIngresos,
        totalAnuladas,
        ticketPromedio: totalVentas > 0 ? totalIngresos / totalVentas : 0,
        totalCosto,
        utilidadBruta,
      },
      ventasPorDia: ventas.reduce((acc, v) => {
        const fecha = new Date(v.createdAt).toLocaleDateString();
        if (!acc[fecha]) acc[fecha] = { total: 0, count: 0 };
        acc[fecha].total += v.total;
        acc[fecha].count += 1;
        return acc;
      }, {}),
      productosMasVendidos: productosConDetalles.map(item => ({
        productoId: item.productoId,
        nombre: item.producto?.nombre,
        codigoBarras: item.producto?.codigoBarras,
        cantidadVendida: item._sum.cantidad || 0,
        ingresos: item._sum.subtotal || 0,
      })),
      stockBajo,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen de reportes' });
  }
};

// Obtener productos más vendidos
const productosMasVendidos = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    const where = {};
    if (desde && hasta) {
      where.createdAt = {
        gte: new Date(desde),
        lte: new Date(hasta),
      };
    }
    
    const productosVendidos = await prisma.ventaDetalle.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
        subtotal: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
    });
    
    const productosConDetalles = await Promise.all(
      productosVendidos.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
          select: {
            id: true,
            nombre: true,
            codigoBarras: true,
            precioVenta: true,
            unidad: true,
          },
        });
        return {
          ...item,
          producto,
        };
      })
    );
    
    res.json(productosConDetalles.map(item => ({
      productoId: item.productoId,
      nombre: item.producto?.nombre,
      codigoBarras: item.producto?.codigoBarras,
      precioVenta: item.producto?.precioVenta,
      unidad: item.producto?.unidad,
      cantidadVendida: item._sum.cantidad || 0,
      ingresos: item._sum.subtotal || 0,
      numeroTransacciones: item._count.id,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
};

// Obtener alertas de stock bajo
const stockBajo = async (req, res) => {
  try {
    const stockBajo = await prisma.producto.findMany({
      where: {
        stock: {
          lte: 10,
        },
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        codigoBarras: true,
        unidad: true,
        categoria: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });
    
    res.json(stockBajo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stock bajo' });
  }
};

module.exports = {
  resumen,
  productosMasVendidos,
  stockBajo,
};
