const prisma = require('../utils/db');

// Obtener estado de la caja para el usuario actual
const getEstado = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Buscar si hay un turno abierto para este usuario
    const sessionActiva = await prisma.cajaSession.findFirst({
      where: {
        usuarioId,
        estado: 'ABIERTA',
      },
      include: {
        ventas: {
          where: { anulada: false },
        },
        movimientosCaja: true,
      },
    });

    if (!sessionActiva) {
      return res.json({ abierta: false });
    }

    // Calcular acumulados de ventas por método de pago
    let ventasEfectivo = 0;
    let ventasTarjeta = 0;
    let ventasTransferencia = 0;
    let totalVentas = 0;

    sessionActiva.ventas.forEach((v) => {
      totalVentas += v.total;
      if (v.metodoPago === 'efectivo') {
        ventasEfectivo += v.total;
      } else if (v.metodoPago === 'tarjeta') {
        ventasTarjeta += v.total;
      } else if (v.metodoPago === 'transferencia') {
        ventasTransferencia += v.total;
      }
    });

    // Calcular ingresos y egresos manuales
    let ingresosManuales = 0;
    let egresosManuales = 0;

    sessionActiva.movimientosCaja.forEach((m) => {
      if (m.tipo === 'INGRESO') {
        ingresosManuales += m.monto;
      } else if (m.tipo === 'EGRESO') {
        egresosManuales += m.monto;
      }
    });

    const efectivoEsperado = sessionActiva.montoApertura + ventasEfectivo + ingresosManuales - egresosManuales;

    res.json({
      abierta: true,
      session: {
        id: sessionActiva.id,
        montoApertura: sessionActiva.montoApertura,
        aperturaAt: sessionActiva.aperturaAt,
        ventasEfectivo,
        ventasTarjeta,
        ventasTransferencia,
        totalVentas,
        ingresosManuales,
        egresosManuales,
        efectivoEsperado,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estado de caja' });
  }
};

// Abrir caja
const apertura = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { montoApertura } = req.body;

    if (montoApertura === undefined || montoApertura < 0) {
      return res.status(400).json({ error: 'Monto de apertura inválido' });
    }

    // Verificar si ya existe una caja abierta para este usuario
    const cajaExistente = await prisma.cajaSession.findFirst({
      where: {
        usuarioId,
        estado: 'ABIERTA',
      },
    });

    if (cajaExistente) {
      return res.status(400).json({ error: 'Ya tienes una sesión de caja abierta' });
    }

    const nuevaSession = await prisma.cajaSession.create({
      data: {
        usuarioId,
        montoApertura: parseFloat(montoApertura),
        estado: 'ABIERTA',
      },
    });

    res.status(201).json(nuevaSession);
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir caja' });
  }
};

// Cerrar caja
const cierre = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { montoCierre, observaciones } = req.body;

    if (montoCierre === undefined || montoCierre < 0) {
      return res.status(400).json({ error: 'Monto de cierre inválido' });
    }

    // Buscar sesión activa
    const sessionActiva = await prisma.cajaSession.findFirst({
      where: {
        usuarioId,
        estado: 'ABIERTA',
      },
      include: {
        ventas: {
          where: { anulada: false },
        },
        movimientosCaja: true,
      },
    });

    if (!sessionActiva) {
      return res.status(400).json({ error: 'No hay ninguna sesión de caja abierta' });
    }

    // Calcular efectivo esperado
    let ventasEfectivo = 0;
    sessionActiva.ventas.forEach((v) => {
      if (v.metodoPago === 'efectivo') {
        ventasEfectivo += v.total;
      }
    });

    let ingresosManuales = 0;
    let egresosManuales = 0;
    sessionActiva.movimientosCaja.forEach((m) => {
      if (m.tipo === 'INGRESO') {
        ingresosManuales += m.monto;
      } else if (m.tipo === 'EGRESO') {
        egresosManuales += m.monto;
      }
    });

    const efectivoEsperado = sessionActiva.montoApertura + ventasEfectivo + ingresosManuales - egresosManuales;
    const diferencia = parseFloat(montoCierre) - efectivoEsperado;

    const sessionCerrada = await prisma.cajaSession.update({
      where: { id: sessionActiva.id },
      data: {
        montoCierre: parseFloat(montoCierre),
        estado: 'CERRADA',
        cierreAt: new Date(),
        diferencia,
        observaciones,
      },
    });

    res.json(sessionCerrada);
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
};

// Agregar movimiento manual (Ingreso / Egreso)
const crearMovimiento = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { tipo, monto, motivo } = req.body;

    if (!tipo || !['INGRESO', 'EGRESO'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido (debe ser INGRESO o EGRESO)' });
    }
    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto debe ser mayor a 0' });
    }
    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({ error: 'Debe ingresar un motivo para el movimiento' });
    }

    // Buscar sesión activa
    const sessionActiva = await prisma.cajaSession.findFirst({
      where: {
        usuarioId,
        estado: 'ABIERTA',
      },
    });

    if (!sessionActiva) {
      return res.status(400).json({ error: 'Debe tener una sesión de caja abierta para registrar movimientos' });
    }

    const nuevoMovimiento = await prisma.movimientoCaja.create({
      data: {
        cajaSessionId: sessionActiva.id,
        tipo,
        monto: parseFloat(monto),
        motivo: motivo.trim(),
      },
    });

    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar movimiento de caja' });
  }
};

module.exports = {
  getEstado,
  apertura,
  cierre,
  crearMovimiento,
};
