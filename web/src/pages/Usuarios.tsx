import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Usuario } from '../types';

interface UsuarioForm {
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'CAJERO';
  activo: boolean;
}

const emptyForm: UsuarioForm = {
  nombre: '',
  email: '',
  password: '',
  rol: 'CAJERO',
  activo: true,
};

export const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UsuarioForm>(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = currentUser?.rol === 'ADMIN';

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Usuario[]>('/usuarios');
      setUsuarios(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setModalOpen(false);

    const payload: Record<string, unknown> = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      rol: form.rol,
      activo: form.activo,
    };

    if (form.password) {
      payload.password = form.password;
    }

    try {
      if (editingId) {
        await apiFetch(`/usuarios/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Usuario actualizado correctamente');
      } else {
        await apiFetch('/usuarios', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: form.password }),
        });
        setSuccess('Usuario creado correctamente');
      }
      fetchUsuarios();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar usuario');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      setSuccess('Usuario eliminado');
      fetchUsuarios();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar usuario');
    }
  };

  const selectClass = 'select [&>option]:bg-papelAlto [&>option]:text-tinta';

  if (!isAdmin) {
    return (
      <div className="border-2 border-sello bg-sello/20 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-tinta">
        Restringido: no tiene permisos para administrar usuarios. Esta sección requiere rol
        ADMIN.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="ficha-pestana-grafito p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-tinta">Usuarios</h2>
            <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              Control de cuentas de cajeros y administradores
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-primario">
            + Nuevo usuario
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
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla min-w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th className="text-center">Rol</th>
                  <th className="text-center">Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-tinta">{usuario.nombre}</p>
                      {usuario.id === currentUser?.id && (
                        <p className="mt-0.5 font-ledger text-xs font-bold uppercase tracking-sello text-hoja">
                          (usted)
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-tintaSuave">{usuario.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`sello ${usuario.rol === 'ADMIN' ? 'sello-oro' : 'sello-gris'}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`sello ${usuario.activo ? 'sello-ok' : 'sello-gris'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(usuario)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave transition-colors hover:text-tinta"
                      >
                        Editar
                      </button>
                      {usuario.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="font-ledger text-xs font-bold uppercase tracking-sello text-oferta transition-colors hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
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
          <div className="ficha-pestana w-full max-w-lg overflow-hidden">
            <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
              <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
                {editingId ? 'Editar usuario' : 'Nuevo usuario'}
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
                <label className="etiqueta">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="input"
                  placeholder="Ej: María González"
                />
              </div>
              <div>
                <label className="etiqueta">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="usuario@stockcaja.cl"
                />
              </div>
              <div>
                <label className="etiqueta">
                  Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiqueta">Rol *</label>
                  <select
                    value={form.rol}
                    onChange={(e) =>
                      setForm({ ...form, rol: e.target.value as 'ADMIN' | 'CAJERO' })
                    }
                    className={selectClass}
                  >
                    <option value="CAJERO">Cajero</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="etiqueta">Estado</label>
                  <select
                    value={form.activo ? 'activo' : 'inactivo'}
                    onChange={(e) => setForm({ ...form, activo: e.target.value === 'activo' })}
                    className={selectClass}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-papel">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primario">
                  {editingId ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
