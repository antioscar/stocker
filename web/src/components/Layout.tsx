import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/productos', label: 'Productos' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/reportes', label: 'Reportes' },
];

const adminNavItems = [
  { to: '/usuarios', label: 'Usuarios' },
  { to: '/configuracion', label: 'Configuración' },
];

export const Layout = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      apiFetch<{ abierta: boolean }>('/caja/estado')
        .then((res) => {
          setCajaAbierta(res?.abierta || false);
        })
        .catch(() => {
          setCajaAbierta(false);
        });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-pauta border-b-oferta"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const esAdmin = user.rol === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap px-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
      isActive
        ? 'border-hoja text-hoja font-bold'
        : 'border-transparent text-slate-500 hover:text-slate-950 hover:border-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-papel">
      <div className="sticky top-0 z-40 print:hidden shadow-sm">
        <header className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-hoja text-white font-bold rounded-md">
                  <span className="text-sm font-bold">SC</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-none">StockCaja</h1>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Control de almacén</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {cajaAbierta !== null && (
                  <span className={`sello hidden sm:inline-flex ${cajaAbierta ? 'sello-ok' : 'sello-alerta'}`}>
                    {cajaAbierta ? '● Caja abierta' : '○ Caja cerrada'}
                  </span>
                )}
                <span className="hidden text-xs text-slate-600 md:inline font-medium">
                  Operador:{' '}
                  <span className="font-semibold uppercase text-slate-900">{user.nombre}</span>
                </span>
                <span
                  className={`sello ${
                    esAdmin
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {user.rol}
                </span>
                <button
                  onClick={handleLogout}
                  className="border border-slate-200 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <nav className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
              {esAdmin &&
                adminNavItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navLinkClass}>
                    {item.label}
                  </NavLink>
                ))}
            </div>
          </div>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
