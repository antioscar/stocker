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

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
        No tiene permisos para modificar la configuración. Esta sección requiere rol ADMIN.
      </div>
    );
  }

  const renderField = (
    label: string,
    key: keyof ConfigNegocio,
    type = 'text',
    disabled = false,
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={negocio[key]}
        disabled={!editing || disabled}
        onChange={(e) =>
          setNegocio({
            ...negocio,
            [key]:
              type === 'number'
                ? Number(e.target.value)
                : e.target.value,
          })
        }
        className={`${inputClass} ${!editing ? 'bg-gray-50' : ''}`}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
            <p className="text-sm text-gray-600">Datos del negocio y folio (solo ADMIN)</p>
          </div>
          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setError('');
                setSuccess('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="config-form"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form id="config-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos del negocio</h3>
            </div>
            {renderField('Nombre del negocio *', 'nombre')}
            {renderField('RUT', 'rut')}
            {renderField('Dirección', 'direccion')}
            {renderField('Teléfono', 'telefono')}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Folio de ventas</h3>
            </div>
            {renderField('Último folio correlativo', 'folioCorrelativo', 'number', true)}
            <p className="md:col-span-2 text-sm text-gray-500">
              El folio se genera automáticamente en cada venta (formato BOL-####). El correlativo se
              administra de forma interna.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
