import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-papel px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-7 select-none text-center">
          <div className="nav-tab mx-auto flex h-12 w-12 items-center justify-center bg-hoja shadow-card">
            <span className="text-lg font-bold text-white">SC</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-tinta">
            StockCaja
          </h2>
          <p className="mt-0.5 text-xs text-tintaSuave">
            Punto de venta y control de caja
          </p>
        </div>

        <div className="ficha-pestana p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="border-2 border-oferta bg-oferta/10 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-oferta">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email-address" className="etiqueta">
                Usuario / Correo
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="usuario@stockcaja.cl"
              />
            </div>

            <div>
              <label htmlFor="password" className="etiqueta">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="btn btn-primario w-full py-3">
                {isLoading ? 'Conectando…' : 'Entrar al sistema'}
              </button>
            </div>

            <div className="border border-pauta bg-card px-3 py-2.5 text-center font-ledger text-xs text-tintaSuave">
              Demo:{' '}
              <span className="font-bold text-tinta">admin@stockcaja.cl</span> /{' '}
              <span className="font-bold text-tinta">admin123</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
