import { useState } from 'react';
import { ProductSearch } from '../components/ProductSearch';
import { Cart } from '../components/Cart';

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
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('efectivo');
  const [descuento, setDescuento] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const handleProductSelect = (producto: Producto) => {
    const existingItemIndex = cartItems.findIndex(item => item.producto.id === producto.id);
    
    if (existingItemIndex >= 0) {
      // Item already in cart, increase quantity
      const newCartItems = [...cartItems];
      newCartItems[existingItemIndex].cantidad += 1;
      newCartItems[existingItemIndex].subtotal = newCartItems[existingItemIndex].cantidad * newCartItems[existingItemIndex].precioUnitario;
      setCartItems(newCartItems);
    } else {
      // New item
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
    setIsProductSearchOpen(false);
  };

  const handleUpdateItem = (index: number, cantidad: number) => {
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
        usuarioId: 1, // TODO: Obtener del token
        items: cartItems.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        metodoPago,
        descuento,
      };

      const response = await fetch('http://localhost:3000/api/ventas', {
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
        alert(`Venta procesada exitosamente! Folio: ${result.folio}`);
        setCartItems([]);
        // Imprimir ticket (simulado)
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
  const calcularImpuesto = (subtotal: number) => subtotal * 0.19;
  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal + calcularImpuesto(subtotal) - (calcularSubtotal() * descuento / 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Search Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Búsqueda de Productos</h2>
          <button
            onClick={() => setIsProductSearchOpen(true)}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar Productos</span>
          </button>
        </div>

        {/* Cart */}
        <Cart
          items={cartItems}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />

        {/* Last Sale Receipt */}
        {lastSale && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Venta Completada</h3>
            <div className="text-sm text-green-700">
              <div><strong>Folio:</strong> {lastSale.folio}</div>
              <div><strong>Total:</strong> {formatCurrency(lastSale.total)}</div>
              <div><strong>Pago:</strong> {lastSale.metodoPago}</div>
              <div><strong>Cliente:</strong> {lastSale.cliente?.nombre || 'No especificado'}</div>
              <div><strong>Usuario:</strong> {lastSale.usuario?.nombre}</div>
            </div>
            <button
              onClick={() => setLastSale(null)}
              className="mt-2 text-sm text-green-800 hover:text-green-900 font-medium"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Checkout Panel */}
      <div className="space-y-4">
        {/* Client Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
              <input
                type="text"
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
          <div className="space-y-2">
            {['efectivo', 'tarjeta', 'transferencia'].map((metodo) => (
              <label key={metodo} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="metodoPago"
                  value={metodo}
                  checked={metodoPago === metodo}
                  onChange={() => setMetodoPago(metodo)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Discount */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Descuento</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de descuento</label>
              <input
                type="number"
                min="0"
                max="100"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                placeholder="0%"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {descuento > 0 && (
              <div className="text-sm text-gray-600">
                Ahorro: {((calcularSubtotal() * descuento / 100).toFixed(2))} CLP
              </div>
            )}
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Previa de Receipt</h3>
          <div className="border border-gray-300 rounded p-3 bg-gray-50 font-mono text-sm">
            <div className="text-center font-bold border-b border-gray-300 pb-2 mb-2">
              STOCKCAJA
            </div>
            <div>Fecha: {new Date().toLocaleDateString()}</div>
            <div>Hora: {new Date().toLocaleTimeString()}</div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.cantidad}x {item.producto.nombre}</span>
                  <span>{(item.subtotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{calcularSubtotal().toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between">
                  <span>Descuento ({descuento}%):</span>
                  <span>-{(calcularSubtotal() * descuento / 100).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-1">
                <span>TOTAL:</span>
                <span>
                  {calcularTotal().toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-800">Procesando venta...</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Search Modal */}
      {isProductSearchOpen && (
        <ProductSearch
          onProductSelect={handleProductSelect}
          onClose={() => setIsProductSearchOpen(false)}
        />
      )}
    </div>
  );
};
