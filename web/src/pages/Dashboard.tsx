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

  const fechaHoy = () =>
    new Date().toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const accesosRapidos = [
    {
      titulo: 'Punto de venta',
      descripcion: 'Abrir caja y registrar ventas',
      to: '/ventas',
      ficha: 'ficha-pestana',
    },
    {
      titulo: 'Productos',
      descripcion: 'Verificar stock y precios',
      to: '/productos',
      ficha: 'ficha-pestana-hoja',
    },
    {
      titulo: 'Clientes',
      descripcion: 'Fichas e historiales',
      to: '/clientes',
      ficha: 'ficha-pestana-grafito',
    },
    {
      titulo: 'Reportes',
      descripcion: 'Estadísticas del negocio',
      to: '/reportes',
      ficha: 'ficha-pestana-sello',
    },
  ];

  const esAdmin = user?.rol === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="ficha-pestana-grafito p-6">
        <h2 className="font-display text-xl font-bold tracking-tight text-tinta">
          Buen día, {user?.nombre ?? 'usuario'}
        </h2>
        <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
          Resumen del día · {fechaHoy()}
        </p>
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
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 select-none sm:grid-cols-2 lg:grid-cols-5">
          <div className="ficha p-5">
            <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
              Ventas de hoy
            </p>
            <div className="mt-2.5 rounded-ficha border border-pautaOscura bg-papelAlto px-3 py-2 text-center font-ledger text-2xl font-bold text-tinta">
              {data.resumen.totalVentas}
            </div>
            <p className="mt-1.5 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
              tickets registrados
            </p>
          </div>

          <div className="ficha p-5">
            <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
              Ingresos del día
            </p>
            <div className="mt-2.5 rounded-ficha border border-pautaOscura bg-papelAlto px-3 py-2 text-center font-ledger text-2xl font-bold text-hoja">
              {formatCurrency(data.resumen.totalIngresos)}
            </div>
            <p className="mt-1.5 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
              ventas válidas
            </p>
          </div>

          <div className="ficha p-5">
            <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
              Utilidad bruta
            </p>
            <div className="mt-2.5 rounded-ficha border border-pautaOscura bg-papelAlto px-3 py-2 text-center font-ledger text-2xl font-bold text-hoja">
              {formatCurrency(data.resumen.utilidadBruta ?? 0)}
            </div>
            <p className="mt-1.5 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
              ganancia estimada
            </p>
          </div>

          <div className="ficha p-5">
            <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
              Ticket promedio
            </p>
            <div className="mt-2.5 rounded-ficha border border-pautaOscura bg-papelAlto px-3 py-2 text-center font-ledger text-2xl font-bold text-tinta">
              {formatCurrency(data.resumen.ticketPromedio)}
            </div>
            <p className="mt-1.5 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
              por venta
            </p>
          </div>

          <div className="ficha p-5">
            <p className="font-ledger text-xxs font-bold uppercase tracking-sello text-tintaSuave">
              Por agotarse
            </p>
            <div className="mt-2.5 rounded-ficha border-2 border-oferta bg-oferta/10 px-3 py-2 text-center font-ledger text-2xl font-bold text-oferta">
              {data.stockBajo.length}
            </div>
            <p className="mt-1.5 font-ledger text-xxs uppercase tracking-sello text-tintaTenue">
              con stock bajo
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accesosRapidos.map((acceso) => (
          <Link
            key={acceso.to}
            to={acceso.to}
            className={`${acceso.ficha} block p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift`}
          >
            <h3 className="font-display text-lg font-bold tracking-tight text-tinta">
              {acceso.titulo}
            </h3>
            <p className="mt-1 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              {acceso.descripcion}
            </p>
            <span className="mt-3 inline-block font-ledger text-xs font-bold uppercase tracking-sello text-oferta">
              Abrir ›
            </span>
          </Link>
        ))}
      </div>

      {esAdmin && (
        <div className="ficha-pestana-grafito p-6">
          <h3 className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave">
            Panel de control administrativo
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/usuarios" className="btn btn-papel">
              Gestión de operadores
            </Link>
            <Link to="/configuracion" className="btn btn-papel">
              Parámetros del sistema
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
