// API client types for the frontend

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: 'ADMIN' | 'CAJERO';
  };
}

export interface AuthMeResponse {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'CAJERO';
  activo: boolean;
  createdAt: string;
}

export interface ProductoFilters {
  search?: string;
  categoriaId?: number;
  stockMinimo?: number;
}

export interface CreateProductoRequest {
  nombre: string;
  codigoBarras?: string;
  categoriaId: number;
  precioVenta: number;
  precioCosto: number;
  stock?: number;
  stockMinimo?: number;
  unidad: string;
  activo?: boolean;
}

export interface UpdateProductoRequest extends Partial<CreateProductoRequest> {
  id: number;
}

export interface CreateCategoriaRequest {
  nombre: string;
}

export interface CreateClienteRequest {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface UpdateClienteRequest extends Partial<CreateClienteRequest> {
  id: number;
}

export interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'CAJERO';
  activo?: boolean;
}

export interface UpdateUsuarioRequest extends Partial<CreateUsuarioRequest> {
  id: number;
}

export interface CreateVentaRequest {
  clienteId?: number;
  items: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  metodoPago: string;
  descuento?: number;
}

export interface UpdateVentaRequest {
  id: number;
  clienteId?: number;
  metodoPago?: string;
  anulada?: boolean;
}

export interface AnularVentaRequest {
  motivo?: string;
}

export interface ReportFilters {
  desde?: string;
  hasta?: string;
}

export interface ConfigUpdate {
  [key: string]: any;
}

export interface BackupResponse {
  filename: string;
  size: number;
  downloadUrl: string;
}
