interface Producto {
  id: number;
  nombre: string;
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

interface CartProps {
  items: CartItem[];
  onUpdateItem: (index: number, cantidad: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export const Cart = ({ items, onUpdateItem, onRemoveItem, onClearCart, onCheckout }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const neto = total / 1.19;
  const impuesto = total - neto;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Carrito de Ventas</h3>
          <button
            onClick={onClearCart}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Vaciar carrito
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v8a4 4 0 008 0v-1m4 8v1a3 3 0 01-6 0V8a3 3 0 016 0v11z" />
            </svg>
            <p>Carrito vacío</p>
            <p className="text-sm">Agregue productos para empezar la venta</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.producto.nombre}</h4>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.precioUnitario)} c/u • {item.producto.unidad}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onUpdateItem(index, Math.max(1, item.cantidad - 1))}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <span className="text-lg">−</span>
                </button>
                <span className="w-8 text-center font-medium">{item.cantidad}</span>
                <button
                  onClick={() => onUpdateItem(index, item.cantidad + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <span className="text-lg">+</span>
                </button>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center ml-2"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>

              <div className="ml-4 text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with totals */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Neto:</span>
              <span className="font-medium">{formatCurrency(neto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (19%):</span>
              <span className="font-medium">{formatCurrency(impuesto)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total (Bruto):</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.293 1.293a3 3 0 001.414 1.414L9 11.414 16.586 4.414A2 2 0 0021.414 1.414L3 3zM3 3v18h18M16 8l3-3m0 0l-3 3m3-3v9" />
            </svg>
            <span>Procesar Pago</span>
          </button>
        </div>
      )}
    </div>
  );
};
