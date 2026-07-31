import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { ResumenReportes } from '../types';

const hoyISO = () => new Date().toISOString().split('T')[0];

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ResumenReportes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResumen = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const hoy = hoyISO();
      const data = await apiFetch<ResumenReportes>(
        `/reportes/resumen?desde=${hoy}&hasta=${hoy}`,
      );
      setData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el resumen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const accesosRapidos = [
    { titulo: 'Punto de Venta', descripcion: 'Registrar una venta', to: '/ventas', color: 'bg-blue-600 hover:bg-blue-700' },
    { titulo: 'Productos', descripcion: 'Inventario y precios', to: '/productos', color: 'bg-green-600 hover:bg-green-700' },
    { titulo: 'Clientes', descripcion: 'Registro de clientes', to: '/clientes', color: 'bg-purple-600 hover:bg-purple-700' },
    { titulo: 'Reportes', descripcion: 'Indicadores del negocio', to: '/reportes', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  const esAdmin = user?.rol === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Hola, {user?.nombre ?? 'usuario'}
        </h2>
        <p className="text-gray-600 mt-1">Resumen de ventas de hoy</p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">Ventas de hoy</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data.resumen.totalVentas}</p>
            <p className="text-xs text-gray-500 mt-1">tickets registrados</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">Ingresos del día</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(data.resumen.totalIngresos)}
            </p>
            <p className="text-xs text-gray-500 mt-1">ventas válidas</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">Ticket promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(data.resumen.ticketPromedio)}
            </p>
            <p className="text-xs text-gray-500 mt-1">por venta</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">Productos por agotarse</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{data.stockBajo.length}</p>
            <p className="text-xs text-gray-500 mt-1">con stock bajo</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accesosRapidos
          .filter((acceso) => (esAdmin ? true : acceso.to !== '/usuarios'))
          .map((acceso) => (
            <Link
              key={acceso.to}
              to={acceso.to}
              className={`${acceso.color} text-white rounded-lg shadow-sm p-6 transition-colors`}
            >
              <h3 className="text-lg font-semibold">{acceso.titulo}</h3>
              <p className="text-sm opacity-90 mt-1">{acceso.descripcion}</p>
            </Link>
          ))}
      </div>

      {esAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Accesos de administración</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/usuarios"
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Usuarios y roles
            </Link>
            <Link
              to="/configuracion"
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Configuración del negocio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
