import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../services/api';
import type { Proveedor, Producto } from '../types';

interface CompraItem {
  producto: Producto;
  cantidad: number;
  precioCostoUnitario: number;
  precioVentaSugerido: number;
}

export const Compras = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState<string>('');
  const [documentoTipo, setDocumentoTipo] = useState<string>('FACTURA');
  const [documentoFolio, setDocumentoFolio] = useState<string>('');
  const [compraItems, setCompraItems] = useState<CompraItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de Búsqueda
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar Proveedores
  const fetchProveedores = useCallback(async () => {
    try {
      const data = await apiFetch<Proveedor[]>('/proveedores');
      setProveedores(data.filter((p) => p.activo));
    } catch (e) {
      console.error('Error al cargar proveedores', e);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Buscar Productos
  useEffect(() => {
    if (searchVal.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await apiFetch<Producto[]>(`/productos?search=${encodeURIComponent(searchVal)}`);
        setSearchResults(data.slice(0, 5)); // max 5 results
        setSearchSelectedIndex(data.length > 0 ? 0 : -1);
      } catch (err) {
        console.error('Error al buscar productos', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  const handleAddProduct = (prod: Producto) => {
    const existingIndex = compraItems.findIndex((item) => item.producto.id === prod.id);
    if (existingIndex !== -1) {
      const updated = [...compraItems];
      updated[existingIndex].cantidad += 1;
      setCompraItems(updated);
    } else {
      setCompraItems([
        ...compraItems,
        {
          producto: prod,
          cantidad: 1,
          precioCostoUnitario: prod.precioCosto || 0,
          precioVentaSugerido: prod.precioVenta || 0,
        },
      ]);
    }
    setSearchVal('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handleUpdateItem = (index: number, key: keyof CompraItem, val: number) => {
    const updated = [...compraItems];
    updated[index] = {
      ...updated[index],
      [key]: val,
    };
    setCompraItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setCompraItems(compraItems.filter((_, idx) => idx !== index));
  };

  const calculateTotal = () => {
    return compraItems.reduce((acc, item) => acc + item.cantidad * item.precioCostoUnitario, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId || !documentoFolio || compraItems.length === 0) {
      setError('Por favor complete todos los datos requeridos');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    const payload = {
      proveedorId: parseInt(proveedorId),
      documentoTipo,
      documentoFolio: documentoFolio.trim(),
      items: compraItems.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioCostoUnitario: item.precioCostoUnitario,
        precioVentaSugerido: item.precioVentaSugerido,
      })),
    };

    try {
      await apiFetch('/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSuccess('Ingreso de inventario registrado correctamente');
      setCompraItems([]);
      setDocumentoFolio('');
      setProveedorId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la compra');
    } finally {
      setIsProcessing(false);
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
      {/* Header card */}
      <div className="ficha-pestana-hoja p-6">
        <h2 className="font-display text-xl font-bold tracking-tight text-tinta">Carga Rápida de Inventario (Compras)</h2>
        <p className="mt-0.5 font-ledger text-xs uppercase tracking-sello text-tintaSuave">
          Registrar facturas de proveedores e ingreso de stock en lote
        </p>

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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Panel izquierdo: Datos de la compra e ingreso de productos (66%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ficha Documento */}
          <div className="ficha p-5 bg-white border border-slate-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="etiqueta">Proveedor *</label>
              <select
                required
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="select"
              >
                <option value="">Seleccione proveedor...</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.rut ? `(${p.rut})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="etiqueta">Tipo Documento *</label>
              <select
                required
                value={documentoTipo}
                onChange={(e) => setDocumentoTipo(e.target.value)}
                className="select"
              >
                <option value="FACTURA">Factura de Compra</option>
                <option value="GUIA">Guía de Despacho</option>
              </select>
            </div>
            <div>
              <label className="etiqueta">Folio Documento *</label>
              <input
                type="text"
                required
                value={documentoFolio}
                onChange={(e) => setDocumentoFolio(e.target.value)}
                className="input"
                placeholder="Ej: 104523"
              />
            </div>
          </div>

          {/* Ficha Buscador */}
          <div className="ficha p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 relative">
            <label className="etiqueta">Buscar o Escanear Producto</label>
            <input
              type="text"
              ref={searchInputRef}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Escanee código de barras o escriba nombre..."
              className="input text-base"
              autoFocus
            />

            {/* Resultados de búsqueda flotantes */}
            {searchResults.length > 0 && (
              <div className="absolute left-5 right-5 z-20 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden divide-y divide-slate-100">
                {searchResults.map((prod, idx) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddProduct(prod)}
                    className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                      searchSelectedIndex === idx ? 'bg-slate-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-tinta text-sm block">{prod.nombre}</span>
                      {prod.codigoBarras && (
                        <span className="font-ledger text-[10px] text-tintaTenue block mt-0.5">
                          {prod.codigoBarras}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-tinta text-sm block">{formatCurrency(prod.precioVenta)}</span>
                      <span className="text-xs text-tintaSuave block mt-0.5">Stock: {prod.stock}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ficha Tabla Productos */}
          <div className="ficha bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {compraItems.length === 0 ? (
              <div className="py-16 text-center font-ledger text-xs uppercase tracking-sello text-tintaTenue">
                Escanee o busque productos para registrar la compra
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="tabla min-w-full">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th className="w-20 text-center">Cant</th>
                      <th className="w-32 text-right">Precio Costo</th>
                      <th className="w-32 text-right">Precio Venta</th>
                      <th className="w-20 text-center">Margen</th>
                      <th className="w-28 text-right">Subtotal</th>
                      <th className="w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {compraItems.map((item, idx) => {
                      const costSubtotal = item.cantidad * item.precioCostoUnitario;
                      const margin = item.precioVentaSugerido > 0 
                        ? ((item.precioVentaSugerido - item.precioCostoUnitario) / item.precioVentaSugerido) * 100 
                        : 0;

                      return (
                        <tr key={item.producto.id}>
                          <td className="px-4 py-3">
                            <span className="font-medium text-tinta text-xs block">{item.producto.nombre}</span>
                            {item.producto.codigoBarras && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">{item.producto.codigoBarras}</span>
                            )}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => handleUpdateItem(idx, 'cantidad', Number(e.target.value))}
                              className="input text-center py-1 px-1.5 w-16"
                            />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.precioCostoUnitario}
                              onChange={(e) => handleUpdateItem(idx, 'precioCostoUnitario', Number(e.target.value))}
                              className="input text-right py-1 px-1.5 w-24"
                            />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.precioVentaSugerido}
                              onChange={(e) => handleUpdateItem(idx, 'precioVentaSugerido', Number(e.target.value))}
                              className="input text-right py-1 px-1.5 w-24"
                            />
                          </td>
                          <td className="px-2 py-3 text-center text-xs font-bold">
                            <span className={margin > 30 ? 'text-hoja' : margin > 15 ? 'text-amber-600' : 'text-oferta'}>
                              {margin.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-tinta text-xs">
                            {formatCurrency(costSubtotal)}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-oferta hover:text-red-700 text-lg leading-none"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Totales y Confirmar Compra (33%) */}
        <div className="space-y-4">
          {/* Total card */}
          <div className="ficha p-6 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Costo Total Compra</span>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              {formatCurrency(calculateTotal())}
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold mt-2">
              Cantidad items: {compraItems.length}
            </span>
          </div>

          {/* Confirm panel */}
          <button
            type="submit"
            disabled={isProcessing || compraItems.length === 0 || !proveedorId || !documentoFolio}
            className={`w-full py-4 rounded-md text-white font-bold text-md uppercase tracking-wider shadow-sm transition-all ${
              isProcessing || compraItems.length === 0 || !proveedorId || !documentoFolio
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-hoja hover:bg-hojaOscuro hover:shadow active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isProcessing ? 'Registrando...' : 'Registrar Compra'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default Compras;
