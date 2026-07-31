import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';
import { Cart } from '../components/Cart';
import { CajaModal } from '../components/CajaModal';

interface Producto {
  id: number;
  nombre: string;
  codigoBarras?: string;
  precioVenta: number;
  stock: number;
  unidad: string;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export const POS = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('efectivo');
  const [descuento, setDescuento] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  // Estados de Caja
  const [cajaAbierta, setCajaAbierta] = useState<boolean>(false);
  const [cajaSession, setCajaSession] = useState<any>(null);
  const [cajaModalMode, setCajaModalMode] = useState<'apertura' | 'cierre' | 'movimiento' | null>(null);
  const [isCajaLoading, setIsCajaLoading] = useState(true);

  // Estados de Búsqueda
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const checkCajaEstado = async () => {
    setIsCajaLoading(true);
    try {
      const res = await apiFetch('/caja/estado');
      if (res && res.abierta) {
        setCajaAbierta(true);
        setCajaSession(res.session);
      } else {
        setCajaAbierta(false);
        setCajaSession(null);
      }
    } catch (e) {
      console.error('Error al revisar estado de caja', e);
    } finally {
      setIsCajaLoading(false);
    }
  };

  useEffect(() => {
    checkCajaEstado();
  }, []);

  // Autofocus persistent search input
  useEffect(() => {
    if (cajaAbierta && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [cajaAbierta, cajaModalMode]);

  const handleProductSelect = (producto: Producto) => {
    if (producto.stock <= 0) {
      alert(`El producto ${producto.nombre} no tiene stock disponible`);
      return;
    }

    const existingItemIndex = cartItems.findIndex(item => item.producto.id === producto.id);
    
    if (existingItemIndex >= 0) {
      const newCartItems = [...cartItems];
      const newQty = newCartItems[existingItemIndex].cantidad + 1;
      
      if (newQty > producto.stock) {
        alert(`No hay suficiente stock. Disponible: ${producto.stock}`);
        return;
      }

      newCartItems[existingItemIndex].cantidad = newQty;
      newCartItems[existingItemIndex].subtotal = newQty * newCartItems[existingItemIndex].precioUnitario;
      setCartItems(newCartItems);
    } else {
      const newCartItems = [
        ...cartItems,
        {
          producto,
          cantidad: 1,
          precioUnitario: producto.precioVenta,
          subtotal: producto.precioVenta,
        }
      ];
      setCartItems(newCartItems);
    }
    setSearchVal('');
    setSearchResults([]);
    setSearchSelectedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (!val.trim()) {
      setSearchResults([]);
      setSearchSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    try {
      const res = await apiFetch<Producto[]>(`/productos?search=${encodeURIComponent(val)}`);
      setSearchResults(res || []);
      setSearchSelectedIndex(-1);
    } catch (err) {
      console.error('Error en búsqueda rápida', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchSelectedIndex >= 0 && searchResults[searchSelectedIndex]) {
        handleProductSelect(searchResults[searchSelectedIndex]);
      } else if (searchResults.length === 1) {
        handleProductSelect(searchResults[0]);
      } else if (searchResults.length > 1) {
        // Selecciona el primero por defecto si se presiona Enter sin navegar
        handleProductSelect(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setSearchVal('');
      setSearchResults([]);
      setSearchSelectedIndex(-1);
    }
  };

  const handleUpdateItem = (index: number, cantidad: number) => {
    const item = cartItems[index];
    if (cantidad > item.producto.stock) {
      alert(`No hay suficiente stock. Disponible: ${item.producto.stock}`);
      return;
    }

    const newCartItems = cartItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          cantidad,
          subtotal: cantidad * item.precioUnitario,
        };
      }
      return item;
    });
    setCartItems(newCartItems);
  };

  const handleRemoveItem = (index: number) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newCartItems);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setLastSale(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Debe iniciar sesión para procesar una venta');
        return;
      }

