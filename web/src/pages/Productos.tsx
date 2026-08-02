import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { Producto, Categoria } from '../types';
import { EtiquetaModal } from '../components/EtiquetaModal';

interface ProductoForm {
  nombre: string;
  codigoBarras: string;
  categoriaId: number;
  precioVenta: string;
  precioCosto: string;
  stock: string;
  stockMinimo: string;
  unidad: string;
  esPesable: boolean;
}

const emptyForm: ProductoForm = {
  nombre: '',
  codigoBarras: '',
  categoriaId: 0,
  precioVenta: '',
  precioCosto: '',
  stock: '',
  stockMinimo: '',
  unidad: 'unidad',
  esPesable: false,
};

export const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [etiquetaModalOpen, setEtiquetaModalOpen] = useState(false);

  const fetchProductos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Producto[]>(`/productos?search=${encodeURIComponent(search)}`);
      setProductos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await apiFetch<Categoria[]>('/categorias');
      setCategorias(data);
    } catch {
      setCategorias([]);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (producto: Producto) => {
    setEditingId(producto.id);
    setForm({
      nombre: producto.nombre,
      codigoBarras: producto.codigoBarras ?? '',
      categoriaId: producto.categoriaId,
      precioVenta: String(producto.precioVenta),
      precioCosto: String(producto.precioCosto),
      stock: String(producto.stock),
      stockMinimo: String(producto.stockMinimo),
      unidad: producto.unidad,
      esPesable: producto.esPesable || false,
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
      codigoBarras: form.codigoBarras.trim() || undefined,
      categoriaId: Number(form.categoriaId),
      precioVenta: parseFloat(form.precioVenta),
      precioCosto: parseFloat(form.precioCosto),
      stock: parseFloat(form.stock) || 0,
      stockMinimo: parseFloat(form.stockMinimo) || 0,
      unidad: form.unidad,
      esPesable: form.esPesable,
    };

    try {
      if (editingId) {
        await apiFetch(`/productos/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Producto actualizado correctamente');
      } else {
        await apiFetch('/productos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess('Producto creado correctamente');
      }
      fetchProductos();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/productos/${id}`, { method: 'DELETE' });
      setSuccess('Producto eliminado');
      fetchProductos();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar producto');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === productos.length) {
        return new Set();
      }
      return new Set(productos.map((p) => p.id));
    });
  };

  const handleGenerarCodigo = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/productos/${id}/generar-codigo`, { method: 'POST' });
      setSuccess('Código de barras generado correctamente');
      fetchProductos();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar código');
    }
  };

  const selectedProducts = productos.filter((p) => selectedIds.has(p.id));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const selectClass =
    'select [&>option]:bg-papelAlto [&>option]:text-tinta';

  return (
    <div className="space-y-4">
      <div className="ficha-pestana-grafito p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-tinta">Productos</h2>
            <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
              Control de inventario y costos del negocio
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={openCreate} className="btn btn-primario">
              + Nuevo producto
            </button>
            {selectedIds.size > 0 && (
              <button onClick={() => setEtiquetaModalOpen(true)} className="btn btn-hoja">
                Imprimir etiquetas ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código de barras..."
            className="input sm:w-80"
          />
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
        ) : productos.length === 0 ? (
          <div className="py-16 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
            No hay productos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla min-w-full">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={productos.length > 0 && selectedIds.size === productos.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-hoja focus:ring-hoja h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Precio venta</th>
                  <th className="text-right">Costo</th>
                  <th className="text-right">Stock</th>
                  <th className="text-center">Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(producto.id)}
                        onChange={() => toggleSelect(producto.id)}
                        className="rounded border-slate-300 text-hoja focus:ring-hoja h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-tinta">{producto.nombre}</p>
                        {producto.esPesable && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider select-none">
                            Pesable
                          </span>
                        )}
                      </div>
                      {producto.codigoBarras ? (
                        <p className="mt-0.5 font-ledger text-xs text-tintaTenue">
                          Cód: {producto.codigoBarras}
                        </p>
                      ) : (
                        <button
                          onClick={() => handleGenerarCodigo(producto.id)}
                          className="mt-0.5 font-ledger text-[10px] font-bold uppercase tracking-wider text-hoja hover:underline"
                        >
                          Generar código
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-tintaSuave">
                      {producto.categoria?.nombre ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-ledger font-bold text-tinta">
                      {formatCurrency(producto.precioVenta)}
                    </td>
                    <td className="px-4 py-3 text-right font-ledger text-tintaSuave">
                      {formatCurrency(producto.precioCosto)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`sello ${
                          producto.stock <= producto.stockMinimo ? 'sello-alerta' : 'sello-gris'
                        }`}
                      >
                        {Number(producto.stock.toFixed(3))} {producto.unidad.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`sello ${producto.activo ? 'sello-ok' : 'sello-gris'}`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(producto)}
                        className="font-ledger text-xs font-bold uppercase tracking-sello text-tintaSuave transition-colors hover:text-tinta"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
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
                {editingId ? 'Editar producto' : 'Nuevo producto'}
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
                  placeholder="Ej: Coca Cola 1L"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiqueta">Código de barras</label>
                  <input
                    type="text"
                    value={form.codigoBarras}
                    onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                    className="input"
                    placeholder="7800000000000"
                  />
                </div>
                <div>
                  <label className="etiqueta">Categoría *</label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}
                    className={selectClass}
                  >
                    <option value={0}>Seleccionar...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiqueta">Precio venta * (CLP)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.precioVenta}
                    onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                    className="input font-ledger"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="etiqueta">Precio costo *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.precioCosto}
                    onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
                    className="input font-ledger"
                    placeholder="1100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="etiqueta">Stock</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input font-ledger"
                  />
                </div>
                <div>
                  <label className="etiqueta">Stock mínimo</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.stockMinimo}
                    onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                    className="input font-ledger"
                  />
                </div>
                <div>
                  <label className="etiqueta">Unidad</label>
                  <select
                    value={form.unidad}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                    className={selectClass}
                  >
                    <option value="unidad">unidad</option>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="lt">lt</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="esPesable"
                  checked={form.esPesable}
                  onChange={(e) => setForm({ ...form, esPesable: e.target.checked })}
                  className="rounded border-slate-300 text-hoja focus:ring-hoja h-4 w-4 cursor-pointer"
                />
                <label htmlFor="esPesable" className="text-xs font-bold text-tinta select-none cursor-pointer">
                  Producto se vende por peso (Pesable / Decimal)
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-papel">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primario">
                  {editingId ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {etiquetaModalOpen && (
        <EtiquetaModal
          productos={selectedProducts}
          onClose={() => {
            setEtiquetaModalOpen(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
};
