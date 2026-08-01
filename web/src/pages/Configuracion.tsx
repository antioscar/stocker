import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface ConfigNegocio {
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  folioCorrelativo: number;
}

const emptyNegocio: ConfigNegocio = {
  nombre: '',
  rut: '',
  direccion: '',
  telefono: '',
  folioCorrelativo: 0,
};

export const Configuracion = () => {
  const { user: currentUser } = useAuth();
  const [negocio, setNegocio] = useState<ConfigNegocio>(emptyNegocio);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = currentUser?.rol === 'ADMIN';

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ negocio?: ConfigNegocio }>('/configuracion');
      if (data.negocio) {
        setNegocio({ ...emptyNegocio, ...data.negocio });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      await apiFetch('/configuracion', {
        method: 'PUT',
        body: JSON.stringify({ negocio }),
      });
      setSuccess('Configuración guardada correctamente');
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="border-2 border-sello bg-sello/20 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-tinta">
        Restringido: no tiene permisos para modificar la configuración. Esta sección requiere rol
        ADMIN.
      </div>
    );
  }

  const renderField = (
    label: string,
    key: keyof ConfigNegocio,
    type = 'text',
    disabled = false,
  ) => {
    const locked = !editing || disabled;
    return (
      <div>
        <label className="etiqueta">{label}</label>
        <input
          type={type}
          value={negocio[key]}
          disabled={locked}
          onChange={(e) =>
            setNegocio({
              ...negocio,
              [key]:
                type === 'number'
                  ? Number(e.target.value)
                  : e.target.value,
            })
          }
          className={`input font-ledger ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="ficha-pestana-grafito p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-tinta">
              Configuración
            </h2>
            <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              Parámetros del negocio y correlativos
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setError('');
                setSuccess('');
              }}
              className="btn btn-primario"
            >
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setSuccess('');
                  fetchConfig();
                }}
                className="btn btn-papel"
              >
                Cancelar
              </button>
              <button type="submit" form="config-form" disabled={isSaving} className="btn btn-primario">
                {isSaving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 border-2 border-oferta bg-oferta/10 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-oferta">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 border-2 border-hoja bg-hoja/10 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-hoja">
            {success}
          </div>
        )}
      </div>

      <div className="ficha p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-pauta border-b-oferta"></div>
          </div>
        ) : (
          <form id="config-form" onSubmit={handleSave} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-b-2 border-pauta pb-2 md:col-span-2">
              <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
                Datos del negocio
              </h3>
            </div>
            {renderField('Nombre del negocio *', 'nombre')}
            {renderField('RUT', 'rut')}
            {renderField('Dirección', 'direccion')}
            {renderField('Teléfono', 'telefono')}

            <div className="mt-2 border-b-2 border-pauta pb-2 md:col-span-2">
              <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
                Folio de ventas
              </h3>
            </div>
            {renderField('Último folio correlativo', 'folioCorrelativo', 'number', true)}

            <p className="font-ledger text-xs uppercase tracking-sello text-tintaSuave md:col-span-2">
              El folio se genera automáticamente en cada venta (formato BOL-####). El correlativo se
              administra de forma interna.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
