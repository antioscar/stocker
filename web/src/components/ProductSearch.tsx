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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
      <div className="ficha-pestana flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden">
        <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
          <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
            Buscar productos
          </h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold leading-none text-tintaSuave transition-colors hover:text-oferta"
          >
            ×
          </button>
        </div>

        <div className="border-b border-pauta p-4">
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-pauta border-b-oferta"></div>
            </div>
          ) : productos.length === 0 ? (
            <div className="py-8 text-center font-ledger text-sm text-tintaSuave">
              No se encontraron productos
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {productos.map((producto, index) => (
                <button
                  key={producto.id}
                  onClick={() => onProductSelect(producto)}
                  className={`rounded-ficha border p-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'border-oferta bg-oferta/10'
                      : 'border-pautaOscura hover:bg-papelAlto'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-tinta">{producto.nombre}</h4>
                      <p className="font-ledger text-sm text-tintaSuave">
                        {producto.codigoBarras && `Código: ${producto.codigoBarras} · `}
                        {formatCurrency(producto.precioVenta)} · Stock: {producto.stock}{' '}
                        {producto.unidad}
                      </p>
                    </div>
                    {producto.stock <= 10 && (
                      <span className="sello sello-alerta shrink-0">Stock bajo</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-pauta bg-card px-4 py-3">
          <div className="flex justify-between font-ledger text-xs text-tintaSuave">
            <span>{productos.length} productos encontrados</span>
            <span>↑↓ para navegar · Enter para seleccionar · Esc para cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
