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
    <div className="space-y-6">
      <div className="ficha-pestana-sello p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-tinta">Reportes</h2>
            <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              Indicadores financieros y de inventario del negocio
            </p>
          </div>
          <div className="flex items-end gap-2.5">
            <div>
              <label className="etiqueta">Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="input" />
            </div>
            <div>
              <label className="etiqueta">Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="input" />
            </div>
            <button
              onClick={() => {
                setDesde('');
                setHasta('');
              }}
              className="btn btn-papel"
            >
              Limpiar
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 border-2 border-oferta bg-oferta/10 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-oferta">
            {error}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pauta border-b-oferta"></div>
        </div>
      ) : !data ? (
        <div className="py-16 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
          No hay datos disponibles
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 select-none sm:grid-cols-2 lg:grid-cols-5">
            <div className="ficha p-5">
              <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
                Ventas totales
              </p>
              <p className="mt-1.5 font-ledger text-2xl font-bold text-tinta">
                {data.resumen.totalVentas}
              </p>
              <p className="mt-1 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
                tickets registrados
              </p>
            </div>

            <div className="ficha p-5">
              <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
                Ingresos
              </p>
              <p className="mt-1.5 font-ledger text-2xl font-bold text-hoja">
                {formatCurrency(data.resumen.totalIngresos)}
              </p>
              <p className="mt-1 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
                ventas válidas
              </p>
            </div>

            <div className="ficha p-5">
              <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
                Costo total
              </p>
              <p className="mt-1.5 font-ledger text-2xl font-bold text-tintaSuave">
                {formatCurrency(data.resumen.totalCosto ?? 0)}
              </p>
              <p className="mt-1 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
                costo de mercadería
              </p>
            </div>

            <div className="ficha p-5">
              <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
                Utilidad bruta
              </p>
              <p className="mt-1.5 font-ledger text-2xl font-bold text-hoja">
                {formatCurrency(data.resumen.utilidadBruta ?? 0)}
              </p>
              <p className="mt-1 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
                ganancia bruta estimada
              </p>
            </div>

            <div className="ficha p-5">
              <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
                Ventas anuladas
              </p>
              <p className="mt-1.5 font-ledger text-2xl font-bold text-oferta">
                {data.resumen.totalAnuladas}
              </p>
              <p className="mt-1 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
                anulaciones de tickets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="ficha p-6">
              <h3 className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave">
                Ventas por día
              </h3>
              {ventasPorDia.length === 0 ? (
                <div className="py-12 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
                  Sin ventas en el período
                </div>
              ) : (
                <div className="mt-4 space-y-3.5">
                  {ventasPorDia.map(([fecha, value]) => (
                    <div key={fecha} className="flex items-center gap-3">
                      <span className="w-24 font-ledger text-xxs font-bold uppercase text-tintaSuave">
                        {new Date(fecha).toLocaleDateString('es-CL')}
                      </span>
                      <div className="h-5 flex-1 overflow-hidden rounded-ficha border border-pautaOscura bg-pauta/40">
                        <div
                          className="h-full bg-hoja transition-all duration-500"
                          style={{
                            width: `${maxVentaDiaria > 0 ? (value.total / maxVentaDiaria) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="w-24 text-right font-ledger text-xs font-bold text-tinta">
                        {formatCurrency(value.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ficha p-6">
              <h3 className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave">
                Productos más vendidos
              </h3>
              {data.productosMasVendidos.length === 0 ? (
                <div className="py-12 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
                  Sin ventas en el período
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.productosMasVendidos.map((producto, index) => (
                    <div
                      key={producto.productoId}
                      className="flex items-center justify-between rounded-ficha border border-pauta px-3 py-2 transition-colors hover:bg-papelAlto"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-ficha border border-pautaOscura bg-papelAlto font-ledger text-xs font-bold text-tinta">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-tinta">{producto.nombre}</p>
                          <p className="font-ledger text-xs text-tintaSuave">
                            {producto.cantidadVendida} unidades
                          </p>
                        </div>
                      </div>
                      <span className="font-ledger text-sm font-bold text-tinta">
                        {formatCurrency(producto.ingresos)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ficha p-6">
            <h3 className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave">
              Alertas de stock bajo
            </h3>
            {data.stockBajo.length === 0 ? (
              <div className="py-8 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
                No hay productos con stock bajo
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="tabla min-w-full">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th className="text-right">Stock actual</th>
                      <th className="text-right">Stock mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stockBajo.map((producto) => (
                      <tr key={producto.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-tinta">{producto.nombre}</p>
                          {producto.codigoBarras && (
                            <p className="mt-0.5 font-ledger text-xs text-tintaTenue">
                              Cód: {producto.codigoBarras}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-tintaSuave">
                          {producto.categoria?.nombre ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="sello sello-alerta">
                            {producto.stock} {producto.unidad ?? 'unid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-ledger font-bold text-tintaSuave">
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