      const ventaData = {
        clienteId: clienteSeleccionado ? parseInt(clienteSeleccionado) : undefined,
        items: cartItems.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        metodoPago,
        descuento,
      };

      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ventaData),
      });

      if (response.ok) {
        const result = await response.json();
        setLastSale(result);
        setCartItems([]);
        checkCajaEstado(); // Refrescar totales de caja
      } else {
        const error = await response.json();
        alert(`Error al procesar venta: ${error.error}`);
      }
    } catch (error) {
      alert('Error de conexión al procesar venta');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calcularSubtotal = () => cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - (subtotal * descuento / 100);
  };

  const total = calcularTotal();
  const neto = total / 1.19;
  const iva = total - neto;

  const handlePrint = () => {
    window.print();
  };

  if (isCajaLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si la caja está cerrada, bloquear interfaz POS
  if (!cajaAbierta) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-lg shadow-md border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Caja Registradora Cerrada</h2>
          <p className="text-gray-600">
            Debes iniciar un nuevo turno abriendo la caja con un saldo inicial antes de poder registrar ventas.
          </p>
        </div>
        <button
          onClick={() => setCajaModalMode('apertura')}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Iniciar Turno / Abrir Caja
        </button>

        {cajaModalMode === 'apertura' && (
          <CajaModal
            mode="apertura"
            onClose={() => setCajaModalMode(null)}
            onSuccess={() => {
              setCajaModalMode(null);
              checkCajaEstado();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Caja Info & Acciones */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🟢 Caja Abierta
          </span>
          <span className="text-sm text-gray-600 ml-3">
            Efectivo esperado: <strong>{formatCurrency(cajaSession?.efectivoEsperado || 0)}</strong>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCajaModalMode('movimiento')}
            className="px-3.5 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            💰 Ingreso / Egreso Manual
          </button>
          <button
            onClick={() => setCajaModalMode('cierre')}
            className="px-3.5 py-2 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            🔒 Cerrar Caja / Turno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full print:block">
        {/* Product Search & Cart */}
        <div className="lg:col-span-2 space-y-4 print:hidden">
          {/* Persistent Search Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Registrar Producto</h2>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Escanea el código de barras o escribe el nombre del producto..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Búsqueda rápida dropdown */}
            {searchVal.trim() && (
              <div className="absolute left-6 right-6 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Buscando...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No se encontraron productos</div>
                ) : (
                  searchResults.map((producto, idx) => (
                    <button
                      key={producto.id}
                      onClick={() => handleProductSelect(producto)}
                      className={`w-full p-3 text-left border-b hover:bg-blue-50 flex justify-between items-center text-sm ${
                        idx === searchSelectedIndex ? 'bg-blue-50 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <span className="text-gray-900 font-medium">{producto.nombre}</span>
                        {producto.codigoBarras && (
                          <span className="text-gray-500 text-xs ml-2">({producto.codigoBarras})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 font-bold">{formatCurrency(producto.precioVenta)}</span>
                        <span className="text-xs text-gray-500 block">Stock: {producto.stock} {producto.unidad}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Cart
            items={cartItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Checkout Panel */}
        <div className="space-y-4 print:w-full print:max-w-md print:mx-auto">
          {/* Client Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6 print:hidden">
            <h3 className="text-base font-bold text-gray-900 mb-3">Cliente</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del Cliente (Opcional)</label>
              <input
                type="text"
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(e.target.value)}
                placeholder="Ej: Consumidor Final / Nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6 print:hidden">
            <h3 className="text-base font-bold text-gray-900 mb-3">Método de Pago</h3>
            <div className="grid grid-cols-3 gap-2">
              {['efectivo', 'tarjeta', 'transferencia'].map((metodo) => (
                <button
                  key={metodo}
                  type="button"
                  onClick={() => setMetodoPago(metodo)}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                    metodoPago === metodo
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="bg-white rounded-lg shadow-sm border p-6 print:hidden">
            <h3 className="text-base font-bold text-gray-900 mb-3">Descuento</h3>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                placeholder="0%"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-xs text-gray-500 font-semibold">% de Descuento</span>
            </div>
          </div>

          {/* Ticket Preview (Optimizado para impresión térmica) */}
          <div className="bg-white rounded-lg shadow-sm border p-6 print:border-none print:shadow-none print:p-0">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h3 className="text-base font-bold text-gray-900">Previa de Ticket</h3>
              {lastSale && (
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700"
                >
                  🖨️ Imprimir Ticket
                </button>
              )}
            </div>

            <div className="border border-gray-300 rounded p-4 bg-gray-50 font-mono text-xs print:bg-white print:border-none print:p-0">
              <div className="text-center font-bold border-b border-dashed border-gray-400 pb-2 mb-2">
                <span className="text-sm block">STOCKCAJA</span>
                <span className="text-xxs font-normal">Boleta de Venta Interna</span>
              </div>
              <div className="space-y-1 mb-2 text-xxs">
                <div><strong>Folio:</strong> {lastSale ? lastSale.folio : 'BOL-XXXX'}</div>
                <div><strong>Fecha:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Hora:</strong> {new Date().toLocaleTimeString()}</div>
                <div><strong>Cajero:</strong> {lastSale?.usuario?.nombre || 'Administrador'}</div>
              </div>
              
              <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
                {/* Items */}
                {cartItems.length === 0 && !lastSale && (
                  <div className="text-center py-2 text-gray-400 text-xxs">Sin productos cargados</div>
                )}
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between mb-1">
                    <span>{item.cantidad}x {item.producto.nombre.substring(0, 18)}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                {lastSale && lastSale.ventaDetalle?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between mb-1">
                    <span>{item.cantidad}x {item.producto.nombre.substring(0, 18)}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 text-xxs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Neto:</span>
                  <span>{formatCurrency(lastSale ? lastSale.total / 1.19 : neto)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span>{formatCurrency(lastSale ? lastSale.total - (lastSale.total / 1.19) : iva)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({descuento}%):</span>
                    <span>-{formatCurrency(calcularSubtotal() * descuento / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-double border-gray-400 pt-2 mt-1">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(lastSale ? lastSale.total : total)}</span>
                </div>
              </div>
              
              <div className="text-center text-xxs text-gray-500 border-t border-dashed border-gray-400 pt-2 mt-3">
                Gracias por su compra
              </div>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-blue-800">Procesando venta...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales de Caja */}
      {cajaModalMode && (
        <CajaModal
          mode={cajaModalMode}
          onClose={() => setCajaModalMode(null)}
          onSuccess={() => {
            setCajaModalMode(null);
            checkCajaEstado();
          }}
          sessionData={cajaSession}
        />
      )}

      {/* Ticket Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};
