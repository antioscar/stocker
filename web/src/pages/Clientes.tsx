import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { Cliente, Venta } from '../types';

interface ClienteForm {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}

const emptyForm: ClienteForm = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
};

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [historialCliente, setHistorialCliente] = useState<Cliente | null>(null);
  const [ventasHistorial, setVentasHistorial] = useState<Venta[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Cliente[]>('/clientes');
      setClientes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono ?? '',
      email: cliente.email ?? '',
      direccion: cliente.direccion ?? '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setModalOpen(false);

    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || undefined,
      email: form.email.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
    };

    try {
      if (editingId) {
        await apiFetch(`/clientes/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Cliente actualizado correctamente');
      } else {
        await apiFetch('/clientes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess('Cliente creado correctamente');
      }
      fetchClientes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
      setSuccess('Cliente eliminado');
      fetchClientes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar cliente');
    }
  };

  const openHistorial = async (cliente: Cliente) => {
    setHistorialCliente(cliente);
    setHistorialLoading(true);
    setVentasHistorial([]);
    try {
      const data = await apiFetch<Venta[]>(
        `/ventas?clienteId=${cliente.id}`,
      );
      setVentasHistorial(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar historial');
    } finally {
      setHistorialLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Clientes</h2>
            <p className="text-sm text-gray-600">Gestión de clientes y su historial de compras</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nuevo cliente
          </button>
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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No hay clientes registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{cliente.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cliente.telefono ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cliente.email ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cliente.direccion ?? '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openHistorial(cliente)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Historial
                      </button>
                      <button
                        onClick={() => openEdit(cliente)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar cliente' : 'Nuevo cliente'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className={inputClass}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    placeholder="cliente@correo.cl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className={inputClass}
                  placeholder="Calle 123, Comuna"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'Guardar cambios' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historialCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Historial de {historialCliente.nombre}
              </h3>
              <button
                onClick={() => setHistorialCliente(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {historialLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : ventasHistorial.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Este cliente no tiene compras registradas
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Folio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ventasHistorial.map((venta) => (
                      <tr key={venta.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {venta.folio}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(venta.createdAt).toLocaleDateString('es-CL')}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {formatCurrency(venta.total)}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              venta.anulada
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {venta.anulada ? 'Anulada' : 'Válida'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
