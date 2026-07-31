import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { Producto, Categoria } from '../types';

interface ProductoForm {
  nombre: string;
  codigoBarras: string;
  categoriaId: number;
  precioVenta: string;
  precioCosto: string;
  stock: string;
  stockMinimo: string;
  unidad: string;
}

const emptyForm: ProductoForm = {
  nombre: '',
  codigoBarras: '',
  categoriaId: 0,
  precioVenta: '',
  precioCosto: '',
  stock: '0',
  stockMinimo: '0',
  unidad: 'unidad',
};

export const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProductos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Producto[]>(
        `/productos${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      );
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
      // si falla, se ignora
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
    setForm({
      ...emptyForm,
      categoriaId: categorias[0]?.id ?? 0,
    });
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
      stock: parseInt(form.stock) || 0,
      stockMinimo: parseInt(form.stockMinimo) || 0,
      unidad: form.unidad,
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
            <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
            <p className="text-sm text-gray-600">Gestión de inventario y precios</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nuevo producto
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código de barras..."
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
        ) : productos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No hay productos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio venta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      {producto.codigoBarras && (
                        <p className="text-xs text-gray-500">Código: {producto.codigoBarras}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {producto.categoria?.nombre ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(producto.precioVenta)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatCurrency(producto.precioCosto)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.stock <= producto.stockMinimo
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {producto.stock} {producto.unidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(producto)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
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
                {editingId ? 'Editar producto' : 'Nuevo producto'}
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
                  placeholder="Ej: Coca Cola 1L"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de barras
                  </label>
                  <input
                    type="text"
                    value={form.codigoBarras}
                    onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                    className={inputClass}
                    placeholder="7800000000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}
                    className={inputClass}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio venta * ({form.precioVenta ? 'CLP' : 'CLP'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.precioVenta}
                    onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                    className={inputClass}
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio costo *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.precioCosto}
                    onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
                    className={inputClass}
                    placeholder="1100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockMinimo}
                    onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select
                    value={form.unidad}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                    className={inputClass}
                  >
                    <option value="unidad">unidad</option>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="lt">lt</option>
                  </select>
                </div>
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
                  {editingId ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
