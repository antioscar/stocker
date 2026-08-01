import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { Cliente } from '../types';

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
  const [cuentaHistorial, setCuentaHistorial] = useState<any[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  // Estados de Abono
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoMonto, setAbonoMonto] = useState<number>(0);
  const [isAbonoSubmitting, setIsAbonoSubmitting] = useState(false);

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
    setCuentaHistorial([]);
    try {
      const data = await apiFetch<any>(
        `/clientes/${cliente.id}/historial-cuenta`
      );
      setCuentaHistorial(data.historial || []);
      setHistorialCliente(data.cliente);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar historial de cuenta');
    } finally {
      setHistorialLoading(false);
    }
  };

  const handleAbonoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historialCliente || abonoMonto <= 0) return;
    setIsAbonoSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/clientes/${historialCliente.id}/abonos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: abonoMonto }),
      });
      setSuccess('Abono registrado correctamente');
      setAbonoModalOpen(false);
      setAbonoMonto(0);
      fetchClientes();
      openHistorial(historialCliente);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar abono');
    } finally {
      setIsAbonoSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-4">
      <div className="ficha-pestana-grafito p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-tinta">Clientes</h2>
            <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              Control de cuentas de clientes e historial de compras
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-primario">
            + Nuevo cliente
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
        ) : clientes.length === 0 ? (
          <div className="py-16 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
            No hay clientes registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla min-w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th className="text-right">Deuda Pendiente</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-4 py-3 font-medium text-tinta">{cliente.nombre}</td>
                    <td className="px-4 py-3 text-tintaSuave">{cliente.telefono ?? '-'}</td>
                    <td className="px-4 py-3 text-tintaSuave">{cliente.email ?? '-'}</td>
                    <td className="px-4 py-3 text-tintaSuave">{cliente.direccion ?? '-'}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      cliente.saldoDeuda > 0 ? 'text-oferta' : 'text-slate-400'
                    }`}>
                      {formatCurrency(cliente.saldoDeuda || 0)}
                    </td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button
                        onClick={() => openHistorial(cliente)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-hoja transition-colors hover:underline"
                      >
                        Historial
                      </button>
                      <button
                        onClick={() => openEdit(cliente)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave transition-colors hover:text-tinta"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-oferta transition-colors hover:underline"
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
          <div className="ficha-pestana w-full max-w-lg overflow-hidden">
            <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
              <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
                {editingId ? 'Editar cliente' : 'Nuevo cliente'}
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
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="etiqueta">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                    placeholder="cliente@correo.cl"
                  />
                </div>
              </div>
              <div>
                <label className="etiqueta">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="input"
                  placeholder="Calle 123, Comuna"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-papel">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primario">
                  {editingId ? 'Guardar cambios' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historialCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
          <div className="ficha-pestana-hoja w-full max-w-2xl overflow-hidden bg-white">
            <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
              <div>
                <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
                  Historial de {historialCliente.nombre}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Deuda Pendiente: <span className="text-oferta font-bold">{formatCurrency(historialCliente.saldoDeuda || 0)}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(historialCliente.saldoDeuda || 0) > 0 && (
                  <button
                    onClick={() => {
                      setAbonoMonto(historialCliente.saldoDeuda);
                      setAbonoModalOpen(true);
                    }}
                    className="btn btn-primario py-1 px-3 text-xs bg-hoja hover:bg-hojaOscuro text-white border-hoja"
                  >
                    Abonar Deuda
                  </button>
                )}
                <button
                  onClick={() => setHistorialCliente(null)}
                  className="text-2xl font-bold leading-none text-tintaSuave transition-colors hover:text-oferta"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto bg-card">
              {historialLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-pauta border-b-oferta"></div>
                </div>
              ) : cuentaHistorial.length === 0 ? (
                <div className="py-8 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
                  Este cliente no tiene movimientos registrados
                </div>
              ) : (
                <table className="tabla min-w-full">
                  <thead className="bg-card">
                    <tr>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th className="text-right">Monto</th>
                      <th className="text-center">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentaHistorial.map((item, idx) => (
                      <tr key={`${item.tipo}-${item.id}-${idx}`}>
                        <td className="px-4 py-2.5 text-tintaSuave">
                          {new Date(item.createdAt).toLocaleString('es-CL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-tinta font-medium">
                          {item.detalle}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-bold ${
                          item.tipo === 'COMPRA' ? 'text-oferta' : 'text-hoja'
                        }`}>
                          {item.tipo === 'COMPRA' ? '+' : '-'}{formatCurrency(item.monto)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`sello ${
                            item.tipo === 'COMPRA' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'sello-ok'
                          }`}>
                            {item.tipo === 'COMPRA' ? 'Compra' : 'Abono'}
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

      {abonoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
          <div className="ficha w-full max-w-sm overflow-hidden bg-white">
            <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-tinta">
                Registrar Abono
              </h3>
              <button
                onClick={() => setAbonoModalOpen(false)}
                className="text-2xl font-bold leading-none text-tintaSuave transition-colors hover:text-oferta"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAbonoSubmit} className="space-y-4 p-5">
              <div>
                <label className="etiqueta">Monto del abono *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={historialCliente?.saldoDeuda || 9999999}
                  value={abonoMonto || ''}
                  onChange={(e) => setAbonoMonto(Number(e.target.value))}
                  className="input text-lg font-bold"
                  placeholder="Ingrese el monto..."
                />
                <p className="text-[10px] text-slate-400 mt-1 uppercase">
                  Deuda máxima a abonar: {formatCurrency(historialCliente?.saldoDeuda || 0)}
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setAbonoModalOpen(false)} className="btn btn-papel">
                  Cancelar
                </button>
                <button type="submit" disabled={isAbonoSubmitting || !abonoMonto} className="btn btn-primario bg-hoja hover:bg-hojaOscuro border-hoja text-white">
                  {isAbonoSubmitting ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
