// Type definitions for the frontend
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'CAJERO';
  activo: boolean;
  createdAt: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  codigoBarras?: string;
  categoriaId: number;
  precioVenta: number;
  precioCosto: number;
  stock: number;
  stockMinimo: number;
  unidad: string;
  activo: boolean;
  createdAt: string;
  categoria?: Categoria;
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt: string;
}

export interface Venta {
  id: number;
  folio: string;
  clienteId?: number;
  usuarioId: number;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  anulada: boolean;
  createdAt: string;
  cliente?: Cliente;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
  ventaDetalle?: VentaDetalle[];
}

export interface VentaDetalle {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface MovimientoStock {
  id: number;
  productoId: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo?: string;
  usuarioId?: number;
  createdAt: string;
}

export interface Configuracion {
  key: string;
  value: any;
}

export interface ResumenReportes {
  resumen: {
    totalVentas: number;
    totalIngresos: number;
    totalAnuladas: number;
    ticketPromedio: number;
  };
  ventasPorDia: Record<string, { total: number; count: number }>;
  productosMasVendidos: Array<{ productoId: number; nombre?: string; codigoBarras?: string; cantidadVendida: number; ingresos: number }>;
  stockBajo: Array<{ id: number; nombre: string; stock: number; stockMinimo: number; codigoBarras?: string; unidad?: string; categoria?: { nombre: string } }>;
}
