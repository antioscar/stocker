import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { ResumenReportes } from '../types';

export const Reportes = () => {
  const [data, setData] = useState<ResumenReportes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const fetchReportes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const query: string[] = [];
      if (desde) query.push(`desde=${encodeURIComponent(desde)}`);
      if (hasta) query.push(`hasta=${encodeURIComponent(hasta)}`);
      const suffix = query.length > 0 ? `?${query.join('&')}` : '';
      const data = await apiFetch<ResumenReportes>(`/reportes/resumen${suffix}`);
      setData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar reportes');
    } finally {
      setIsLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const ventasPorDia = data?.ventasPorDia
    ? Object.entries(data.ventasPorDia).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
      )
    : [];

  const maxVentaDiaria = ventasPorDia.length > 0
    ? Math.max(...ventasPorDia.map(([, v]) => v.total))
    : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Reportes</h2>
            <p className="text-sm text-gray-600">Resumen de ventas e indicadores del negocio</p>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                setDesde('');
                setHasta('');
              }}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </div>

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
      ) : !data ? (
        <div className="text-center py-16 text-gray-500">No hay datos disponibles</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-semibold">Ventas totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.resumen.totalVentas}</p>
              <p className="text-xs text-gray-500 mt-1">tickets registrados</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-semibold">Ingresos</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(data.resumen.totalIngresos)}
              </p>
              <p className="text-xs text-gray-500 mt-1">ventas válidas</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-semibold">Costo Total</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency((data.resumen as any).totalCosto || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">costo de mercadería</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-semibold">Utilidad Bruta</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency((data.resumen as any).utilidadBruta || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">ganancia neta estimada</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-semibold">Ventas anuladas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{data.resumen.totalAnuladas}</p>
              <p className="text-xs text-gray-500 mt-1">anulaciones de tickets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por día</h3>
              {ventasPorDia.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Sin ventas en el período</div>
              ) : (
                <div className="space-y-2">
                  {ventasPorDia.map(([fecha, value]) => (
                    <div key={fecha} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-gray-600">
                        {new Date(fecha).toLocaleDateString('es-CL')}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded h-6 overflow-hidden">
                        <div
                          className="bg-blue-500 h-6"
                          style={{
                            width: `${maxVentaDiaria > 0 ? (value.total / maxVentaDiaria) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="w-24 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(value.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos más vendidos</h3>
              {data.productosMasVendidos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Sin ventas en el período</div>
              ) : (
                <div className="space-y-3">
                  {data.productosMasVendidos.map((producto, index) => (
                    <div
                      key={producto.productoId}
                      className="flex items-center justify-between border-b border-gray-100 pb-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {producto.cantidadVendida} unidades
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(producto.ingresos)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de stock bajo</h3>
            {data.stockBajo.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay productos con stock bajo
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock actual
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock mínimo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.stockBajo.map((producto) => (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          {producto.codigoBarras && (
                            <p className="text-xs text-gray-500">
                              Código: {producto.codigoBarras}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {producto.categoria?.nombre ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {producto.stock} {producto.unidad ?? 'unid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {producto.stockMinimo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
