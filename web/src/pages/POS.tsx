import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      const res = await apiFetch<any>('/caja/estado');
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

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F1: Focus Search Bar
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      // F2: Cycle Payment Method
      if (e.key === 'F2') {
        e.preventDefault();
        const methods = ['efectivo', 'tarjeta', 'transferencia'];
        const currentIndex = methods.indexOf(metodoPago);
        const nextIndex = (currentIndex + 1) % methods.length;
        setMetodoPago(methods[nextIndex]);
      }

      // F8: Empty Cart
      if (e.key === 'F8') {
        e.preventDefault();
        if (confirm('¿Vaciar venta actual?')) {
          handleClearCart();
        }
      }

      // F9: Print Last Ticket
      if (e.key === 'F9') {
        if (lastSale) {
          e.preventDefault();
          window.print();
        }
      }

      // F12 or Ctrl+Enter: Pay/Checkout
      if (e.key === 'F12' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [cartItems, metodoPago, descuento, lastSale, clienteSeleccionado, cajaAbierta]);

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
      alert('La venta no tiene productos');
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
        checkCajaEstado();
        alert(`Venta registrada con éxito. Folio: ${result.folio}`);
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

  if (isCajaLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pauta border-b-hoja"></div>
      </div>
    );
  }

  if (!cajaAbierta) {
    return (
      <div className="mx-auto max-w-md py-12 text-center select-none">
        <div className="ficha p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Caja Cerrada</h2>
          <p className="text-sm text-slate-500 mb-6">Debe abrir la caja e ingresar el saldo inicial para poder comenzar a vender.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setCajaModalMode('apertura')}
              className="btn btn-primario w-full py-3"
            >
              Abrir Caja
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-papel w-full py-3"
            >
              Volver al Sistema
            </button>
          </div>
        </div>
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
    <div className="space-y-6 select-none">
      {/* Información y Acciones de Caja */}
      <div className="ficha p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <span className="sello sello-ok">● Caja abierta</span>
          <span className="text-sm text-slate-600 font-semibold">
            Efectivo esperado: <span className="text-slate-900 font-bold">{formatCurrency(cajaSession?.efectivoEsperado || 0)}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCajaModalMode('movimiento')}
            className="btn btn-papel text-xs font-semibold py-1.5 px-3"
          >
            Mover Dinero
          </button>
          <button
            onClick={() => setCajaModalMode('cierre')}
            className="btn btn-papel border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold py-1.5 px-3"
          >
            Cerrar Turno
          </button>
        </div>
      </div>

      {/* Grid Principal 70% / 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Buscador y Carrito (70%) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Campo de búsqueda */}
          <div className="ficha p-5 bg-white border border-slate-200 rounded-lg shadow-sm relative">
            <label className="etiqueta mb-2 block">Registrar Producto (F1)</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Escanee el código de barras o escriba el nombre del producto..."
                className="input py-3 text-base"
                autoFocus
              />
            </div>

            {/* Búsqueda rápida dropdown */}
            {searchVal.trim() && (
              <div className="absolute left-5 right-5 mt-1 bg-white border border-slate-200 shadow-lg z-50 max-h-60 overflow-y-auto rounded-md divide-y divide-slate-100">
                {isSearching ? (
                  <div className="p-4 text-center text-slate-400 text-sm">Buscando...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No se encontraron productos</div>
                ) : (
                  searchResults.map((producto, idx) => (
                    <button
                      key={producto.id}
                      onClick={() => handleProductSelect(producto)}
                      className={`w-full p-3 text-left hover:bg-slate-50 flex justify-between items-center text-sm transition-colors ${
                        idx === searchSelectedIndex ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-600'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{producto.nombre}</span>
                        {producto.codigoBarras && (
                          <span className="text-slate-400 text-xs ml-2">({producto.codigoBarras})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(producto.precioVenta)}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Stock: {producto.stock} {producto.unidad}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Listado del Carrito */}
          <Cart
            items={cartItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {/* Panel Derecho: Totales y Acciones (30%) */}
        <div className="space-y-4">
          
          {/* Caja del Total */}
          <div className="ficha p-6 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total a Pagar</span>
            <div className="text-5xl font-black text-slate-900 tracking-tight">
              {formatCurrency(total)}
            </div>
          </div>

          {/* Formulario de Cliente y Descuento */}
          <div className="ficha p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="etiqueta">Cliente (Opcional)</label>
              <input
                type="text"
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(e.target.value)}
                placeholder="Consumidor Final"
                className="input"
              />
            </div>
            <div>
              <label className="etiqueta">Descuento %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="ficha p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
            <label className="etiqueta">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              {['efectivo', 'tarjeta', 'transferencia'].map((metodo) => (
                <button
                  key={metodo}
                  type="button"
                  onClick={() => setMetodoPago(metodo)}
                  className={`py-2 rounded-md font-bold text-xs uppercase transition-colors border ${
                    metodoPago === metodo
                      ? 'bg-hoja text-white border-hoja'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {metodo}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Finalizar */}
          <button
            onClick={handleCheckout}
            disabled={isProcessing || cartItems.length === 0}
            className={`w-full py-4 rounded-md text-white font-bold text-lg uppercase tracking-wider shadow-sm transition-all ${
              isProcessing || cartItems.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-hoja hover:bg-hojaOscuro hover:shadow active:scale-[0.99]'
            }`}
          >
            {isProcessing ? 'Procesando...' : 'Finalizar Venta (F12)'}
          </button>
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
    </div>
  );
};
