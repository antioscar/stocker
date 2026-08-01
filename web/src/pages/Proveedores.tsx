import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { Proveedor } from '../types';

interface ProveedorForm {
  nombre: string;
  rut: string;
  telefono: string;
  email: string;
  direccion: string;
}

const emptyForm: ProveedorForm = {
  nombre: '',
  rut: '',
  telefono: '',
  email: '',
  direccion: '',
};

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProveedorForm>(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProveedores = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Proveedor[]>('/proveedores');
      setProveedores(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar proveedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (prov: Proveedor) => {
    setEditingId(prov.id);
    setForm({
      nombre: prov.nombre,
      rut: prov.rut ?? '',
      telefono: prov.telefono ?? '',
      email: prov.email ?? '',
      direccion: prov.direccion ?? '',
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
      rut: form.rut.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      email: form.email.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
    };

    try {
      if (editingId) {
        await apiFetch(`/proveedores/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSuccess('Proveedor actualizado correctamente');
      } else {
        await apiFetch('/proveedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSuccess('Proveedor creado correctamente');
      }
      fetchProveedores();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este proveedor?')) return;
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/proveedores/${id}`, { method: 'DELETE' });
      setSuccess('Proveedor eliminado');
      fetchProveedores();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar proveedor');
    }
  };

  return (
    <div className="space-y-4">
      <div className="ficha-pestana-grafito p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-tinta">Proveedores</h2>
            <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              Administración de proveedores y contactos comerciales
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-primario bg-hoja hover:bg-hojaOscuro border-hoja text-white font-semibold">
            + Nuevo proveedor
          </button>
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

      <div className="ficha overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-pauta border-b-oferta"></div>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="py-16 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
            No hay proveedores registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla min-w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((prov) => (
                  <tr key={prov.id}>
                    <td className="px-4 py-3 font-medium text-tinta">{prov.nombre}</td>
                    <td className="px-4 py-3 text-tintaSuave">{prov.rut ?? '-'}</td>
                    <td className="px-4 py-3 text-tintaSuave">{prov.telefono ?? '-'}</td>
                    <td className="px-4 py-3 text-tintaSuave">{prov.email ?? '-'}</td>
                    <td className="px-4 py-3 text-tintaSuave">{prov.direccion ?? '-'}</td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(prov)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-hoja transition-colors hover:underline font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prov.id)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-oferta transition-colors hover:underline font-semibold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
          <div className="ficha-pestana w-full max-w-lg overflow-hidden bg-white">
            <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
              <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
                {editingId ? 'Editar proveedor' : 'Nuevo proveedor'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-2xl font-bold leading-none text-tintaSuave transition-colors hover:text-oferta"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="etiqueta">Nombre / Razón Social *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="input"
                  placeholder="Ej: Distribuidora Central Ltda"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiqueta">RUT (Opcional)</label>
                  <input
                    type="text"
                    value={form.rut}
                    onChange={(e) => setForm({ ...form, rut: e.target.value })}
                    className="input"
                    placeholder="12.345.678-9"
                  />
                </div>
                <div>
                  <label className="etiqueta">Teléfono</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="input"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
              <div>
                <label className="etiqueta">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="contacto@proveedor.cl"
                />
              </div>
              <div>
                <label className="etiqueta">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="input"
                  placeholder="Av. Providencia 1234, Santiago"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-papel">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primario bg-hoja hover:bg-hojaOscuro border-hoja text-white font-semibold">
                  {editingId ? 'Guardar cambios' : 'Crear proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
