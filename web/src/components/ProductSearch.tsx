import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';

interface Producto {
  id: number;
  nombre: string;
  codigoBarras?: string;
  precioVenta: number;
  stock: number;
  unidad: string;
}

interface ProductSearchProps {
  onProductSelect: (producto: Producto) => void;
  onClose: () => void;
}

export const ProductSearch = ({ onProductSelect, onClose }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setIsLoading(true);
        const token = authService.getToken();
        if (!token) return;

        const response = await fetch(`http://localhost:3000/api/productos?search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error('Error fetching productos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductos();
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < productos.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onProductSelect(productos[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Buscar Productos</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron productos
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {productos.map((producto, index) => (
                <button
                  key={producto.id}
                  onClick={() => onProductSelect(producto)}
                  className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${index === selectedIndex ? 'bg-blue-50 border-blue-500' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        {producto.codigoBarras && `Código: ${producto.codigoBarras} • `}
                        ${producto.precioVenta.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} • Stock: {producto.stock} {producto.unidad}
                      </p>
                    </div>
                    {producto.stock <= 10 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Stock bajo
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{productos.length} productos encontrados</span>
            <span>↑↓ para navegar • Enter para seleccionar • Esc para cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
